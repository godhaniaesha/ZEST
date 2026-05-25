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
    cls: ["s_w", "s_f", "s_g", "s_s"][s - 1] || "s_w",
  };
};

/* ── Icons ── */
const EyeIcon = ({ open }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
    ) : (
      <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></>
    )}
  </svg>
);

/* ── Main Auth Component ── */
export default function Auth() {
  const [tab, setTab] = useState("login"); // login, signup, forgot, otp, reset
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [remember, setRemember] = useState(false);
  
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [resetForm, setResetForm] = useState({ password: "", confirm: "" });

  const toast = (msg, icon = "✓") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, icon }]);
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
    
    // Auto-focus next input
    if (val && idx < 3) {
      const next = document.getElementById(`otp-${idx + 1}`);
      if (next) next.focus();
    }
  };

  /* ── Handlers ── */
  const doLogin = (e) => {
    e.preventDefault();
    setAlert(null);
    if (!loginForm.email || !loginForm.password) return setAlert({ type: "error", msg: "Required fields missing." });
    setLoading(true);
    setTimeout(() => { setLoading(false); toast("Welcome back!", "🍷"); }, 1500);
  };

  const doSignup = (e) => {
    e.preventDefault();
    setAlert(null);
    if (!signupForm.email || !signupForm.password) return setAlert({ type: "error", msg: "All fields are required." });
    setLoading(true);
    setTimeout(() => { setLoading(false); setAlert({ type: "success", msg: "Membership initiated! Check email." }); }, 1800);
  };

  const doForgot = (e) => {
    e.preventDefault();
    if (!forgotEmail) return setAlert({ type: "error", msg: "Email is required." });
    setLoading(true);
    setTimeout(() => { setLoading(false); setTab("otp"); toast("Code sent!", "📧"); }, 1500);
  };

  const doVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.join("").length < 4) return setAlert({ type: "error", msg: "Complete the code." });
    setLoading(true);
    setTimeout(() => { setLoading(false); setTab("reset"); }, 1200);
  };

  const doReset = (e) => {
    e.preventDefault();
    if (resetForm.password !== resetForm.confirm) return setAlert({ type: "error", msg: "Passwords don't match." });
    setLoading(true);
    setTimeout(() => { setLoading(false); setTab("login"); setAlert({ type: "success", msg: "Password updated." }); }, 1500);
  };

  const strength = pwStrength(signupForm.password || resetForm.password);

  return (
    <div className="h_auth_page">
      {/* Background Elements */}
      <div className="h_bg_noise" />
      <div className="h_bg_aurora">
        <div className="h_aurora_blob" />
        <div className="h_aurora_blob" />
      </div>

      <div className="h_auth_container">
        
        {/* Brand Header */}
        <div className="h_brand_float">
          <div className="h_brand_z">Z</div>
        </div>

        <div className="h_auth_card">
          <div className="h_card_glow" />

          {["login", "signup"].includes(tab) && (
            <div className="h_tab_switcher" data-active={tab}>
              <div className="h_tab_bubble" />
              <button className={`h_tab_item${tab === "login" ? " h_active" : ""}`} onClick={() => switchTab("login")}>SIGN IN</button>
              <button className={`h_tab_item${tab === "signup" ? " h_active" : ""}`} onClick={() => switchTab("signup")}>JOIN CLUB</button>
            </div>
          )}

          <div className="h_form_header">
            <h3>
              {tab === "login" && "Welcome Back"}
              {tab === "signup" && "New Journey"}
              {tab === "forgot" && "Reset Password"}
              {tab === "otp" && "Verify Code"}
              {tab === "reset" && "Secure Account"}
            </h3>
            <p>
              {tab === "login" && "Enter your credentials to access the club."}
              {tab === "signup" && "Create your elite ZEST membership."}
              {tab === "forgot" && "We'll send a verification code to your email."}
              {tab === "otp" && "Enter the 4-digit code sent to your email."}
              {tab === "reset" && "Set a strong new password for your account."}
            </p>
          </div>

          {alert && (
            <div className={`h_alert h_alert_${alert.type}`}>
              {alert.msg}
            </div>
          )}

          {/* ── LOGIN VIEW ── */}
          {tab === "login" && (
            <form onSubmit={doLogin}>
              <div className="h_input_group">
                <label className="h_input_label">Email</label>
                <div className="h_field_wrap">
                  <input className="h_main_input" type="email" placeholder="you@example.com" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} />
                </div>
              </div>
              <div className="h_input_group">
                <label className="h_input_label">Password</label>
                <div className="h_field_wrap">
                  <input className="h_main_input" type={showPw ? "text" : "password"} placeholder="••••••••" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} />
                  <button type="button" className="h_eye_btn" onClick={() => setShowPw(!showPw)}><EyeIcon open={showPw} /></button>
                </div>
              </div>
              <div className="h_form_footer">
                <label className="h_check_label">
                  <input type="checkbox" hidden checked={remember} onChange={e => setRemember(e.target.checked)} />
                  <div className="h_custom_ck">{remember && "✓"}</div>
                  Remember me
                </label>
                <a href="#" className="h_link_simple" onClick={() => switchTab("forgot")}>Forgot?</a>
              </div>
              <button type="submit" className="h_submit_btn" disabled={loading}>
                {loading ? <div className="h_loader" /> : "AUTHENTICATE"}
              </button>
            </form>
          )}

          {/* ── SIGNUP VIEW ── */}
          {tab === "signup" && (
            <form onSubmit={doSignup}>
              <div className="h_input_group">
                <label className="h_input_label">Full Name</label>
                <div className="h_field_wrap">
                  <input className="h_main_input" type="text" placeholder="John Doe" value={`${signupForm.firstName} ${signupForm.lastName}`.trim()} 
                    onChange={e => {
                      const [f, ...l] = e.target.value.split(" ");
                      setSignupForm({...signupForm, firstName: f || "", lastName: l.join(" ") || ""});
                    }} 
                  />
                </div>
              </div>
              <div className="h_input_group">
                <label className="h_input_label">Email</label>
                <div className="h_field_wrap">
                  <input className="h_main_input" type="email" placeholder="you@example.com" value={signupForm.email} onChange={e => setSignupForm({...signupForm, email: e.target.value})} />
                </div>
              </div>
              <div className="h_input_group">
                <label className="h_input_label">Password</label>
                <div className="h_field_wrap">
                  <input className="h_main_input" type={showPw ? "text" : "password"} placeholder="••••••••" value={signupForm.password} onChange={e => setSignupForm({...signupForm, password: e.target.value})} />
                  <button type="button" className="h_eye_btn" onClick={() => setShowPw(!showPw)}><EyeIcon open={showPw} /></button>
                </div>
                {signupForm.password && strength && (
                  <div className="h_strength_container"><div className={`h_strength_fill ${strength.cls}`} style={{ width: `${strength.pct}%` }} /></div>
                )}
              </div>
              <button type="submit" className="h_submit_btn" disabled={loading}>
                {loading ? <div className="h_loader" /> : "CREATE ACCOUNT"}
              </button>
            </form>
          )}

          {/* ── FORGOT VIEW ── */}
          {tab === "forgot" && (
            <form onSubmit={doForgot}>
              <div className="h_input_group">
                <label className="h_input_label">Recovery Email</label>
                <div className="h_field_wrap">
                  <input className="h_main_input" type="email" placeholder="Enter your email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
                </div>
              </div>
              <button type="submit" className="h_submit_btn" disabled={loading}>
                {loading ? <div className="h_loader" /> : "SEND CODE"}
              </button>
              <a href="#" className="h_back_link" onClick={() => switchTab("login")}>Back to Sign In</a>
            </form>
          )}

          {/* ── OTP VIEW ── */}
          {tab === "otp" && (
            <form onSubmit={doVerifyOtp}>
              <div className="h_otp_row">
                {otp.map((digit, i) => (
                  <input key={i} id={`otp-${i}`} className="h_otp_box" type="text" maxLength="1" value={digit} onChange={e => handleOtp(e.target.value, i)} />
                ))}
              </div>
              <button type="submit" className="h_submit_btn" disabled={loading}>
                {loading ? <div className="h_loader" /> : "VERIFY CODE"}
              </button>
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <a href="#" className="h_link_simple" onClick={doForgot}>Resend OTP</a>
              </div>
              <a href="#" className="h_back_link" onClick={() => switchTab("login")}>Back to Sign In</a>
            </form>
          )}

          {/* ── RESET VIEW ── */}
          {tab === "reset" && (
            <form onSubmit={doReset}>
              <div className="h_input_group">
                <label className="h_input_label">New Password</label>
                <div className="h_field_wrap">
                  <input className="h_main_input" type={showPw ? "text" : "password"} placeholder="••••••••" value={resetForm.password} onChange={e => setResetForm({...resetForm, password: e.target.value})} />
                  <button type="button" className="h_eye_btn" onClick={() => setShowPw(!showPw)}><EyeIcon open={showPw} /></button>
                </div>
                {resetForm.password && strength && (
                  <div className="h_strength_container"><div className={`h_strength_fill ${strength.cls}`} style={{ width: `${strength.pct}%` }} /></div>
                )}
              </div>
              <div className="h_input_group">
                <label className="h_input_label">Confirm</label>
                <div className="h_field_wrap">
                  <input className="h_main_input" type="password" placeholder="••••••••" value={resetForm.confirm} onChange={e => setResetForm({...resetForm, confirm: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="h_submit_btn" disabled={loading}>
                {loading ? <div className="h_loader" /> : "UPDATE PASSWORD"}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="h_toast_list">
        {toasts.map(t => (
          <div key={t.id} className="h_toast_item">
            <span>{t.icon}</span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
