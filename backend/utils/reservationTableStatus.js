const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const { randomUUID } = require('node:crypto');

const ACTIVE_RESERVATION_FILTER = {
  $or: [
    { status: { $in: ['Pending', 'Confirmed'] } },
    { status: 'Completed', fullPaymentDone: { $ne: true } },
  ],
};
const RESERVATION_NOTICE_WINDOW_MS = 15 * 60 * 1000;
const RESERVATION_DURATION_MS = 60 * 60 * 1000;
const BOOKING_LOCK_DURATION_MS = 30 * 1000;
const BUSINESS_TIME_ZONE = process.env.BUSINESS_TIME_ZONE || 'Asia/Kolkata';
const timeZoneFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: BUSINESS_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

const getReservationStart = (reservation) => {
  const dateValue = reservation.date instanceof Date
    ? reservation.date.toISOString()
    : String(reservation.date || '');
  const dateMatch = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const timeMatch = String(reservation.time || '').match(/^\s*(\d{1,2}):(\d{2})\s*(AM|PM)\s*$/i);

  if (!dateMatch || !timeMatch) return null;

  const [, yearText, monthText, dayText] = dateMatch;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour12 = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);

  if (
    month < 1 || month > 12 || day < 1 || day > 31 ||
    hour12 < 1 || hour12 > 12 || minute < 0 || minute > 59
  ) {
    return null;
  }

  const dateCheck = new Date(Date.UTC(year, month - 1, day));
  if (
    dateCheck.getUTCFullYear() !== year ||
    dateCheck.getUTCMonth() !== month - 1 ||
    dateCheck.getUTCDate() !== day
  ) {
    return null;
  }

  const isPm = timeMatch[3].toUpperCase() === 'PM';
  const hour24 = (hour12 % 12) + (isPm ? 12 : 0);
  const wallTimeUtc = Date.UTC(year, month - 1, day, hour24, minute);
  let timestamp = wallTimeUtc;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const parts = Object.fromEntries(
      timeZoneFormatter
        .formatToParts(new Date(timestamp))
        .filter(({ type }) => type !== 'literal')
        .map(({ type, value }) => [type, Number(value)])
    );
    const formattedAsUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second
    );
    timestamp += wallTimeUtc - formattedAsUtc;
  }

  return new Date(timestamp);
};

const isReservationWithinNoticeWindow = (reservation, now = new Date()) => {
  const start = getReservationStart(reservation);
  if (!start) return true;
  return start.getTime() <= now.getTime() + RESERVATION_NOTICE_WINDOW_MS;
};

const isReservationStartingSoon = (reservation, now = new Date()) => {
  const start = getReservationStart(reservation);
  if (!start) return false;
  return Math.abs(start.getTime() - now.getTime()) <= RESERVATION_NOTICE_WINDOW_MS;
};

const reservationTimesOverlap = (firstStart, secondStart) => {
  const firstEnd = firstStart.getTime() + RESERVATION_DURATION_MS;
  const secondEnd = secondStart.getTime() + RESERVATION_DURATION_MS;
  return firstStart.getTime() < secondEnd && secondStart.getTime() < firstEnd;
};

const findReservationConflict = async (tableId, date, time, excludeReservationId) => {
  const requestedStart = getReservationStart({ date, time });
  if (!requestedStart) {
    const error = new Error('Please select a valid reservation date and time.');
    error.statusCode = 400;
    throw error;
  }

  const reservations = await Reservation.find({
    table: tableId,
    ...(excludeReservationId ? { _id: { $ne: excludeReservationId } } : {}),
    ...ACTIVE_RESERVATION_FILTER,
  }).select('customerName date time');

  return reservations.find((reservation) => {
    const existingStart = getReservationStart(reservation);
    if (!existingStart) return true;
    return reservationTimesOverlap(requestedStart, existingStart);
  }) || null;
};

const withTableBookingLock = async (tableId, operation) => {
  const now = new Date();
  const lockId = randomUUID();
  const table = await Table.findOneAndUpdate(
    {
      _id: tableId,
      $or: [
        { bookingLockExpiresAt: { $exists: false } },
        { bookingLockExpiresAt: null },
        { bookingLockExpiresAt: { $lte: now } },
      ],
    },
    {
      $set: {
        bookingLockId: lockId,
        bookingLockExpiresAt: new Date(now.getTime() + BOOKING_LOCK_DURATION_MS),
      },
    },
    { new: true }
  );

  if (!table) {
    const error = new Error('This table is being booked right now. Please try again.');
    error.statusCode = 409;
    throw error;
  }

  try {
    return await operation(table);
  } finally {
    await Table.findOneAndUpdate(
      { _id: tableId, bookingLockId: lockId },
      { $unset: { bookingLockId: 1, bookingLockExpiresAt: 1 } }
    );
  }
};

const getActiveReservations = (tableId) => Reservation.find({
  ...(tableId ? { table: tableId } : {}),
  ...ACTIVE_RESERVATION_FILTER,
}).select('table date time status fullPaymentDone');

const syncTableReservationStatus = async (tableId, now = new Date()) => {
  if (!tableId) return;

  const table = await Table.findById(tableId);
  if (!table) return;

  const reservations = await getActiveReservations(tableId);
  const shouldBeReserved = reservations.some((reservation) =>
    isReservationWithinNoticeWindow(reservation, now)
  );
  const nextStatus = table.status === 'Occupied'
    ? 'Occupied'
    : shouldBeReserved
      ? 'Reserved'
      : 'Free';

  if (table.status !== nextStatus) {
    table.status = nextStatus;
    await table.save();
  }
};

const syncAllTableReservationStatuses = async (now = new Date()) => {
  const [tables, reservations] = await Promise.all([
    Table.find(),
    getActiveReservations(),
  ]);
  const tablesEnteringReservationWindow = new Set(
    reservations
      .filter((reservation) => isReservationWithinNoticeWindow(reservation, now))
      .map((reservation) => String(reservation.table))
  );

  for (const table of tables) {
    const shouldBeReserved = tablesEnteringReservationWindow.has(String(table._id));
    const nextStatus = table.status === 'Occupied'
      ? 'Occupied'
      : shouldBeReserved
        ? 'Reserved'
        : 'Free';

    if (table.status !== nextStatus) {
      table.status = nextStatus;
      await table.save();
    }
  }
};

module.exports = {
  ACTIVE_RESERVATION_FILTER,
  RESERVATION_DURATION_MS,
  getReservationStart,
  reservationTimesOverlap,
  findReservationConflict,
  isReservationWithinNoticeWindow,
  isReservationStartingSoon,
  syncTableReservationStatus,
  syncAllTableReservationStatuses,
  withTableBookingLock,
};
