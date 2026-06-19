import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MdAccessTime, MdAlarm, MdClose } from 'react-icons/md';
import { attendanceAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';

export default function AttendanceBanner() {
  const { user } = useAuth();
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [isAutoLeave, setIsAutoLeave] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const bannerRef = useRef(null);
  const timerRef = useRef(null);

  const today = new Date().toISOString().split('T')[0];

  const loadTodayAttendance = useCallback(async () => {
    if (!user || user.role === 'customer' || user.role === 'superadmin') {
      setLoading(false);
      return;
    }

    try {
      const res = await attendanceAPI.getAll({ date: today });
      const todayAttendance = res.data.find(a => a.staffId === user._id);
      setAttendanceStatus(todayAttendance?.status || null);
    } catch (error) {
      console.error('Error loading attendance:', error);
      setAttendanceStatus(null); // Show banner even on error
    } finally {
      setLoading(false);
    }
  }, [today, user]);

  useEffect(() => {
    loadTodayAttendance();
  }, [loadTodayAttendance]);

  const handleAutoLeave = useCallback(async () => {
    try {
      await attendanceAPI.autoMarkLeave(user._id, today);
      setIsAutoLeave(true);
      setAttendanceStatus('on-leave');
    } catch (error) {
      console.error('Error marking auto-leave:', error);
    }
  }, [today, user._id]);

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
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [attendanceStatus, isAutoLeave, handleAutoLeave]);

  // Only show for staff users, not customers or superadmin
  // Banner shows full day regardless of attendance status
  if (loading || !user || user.role === 'customer' || user.role === 'superadmin' || !isVisible) {
    return null;
  }

  const handleMarkPresent = async () => {
    try {
      console.log('Marking present for user:', user._id, 'on date:', today);
      const response = await attendanceAPI.markPresent(user._id, today);
      console.log('Mark present response:', response.data);
      setAttendanceStatus(response.data.status || 'present');
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    } catch (error) {
      console.error('Error marking present:', error);
      alert(error.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        width: 'auto',
        maxWidth: '350px'
      }}
      ref={bannerRef}
    >
      <div 
        style={{
          background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
          color: '#ffffff',
          padding: '16px 24px',
          borderRadius: '12px',
          cursor: attendanceStatus ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          minWidth: '340px',
          border: '2px solid rgba(201, 168, 76, 0.3)',
          animation: 'slideInRight 0.6s ease',
          opacity: attendanceStatus ? 0.9 : 1,
          backdropFilter: 'blur(10px)'
        }}
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
        <div style={{
          background: attendanceStatus ? 'rgba(46, 204, 113, 0.2)' : 'rgba(201, 168, 76, 0.2)',
          padding: '12px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: attendanceStatus ? '2px solid rgba(46, 204, 113, 0.4)' : '2px solid rgba(201, 168, 76, 0.4)'
        }}>
          <MdAccessTime size={24} style={{ color: attendanceStatus ? '#2ecc71' : '#C9A84C' }} />
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontSize: '0.7rem', 
            opacity: 0.8, 
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontWeight: 600,
            color: '#C9A84C'
          }}>
            Attendance Tracker
          </div>
          <div style={{ 
            fontSize: '1rem', 
            fontWeight: 700,
            marginBottom: '4px',
            letterSpacing: '0.5px'
          }}>
            {attendanceStatus 
              ? `✓ ${attendanceStatus.charAt(0).toUpperCase() + attendanceStatus.slice(1)}` 
              : 'Tap to Mark Present'
            }
          </div>
          <div style={{ 
            fontSize: '0.75rem', 
            opacity: 0.9,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 500
          }}>
            <MdAlarm size={14} style={{ color: '#C9A84C' }} />
            {!attendanceStatus 
              ? `Auto-leave in: ${formatTime(timeLeft)}` 
              : 'Successfully marked'
            }
          </div>
        </div>

        <div 
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '8px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            border: '1px solid rgba(255, 255, 255, 0.1)'
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
      `}</style>
    </div>
  );
}
