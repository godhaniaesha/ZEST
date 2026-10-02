import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MdAccessTime, MdAlarm, MdClose } from 'react-icons/md';
import { attendanceAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';

// localStorage key helpers — scoped per user + date so it auto-resets next day
const getDismissKey  = (userId, date) => `att_dismissed_${userId}_${date}`;
const getLeaveEndKey = (userId, date) => `att_leave_end_${userId}_${date}`;

export default function AttendanceBanner() {
  const { user } = useAuth();
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [isAutoLeave, setIsAutoLeave] = useState(false);
  const [isVisible, setIsVisible]     = useState(false); // start hidden; show after logic
  const bannerRef = useRef(null);
  const timerRef  = useRef(null);

  const today = new Date().toISOString().split('T')[0];

  // ── Determine initial visibility from localStorage ──
  const shouldShow = useCallback(() => {
    if (!user) return false;

    const dismissed = localStorage.getItem(getDismissKey(user._id, today));
    if (!dismissed) return true; // never dismissed today → show

    // Was dismissed → only re-show if it was dismissed while on-leave AND the
    // leave timer has now expired (i.e. user came back the next moment after leave ended)
    const leaveEndTs = localStorage.getItem(getLeaveEndKey(user._id, today));
    if (leaveEndTs && Date.now() >= Number(leaveEndTs)) {
      // Leave period ended → clear the dismiss flag so banner shows again
      localStorage.removeItem(getDismissKey(user._id, today));
      localStorage.removeItem(getLeaveEndKey(user._id, today));
      return true;
    }

    return false; // still dismissed and leave hasn't ended
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

      // If already marked (present / on-leave from backend), don't show banner
      // unless they haven't dismissed it yet
      if (status) {
        // Already marked → only show if not dismissed today
        const dismissed = localStorage.getItem(getDismissKey(user._id, today));
        setIsVisible(!dismissed);
      } else {
        // Not marked → show only if user hasn't dismissed it today
        setIsVisible(shouldShow());
      }
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

  const handleAutoLeave = useCallback(async () => {
    try {
      await attendanceAPI.autoMarkLeave(user._id, today);
      setIsAutoLeave(true);
      setAttendanceStatus('on-leave');
      // Store when the "leave" ends (here we treat it as end of working day = midnight)
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      localStorage.setItem(getLeaveEndKey(user._id, today), String(midnight.getTime()));
    } catch (error) {
      console.error('Error marking auto-leave:', error);
    }
  }, [today, user]);

  // Timer for auto-leave after 10 minutes (only if not already marked)
  useEffect(() => {
    if (!attendanceStatus && !isAutoLeave) {
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
  }, [attendanceStatus, isAutoLeave, handleAutoLeave]);

  if (loading || !user || user.role === 'customer' || user.role === 'superadmin' || !isVisible) {
    return null;
  }

  const handleMarkPresent = async () => {
    try {
      const response = await attendanceAPI.markPresent(user._id, today);
      setAttendanceStatus(response.data.status || 'present');
      if (timerRef.current) clearInterval(timerRef.current);
    } catch (error) {
      console.error('Error marking present:', error);
      alert(error.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const handleClose = () => {
    // Persist dismissal keyed to user + today so it survives refresh
    localStorage.setItem(getDismissKey(user._id, today), '1');

    // If currently on-leave, also store when leave ends (midnight = next day)
    if (attendanceStatus === 'on-leave' || isAutoLeave) {
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      localStorage.setItem(getLeaveEndKey(user._id, today), String(midnight.getTime()));
    }

    setIsVisible(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const iconColor = attendanceStatus ? '#2ecc71' : '#C9A84C';
  const iconBg = attendanceStatus ? 'rgba(46, 204, 113, 0.2)' : 'rgba(201, 168, 76, 0.2)';
  const iconBorder = attendanceStatus ? 'rgba(46, 204, 113, 0.4)' : 'rgba(201, 168, 76, 0.4)';

  return (
    <div 
      className="att-banner-wrapper"
      ref={bannerRef}
    >
      <div 
        className="att-banner-card"
        data-status={attendanceStatus ? 'marked' : 'unmarked'}
        onClick={!attendanceStatus ? handleMarkPresent : undefined}
        onMouseEnter={(e) => {
          if (!attendanceStatus) {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.6)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(201, 168, 76, 0.3)';
          }
        }}
        onMouseLeave={(e) => {
          if (!attendanceStatus) {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.3)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
          }
        }}
      >
        <div className="att-banner-icon">
          <MdAccessTime size={24} style={{ color: iconColor }} />
        </div>
        
        <div className="att-banner-content">
          <div className="att-banner-subtitle">
            Attendance Tracker
          </div>
          <div className="att-banner-title">
            {attendanceStatus 
              ? `✓ ${attendanceStatus.charAt(0).toUpperCase() + attendanceStatus.slice(1)}` 
              : 'Tap to Mark Present'
            }
          </div>
          <div className="att-banner-timer">
            <MdAlarm size={14} style={{ color: '#C9A84C' }} />
            <span>
              {!attendanceStatus 
                ? `Auto-leave in: ${formatTime(timeLeft)}` 
                : 'Successfully marked'
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
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          min-width: 340px;
          border: 2px solid rgba(201, 168, 76, 0.3);
          animation: slideInRight 0.6s ease;
          backdrop-filter: blur(10px);
        }

        .att-banner-card[data-status="marked"] {
          cursor: default;
          opacity: 0.9;
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
          color: #C9A84C;
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
