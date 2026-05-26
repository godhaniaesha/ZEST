import { useState } from "react";

/* ── Main Reservation Component (Light Theme - 4 Step Flow) ── */
export default function Reservation() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [toasts, setToasts] = useState([]);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: "2",
    location: "Indoor",
    occasion: "None",
    requests: ""
  });

  const toast = (msg) => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    // Validation for Step 1
    if (step === 1 && !formData.guests) {
      return setAlert({ type: "error", msg: "Please select number of guests." });
    }
    // Validation for Step 2
    if (step === 2 && (!formData.date || !formData.time)) {
      return setAlert({ type: "error", msg: "Please select both date and time." });
    }
    // Validation for Step 3
    if (step === 3) {
      if (!formData.fullName || !formData.email || !formData.phone) {
        return setAlert({ type: "error", msg: "Please fill all contact details." });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        return setAlert({ type: "error", msg: "Please enter a valid email address." });
      }
    }
    setAlert(null);
    setStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
    setAlert(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (loading) return;
    setLoading(true);
    
    // Simulate API Call
    setTimeout(() => {
      setLoading(false);
      setAlert({ type: "success", msg: "Reservation Confirmed! We'll see you at ZEST." });
      toast("Table Reserved Successfully! 🥂");
      setStep(5); // Success State
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 2500);
  };

  return (
    <div className="h_res_light_page">
      <div className="h_res_light_container">
        
        {step < 5 && (
          <>
            <h1 className="h_res_title_main">Fine Dining Awaits</h1>
            <p className="h_res_subtitle">Experience the perfect blend of luxury and taste. Secure your table in just a few steps.</p>

            {/* Stepper Progress */}
            <div className="h_stepper">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className={`h_step_item ${step === s ? 'h_active' : ''} ${step > s ? 'h_completed' : ''}`}>
                  <div className="h_step_circle">{step > s ? "✓" : s}</div>
                  <span className="h_step_label">
                    {s === 1 && "Party Size"}
                    {s === 2 && "Schedule"}
                    {s === 3 && "Personal"}
                    {s === 4 && "Confirm"}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {alert && step < 5 && (
          <div className={`h_alert h_alert_${alert.type}`}>
            {alert.type === 'error' ? '✕ ' : '✓ '} {alert.msg}
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()}>
          
          {/* STEP 1: GUESTS & LOCATION */}
          {step === 1 && (
            <div className="h_normal_form_section">
              <label className="h_light_label">Number of Guests</label>
              <div className="h_selection_group">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <div 
                    key={num} 
                    className={`h_select_pill ${formData.guests === num.toString() ? 'h_selected' : ''}`}
                    onClick={() => setFormData({...formData, guests: num.toString()})}
                  >
                    {num} {num === 1 ? 'Guest' : 'Guests'}
                  </div>
                ))}
                <div 
                  className={`h_select_pill ${formData.guests === "8+" ? 'h_selected' : ''}`}
                  onClick={() => setFormData({...formData, guests: "8+"})}
                >
                  Large Group (8+)
                </div>
              </div>

              <label className="h_light_label" style={{ marginTop: '4rem' }}>Preferred Setting</label>
              <div className="h_selection_group">
                {[
                  { id: "Indoor", icon: "🏛️", label: "Classic Indoor" },
                  { id: "Outdoor", icon: "🌿", label: "Garden Outdoor" },
                  { id: "Rooftop", icon: "🌃", label: "Skyline Rooftop" },
                  { id: "Bar Counter", icon: "🍸", label: "Bar Counter" }
                ].map(loc => (
                  <div 
                    key={loc.id} 
                    className={`h_select_pill ${formData.location === loc.id ? 'h_selected' : ''}`}
                    onClick={() => setFormData({...formData, location: loc.id})}
                  >
                    <span>{loc.icon}</span> {loc.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: DATE & TIME */}
          {step === 2 && (
            <div className="h_normal_form_section">
              <div className="h_form_grid_normal">
                <div className="h_full_row">
                  <label className="h_light_label">Reservation Date</label>
                  <input className="h_light_input" type="date" name="date" value={formData.date} onChange={handleChange} min={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="h_full_row">
                  <label className="h_light_label" style={{ marginTop: '3rem' }}>Select Time Slot</label>
                  <div className="h_selection_group">
                    {["19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"].map(t => (
                      <div 
                        key={t} 
                        className={`h_select_pill ${formData.time === t ? 'h_selected' : ''}`}
                        onClick={() => setFormData({...formData, time: t})}
                      >
                        {t === "19:00" ? "07:00 PM" : t === "19:30" ? "07:30 PM" : t === "20:00" ? "08:00 PM" : t === "20:30" ? "08:30 PM" : t === "21:00" ? "09:00 PM" : t === "21:30" ? "09:30 PM" : "10:00 PM"}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PERSONAL DETAILS */}
          {step === 3 && (
            <div className="h_normal_form_section">
              <div className="h_form_grid_normal">
                <div className="h_full_row">
                  <label className="h_light_label">Full Name</label>
                  <input className="h_light_input" type="text" name="fullName" placeholder="e.g. John Doe" value={formData.fullName} onChange={handleChange} />
                </div>
                <div>
                  <label className="h_light_label">Contact Number</label>
                  <input className="h_light_input" type="tel" name="phone" placeholder="+91 00000 00000" value={formData.phone} onChange={handleChange} />
                </div>
                <div>
                  <label className="h_light_label">Email Address</label>
                  <input className="h_light_input" type="email" name="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & REQUESTS */}
          {step === 4 && (
            <div className="h_normal_form_section">
              <div className="h_form_grid_normal">
                <div className="h_full_row">
                  <label className="h_light_label">Special Occasion</label>
                  <select className="h_light_input" name="occasion" value={formData.occasion} onChange={handleChange}>
                    <option value="None">Regular Dining</option>
                    <option value="Birthday">🎂 Birthday Celebration</option>
                    <option value="Anniversary">💍 Anniversary</option>
                    <option value="Date Night">🕯️ Date Night</option>
                    <option value="Business">💼 Business Meeting</option>
                  </select>
                </div>
                <div className="h_full_row">
                  <label className="h_light_label">Additional Requests</label>
                  <textarea className="h_light_input h_textarea" name="requests" placeholder="Allergies, table preferences, or special surprises..." rows="3" value={formData.requests} onChange={handleChange}></textarea>
                </div>
              </div>
              
              <div className="h_summary_box">
                <h3 className="h_summary_title">Booking Summary</h3>
                <div className="h_summary_item">
                  <span className="h_summary_label">Guests & Setting</span>
                  <span className="h_summary_value">{formData.guests} Guests • {formData.location}</span>
                </div>
                <div className="h_summary_item">
                  <span className="h_summary_label">Date & Time</span>
                  <span className="h_summary_value">{new Date(formData.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} at {formData.time}</span>
                </div>
                <div className="h_summary_item">
                  <span className="h_summary_label">Reserved For</span>
                  <span className="h_summary_value">{formData.fullName}</span>
                </div>
                <div className="h_summary_item">
                  <span className="h_summary_label">Occasion</span>
                  <span className="h_summary_value">{formData.occasion}</span>
                </div>
              </div>
            </div>
          )}

          {/* SUCCESS STATE */}
          {step === 5 && (
            <div className="h_success_wrap">
              <div className="h_success_icon">✓</div>
              <h1 className="h_res_title_main">Table Reserved</h1>
              <p className="h_res_subtitle">We are delighted to host you, {formData.fullName.split(' ')[0]}. A confirmation email with your booking ID has been sent to {formData.email}.</p>
              <button type="button" className="h_btn_next" style={{ margin: '4rem auto', display: 'block' }} onClick={() => window.location.href = '/'}>Return to Home</button>
            </div>
          )}

          {/* STEP NAVIGATION */}
          {step < 5 && (
            <div className="h_step_nav">
              {step > 1 ? (
                <button 
                  key="btn-back"
                  type="button" 
                  className="h_btn_back" 
                  onClick={prevStep}
                >
                  ← PREVIOUS STEP
                </button>
              ) : <div></div>}
              
              {step < 4 ? (
                <button 
                  key="btn-next"
                  type="button" 
                  className="h_btn_next" 
                  onClick={nextStep}
                >
                  CONTINUE
                </button>
              ) : (
                <button 
                  key="btn-confirm"
                  type="button" 
                  className="h_submit_btn h_btn_next" 
                  disabled={loading}
                  onClick={handleSubmit}
                >
                  {loading ? <div className="h_loader" /> : "CONFIRM RESERVATION"}
                </button>
              )}
            </div>
          )}
        </form>

      </div>

      <div className="h_toast_list">
        {toasts.map(t => (
          <div key={t.id} className="h_toast_item">
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}
