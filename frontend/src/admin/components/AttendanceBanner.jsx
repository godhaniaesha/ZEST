import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MdAccessTime, MdAlarm, MdClose, MdCheckCircle } from 'react-icons/md';
import { attendanceAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';

const getDismissKey  = (userId, date) => `att_dismissed_${userId}_${date}`;
const getLeaveEndKey = (userId, date) => `att_leave_end_${userId}_${date}`;

const toLocalDateStr = (d = new Date()) => {
  const dt = d instanceof Date ? d : new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export default function AttendanceBanner() {
  const { user } = useAuth();
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [timeLeft, setTimeLeft] = useState(600);
  const [isAutoLeave, setIsAutoLeave] = useState(false);
  const [isVisible, setIsVisible]     = useState(false);
  const [marking, setMarking]         = useState(false);
  const bannerRef = useRef(null);
  const timerRef  = useRef(null);
  const autoHideRef = useRef(null);

  const today = toLocalDateStr();

  const shouldShow = useCallback(() => {
    if (!user) return false;
    const dismissed = localStorage.getItem(getDismissKey(user._id, today));
    if (!dismissed) return true;
    const leaveEndTs = localStorage.getItem(getLeaveEndKey(user._id, today));
    if (leaveEndTs && Date.now() >= Number(leaveEndTs)) {
      localStorage.removeItem(getDismissKey(user._id, today));
      localStorage.removeItem(getLeaveEndKey(user._id, today));
      return true;
    }
    return false;
  }, [user, today]);

  const scheduleAutoHide = useCallback((delayMs = 3500) => {
    if (autoHideRef.current) clearTimeout(autoHideRef.current);
    autoHideRef.current = setTimeout(() => {
      localStorage.setItem(getDismissKey(user._id, today), '1');
      setIsVisible(false);
    }, delayMs);
  }, [user, today]);

  const loadTodayAttendance = useCallback(async () => {
    if (!user || user.role === 'customer' || user.role === 'superadmin') {
      setLoading(false);
      return;
    }
    try {
      const res = await attendanceAPI.getAll({ date: today });
      const todayAttendance = res.data.find(a => a.staffId === user._id);
      const status = todayAttendance?.status || null;
      setAttendanceStatus(status);
      const dismissed = localStorage.getItem(getDismissKey(user._id, today));
      setIsVisible(!dismissed);
    } catch (error) {
      console.error('Error loading attendance:', error);
      setIsVisible(shouldShow());
    } finally {
      setLoading(false);
    }
  }, [today, user, shouldShow]);

  useEffect(() => {
    loadTodayAttendance();
  }, [loadTodayAttendance]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoHideRef.current) clearTimeout(autoHideRef.current);
    };
  }, []);

  const handleAutoLeave = useCallback(async () => {
    try {
      await attendanceAPI.autoMarkLeave(user._id, today);
      setIsAutoLeave(true);
      setAttendanceStatus('on-leave');
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      localStorage.setItem(getLeaveEndKey(user._id, today), String(midnight.getTime()));
      localStorage.setItem(getDismissKey(user._id, today), '1');
      scheduleAutoHide(5000);
    } catch (error) {
      console.error('Error marking auto-leave:', error);
    }
  }, [today, user, scheduleAutoHide]);

  useEffect(() => {
    if (!attendanceStatus && !isAutoLeave && !loading) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoLeave();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [attendanceStatus, isAutoLeave, loading, handleAutoLeave]);

  if (loading || !user || user.role === 'customer' || user.role === 'superadmin' || !isVisible) {
    return null;
  }

  const handleMarkPresent = async () => {
    if (attendanceStatus || marking) return;
    try {
      setMarking(true);
      const response = await attendanceAPI.markPresent(user._id, today);
      setAttendanceStatus(response.data.status || 'present');
      if (timerRef.current) clearInterval(timerRef.current);
      localStorage.setItem(getDismissKey(user._id, today), '1');
      scheduleAutoHide(3500);
    } catch (error) {
      console.error('Error marking present:', error);
      alert(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setMarking(false);
    }
  };

  const handleClose = () => {
    localStorage.setItem(getDismissKey(user._id, today), '1');
    if (attendanceStatus === 'on-leave' || isAutoLeave) {
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      localStorage.setItem(getLeaveEndKey(user._id, today), String(midnight.getTime()));
    }
    if (autoHideRef.current) clearTimeout(autoHideRef.current);
    setIsVisible(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isMarked = !!attendanceStatus;
  const iconColor = isMarked ? '#2ecc71' : marking ? '#8B7355' : '#C9A84C';
  const iconBg = isMarked ? 'rgba(46, 204, 113, 0.2)' : 'rgba(201, 168, 76, 0.2)';
  const iconBorder = isMarked ? 'rgba(46, 204, 113, 0.4)' : 'rgba(201, 168, 76, 0.4)';
  const statusDisplay = attendanceStatus
    ? attendanceStatus.replace('half-day', 'Half Day').replace('on-leave', 'On Leave')
    : marking ? 'Marking...' : null;

  return (
    <div 
      className="att-banner-wrapper"
      ref={bannerRef}
    >
      <div 
        className="att-banner-card"
        data-status={isMarked ? 'marked' : 'unmarked'}
        onClick={!isMarked && !marking ? handleMarkPresent : undefined}
        onMouseEnter={(e) => {
          if (!isMarked && !marking) {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.6)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(201, 168, 76, 0.3)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isMarked) {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.3)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
          }
        }}
      >
        <div className="att-banner-icon">
          {isMarked ? (
            <MdCheckCircle size={24} style={{ color: iconColor }} />
          ) : (
            <MdAccessTime size={24} style={{ color: iconColor }} />
          )}
        </div>
        
        <div className="att-banner-content">
          <div className="att-banner-subtitle">
            Attendance Tracker • {today}
          </div>
          <div className="att-banner-title">
            {isMarked 
              ? `✓ ${statusDisplay.charAt(0).toUpperCase() + statusDisplay.slice(1)}` 
              : marking ? 'Marking...' : 'Tap to Mark Present'
            }
          </div>
          <div className="att-banner-timer">
            <MdAlarm size={14} style={{ color: isMarked ? '#2ecc71' : '#C9A84C' }} />
            <span>
              {!isMarked 
                ? `Auto-leave in: ${formatTime(timeLeft)}` 
                : `Successfully marked (${today})`
              }
            </span>
          </div>
        </div>

        <div 
          className="att-banner-close"
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'rotate(90deg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'rotate(0deg)';
          }}
        >
          <MdClose size={18} />
        </div>
      </div>
      
      <style jsx>{`
        .att-banner-wrapper {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          width: auto;
          max-width: 350px;
        }

        .att-banner-card {
          background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
          color: #ffffff;
          padding: 16px 24px;
          border-radius: 12px;
          cursor: ${isMarked || marking ? 'default' : 'pointer'};
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          min-width: 340px;
          border: 2px solid ${iconBorder};
          animation: slideInRight 0.6s ease;
          backdrop-filter: blur(10px);
        }

        .att-banner-card[data-status="marked"] {
          cursor: default;
          opacity: 0.95;
        }

        .att-banner-icon {
          background: ${iconBg};
          padding: 12px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid ${iconBorder};
          flex-shrink: 0;
        }

        .att-banner-content {
          flex: 1;
          min-width: 0;
        }

        .att-banner-subtitle {
          font-size: 0.7rem;
          opacity: 0.8;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
          color: ${isMarked ? '#2ecc71' : '#C9A84C'};
        }

        .att-banner-title {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 4px;
          letter-spacing: 0.5px;
          line-height: 1.3;
        }

        .att-banner-timer {
          font-size: 0.75rem;
          opacity: 0.9;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
        }

        .att-banner-close {
          background: rgba(255, 255, 255, 0.1);
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          border: 1px solid rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 480px) {
          .att-banner-wrapper {
            top: 10px;
            left: 50%;
            right: auto;
            transform: translateX(-50%);
            max-width: calc(100vw - 20px);
            width: calc(100vw - 20px);
          }

          .att-banner-card {
            min-width: auto;
            width: 100%;
            padding: 12px 14px;
            gap: 10px;
            animation: slideInDown 0.6s ease;
          }

          .att-banner-icon {
            padding: 8px;
          }

          .att-banner-icon :global(svg) {
            width: 18px !important;
            height: 18px !important;
          }

          .att-banner-subtitle {
            font-size: 0.55rem;
            letter-spacing: 0.5px;
          }

          .att-banner-title {
            font-size: 0.8rem;
            letter-spacing: 0.2px;
          }

          .att-banner-timer {
            font-size: 0.65rem;
            gap: 4px;
          }

          .att-banner-timer :global(svg) {
            width: 11px !important;
            height: 11px !important;
          }

          .att-banner-close {
            padding: 6px;
          }

          .att-banner-close :global(svg) {
            width: 14px !important;
            height: 14px !important;
          }
        }

        @media (max-width: 360px) {
          .att-banner-wrapper {
            max-width: calc(100vw - 16px);
            width: calc(100vw - 16px);
          }

          .att-banner-card {
            padding: 10px 12px;
            gap: 8px;
          }

          .att-banner-icon {
            padding: 6px;
          }

          .att-banner-icon :global(svg) {
            width: 16px !important;
            height: 16px !important;
          }

          .att-banner-subtitle {
            font-size: 0.5rem;
            letter-spacing: 0.3px;
            margin-bottom: 2px;
          }

          .att-banner-title {
            font-size: 0.7rem;
            margin-bottom: 2px;
          }

          .att-banner-timer {
            font-size: 0.6rem;
          }

          .att-banner-close {
            padding: 5px;
          }

          .att-banner-close :global(svg) {
            width: 12px !important;
            height: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
