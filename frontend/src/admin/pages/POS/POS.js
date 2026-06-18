import React, { useState, useEffect, useRef } from "react";
import { Row, Col } from "react-bootstrap";
import {
  MdShoppingCart,
  MdPayment,
  MdSearch,
  MdDelete,
  MdAdd,
  MdRemove,
  MdTableRestaurant,
} from "react-icons/md";
import { menuAPI, ordersAPI, reservationsAPI } from "../../../api";
import { payBill, mountCardElement } from "../../../utils/stripePay";

const ADVANCE_AMOUNT = 200;

export default function POS() {
  const [menuItems, setMenuItems] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState("");
  const [selectedReservationData, setSelectedReservationData] = useState(null);
  const [reservationOrders, setReservationOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [upiVpa, setUpiVpa] = useState("");
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState("");
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const cardMountRef = useRef(null);
  const cardElementRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [menuRes, resRes] = await Promise.all([
          menuAPI.getAll(),
          reservationsAPI.getAll(),
        ]);

        setMenuItems(Array.isArray(menuRes.data) ? menuRes.data : []);

        const confirmedReservations = Array.isArray(resRes.data)
          ? resRes.data.filter((r) => r.status === "Confirmed")
          : [];

        const eligibleReservations = [];

        for (const reservation of confirmedReservations) {
          const orderRes = await ordersAPI.getByReservationId(reservation._id);

          const orders = Array.isArray(orderRes.data) ? orderRes.data : [];
          const allItems = orders.flatMap((o) => o.items || []);

          const allServed =
            allItems.length > 0 &&
            allItems.every((item) => item.status === "Served");

          if (allServed) {
            eligibleReservations.push(reservation);
          }
        }

        setReservations(eligibleReservations);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const loadOrdersForReservation = async () => {
      if (!selectedReservation) {
        setCart([]);
        setReservationOrders([]);
        setSelectedReservationData(null);
        return;
      }

      try {
        const res = await ordersAPI.getByReservationId(selectedReservation);
        const orders = Array.isArray(res.data) ? res.data : [];
        setReservationOrders(orders);

        const reservation = reservations.find(
          (r) => r._id === selectedReservation,
        );
        setSelectedReservationData(reservation || null);

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
  }, [selectedReservation, reservations]);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const tax = subtotal * 0.05;
  const grossTotal = subtotal + tax;
  const advanceDeducted = selectedReservationData?.advancePaid || 0;
  const total = Math.max(0, grossTotal - advanceDeducted);

  useEffect(() => {
    if (!selectedReservation || total <= 0 || paymentMethod !== "Card") {
      return undefined;
    }

    let active = true;
    let frameId = 0;

    const setupCard = async () => {
      if (!cardMountRef.current) {
        frameId = requestAnimationFrame(() => {
          if (active) setupCard();
        });
        return;
      }

      try {
        cardElementRef.current?.unmount();
        cardElementRef.current = null;
        setCardComplete(false);
        setCardError("");

        const { cardElement } = await mountCardElement(
          cardMountRef.current,
          (event) => {
            setCardComplete(event.complete);
            setCardError(event.error?.message || "");
          },
        );

        if (active) {
          cardElementRef.current = cardElement;
        } else {
          cardElement.unmount();
        }
      } catch (err) {
        if (active) {
          setCardError(err.message || "Could not load card payment form.");
        }
      }
    };

    setupCard();

    return () => {
      active = false;
      cancelAnimationFrame(frameId);
      cardElementRef.current?.unmount();
      cardElementRef.current = null;
    };
  }, [selectedReservation, total, paymentMethod]);

  const getTableLabel = (reservation) => {
    if (!reservation) return "";
    if (reservation.table?.displayId) return reservation.table.displayId;
    if (reservation.table?.number) return `Table ${reservation.table.number}`;
    return `Table ${reservation.tableNumber || ""}`;
  };

  const handlePayment = async () => {
    try {
      setPaying(true);
      setPaymentError("");

      if (!selectedReservation) {
        setPaymentError("Please select a reservation to pay");
        return;
      }

      const result = await payBill({
        paymentMethod,
        upiVpa,
        cardElement: cardElementRef.current,
        reservationId: selectedReservation,
        subtotal: cart.reduce((sum, item) => sum + item.price * item.qty, 0),
        tax: 0,
        orderIds: reservationOrders.map(order => order._id),
      });

      console.log("Payment Success:", result);

      // Redirect to dashboard after successful payment
      window.location.href = "/admin/dashboard";
    } catch (err) {
      setPaymentError(err.message || "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  const updateQty = (id, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === id || item._id === id
            ? { ...item, qty: Math.max(1, item.qty + delta) }
            : item,
        )
        .filter((item) => item.qty > 0),
    );
  };

  const removeFromCart = (id) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.id !== id && item._id !== id),
    );
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

                    {reservations.filter(r => !r.fullPaymentDone).map((r) => (
                      <option key={r._id} value={r._id}>
                        {getTableLabel(r)} - {r.customerName || r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="d-card">
            <div className="d-section-title">
              {selectedReservation
                ? "Active Order"
                : "Select a table to view bill"}
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
                        <td
                          colSpan="5"
                          className="text-center py-4"
                          style={{ color: "var(--d-text-muted)" }}
                        >
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
                                onClick={() =>
                                  updateQty(
                                    item.id || item._id || item.name,
                                    -1,
                                  )
                                }
                              >
                                <MdRemove />
                              </button>
                              <span>{item.qty}</span>
                              <button
                                className="btn btn-sm btn-light p-1"
                                onClick={() =>
                                  updateQty(item.id || item._id || item.name, 1)
                                }
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
                              onClick={() =>
                                removeFromCart(item.id || item._id || item.name)
                              }
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
                {advanceDeducted > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Reservation Advance</span>
                    <span style={{ color: "var(--d-green, #2ecc71)" }}>
                      − ₹{advanceDeducted.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-4">
                  <span className="text-muted">Service Charge</span>
                  <span>₹0.00</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-4 mt-4">
                  <strong
                    style={{
                      fontSize: "1.4rem",
                      fontFamily: "Playfair Display",
                    }}
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

                {total > 0 && (
                  <>
                    <div className="d-payment-methods mb-3">
                      <div className="text-muted small mb-2">
                        Payment Method
                      </div>
                      <div className="d-flex gap-3">
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

                    {paymentMethod === "Card" ? (
                      <div className="mb-3">
                        <div className="text-muted small mb-2">
                          Card Details
                        </div>
                        <div
                          ref={cardMountRef}
                          className="form-control"
                          style={{ minHeight: "42px", paddingTop: "10px" }}
                        />
                        {cardError && (
                          <div className="text-danger small mt-2">
                            {cardError}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mb-3">
                        <input
                          className="form-control"
                          placeholder="UPI ID (e.g. success@upi)"
                          value={upiVpa}
                          onChange={(e) => setUpiVpa(e.target.value)}
                        />
                      </div>
                    )}
                  </>
                )}

                {paymentError && (
                  <div className="alert alert-danger py-2 small mb-3">
                    {paymentError}
                  </div>
                )}

                <button
                  className="d-btn-gold w-100 "
                  style={{ justifyContent: "center", fontSize: "1rem" }}
                  onClick={handlePayment}
                  disabled={cart.length === 0 || paying}
                >
                  <MdPayment className="me-2" />
                  {paying
                    ? "Processing..."
                    : total === 0
                      ? "Settle Bill"
                      : "Complete Payment"}
                </button>
              </div>
            ) : (
              <div
                className="text-center py-5"
                style={{ color: "var(--d-text-muted)" }}
              >
                <MdShoppingCart
                  style={{
                    fontSize: "3rem",
                    marginBottom: "1rem",
                    opacity: 0.5,
                  }}
                />
                <p>
                  Select a table from the dropdown above to view and manage the
                  bill
                </p>
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
