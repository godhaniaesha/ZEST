import { useState } from "react";

/* ── Password strength helper ── */
const pwStrength = (pw) => {
  if (!pw) return null;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return {
    score: s,
    pct: (s / 4) * 100,
    cls: ["h_auth_s_w", "h_auth_s_f", "h_auth_s_g", "h_auth_s_s"][s - 1] || "h_auth_s_w",
  };
};

/* ── Eye Icon ── */
const EyeIcon = ({ open }) =>
  open ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
  );

/* ── Main Auth Component ── */
export default function Auth() {
  const [tab, setTab] = useState("login"); // login, signup, forgot, otp, reset
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [toasts, setToasts] = useState([]);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", confirm: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [resetForm, setResetForm] = useState({ password: "", confirm: "" });

  const toast = (msg) => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  const switchTab = (t) => {
    setTab(t);
    setAlert(null);
    setShowPw(false);
  };

  const handleOtp = (val, idx) => {
    if (isNaN(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    if (val && idx < 3) {
      const nextInput = document.getElementById(`otp-${idx + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  /* ── Handlers ── */
  const doLogin = (e) => {
    e.preventDefault();
    setAlert(null);
    if (!loginForm.email || !loginForm.password) return setAlert({ type: "error", msg: "Please fill all fields." });
    setLoading(true);
    setTimeout(() => { setLoading(false); toast("Welcome to the ZEST experience."); }, 1500);
  };

  const doSignup = (e) => {
    e.preventDefault();
    setAlert(null);
    if (!signupForm.email || !signupForm.password || !signupForm.phone || !signupForm.confirm) {
      return setAlert({ type: "error", msg: "All fields are required." });
    }
    if (signupForm.password !== signupForm.confirm) {
      return setAlert({ type: "error", msg: "Passwords do not match." });
    }
    setLoading(true);
    setTimeout(() => { setLoading(false); setAlert({ type: "success", msg: "Membership initiated! Check your email." }); }, 1800);
  };

  const doForgot = (e) => {
    e.preventDefault();
    if (!forgotEmail) return setAlert({ type: "error", msg: "Email is required." });
    setLoading(true);
    setTimeout(() => { setLoading(false); setTab("otp"); toast("Verification code sent."); }, 1500);
  };

  const doVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.join("").length < 4) return setAlert({ type: "error", msg: "Enter the full 4-digit code." });
    setLoading(true);
    setTimeout(() => { setLoading(false); setTab("reset"); }, 1200);
  };

  const doReset = (e) => {
    e.preventDefault();
    if (resetForm.password !== resetForm.confirm) return setAlert({ type: "error", msg: "Passwords don't match." });
    setLoading(true);
    setTimeout(() => { setLoading(false); setTab("login"); setAlert({ type: "success", msg: "Password updated successfully." }); }, 1500);
  };

  const strength = pwStrength(signupForm.password || resetForm.password);

  return (
    <div className="h_auth_page">

      {/* Background for both sides */}
      <div className="h_auth_visual_bg">
        <div className="h_auth_bg_mesh" />
        <div className="h_auth_bg_noise" />
      </div>

      {/* Left Side: Cinematic Visuals with Image */}
      <div className="h_auth_visual">
        <div className="h_auth_visual_img_container">
          <img 
            src="https://i.pinimg.com/736x/3d/9d/7d/3d9d7dc2b7eaa70e97610ec79bf6e6bf.jpg" 
            alt="ZEST Ambience" 
            className="h_auth_visual_img" 
          />
          <div className="h_auth_image_overlay" />
        </div>

        <div className="h_auth_visual_content">
          <div className="h_auth_brand_logo">ZEST</div>
          <div className="h_auth_brand_sub">Café & Bar</div>
        </div>

        <div className="h_auth_hero_text">
          <h2>
            Elevate Your<br />
            Vibe with <em>ZEST.</em>
          </h2>
          <p>
            Experience Ahmedabad's most exclusive social club. Where luxury meets 
            the art of the perfect brew and handcrafted cocktails.
          </p>
        </div>
      </div>

      {/* Right Side: Form Panel */}
      <div className="h_auth_form_panel">
        <div className="h_auth_form_container">
          
          {/* Mobile Branding (Visible only on small screens) */}
          <div className="h_auth_mobile_branding">
            <div className="h_auth_brand_logo">ZEST</div>
            <div className="h_auth_brand_sub">Café & Bar</div>
          </div>

          {["login", "signup"].includes(tab) && (
            <div className="h_auth_tabs_nav">
              <button className={`h_auth_tab_btn${tab === "login" ? " h_auth_active" : ""}`} onClick={() => switchTab("login")}>SIGN IN</button>
              <button className={`h_auth_tab_btn${tab === "signup" ? " h_auth_active" : ""}`} onClick={() => switchTab("signup")}>REGISTER</button>
            </div>
          )}

          <div className="h_auth_form_header">
            <h3 className="h_auth_form_title">
              {tab === "login" && "Welcome Back"}
              {tab === "signup" && "Start Journey"}
              {tab === "forgot" && "Recovery"}
              {tab === "otp" && "Verification"}
              {tab === "reset" && "Secure Account"}
            </h3>
            <p className="h_auth_form_sub">
              {tab === "login" && "Access your exclusive member dashboard."}
              {tab === "signup" && "Join our elite circle of members."}
              {tab === "forgot" && "We'll send a code to reset your password."}
              {tab === "otp" && "Enter the 4-digit code sent to your email."}
              {tab === "reset" && "Set a strong new password for your account."}
            </p>
          </div>

          {alert && (
            <div className={`h_auth_alert h_auth_alert_${alert.type}`}>
              {alert.msg}
            </div>
          )}

          {/* ── LOGIN ── */}
          {tab === "login" && (
            <form onSubmit={doLogin}>
              <div className="h_auth_fg">
                <label className="h_auth_label">Email Address</label>
                <div className="h_auth_input_wrap">
                  <input className="h_auth_input" type="email" placeholder="name@example.com" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} />
                </div>
              </div>
              <div className="h_auth_fg">
                <label className="h_auth_label">Password</label>
                <div className="h_auth_input_wrap">
                  <input className="h_auth_input" type={showPw ? "text" : "password"} placeholder="••••••••" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} />
                  <button type="button" className="h_auth_eye_btn" onClick={() => setShowPw(!showPw)}><EyeIcon open={showPw} /></button>
                </div>
              </div>
              <div className="h_auth_form_meta">
                <a href="#" className="h_auth_link_gold" onClick={() => switchTab("forgot")}>Forgot Password?</a>
              </div>
              <button type="submit" className="h_auth_submit_btn" disabled={loading}>
                {loading ? "AUTHENTICATING..." : "SIGN IN"}
              </button>
            </form>
          )}

          {/* ── SIGNUP ── */}
          {tab === "signup" && (
            <form onSubmit={doSignup}>
              <div className="h_auth_fg">
                <label className="h_auth_label">Full Name</label>
                <div className="h_auth_input_wrap">
                  <input className="h_auth_input" type="text" placeholder="John Doe" value={`${signupForm.firstName} ${signupForm.lastName}`.trim()} 
                    onChange={e => {
                      const [f, ...l] = e.target.value.split(" ");
                      setSignupForm({...signupForm, firstName: f || "", lastName: l.join(" ") || ""});
                    }} 
                  />
                </div>
              </div>
              <div className="h_auth_fg">
                <label className="h_auth_label">Email Address</label>
                <div className="h_auth_input_wrap">
                  <input className="h_auth_input" type="email" placeholder="name@example.com" value={signupForm.email} onChange={e => setSignupForm({...signupForm, email: e.target.value})} />
                </div>
              </div>
              <div className="h_auth_fg">
                <label className="h_auth_label">Phone Number</label>
                <div className="h_auth_input_wrap">
                  <input className="h_auth_input" type="tel" placeholder="+91 98765 43210" value={signupForm.phone} onChange={e => setSignupForm({...signupForm, phone: e.target.value})} />
                </div>
              </div>
              <div className="h_auth_fg">
                <label className="h_auth_label">Password</label>
                <div className="h_auth_input_wrap">
                  <input className="h_auth_input" type={showPw ? "text" : "password"} placeholder="••••••••" value={signupForm.password} onChange={e => setSignupForm({...signupForm, password: e.target.value})} />
                  <button type="button" className="h_auth_eye_btn" onClick={() => setShowPw(!showPw)}><EyeIcon open={showPw} /></button>
                </div>
                {signupForm.password && strength && (
                  <div className="h_auth_str_bar"><div className={`h_auth_str_fill ${strength.cls}`} style={{ width: `${strength.pct}%` }} /></div>
                )}
              </div>
              <div className="h_auth_fg">
                <label className="h_auth_label">Confirm Password</label>
                <div className="h_auth_input_wrap">
                  <input className="h_auth_input" type="password" placeholder="••••••••" value={signupForm.confirm} onChange={e => setSignupForm({...signupForm, confirm: e.target.value})} />
                </div>
              </div> 
              <button type="submit" className="h_auth_submit_btn" disabled={loading}>
                {loading ? "CREATING..." : "INITIATE MEMBERSHIP"}
              </button>
            </form>
          )}

          {/* ── FORGOT ── */}
          {tab === "forgot" && (
            <form onSubmit={doForgot}>
              <div className="h_auth_fg">
                <label className="h_auth_label">Registered Email</label>
                <div className="h_auth_input_wrap">
                  <input className="h_auth_input" type="email" placeholder="Enter your email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
                </div>
              </div>
              <button type="submit" className="h_auth_submit_btn" disabled={loading}>
                {loading ? "SENDING..." : "GET CODE"}
              </button>
              <a href="#" className="h_auth_back_link" onClick={() => switchTab("login")}>Back to Sign In</a>
            </form>
          )}

          {/* ── OTP ── */}
          {tab === "otp" && (
            <form onSubmit={doVerifyOtp}>
              <div className="h_auth_otp_grid">
                {otp.map((digit, i) => (
                  <input key={i} id={`otp-${i}`} className="h_auth_otp_input" type="text" maxLength="1" value={digit} onChange={e => handleOtp(e.target.value, i)} />
                ))}
              </div>
              <button type="submit" className="h_auth_submit_btn" disabled={loading}>
                {loading ? "VERIFYING..." : "CONFIRM CODE"}
              </button>
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <a href="#" className="h_auth_link_gold" onClick={doForgot}>Resend OTP</a>
              </div>
              <a href="#" className="h_auth_back_link" onClick={() => switchTab("login")}>Back to Sign In</a>
            </form>
          )}

          {/* ── RESET ── */}
          {tab === "reset" && (
            <form onSubmit={doReset}>
              <div className="h_auth_fg">
                <label className="h_auth_label">New Password</label>
                <div className="h_auth_input_wrap">
                  <input className="h_auth_input" type={showPw ? "text" : "password"} placeholder="••••••••" value={resetForm.password} onChange={e => setResetForm({...resetForm, password: e.target.value})} />
                  <button type="button" className="h_auth_eye_btn" onClick={() => setShowPw(!showPw)}><EyeIcon open={showPw} /></button>
                </div>
                {resetForm.password && strength && (
                  <div className="h_auth_str_bar"><div className={`h_auth_str_fill ${strength.cls}`} style={{ width: `${strength.pct}%` }} /></div>
                )}
              </div>
              <div className="h_auth_fg">
                <label className="h_auth_label">Confirm Password</label>
                <div className="h_auth_input_wrap">
                  <input className="h_auth_input" type="password" placeholder="••••••••" value={resetForm.confirm} onChange={e => setResetForm({...resetForm, confirm: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="h_auth_submit_btn" disabled={loading}>
                {loading ? "UPDATING..." : "UPDATE PASSWORD"}
              </button>
            </form>
          )}

        </div>
      </div>

      <div className="h_auth_toast_stack">
        {toasts.map(t => (
          <div key={t.id} className="h_auth_toast">
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}
