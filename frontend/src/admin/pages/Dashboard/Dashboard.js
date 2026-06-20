import React, { useState, useEffect } from 'react';
import { Row, Col, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  MdTrendingUp, MdReceiptLong, MdPeople, MdStar,
  MdArrowUpward, MdArrowDownward, MdMoreVert,
  MdLocalCafe, MdLocalBar, MdInventory, MdNotificationsActive,
  MdFiberManualRecord, MdDashboard
} from 'react-icons/md';
import { usersAPI, attendanceAPI, ordersAPI, inventoryAPI, tablesAPI, reportsAPI } from '../../../api';


export default function Dashboard() {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [stats, setStats] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [staffRes, attendanceRes, ordersRes, inventoryRes, tablesRes, reportsRes] = await Promise.all([
        usersAPI.getStaff(),
        attendanceAPI.getAll(),
        ordersAPI.getAll(),
        inventoryAPI.getAll(),
        tablesAPI.getAll(),
        reportsAPI.getSummary('7days')
      ]);

      const staff = staffRes.data || [];
      const attendance = attendanceRes.data || [];
      const orders = ordersRes.data || [];
      const inventory = inventoryRes.data || [];
      const tablesData = tablesRes.data || [];
      const reports = reportsRes.data || {};

      setStaffList(staff);
      setAttendanceData(attendance);
      setTables(tablesData);

      // Process stats from reports
      const totalRevenue = reports.totalRevenue || 0;
      const totalOrders = reports.totalOrders || 0;
      const growth = reports.growth || 0;
      
      // Calculate cafe vs bar sales from orders
      let cafeSales = 0;
      let barSales = 0;
      orders.forEach(order => {
        if (order.type === 'Dine-in') {
          cafeSales += order.amount || 0;
        } else if (order.type === 'Bar') {
          barSales += order.amount || 0;
        }
      });

      setStats([
        { icon: <MdTrendingUp />, color: 'd-gold',  value: `₹${totalRevenue.toLocaleString()}`, label: "Total Revenue", change: `${growth >= 0 ? '+' : ''}${growth}%`, dir: growth >= 0 ? 'up' : 'down' },
        { icon: <MdLocalCafe />,   color: 'd-green', value: `₹${cafeSales.toLocaleString()}`,   label: "Cafe Sales",    change: '+8%',  dir: 'up' },
        { icon: <MdLocalBar />,    color: 'd-blue',  value: `₹${barSales.toLocaleString()}`,   label: "Bar Sales",     change: '+15%', dir: 'up' },
        { icon: <MdReceiptLong />, color: 'd-red',   value: totalOrders,        label: 'Total Orders',  change: '+5%',  dir: 'up' },
      ]);

      // Process recent orders (last 8)
      const recent = orders.slice(0, 8).map(order => ({
        id: `#${order.id}`,
        table: order.table,
        items: order.items?.map(item => item.name).join(', ') || 'No items',
        type: order.type === 'Bar' ? 'Bar' : 'Cafe',
        amount: `₹${order.amount?.toLocaleString() || 0}`,
        status: order.status || 'Pending',
        statusClass: order.status === 'Paid' ? 'd-chip-green' : order.status === 'Pending' ? 'd-chip-blue' : 'd-chip-gold'
      }));
      setRecentOrders(recent);

      // Calculate top selling items from orders
      const itemSales = {};
      orders.forEach(order => {
        order.items?.forEach(item => {
          const itemName = item.name;
          if (!itemSales[itemName]) {
            itemSales[itemName] = { 
              name: itemName, 
              sales: 0, 
              category: order.type === 'Bar' ? 'Bar' : 'Cafe' 
            };
          }
          itemSales[itemName].sales += item.qty || 1;
        });
      });

      const topSelling = Object.values(itemSales)
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 4)
        .map((item, index) => {
          const maxSales = Math.max(...Object.values(itemSales).map(i => i.sales));
          const progress = maxSales > 0 ? (item.sales / maxSales) * 100 : 0;
          const colors = ['success', 'warning', 'info', 'primary'];
          return {
            name: item.name,
            sales: item.sales,
            progress: Math.round(progress),
            color: colors[index] || 'primary',
            category: item.category
          };
        });
      setTopItems(topSelling);

      // Process inventory alerts (low stock items)
      const alerts = inventory
        .filter(item => item.status === 'Low' || item.status === 'Critical')
        .slice(0, 5)
        .map(item => ({
          item: item.name,
          stock: `${item.quantity} ${item.unit}`,
          status: item.status,
          color: item.status === 'Critical' ? 'var(--d-danger)' : 'var(--d-warning)'
        }));
      setInventoryAlerts(alerts);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
    navigate('/admin/reports');
  };

  const handleNewOrder = () => {
    navigate('/admin/take-order');
  };

  const viewAllOrders = () => {
    navigate('/admin/orders');
  };

  const manageRoster = () => {
    navigate('/admin/staff');
  };

  const handleTableClick = (tableNum) => {
    navigate('/admin/tables');
  };

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading d-flex align-items-center gap-2">
            <MdDashboard /> Dashboard Overview
          </div>
          <div className="d-page-sub">Real-time management for Zest Café & Bar</div>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <button className="d-btn-outline d-hide-mobile" onClick={handleDownloadReport}>Download Report</button>
          <button className="d-btn-gold" onClick={handleNewOrder}>+ New Order</button>
        </div>
      </div>

      {/* Main Stats */}
      <Row className="g-3 mb-4">
        {stats.map((s, i) => (
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
                  {recentOrders.map((o) => (
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
              {topItems.map((item, idx) => (
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
              {inventoryAlerts.map((alert, idx) => (
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
              {tables.length > 0 ? tables.map((table, i) => {
                const s = table.status?.toLowerCase() || 'free';
                const color = s === 'occupied' ? 'var(--d-danger)' : s === 'reserved' ? 'var(--d-info)' : 'var(--d-success)';
                const bg = s === 'occupied' ? 'rgba(231,76,60,0.1)' : s === 'reserved' ? 'rgba(52,152,219,0.1)' : 'rgba(46,204,113,0.1)';
                return (
                  <div 
                    key={table._id || i} 
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
                    onClick={() => handleTableClick(table.number)}
                  >
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color, fontFamily: 'Lato,sans-serif' }}>{table.type === 'Bar' ? 'B' : 'T'}{table.number}</div>
                    <div style={{ fontSize: '0.6rem', color, textTransform: 'uppercase', fontWeight: 700, marginTop: '2px' }}>{s}</div>
                  </div>
                );
              }) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: 'var(--d-text-muted)' }}>
                  No tables found
                </div>
              )}
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
