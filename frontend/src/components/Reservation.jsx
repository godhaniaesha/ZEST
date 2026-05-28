import { useState } from "react";
import { FiChevronRight, FiCheck } from "react-icons/fi";
import ReservationTime from ".";
import CustomTimePicker from ".";

/* ─────────────────────────────────────────────
   ZEST — Avant-Garde Glassmorphism Design
   Prefix: h_res_ | Concept: Frosted Glass & Soft Glows
   Palette: Emerald Night #0B1915, Rich Cream #FAF7F2, Sovereign Gold #C9A84C
───────────────────────────────────────────── */

const h_res_css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── SOFT GLASS BACKGROUND MASTER ── */
  .h_res_page {
    min-height: 100vh;
    background: #FAF7F2;
    font-family: 'Plus Jakarta Sans', sans-serif;
    position: relative;
    overflow-x: hidden;
    color: #0B1915;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
  }

  .h_res_bg_glows {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
    overflow: hidden;
  }

  .h_res_glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.3;
    background: radial-gradient(circle, #C9A84C 0%, rgba(201,168,76,0) 70%);
  }

  /* ── GLASS MAIN CONTAINER ── */
  .h_res_main_glass {
    position: relative;
    z-index: 5;
    width: 100%;
    max-width: 1100px;
    background: rgb(34 70 42 / 40%);
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
    border: 1px solid rgba(255, 255, 255, 0.6);
    border-radius: 40px;
    box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.08);
    display: grid;
    grid-template-columns: 350px 1fr;
    min-height: 700px;
    overflow: hidden;
  }

  /* ── LEFT NAVIGATION PANEL ── */
  .h_res_side_nav {
    background: rgba(255, 255, 255, 0.15);
    border-right: 1px solid rgba(255, 255, 255, 0.3);
    padding: 3.5rem 2.5rem;
    display: flex;
    flex-direction: column;
  }

  .h_res_brand_tag {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 3px;
    color: #112923;
    margin-bottom: 1.5rem;
  }

  .h_res_side_title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 3rem;
    line-height: 1.1;
    font-weight: 400;
    margin-bottom: 3.5rem;
    color: #0B1915;
  }
  .h_res_side_title span { display: block; font-weight: 600; color: #112923; }

  .h_res_step_list { display: flex; flex-direction: column; gap: 1.2rem; }

  .h_res_step_item {
    display: flex;
    align-items: center;
    gap: 1.2rem;
    padding: 1rem 1.2rem;
    border-radius: 18px;
    transition: all 0.4s ease;
    cursor: pointer;
  }

  .h_res_step_item.active {
    background: rgba(255, 255, 255, 0.6);
    box-shadow: 0 10px 20px rgba(0,0,0,0.02);
  }

  .h_res_step_num {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.5rem;
    font-weight: 600;
    color: rgba(11, 25, 21, 0.2);
    margin-bottom: 4px;
  }
  .active .h_res_step_num { color: #C9A84C; }

  .h_res_step_label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: rgba(11,25,21,0.4); }
  .active .h_res_step_label { color: #0B1915; }

  .h_res_main_card {
  }

  /* ── RIGHT CONTENT AREA ── */
  .h_res_content_area {
    padding: 3.5rem 4rem;
    display: flex;
    flex-direction: column;
  }

  /* ── IMAGE MATCH: VERTICAL GLASS CAPSULE ── */
  .h_res_capsule_box {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    margin-bottom: 40px;
  }

  .h_res_capsule_label {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: rgba(11, 25, 21, 0.4);
  }

  .h_res_glass_capsule {
    background: rgb(255 255 255 / 36%);
    border: 1px solid rgba(255, 255, 255, 0.8);
    width: 260px;
    height: 84px;
    border-radius: 100px;
    display: flex;
    /* flex-direction: column; */
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.03);
}

  .h_res_circle_btn {
    width: 55px;
    height: 55px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.6rem;
    color: #0B1915;
    cursor: pointer;
    box-shadow: 0 8px 15px rgba(0,0,0,0.05);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  .h_res_circle_btn:hover { transform: scale(1.1); background: #fff; }
  .h_res_circle_btn:active { transform: scale(0.95); }

  .h_res_capsule_count {
    // font-family: 'Cormorant Garamond', serif;
    font-size: 2.5rem;
    font-weight: 600;
    color: #0B1915;
  }

  /* ── GRID OPTIONS (GLASS) ── */
  .h_res_option_grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.2rem;
  }

  .h_res_glass_card {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 24px;
    padding: 1.8rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  .h_res_glass_card:hover { background: rgba(255, 255, 255, 0.5); transform: translateY(-5px); }
  .h_res_glass_card.selected { background: #112923; color: #FAF7F2; border-color: #112923; }

  .h_res_card_icon { font-size: 1.8rem; margin-bottom: 0.8rem; display: block; }
  .h_res_card_title { serif; font-size: 1.4rem; font-weight: 500; }
  .h_res_card_desc { font-size: 0.75rem; opacity: 0.6; margin-top: 0.3rem; }

  /* ── INPUTS (GLASS) ── */
  .h_res_input_field {
    background: rgba(255, 255, 255, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 16px;
    padding: 0.8rem 1.2rem;
    margin-bottom: 1.2rem;
    transition: all 0.3s;
  }
  .h_res_input_field:focus-within { background: rgba(255, 255, 255, 0.6); border-color: #C9A84C; }
  .h_res_input_field label { display: block; font-size: 0.6rem; font-weight: 700; text-transform: uppercase; color: rgba(11,25,21,0.4); margin-bottom: 0.2rem; }
  .h_res_input_field input { width: 100%; border: none; background: transparent; outline: none; font-size: 1rem; color: #0B1915; }

  /* ── BUTTONS ── */
  .h_res_action_bar { margin-top: auto; display: flex; justify-content: space-between; align-items: center; padding-top: 2rem; }
  
  .h_res_back_link { background: none; border: none; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: rgba(11,25,21,0.3); cursor: pointer; }
  .h_res_back_link:hover { color: #0B1915; }

  .h_res_primary_btn {
    background: #112923;
    color: #C9A84C;
    border: none;
    padding: 1rem 3rem;
    border-radius: 50px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    cursor: pointer;
    box-shadow: 0 10px 20px rgba(17,41,35,0.15);
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .h_res_primary_btn:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(17,41,35,0.25); }

  .h_res_payment_card {
    background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%);
    border: 1px solid rgba(255,255,255,0.5);
    border-radius: 20px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 20px 40px rgba(0,0,0,0.05);
  }

  .h_res_card_flex {
    display: flex;
    gap: 1rem;
  }

  /* ── TABLE SELECTOR ── */
  .h_res_table_map {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 1.5rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 30px;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .h_res_table_node {
    aspect-ratio: 1;
    border-radius: 15px;
    background: rgba(255, 255, 255, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
  }

  .h_res_table_node:hover:not(.occupied) {
    background: rgba(255, 255, 255, 0.6);
    transform: translateY(-5px);
  }

  .h_res_table_node.selected {
    background: #112923;
    border-color: #112923;
    color: #C9A84C;
    box-shadow: 0 10px 20px rgba(17,41,35,0.2);
  }

  .h_res_table_node.occupied {
    opacity: 0.3;
    cursor: not-allowed;
    background: rgba(0,0,0,0.1);
  }

  .h_res_table_id { font-size: 0.9rem; font-weight: 700; }
  .h_res_table_cap { font-size: 0.6rem; opacity: 0.6; text-transform: uppercase; margin-top: 2px; }
  .selected .h_res_table_cap { opacity: 0.8; }

  .h_res_map_legend {
    display: flex;
    gap: 1.5rem;
    margin-top: 1.5rem;
    justify-content: center;
  }

  .h_res_legend_item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    color: rgba(11,25,21,0.5);
  }

  .h_res_legend_dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 900px) {
    .h_res_page { padding: 1rem; }
    .h_res_main_glass { grid-template-columns: 1fr; border-radius: 30px; }
    .h_res_side_nav { padding: 2rem; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.2); }
    .h_res_side_title { font-size: 2.5rem; margin-bottom: 1.5rem; text-align: center; }
    .h_res_step_list { flex-direction: row; overflow-x: auto; padding-bottom: 1rem; scrollbar-width: none; }
    .h_res_step_item { min-width: 140px; padding: 0.8rem; }
    .h_res_content_area { padding: 2rem 1.5rem; }
  }

  @media (max-width: 480px) {
    .h_res_option_grid { grid-template-columns: 1fr; }
    .h_res_main_glass { border-radius: 20px; width: 100%; }
    .h_res_glass_capsule { 
      flex-direction: column !important; 
      width: 80px !important; 
      height: 240px !important; 
      padding: 0.8rem !important; 
    }
    .h_res_capsule_count { font-size: 2.2rem; }
    .h_res_circle_btn { width: 45px; height: 45px; font-size: 1.2rem; }
    .h_res_action_bar { flex-direction: row; justify-content: space-between; gap: 1rem; }
    .h_res_primary_btn { width: auto; padding: 1rem 2rem; }
    .h_res_side_nav { padding: 1.5rem 1rem; }
    .h_res_payment_card { padding: 1.2rem; }
    .h_res_card_flex { flex-direction: column; gap: 0; }
  }

  @media (max-width: 320px) {
    .h_res_side_title { font-size: 2rem; }
  }
`;

const STEPS = [
  { id: 1, label: "Schedule", sub: "Time & Guests" },
  { id: 2, label: "Details", sub: "Setting & Info" },
  { id: 3, label: "Table", sub: "Pick your spot" },
  { id: 4, label: "Payment", sub: "Secure Checkout" },
  { id: 5, label: "Review", sub: "Final Check" },
];

const TABLES = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  capacity: i % 3 === 0 ? 4 : 2,
  occupied: [3, 7, 10].includes(i + 1)
}));

const LOCATIONS = [
  { id: "Indoor", icon: "🏛️", title: "Grand Hall", desc: "Classic luxury" },
  { id: "Garden", icon: "🌿", title: "Patio", desc: "Al-fresco dining" },
  { id: "Rooftop", icon: "🌃", title: "Sky Bar", desc: "City views" },
  { id: "Bar", icon: "🍸", title: "Counter", desc: "Front row mixology" },
];

export default function GlassmorphismReservation() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    guests: 2, location: "Indoor", date: "", time: "",
    selectedTable: null,
    fullName: "", email: "", phone: "", occasion: "Standard",
    cardName: "", cardNumber: "", expiry: "", cvv: ""
  });

  const updateField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const nextStep = () => {
    if (step === 1) {
      if (!form.guests) return setError("Select guest count");
      if (!form.date || !form.time) return setError("Select date and time");
    }
    if (step === 2) {
      if (!form.selectedTable) return setError("Please select a table on the map");
    }
    if (step === 3) {
      if (!form.location) return setError("Select atmosphere setting");
      if (!form.fullName || !form.email || !form.phone) return setError("Patron details required");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError("Invalid email address");
    }
    if (step === 4) {
      if (!form.cardName || !form.cardNumber || !form.expiry || !form.cvv) return setError("Payment details required");
      if (form.cardNumber.replace(/\s/g, '').length < 16) return setError("Invalid card number");
      if (form.cvv.length < 3) return setError("Invalid CVV");
    }
    setError(null);
    setStep(prev => prev + 1);
  };

  const submit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(6);
    }, 1500);
  };

  return (
    <>
      <style>{h_res_css}</style>
      <div className="h_res_page">
        <div className="h_res_bg_glows">
          <div className="h_res_glow" style={{ width: '50vw', height: '50vw', top: '-10%', left: '-10%' }} />
          <div className="h_res_glow" style={{ width: '40vw', height: '40vw', bottom: '-10%', right: '-10%', background: 'radial-gradient(circle, #EFECE6 0%, rgba(239,236,230,0) 70%)' }} />
        </div>

        <div className="h_res_main_glass">
          <div className="h_res_side_nav">
            <div className="h_res_brand_tag">✦ ZEST RESERVE</div>
            <h1 className="h_res_side_title">Table <span>Reservation</span></h1>

            <div className="h_res_step_list">
              {STEPS.map(s => (
                <div key={s.id} className={`h_res_step_item ${step === s.id ? 'active' : ''}`} onClick={() => s.id < step && setStep(s.id)}>
                  <div className="h_res_step_num">0{s.id}</div>
                  <div className="h_res_step_label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="h_res_content_area">
            {error && step < 6 && <div style={{ color: '#9b1c1c', fontSize: '0.8rem', marginBottom: '1.5rem', fontWeight: 600 }}>{error}</div>}

            {step === 1 && (
              <div className="h_res_main_card">
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  {/* Guest Count */}
                  <div className="h_res_capsule_box">
                    <span className="h_res_capsule_label">Guest Count</span>
                    <div className="h_res_glass_capsule">
                      <button className="h_res_circle_btn" onClick={() => updateField("guests", Math.max(1, form.guests - 1))}>−</button>
                      <div className="h_res_capsule_count">{form.guests}</div>
                      <button className="h_res_circle_btn" onClick={() => updateField("guests", Math.min(20, form.guests + 1))}>+</button>
                    </div>
                  </div>

                  {/* Timing Selection */}
                  <div style={{ flex: 1 }}>
                      <span className="h_res_capsule_label" style={{ display: 'block', marginBottom: '1rem' }}>Preferred Date</span>

                    <div className="h_res_input_field">
                      <label>Date</label>
                      <input type="date" value={form.date} min={new Date().toISOString().split("T")[0]} onChange={e => updateField("date", e.target.value)} />
                    </div>
                    <CustomTimePicker />
                    {/* <div style={{ marginTop: '2rem' }}>
                      <span className="h_res_capsule_label" style={{ display: 'block', marginBottom: '1rem' }}>Preferred Hour</span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.8rem' }}>
                        {[,"12:00 PM","12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM",].map(t => (
                          <div key={t} className={`h_res_glass_card ${form.time === t ? 'selected' : ''}`} style={{ padding: '1rem', textAlign: 'center' }} onClick={() => updateField("time", t)}>
                            {t}
                          </div>
                        ))}
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                  <span className="h_res_capsule_label" style={{ display: 'block', marginBottom: '1rem' }}>Atmosphere</span>
                  <div className="h_res_option_grid">
                    {LOCATIONS.map(l => (
                      <div key={l.id} className={`h_res_glass_card ${form.location === l.id ? 'selected' : ''}`} onClick={() => updateField("location", l.id)}>
                        <span className="h_res_card_icon">{l.icon}</span>
                        <h3 className="h_res_card_title">{l.title}</h3>
                        <p className="h_res_card_desc">{l.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <span className="h_res_capsule_label" style={{ display: 'block', marginBottom: '1rem' }}>Guest Information</span>
                  <div className="h_res_input_field"><label>Full Name</label><input type="text" placeholder="John Doe" value={form.fullName} onChange={e => updateField("fullName", e.target.value)} /></div>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div className="h_res_input_field" style={{ flex: 1, minWidth: '200px' }}><label>Email</label><input type="email" placeholder="john@example.com" value={form.email} onChange={e => updateField("email", e.target.value)} /></div>
                    <div className="h_res_input_field" style={{ flex: 1, minWidth: '200px' }}><label>Phone</label><input type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => updateField("phone", e.target.value)} /></div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ flex: 1 }}>
                <span className="h_res_capsule_label" style={{ display: 'block', marginBottom: '1.5rem' }}>Select your Table</span>
                <div className="h_res_table_map">
                  {TABLES.map(t => (
                    <div 
                      key={t.id} 
                      className={`h_res_table_node ${t.occupied ? 'occupied' : ''} ${form.selectedTable === t.id ? 'selected' : ''}`}
                      onClick={() => !t.occupied && updateField("selectedTable", t.id)}
                    >
                      <span className="h_res_table_id">{t.id}</span>
                      <span className="h_res_table_cap">{t.capacity}P</span>
                    </div>
                  ))}
                </div>
                <div className="h_res_map_legend">
                  <div className="h_res_legend_item"><div className="h_res_legend_dot" style={{ background: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.5)' }} /> Available</div>
                  <div className="h_res_legend_item"><div className="h_res_legend_dot" style={{ background: 'rgba(0,0,0,0.1)' }} /> Occupied</div>
                  <div className="h_res_legend_item"><div className="h_res_legend_dot" style={{ background: '#112923' }} /> Selected</div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="h_res_payment_card">
                <span className="h_res_capsule_label" style={{ display: 'block', marginBottom: '1.5rem' }}>Secure Payment</span>
                <div className="h_res_input_field">
                  <label>Cardholder Name</label>
                  <input type="text" placeholder="NAME ON CARD" value={form.cardName} onChange={e => updateField("cardName", e.target.value)} />
                </div>
                <div className="h_res_input_field">
                  <label>Card Number</label>
                  <input type="text" placeholder="XXXX XXXX XXXX XXXX" value={form.cardNumber} maxLength="19" onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                    updateField("cardNumber", val);
                  }} />
                </div>
                <div className="h_res_card_flex">
                  <div className="h_res_input_field" style={{ flex: 1 }}>
                    <label>Expiry Date</label>
                    <input type="text" placeholder="MM/YY" value={form.expiry} maxLength="5" onChange={e => {
                      let val = e.target.value.replace(/\D/g, '');
                      if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
                      updateField("expiry", val);
                    }} />
                  </div>
                  <div className="h_res_input_field" style={{ flex: 1 }}>
                    <label>CVV</label>
                    <input type="password" placeholder="XXX" value={form.cvv} maxLength="3" onChange={e => updateField("cvv", e.target.value.replace(/\D/g, ''))} />
                  </div>
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.5, textAlign: 'center', marginTop: '1rem' }}>
                  🔒 Your payment information is encrypted and secure.
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="h_res_glass_card" style={{ cursor: 'default', background: 'rgba(255,255,255,0.4)', padding: '2.5rem' }}>
                <h2 className="h_res_card_title" style={{ fontSize: '1.8rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '1rem' }}>Review Booking</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(0,0,0,0.05)', paddingBottom: '0.5rem' }}>
                    <span className="h_res_capsule_label">Schedule</span>
                    <span style={{ fontWeight: 600 }}>{form.date} @ {form.time}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(0,0,0,0.05)', paddingBottom: '0.5rem' }}>
                    <span className="h_res_capsule_label">Guests</span>
                    <span style={{ fontWeight: 600 }}>{form.guests} Persons</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(0,0,0,0.05)', paddingBottom: '0.5rem' }}>
                    <span className="h_res_capsule_label">Table Selected</span>
                    <span style={{ fontWeight: 600 }}>Table #{form.selectedTable}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(0,0,0,0.05)', paddingBottom: '0.5rem' }}>
                    <span className="h_res_capsule_label">Atmosphere</span>
                    <span style={{ fontWeight: 600 }}>{form.location}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(0,0,0,0.05)', paddingBottom: '0.5rem' }}>
                    <span className="h_res_capsule_label">Patron</span>
                    <span style={{ fontWeight: 600 }}>{form.fullName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="h_res_capsule_label">Payment</span>
                    <span style={{ fontWeight: 600 }}>Card ending in {form.cardNumber.slice(-4)}</span>
                  </div>
                </div>
              </div>
            )}

            {step === 6 && (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🥂</div>
                <h2 className="h_res_card_title" style={{ fontSize: '2.5rem' }}>Reserved</h2>
                <p style={{ opacity: 0.6, marginTop: '1rem' }}>Your table at ZEST is ready for you.</p>
                <button className="h_res_primary_btn" style={{ margin: '2.5rem auto 0' }} onClick={() => setStep(1)}>New Booking</button>
              </div>
            )}

            {step < 6 && (
              <div className="h_res_action_bar">
                {step > 1 ? <button className="h_res_back_link" onClick={() => setStep(prev => prev - 1)}>← Back</button> : <span />}
                <button className="h_res_primary_btn" onClick={step === 5 ? submit : nextStep}>
                  {loading ? "Confirming..." : step === 5 ? "Finalize" : "Next Step"}
                  {step < 5 && <FiChevronRight />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
