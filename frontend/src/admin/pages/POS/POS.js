import React, { useState } from "react";
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
} from "react-icons/md";

const SAMPLE_MENU = [
  { id: 1, name: "Cappuccino", price: 180, category: "Cafe" },
  { id: 2, name: "Espresso", price: 120, category: "Cafe" },
  { id: 3, name: "Old Fashioned", price: 550, category: "Bar" },
  { id: 4, name: "Classic Mojito", price: 450, category: "Bar" },
  { id: 5, name: "Truffle Risotto", price: 680, category: "Kitchen" },
];

export default function POS() {
  const [cart, setCart] = useState([
    { id: 1, name: "Cappuccino", price: 180, qty: 2 },
    { id: 5, name: "Truffle Risotto", price: 680, qty: 1 },
  ]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.id === item.id);
      if (existing) {
        return prevCart.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      return [...prevCart, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === id
            ? { ...item, qty: Math.max(1, item.qty + delta) }
            : item,
        )
        .filter((item) => item.qty > 0),
    );
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const handlePayment = () => {
    alert(
      `Payment of ₹${total.toLocaleString()} completed via ${paymentMethod}`,
    );
    setCart([]);
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
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-section-title mb-0">Quick Select Menu</div>
              <div
                className="d-navbar-search-box m-0"
                style={{ width: "250px" }}
              >
                <MdSearch className="d-search-icon" />
                <input type="text" placeholder="Search items..." />
              </div>
            </div>
            <Row className="g-3">
              {SAMPLE_MENU.map((item) => (
                <Col key={item.id} xs={6} sm={4} xl={3}>
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
                      {item.category}
                    </Badge>
                  </div>
                </Col>
              ))}
            </Row>
          </div>

          <div className="d-card">
            <div className="d-section-title">Active Order</div>
            <div className="d-table-wrap mt-3">
              <table className="d-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.name}</strong>
                      </td>
                      <td>₹{item.price}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <button
                            className="btn btn-sm btn-light p-1"
                            onClick={() => updateQty(item.id, -1)}
                          >
                            <MdRemove />
                          </button>
                          <span>{item.qty}</span>
                          <button
                            className="btn btn-sm btn-light p-1"
                            onClick={() => updateQty(item.id, 1)}
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
                          onClick={() => removeFromCart(item.id)}
                        >
                          <MdDelete />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Col>

        <Col xs={12} lg={4}>
          <div className="d-card h-100">
            <div className="d-section-title mb-4">Checkout Summary</div>
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
                <div className="d-flex gap-2">
                  <button
                    className={`d-btn-outline flex-grow-1 ${paymentMethod === "Cash" ? "active" : ""}`}
                    style={{ fontSize: "0.75rem" }}
                    onClick={() => setPaymentMethod("Cash")}
                  >
                    Cash
                  </button>
                  <button
                    className={`d-btn-outline flex-grow-1 ${paymentMethod === "Card" ? "active" : ""}`}
                    style={{ fontSize: "0.75rem" }}
                    onClick={() => setPaymentMethod("Card")}
                  >
                    Card
                  </button>
                  <button
                    className={`d-btn-outline flex-grow-1 ${paymentMethod === "UPI" ? "active" : ""}`}
                    style={{ fontSize: "0.75rem" }}
                    onClick={() => setPaymentMethod("UPI")}
                  >
                    UPI
                  </button>
                </div>
              </div>

              <button
                className="d-btn-gold w-100 py-3"
                style={{ justifyContent: "center", fontSize: "1rem" }}
                onClick={handlePayment}
              >
                <MdPayment className="me-2" /> Complete Payment
              </button>
              <button
                className="d-btn-outline w-100 mt-2"
                style={{ justifyContent: "center" }}
                onClick={handlePrintBill}
              >
                <MdReceipt className="me-2" /> Print Bill
              </button>
            </div>
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
      `}</style>
    </>
  );
}
