import React, { useState, useEffect } from 'react';
import { Row, Col, ProgressBar } from 'react-bootstrap';
import {
  MdTrendingUp, MdReceiptLong, MdPeople, MdStar,
  MdArrowUpward, MdArrowDownward, MdMoreVert,
  MdLocalCafe, MdLocalBar, MdInventory, MdNotificationsActive,
  MdFiberManualRecord, MdDashboard
} from 'react-icons/md';
import { usersAPI, attendanceAPI } from '../../../api';

const STATS = [
  { icon: <MdTrendingUp />, color: 'd-gold',  value: '₹1,24,500', label: "Total Revenue", change: '+12%', dir: 'up' },
  { icon: <MdLocalCafe />,   color: 'd-green', value: '₹45,200',   label: "Cafe Sales",    change: '+8%',  dir: 'up' },
  { icon: <MdLocalBar />,    color: 'd-blue',  value: '₹79,300',   label: "Bar Sales",     change: '+15%', dir: 'up' },
  { icon: <MdReceiptLong />, color: 'd-red',   value: '87',        label: 'Total Orders',  change: '+5%',  dir: 'up' },
];

const RECENT_ORDERS = [
  { id: '#T-1021', table: 'Table 4', items: 'Cappuccino, Croissant', type: 'Cafe', amount: '₹450',  status: 'Served',  statusClass: 'd-chip-green' },
  { id: '#T-1020', table: 'Table 7', items: 'Old Fashioned, Nachos', type: 'Bar',  amount: '₹1,250', status: 'Preparing',statusClass: 'd-chip-gold' },
  { id: '#T-1019', table: 'Bar',     items: 'Draft Beer x2',         type: 'Bar',  amount: '₹800',  status: 'Served',  statusClass: 'd-chip-green' },
  { id: '#T-1018', table: 'Table 2', items: 'Iced Latte, Sandwich',  type: 'Cafe', amount: '₹520',  status: 'Pending', statusClass: 'd-chip-blue' },
  { id: '#T-1018', table: 'Table 2', items: 'Iced Latte, Sandwich',  type: 'Cafe', amount: '₹520',  status: 'Pending', statusClass: 'd-chip-blue' },
  { id: '#T-1018', table: 'Table 2', items: 'Iced Latte, Sandwich',  type: 'Cafe', amount: '₹520',  status: 'Pending', statusClass: 'd-chip-blue' },
  { id: '#T-1018', table: 'Table 2', items: 'Iced Latte, Sandwich',  type: 'Cafe', amount: '₹520',  status: 'Pending', statusClass: 'd-chip-blue' },
  { id: '#T-1018', table: 'Table 2', items: 'Iced Latte, Sandwich',  type: 'Cafe', amount: '₹520',  status: 'Pending', statusClass: 'd-chip-blue' },
];

const TOP_ITEMS = [
  { name: 'Cold Brew Coffee', sales: 45, progress: 85, color: 'success', category: 'Cafe' },
  { name: 'Signature Cocktail', sales: 38, progress: 70, color: 'warning', category: 'Bar' },
  { name: 'Classic Mojito', sales: 32, progress: 60, color: 'info', category: 'Bar' },
  { name: 'Avocado Toast', sales: 28, progress: 50, color: 'primary', category: 'Cafe' },
];

const INVENTORY_ALERTS = [
  { item: 'Coffee Beans (Arabica)', stock: '2.5kg', status: 'Low', color: 'var(--d-danger)' },
  { item: 'Single Malt Whiskey', stock: '2 bottles', status: 'Critical', color: 'var(--d-danger)' },
  { item: 'Fresh Mint Leaves', stock: 'Limited', status: 'Restock', color: 'var(--d-warning)' },
];

export default function Dashboard() {
  const [staffList, setStaffList] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaffAndAttendance();
  }, []);

  const fetchStaffAndAttendance = async () => {
    try {
      setLoading(true);
      
      const [staffRes, attendanceRes] = await Promise.all([
        usersAPI.getStaff(),
        attendanceAPI.getAll()
      ]);

      const staff = staffRes.data || [];
      const attendance = attendanceRes.data || [];

      setStaffList(staff);
      setAttendanceData(attendance);
    } catch (error) {
      console.error('Error fetching staff and attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceStatus = (staffId) => {
    const record = attendanceData.find(
      a => a.staffId?._id === staffId || a.staffId === staffId
    );
    if (!record) return { status: 'Not Marked', color: 'secondary' };
    if (record.status === 'present') return { status: 'Present', color: 'success' };
    if (record.status === 'absent') return { status: 'Absent', color: 'danger' };
    if (record.status === 'late') return { status: 'Late', color: 'warning' };
    if (record.status === 'on-leave') return { status: 'On Leave', color: 'info' };
    return { status: 'Not Marked', color: 'secondary' };
  };

  const handleDownloadReport = () => { 
    alert("Downloading sales report...");
  };

  const handleNewOrder = () => {
    alert("Opening new order form...");
  };

  const viewAllOrders = () => {
    alert("Navigating to Orders page...");
  };

  const manageRoster = () => {
    alert("Navigating to Staff page...");
  };

  const handleTableClick = (tableNum) => {
    alert(`Table ${tableNum} details`);
  };

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading d-flex align-items-center gap-2">
            <MdDashboard /> Dashboard Overview
          </div>
          <div className="d-page-sub">Real-time management for Breva Café & Bar</div>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <button className="d-btn-outline d-hide-mobile" onClick={handleDownloadReport}>Download Report</button>
          <button className="d-btn-gold" onClick={handleNewOrder}>+ New Order</button>
        </div>
      </div>

      {/* Main Stats */}
      <Row className="g-3 mb-4">
        {STATS.map((s, i) => (
          <Col key={i} xs={12} sm={6} xl={3}>
            <div className="d-stat-card">
              <div className={`d-stat-icon ${s.color}`}>{s.icon}</div>
              <div className="flex-grow-1">
                <div className="d-stat-value">{s.value}</div>
                <div className="d-stat-label">{s.label}</div>
                <div className={`d-stat-change ${s.dir}`}>
                  {s.dir === 'up' ? <MdArrowUpward /> : <MdArrowDownward />} {s.change}
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <Row className="g-3 mb-4">
        {/* Recent Orders */}
        <Col xs={12} xl={8}>
          <div className="d-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <div className="d-section-title">Live Orders</div>
                <div className="d-section-sub">Tracking Café & Bar active sessions</div>
              </div>
              <button className="d-btn-outline" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={viewAllOrders}>View All</button>
            </div>
            <div className="d-table-wrap">
              <table className="d-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Source</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_ORDERS.map((o) => (
                    <tr key={o.id}>
                      <td><strong>{o.id}</strong></td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {o.type === 'Cafe' ? <MdLocalCafe className="text-success" /> : <MdLocalBar className="text-primary" />}
                          <span>{o.table}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--d-text-muted)' }}>{o.items}</td>
                      <td><strong>{o.amount}</strong></td>
                      <td><span className={`d-chip ${o.statusClass}`}>{o.status}</span></td>
                      <td><button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--d-text-muted)' }}><MdMoreVert /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Col>

        {/* Top Selling & Inventory */}
        <Col xs={12} xl={4}>
          <div className="d-card mb-3">
            <div className="d-section-title">Top Selling Items</div>
            <div className="d-section-sub">Popular choices this week</div>
            <div className="mt-3">
              {TOP_ITEMS.map((item, idx) => (
                <div key={idx} className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{item.sales} sales</span>
                  </div>
                  <ProgressBar now={item.progress} variant={item.color} style={{ height: '6px' }} />
                </div>
              ))}
            </div>
          </div>

          <div className="d-card">
            <div className="d-flex align-items-center gap-2 mb-3">
              <MdNotificationsActive className="text-danger" />
              <div className="d-section-title mb-0">Inventory Alerts</div>
            </div>
            <div className="d-sidebar-scroll" style={{ maxHeight: '180px', overflowY: 'auto' }}>
              {INVENTORY_ALERTS.map((alert, idx) => (
                <div key={idx} className="d-flex align-items-center justify-content-between p-2 border-bottom border-light">
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{alert.item}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>Stock: {alert.stock}</div>
                  </div>
                  <span className="d-chip" style={{ background: alert.color + '20', color: alert.color }}>
                    {alert.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>

      <Row className="g-3">
        {/* Table Status Grid */}
        <Col xs={12} xl={8}>
          <div className="d-card">
            <div className="d-section-title">Table Status</div>
            <div className="d-section-sub">Real-time floor management</div>
            <div className="d-table-status-grid mt-3">
              {Array.from({ length: 12 }, (_, i) => {
                const statuses = ['occupied', 'occupied', 'free', 'occupied', 'free', 'reserved', 'occupied', 'free', 'occupied', 'free', 'occupied', 'reserved'];
                const s = statuses[i];
                const color = s === 'occupied' ? 'var(--d-danger)' : s === 'reserved' ? 'var(--d-info)' : 'var(--d-success)';
                const bg = s === 'occupied' ? 'rgba(231,76,60,0.1)' : s === 'reserved' ? 'rgba(52,152,219,0.1)' : 'rgba(46,204,113,0.1)';
                return (
                  <div 
                    key={i} 
                    style={{
                      background: bg,
                      border: `1.5px solid ${color}`,
                      borderRadius: 'var(--d-radius-md)',
                      padding: '12px 8px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'var(--d-transition)',
                      position: 'relative'
                    }}
                    onClick={() => handleTableClick(i + 1)}
                  >
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color, fontFamily: 'Lato,sans-serif' }}>T{i + 1}</div>
                    <div style={{ fontSize: '0.6rem', color, textTransform: 'uppercase', fontWeight: 700, marginTop: '2px' }}>{s}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 d-flex gap-3 flex-wrap">
              {[['Free','var(--d-success)'], ['Occupied','var(--d-danger)'], ['Reserved','var(--d-info)']].map(([l, c]) => (
                <div key={l} className="d-flex align-items-center gap-2" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--d-text-muted)' }}>
                  <MdFiberManualRecord style={{ color: c }} /> {l}
                </div>
              ))}
            </div>
          </div>
        </Col>

        {/* Quick Actions / Staff */}
        <Col xs={12} xl={4}>
          <div className="d-card h-100">
            <div className="d-section-title">Quick Staff Overview</div>
            <div className="d-section-sub">Active members on duty</div>
            <div className="mt-3">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--d-text-muted)' }}>
                  Loading staff data...
                </div>
              ) : staffList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--d-text-muted)' }}>
                  No staff members found
                </div>
              ) : (
                staffList.map((staff) => {
                  const attendance = getAttendanceStatus(staff._id);
                  return (
                    <div key={staff._id} className="d-flex align-items-center gap-3 mb-3 p-2 rounded" style={{ background: 'var(--d-bg)' }}>
                      <div className="d-avatar" style={{ width: '32px', height: '32px', fontSize: '0.7rem' }}>
                        {staff.name ? staff.name.split(' ').map(n => n[0]).join('') : 'NA'}
                      </div>
                      <div className="flex-grow-1">
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{staff.name || 'Unknown'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>
                          {staff.role ? staff.role.charAt(0).toUpperCase() + staff.role.slice(1) : 'Staff'}
                        </div>
                      </div>
                      <span className={`badge bg-${attendance.color}`} style={{ fontSize: '0.6rem' }}>
                        {attendance.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
            <button className="d-btn-primary w-100 mt-2" style={{ justifyContent: 'center' }} onClick={manageRoster}>Manage Roster</button>
          </div>
        </Col>
      </Row>
    </>
  );
}
