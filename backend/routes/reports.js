const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { auth } = require('../middleware/auth');

const RANGE_LABELS = {
  '7days': 'Last 7 Days',
  '30days': 'Last 30 Days',
  '90days': 'Last 90 Days',
  '1year': 'Last 12 Months',
  all: 'All Time'
};

const CHART_SUBTITLES = {
  '7days': 'Daily revenue for the last 7 days',
  '30days': 'Daily revenue for the last 30 days',
  '90days': 'Weekly revenue for the last 90 days',
  '1year': 'Monthly revenue for the last 12 months',
  all: 'Monthly revenue across all time'
};

const getDateRange = (range) => {
  const now = new Date();
  const endDate = new Date(now);
  const startDate = new Date(now);

  switch (range) {
    case '7days':
      startDate.setDate(now.getDate() - 6);
      break;
    case '30days':
      startDate.setDate(now.getDate() - 29);
      break;
    case '90days':
      startDate.setDate(now.getDate() - 89);
      break;
    case '1year':
      startDate.setMonth(now.getMonth() - 11);
      startDate.setDate(1);
      break;
    case 'all':
      startDate.setTime(0);
      break;
    default:
      startDate.setDate(now.getDate() - 6);
  }

  console.log(`[Reports] Range: ${range}, Start: ${startDate.toISOString()}, End: ${endDate.toISOString()}`);

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate, range: range || '7days' };
};

const getPreviousPeriod = (startDate, endDate) => {
  if (startDate.getTime() === 0) {
    return { prevStart: new Date(0), prevEnd: new Date(0) };
  }
  const periodMs = endDate - startDate;
  const prevEnd = new Date(startDate.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - periodMs);
  prevStart.setHours(0, 0, 0, 0);
  prevEnd.setHours(23, 59, 59, 999);
  return { prevStart, prevEnd };
};

const paymentPopulate = [
  {
    path: 'orderId',
    populate: [
      { path: 'userId' },
      { path: 'items.menuItemId' }
    ]
  },
  {
    path: 'reservationId',
    populate: { path: 'userId' }
  }
];

const fetchPayments = (startDate, endDate) =>
  Payment.find({
    status: 'Succeeded',
    createdAt: { $gte: startDate, $lte: endDate }
  }).populate(paymentPopulate);

const fetchPaidOrders = (startDate, endDate) =>
  Order.find({
    createdAt: { $gte: startDate, $lte: endDate },
    status: { $in: ['Paid', 'Completed'] }
  }).populate('userId').populate('items.menuItemId');

const fetchAllOrders = (startDate, endDate) =>
  Order.find({
    createdAt: { $gte: startDate, $lte: endDate }
  }).populate('userId').populate('items.menuItemId');

const getPaymentAmount = (payment) => payment.amount || 0;
const getOrderAmount = (order) => order.amount || 0;

const getCustomerId = (payment) => {
  const orderUser = payment.orderId?.userId;
  if (orderUser) return (orderUser._id || orderUser).toString();

  const reservationUser = payment.reservationId?.userId;
  if (reservationUser) return (reservationUser._id || reservationUser).toString();

  if (payment.reservationId?.phone) {
    return `phone:${payment.reservationId.phone}`;
  }

  return null;
};

const isBillPayment = (payment) =>
  payment.paymentType === 'Bill' ||
  payment.paymentType === 'Order' ||
  Boolean(payment.orderId);

const classifyItemRevenue = (item, orderType) => {
  const lineTotal = (item.price || 0) * (item.qty || 1);
  const category = (item.menuItemId?.category || '').toLowerCase();
  const menuTypes = item.menuItemId?.type || [];
  const itemName = (item.name || '').toLowerCase();

  if (
    category.includes('dessert') ||
    itemName.includes('dessert') ||
    itemName.includes('cake') ||
    itemName.includes('pastry')
  ) {
    return { source: 'Desserts', amount: lineTotal };
  }

  if (
    orderType === 'Bar' ||
    menuTypes.includes('Bar') ||
    category.includes('bar') ||
    category.includes('drink') ||
    category.includes('cocktail') ||
    category.includes('spirit') ||
    category.includes('wine') ||
    category.includes('beer')
  ) {
    return { source: 'Bar & Spirits', amount: lineTotal };
  }

  return { source: 'Café & Kitchen', amount: lineTotal };
};

const allocateToSources = (amount, order, sourceMap) => {
  if (order?.items?.length) {
    let allocated = 0;
    order.items.forEach((item) => {
      const { source, amount: itemAmount } = classifyItemRevenue(item, order.type);
      sourceMap[source] += itemAmount;
      allocated += itemAmount;
    });

    const remainder = amount - allocated;
    if (remainder > 0) {
      if (order.type === 'Bar') sourceMap['Bar & Spirits'] += remainder;
      else sourceMap['Café & Kitchen'] += remainder;
    }
    return;
  }

  if (order?.type === 'Bar') {
    sourceMap['Bar & Spirits'] += amount;
  } else {
    sourceMap['Café & Kitchen'] += amount;
  }
};

const buildSourceMap = (payments) => {
  const sourceMap = {
    'Bar & Spirits': 0,
    'Café & Kitchen': 0,
    Desserts: 0
  };

  payments.forEach((payment) => {
    allocateToSources(getPaymentAmount(payment), payment.orderId, sourceMap);
  });

  return sourceMap;
};

const calcGrowth = (current, previous) => {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return parseFloat((((current - previous) / previous) * 100).toFixed(1));
};

const calcGrowthLabel = (current, previous) => {
  if (previous <= 0) return current > 0 ? '+100%' : '+0%';
  const pct = ((current - previous) / previous * 100).toFixed(0);
  return `${pct >= 0 ? '+' : ''}${pct}%`;
};

const formatSources = (sourceMap, prevSourceMap) => {
  const totalRevenue = Object.values(sourceMap).reduce((a, b) => a + b, 0);

  return [
    {
      label: 'Bar & Spirits',
      value: totalRevenue > 0 ? Math.round((sourceMap['Bar & Spirits'] / totalRevenue) * 100) : 0,
      growth: calcGrowthLabel(sourceMap['Bar & Spirits'], prevSourceMap['Bar & Spirits']),
      color: 'var(--d-info)'
    },
    {
      label: 'Café & Kitchen',
      value: totalRevenue > 0 ? Math.round((sourceMap['Café & Kitchen'] / totalRevenue) * 100) : 0,
      growth: calcGrowthLabel(sourceMap['Café & Kitchen'], prevSourceMap['Café & Kitchen']),
      color: 'var(--d-success)'
    },
    {
      label: 'Desserts',
      value: totalRevenue > 0 ? Math.round((sourceMap.Desserts / totalRevenue) * 100) : 0,
      growth: calcGrowthLabel(sourceMap.Desserts, prevSourceMap.Desserts),
      color: 'var(--d-gold)'
    }
  ];
};

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const buildDailyBuckets = (days, endDate) => {
  const buckets = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(endDate);
    day.setDate(endDate.getDate() - i);
    buckets.push({
      label: day.toLocaleDateString('en-US', { weekday: 'short' }),
      sublabel: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      start: startOfDay(day),
      end: endOfDay(day)
    });
  }
  console.log(`[Reports] Built ${days} daily buckets from ${buckets[0]?.start?.toISOString()} to ${buckets[buckets.length-1]?.end?.toISOString()}`);
  return buckets;
};

const buildWeeklyBuckets = (weeks, endDate, rangeStart) => {
  const buckets = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const end = new Date(endDate);
    end.setDate(endDate.getDate() - w * 7);
    const start = new Date(end);
    start.setDate(end.getDate() - 6);

    if (start < rangeStart) start.setTime(rangeStart.getTime());

    buckets.push({
      label: `W${weeks - w}`,
      sublabel: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      start: startOfDay(start),
      end: endOfDay(end)
    });
  }
  return buckets;
};

const buildMonthlyBuckets = (months, endDate) => {
  const buckets = [];
  for (let m = months - 1; m >= 0; m--) {
    const monthDate = new Date(endDate.getFullYear(), endDate.getMonth() - m, 1);
    const start = startOfDay(monthDate);
    const end = endOfDay(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0));
    if (end > endDate) end.setTime(endDate.getTime());

    buckets.push({
      label: monthDate.toLocaleDateString('en-US', { month: 'short' }),
      sublabel: String(monthDate.getFullYear()),
      start,
      end
    });
  }
  return buckets;
};

const buildAllTimeMonthlyBuckets = (payments, paidOrders, rangeEnd) => {
  const timestamps = [
    ...payments.map((p) => new Date(p.createdAt).getTime()),
    ...paidOrders.map((o) => new Date(o.createdAt).getTime())
  ].filter(Boolean);

  if (!timestamps.length) {
    return buildMonthlyBuckets(6, rangeEnd);
  }

  const minDate = new Date(Math.min(...timestamps));
  const buckets = [];
  const cursor = new Date(minDate.getFullYear(), minDate.getMonth(), 1);

  while (cursor <= rangeEnd) {
    const start = startOfDay(cursor);
    const end = endOfDay(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0));
    const cappedEnd = end > rangeEnd ? rangeEnd : end;

    buckets.push({
      label: cursor.toLocaleDateString('en-US', { month: 'short' }),
      sublabel: String(cursor.getFullYear()),
      start,
      end: cappedEnd
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return buckets.slice(-24);
};

const buildChartBuckets = (range, startDate, endDate, payments, paidOrders) => {
  switch (range) {
    case '7days':
      return buildDailyBuckets(7, endDate);
    case '30days':
      return buildDailyBuckets(30, endDate);
    case '90days':
      return buildWeeklyBuckets(13, endDate, startDate);
    case '1year':
      return buildMonthlyBuckets(12, endDate);
    case 'all':
      return buildAllTimeMonthlyBuckets(payments, paidOrders, endDate);
    default:
      return buildDailyBuckets(7, endDate);
  }
};

const aggregateRecordsIntoBuckets = (buckets, payments, paidOrders) => {
  const paidOrderIds = new Set(
    payments
      .map((p) => p.orderId?._id?.toString() || p.orderId?.toString())
      .filter(Boolean)
  );

  const results = buckets.map((bucket) => ({
    label: bucket.label,
    sublabel: bucket.sublabel,
    rev: 0
  }));

  const addToBucket = (timestamp, amount) => {
    const time = new Date(timestamp).getTime();
    const idx = buckets.findIndex(
      (bucket) => time >= bucket.start.getTime() && time <= bucket.end.getTime()
    );
    if (idx >= 0) results[idx].rev += amount;
  };

  payments.forEach((payment) => {
    addToBucket(payment.createdAt, getPaymentAmount(payment));
  });

  paidOrders.forEach((order) => {
    if (paidOrderIds.has(order._id.toString())) return;
    addToBucket(order.createdAt, getOrderAmount(order));
  });

  return results.map((item) => ({
    ...item,
    rev: Math.round(item.rev)
  }));
};

// Summary Analytics
router.get('/analytics/summary', auth, async (req, res) => {
  try {
    const range = req.query.range || '7days';
    const { startDate, endDate } = getDateRange(range);

    const payments = await fetchPayments(startDate, endDate);
    const totalRevenue = payments.reduce((sum, p) => sum + getPaymentAmount(p), 0);
    const billPayments = payments.filter(isBillPayment);
    const totalOrders = billPayments.length || payments.length;
    const totalCustomers = new Set(payments.map(getCustomerId).filter(Boolean)).size;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const { prevStart, prevEnd } = getPreviousPeriod(startDate, endDate);
    const prevPayments = prevStart.getTime() === 0 && prevEnd.getTime() === 0
      ? []
      : await fetchPayments(prevStart, prevEnd);
    const prevRevenue = prevPayments.reduce((sum, p) => sum + getPaymentAmount(p), 0);

    res.json({
      totalRevenue: Math.round(totalRevenue),
      totalOrders,
      totalCustomers,
      avgOrderValue: Math.round(avgOrderValue),
      growth: calcGrowth(totalRevenue, prevRevenue),
      range,
      periodLabel: RANGE_LABELS[range] || RANGE_LABELS['7days']
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ message: 'Error fetching summary data' });
  }
});

// Chart Analytics (range-aware buckets)
router.get('/analytics/weekly', auth, async (req, res) => {
  try {
    const range = req.query.range || '7days';
    const { startDate, endDate } = getDateRange(range);

    const payments = await fetchPayments(startDate, endDate);
    const paidOrders = await fetchPaidOrders(startDate, endDate);

    console.log(`[Reports Weekly] Range: ${range}, Payments found: ${payments.length}, Paid Orders found: ${paidOrders.length}`);

    // If no payments or paid orders, try to get all orders as fallback
    let allOrders = [];
    if (payments.length === 0 && paidOrders.length === 0) {
      console.log(`[Reports Weekly] No payments or paid orders found, fetching all orders as fallback`);
      allOrders = await fetchAllOrders(startDate, endDate);
      console.log(`[Reports Weekly] All orders found: ${allOrders.length}`);
    }

    const buckets = buildChartBuckets(range, startDate, endDate, payments, paidOrders);
    const chartData = aggregateRecordsIntoBuckets(buckets, payments, allOrders.length > 0 ? allOrders : paidOrders);

    console.log(`[Reports Weekly] Chart data:`, JSON.stringify(chartData));

    res.json({
      range,
      periodLabel: RANGE_LABELS[range] || RANGE_LABELS['7days'],
      chartSubtitle: CHART_SUBTITLES[range] || CHART_SUBTITLES['7days'],
      data: chartData
    });
  } catch (error) {
    console.error('Error fetching weekly data:', error);
    res.status(500).json({ message: 'Error fetching weekly data' });
  }
});

// Revenue Sources
router.get('/analytics/sources', auth, async (req, res) => {
  try {
    const range = req.query.range || '7days';
    const { startDate, endDate } = getDateRange(range);

    const payments = await fetchPayments(startDate, endDate);
    const sourceMap = buildSourceMap(payments);

    const { prevStart, prevEnd } = getPreviousPeriod(startDate, endDate);
    const prevPayments = prevStart.getTime() === 0 && prevEnd.getTime() === 0
      ? []
      : await fetchPayments(prevStart, prevEnd);
    const prevSourceMap = buildSourceMap(prevPayments);

    res.json(formatSources(sourceMap, prevSourceMap));
  } catch (error) {
    console.error('Error fetching sources data:', error);
    res.status(500).json({ message: 'Error fetching sources data' });
  }
});

// Revenue Analytics
router.get('/analytics/revenue', auth, async (req, res) => {
  try {
    const range = req.query.range || '7days';
    const { startDate, endDate } = getDateRange(range);

    const payments = await fetchPayments(startDate, endDate);
    const totalRevenue = payments.reduce((sum, p) => sum + getPaymentAmount(p), 0);
    const dayCount = Math.max(
      1,
      Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
    );
    const avgDailyRevenue = Math.round(totalRevenue / dayCount);

    const dayMap = {};
    payments.forEach((payment) => {
      const day = new Date(payment.createdAt).toLocaleDateString('en-US', { weekday: 'long' });
      dayMap[day] = (dayMap[day] || 0) + getPaymentAmount(payment);
    });

    const topDay = Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    const { prevStart, prevEnd } = getPreviousPeriod(startDate, endDate);
    const prevPayments = prevStart.getTime() === 0 && prevEnd.getTime() === 0
      ? []
      : await fetchPayments(prevStart, prevEnd);
    const prevRevenue = prevPayments.reduce((sum, p) => sum + getPaymentAmount(p), 0);

    res.json({
      totalRevenue: Math.round(totalRevenue),
      avgDailyRevenue,
      topDay,
      growth: calcGrowth(totalRevenue, prevRevenue),
      range,
      periodLabel: RANGE_LABELS[range] || RANGE_LABELS['7days']
    });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({ message: 'Error fetching revenue analytics' });
  }
});

// Peak Hours/Window Analytics
router.get('/analytics/peak', auth, async (req, res) => {
  try {
    const range = req.query.range || '7days';
    const { startDate, endDate } = getDateRange(range);

    const payments = await fetchPayments(startDate, endDate);

    if (!payments.length) {
      return res.json({
        peakWindow: 'No data yet',
        avgRevenue: 0,
        orders: 0,
        customers: 0,
        growth: '+0%'
      });
    }

    const dayHourMap = {};

    payments.forEach((payment) => {
      const date = new Date(payment.createdAt);
      const hour = date.getHours();
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      const key = `${day}|${hour}`;
      dayHourMap[key] = (dayHourMap[key] || 0) + getPaymentAmount(payment);
    });

    const [peakKey] = Object.entries(dayHourMap).sort((a, b) => b[1] - a[1])[0];
    const [peakDay, peakHourStr] = peakKey.split('|');
    const peakHour = parseInt(peakHourStr, 10);
    const hourLabel = peakHour === 0
      ? '12 AM'
      : peakHour < 12
        ? `${peakHour} AM`
        : peakHour === 12
          ? '12 PM'
          : `${peakHour - 12} PM`;
    const peakWindow = `${peakDay} (${hourLabel})`;

    const peakPayments = payments.filter((payment) => {
      const date = new Date(payment.createdAt);
      return (
        date.toLocaleDateString('en-US', { weekday: 'long' }) === peakDay &&
        date.getHours() === peakHour
      );
    });

    const avgRevenue = peakPayments.length > 0
      ? Math.round(
        peakPayments.reduce((sum, p) => sum + getPaymentAmount(p), 0) / peakPayments.length
      )
      : 0;

    const peakCustomers = new Set(peakPayments.map(getCustomerId).filter(Boolean)).size;

    const { prevStart, prevEnd } = getPreviousPeriod(startDate, endDate);
    const prevPayments = prevStart.getTime() === 0 && prevEnd.getTime() === 0
      ? []
      : await fetchPayments(prevStart, prevEnd);
    const prevCount = prevPayments.length;
    const growthPct = prevCount > 0
      ? Math.round(((peakPayments.length - prevCount) / prevCount) * 100)
      : peakPayments.length > 0 ? 100 : 0;

    res.json({
      peakWindow,
      avgRevenue,
      orders: peakPayments.length,
      customers: peakCustomers,
      growth: `${growthPct >= 0 ? '+' : ''}${growthPct}%`
    });
  } catch (error) {
    console.error('Error fetching peak data:', error);
    res.status(500).json({ message: 'Error fetching peak data' });
  }
});

module.exports = router;
