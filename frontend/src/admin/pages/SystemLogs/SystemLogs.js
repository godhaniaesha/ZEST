import React from 'react';
import { MdHistory, MdFilterList } from 'react-icons/md';

export default function SystemLogs() {
  const LOGS = [
    { time: '2026-05-25 14:30', user: 'Admin', action: 'Login Success', module: 'Auth', status: 'Info' },
    { time: '2026-05-25 14:15', user: 'Chef Marco', action: 'Updated Menu Item #45', module: 'Menu', status: 'Success' },
    { time: '2026-05-25 13:45', user: 'System', action: 'Daily Backup Completed', module: 'System', status: 'Info' },
    { time: '2026-05-25 12:30', user: 'Manager John', action: 'Changed Table Status T-4', module: 'Floor', status: 'Warning' },
  ];

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading d-flex align-items-center gap-2">
            <MdHistory /> System Logs
          </div>
          <div className="d-page-sub">Track all system activities and security events</div>
        </div>
        <button className="d-btn-outline"><MdFilterList /> Filter Logs</button>
      </div>

      <div className="d-card">
        <div className="d-table-wrap">
          <table className="d-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Module</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {LOGS.map((log, i) => (
                <tr key={i}>
                  <td style={{ fontSize: '0.85rem' }} title={log.time}>{log.time}</td>
                  <td title={log.user}><strong>{log.user}</strong></td>
                  <td title={log.action}>{log.action}</td>
                  <td title={log.module}><span className="d-chip d-chip-blue" style={{ fontSize: '0.7rem' }}>{log.module}</span></td>
                  <td title={log.status}><span className={`d-chip ${log.status === 'Success' ? 'd-chip-green' : 'd-chip-gold'}`}>{log.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
