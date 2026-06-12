import React, { useState, useEffect } from "react";
import { Row, Col, Badge } from "react-bootstrap";
import {
  MdLocalAtm,
  MdReceipt,
  MdShoppingCart,
  MdPayment,
  MdSearch,
  MdDelete,
  MdAdd,
  MdRemove,
  MdTableRestaurant,
} from "react-icons/md";
import { menuAPI, ordersAPI, reservationsAPI } from "../../../api";

export default function POS() {
  const [menuItems, setMenuItems] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState("");
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [menuRes, resRes] = await Promise.all([
          menuAPI.getAll(),
          reservationsAPI.getAll(),
        ]);
        setMenuItems(Array.isArray(menuRes.data) ? menuRes.data : []);
        setReservations(
          Array.isArray(resRes.data)
            ? resRes.data.filter((r) => r.status === "Confirmed")
            : []
        );
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadOrdersForReservation = async () => {
      if (!selectedReservation) {
        setCart([]);
        return;
      }

      try {
        const res = await ordersAPI.getByReservationId(selectedReservation);
        const orders = Array.isArray(res.data) ? res.data : [];
        
        const combinedItems = [];
        orders.forEach((order) => {
          if (Array.isArray(order.items)) {
            order.items.forEach((item) => {
              const existing = combinedItems.find((i) => i.name === item.name);
              if (existing) {
                existing.qty += item.qty;
              } else {
                combinedItems.push({ ...item, id: item.name });
              }
            });
          }
        });
        setCart(combinedItems);
      } catch (error) {
        console.error("Error loading orders:", error);
      }
    };

    loadOrdersForReservation();
  }, [selectedReservation]);

  const filteredMenuItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i._id === item._id || i.name === item.name);
      if (existing) {
        return prevCart.map((i) =>
          (i._id === item._id || i.name === item.name) ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      return [...prevCart, { ...item, qty: 1, id: item._id || item.name }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          (item.id === id || item._id === id)
            ? { ...item, qty: Math.max(1, item.qty + delta) }
            : item,
        )
        .filter((item) => item.qty > 0),
    );
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id && item._id !== id));
  };

  const handlePayment = () => {
    alert(
      `Payment of ₹${total.toLocaleString()} completed via ${paymentMethod}`,
    );
    setCart([]);
    setSelectedReservation("");
  };

  const handlePrintBill = () => {
    alert("Bill sent to printer");
  };

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading d-flex align-items-center gap-2">
            <MdPayment /> POS & Billing
          </div>
          <div className="d-page-sub">
            Point of Sale terminal for Breva Café & Bar
          </div>
        </div>
        <div className="d-flex gap-2">
          <button className="d-btn-outline">Today's Sales</button>
          <button className="d-btn-gold">Open Cash Drawer</button>
        </div>
      </div>

      <Row className="g-4">
        <Col xs={12} lg={8}>
          <div className="d-card mb-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div className="d-section-title mb-0">Quick Select Menu</div>
              <div className="d-flex gap-3 flex-wrap">
                <div
                  className="d-navbar-search-box m-0"
                  style={{ width: "250px" }}
                >
                  <MdSearch className="d-search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search items..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="d-pos-table-select">
                  <MdTableRestaurant className="text-gold" fontSize="1.2rem" />
                  <select
                    value={selectedReservation}
                    onChange={(e) => setSelectedReservation(e.target.value)}
                    style={{ minWidth: "200px" }}
                  >
                    <option value="">Select Table for Billing</option>
                    {reservations.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.table || `Table ${r.tableNumber}`} -{" "}
                        {r.customerName || r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {/* <Row className="g-3">
              {loading ? (
                <div className="text-center py-5 w-100">Loading menu...</div>
              ) : filteredMenuItems.length === 0 ? (
                <div className="text-center py-5 w-100" style={{ color: "var(--d-text-muted)" }}>
                  No menu items found
                </div>
              ) : (
                filteredMenuItems.map((item) => (
                  <Col key={item._id} xs={6} sm={4} xl={3}>
                    <div
                      className="d-menu-item-pos p-3 border rounded text-center"
                      style={{
                        cursor: "pointer",
                        background: "var(--d-bg)",
                        transition: "var(--d-transition)",
                      }}
                      onClick={() => addToCart(item)}
                    >
                      <div className="fw-bold" style={{ fontSize: "0.9rem" }}>
                        {item.name}
                      </div>
                      <div className="text-gold fw-bold">₹{item.price}</div>
                      <Badge
                        bg="light"
                        text="dark"
                        className="mt-2"
                        style={{ fontSize: "0.65rem" }}
                      >
                        {Array.isArray(item.type) ? item.type.join(", ") : item.type || "Menu"}
                      </Badge>
                    </div>
                  </Col>
                ))
              )}
            </Row> */}
          </div>

          <div className="d-card">
            <div className="d-section-title">
              {selectedReservation ? "Active Order" : "Select a table to view bill"}
            </div>
            {selectedReservation && (
              <div className="d-table-wrap mt-3">
                <table className="d-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Price</th>
                      <th>Qty</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4" style={{ color: "var(--d-text-muted)" }}>
                          No items in this bill
                        </td>
                      </tr>
                    ) : (
                      cart.map((item) => (
                        <tr key={item.id || item._id || item.name}>
                          <td>
                            <strong>{item.name}</strong>
                          </td>
                          <td>₹{item.price}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <button
                                className="btn btn-sm btn-light p-1"
                                onClick={() => updateQty(item.id || item._id || item.name, -1)}
                              >
                                <MdRemove />
                              </button>
                              <span>{item.qty}</span>
                              <button
                                className="btn btn-sm btn-light p-1"
                                onClick={() => updateQty(item.id || item._id || item.name, 1)}
                              >
                                <MdAdd />
                              </button>
                            </div>
                          </td>
                          <td>
                            <strong>₹{item.price * item.qty}</strong>
                          </td>
                          <td>
                            <button
                              className="text-danger border-0 bg-transparent"
                              onClick={() => removeFromCart(item.id || item._id || item.name)}
                            >
                              <MdDelete />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Col>

        <Col xs={12} lg={4}>
          <div className="d-card h-100">
            <div className="d-section-title mb-4">Checkout Summary</div>
            {selectedReservation ? (
              <div className="d-checkout-details">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Tax (GST 5%)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between mb-4">
                  <span className="text-muted">Service Charge</span>
                  <span>₹0.00</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-4 mt-4">
                  <strong
                    style={{ fontSize: "1.4rem", fontFamily: "Playfair Display" }}
                  >
                    Total
                  </strong>
                  <strong
                    style={{
                      fontSize: "1.4rem",
                      color: "var(--d-gold)",
                      fontFamily: "Playfair Display",
                    }}
                  >
                    ₹{total.toLocaleString()}
                  </strong>
                </div>

                <div className="d-payment-methods mb-4">
                  <div className="text-muted small mb-2">Payment Method</div>
                  <div className="d-flex gap-3">
                    <button
                      className={`d-btn-outline flex-grow-1 ${
                        paymentMethod === "Card" ? "active" : ""
                      }`}
                      style={{ fontSize: "0.75rem" }}
                      onClick={() => setPaymentMethod("Card")}
                    >
                      Card
                    </button>
                    <button
                      className={`d-btn-outline flex-grow-1 ${
                        paymentMethod === "UPI" ? "active" : ""
                      }`}
                      style={{ fontSize: "0.75rem" }}
                      onClick={() => setPaymentMethod("UPI")}
                    >
                      UPI
                    </button>
                  </div>
                </div>

                <button
                  className="d-btn-gold w-100 "
                  style={{ justifyContent: "center", fontSize: "1rem" }}
                  onClick={handlePayment}
                  disabled={cart.length === 0}
                >
                  <MdPayment className="me-2" /> Complete Payment
                </button>
                {/* <button
                  className="d-btn-outline w-100 mt-3"
                  style={{ justifyContent: "center" }}
                  onClick={handlePrintBill}
                  disabled={cart.length === 0}
                >
                  <MdReceipt className="me-2" /> Print Bill
                </button> */}
              </div>
            ) : (
              <div className="text-center py-5" style={{ color: "var(--d-text-muted)" }}>
                <MdShoppingCart style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }} />
                <p>Select a table from the dropdown above to view and manage the bill</p>
              </div>
            )}
          </div>
        </Col>
      </Row>

      <style jsx>{`
        .d-menu-item-pos:hover {
          border-color: var(--d-gold) !important;
          transform: translateY(-2px);
          box-shadow: var(--d-shadow-sm);
        }
        .text-gold {
          color: var(--d-gold);
        }
        .d-pos-table-select {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--d-bg);
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid var(--d-border);
        }
        .d-pos-table-select select {
          border: none;
          background: transparent;
          outline: none;
          font-size: 0.9rem;
        }
      `}</style>
    </>
  );
}