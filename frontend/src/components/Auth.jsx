import { useState } from "react";
// import "./auth.css";

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
    label: ["Weak", "Fair", "Good", "Strong"][s - 1] || "Weak",
    cls:   ["s_w",  "s_f",  "s_g",  "s_s"][s - 1]  || "s_w",
    color: ["#e74c3c", "#f39c12", "#27ae60", "#2ecc71"][s - 1] || "#e74c3c",
  };
};

/* ── Eye SVG ── */
const EyeIcon = ({ open }) =>
  open ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

/* ── Toast stack ── */
const Toasts = ({ items, remove }) => (
  <div className="h_toasts">
    {items.map((t) => (
      <div key={t.id} className="h_toast" onClick={() => remove(t.id)}>
        <span>{t.icon}</span><span>{t.msg}</span>
      </div>
    ))}
  </div>
);

/* ── Main Layout ── */
export default function Auth() {
  const [tab,         setTab]         = useState("login");
  const [showPw,      setShowPw]      = useState(false);
  const [showCon,     setShowCon]     = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [alert,       setAlert]       = useState(null);
  const [toasts,      setToasts]      = useState([]);
  const [remember,    setRemember]    = useState(false);
  const [loginForm,   setLoginForm]   = useState({ email: "", password: "" });
  const [signupForm,  setSignupForm]  = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", confirm: "" });

  const toast = (msg, icon = "✓") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, icon }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  };

  const switchTab = (t) => { setTab(t); setAlert(null); setShowPw(false); setShowCon(false); };

  const doLogin = (e) => {
    e.preventDefault(); setAlert(null);
    if (!loginForm.email || !loginForm.password) { setAlert({ type:"error", msg:"Please fill in all fields." }); return; }
    if (!/\S+@\S+\.\S+/.test(loginForm.email))   { setAlert({ type:"error", msg:"Enter a valid email address." }); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); toast("Welcome back! Heading to your table…", "🍷"); }, 1800);
  };

  const doSignup = (e) => {
    e.preventDefault(); setAlert(null);
    const { firstName, lastName, email, password, confirm } = signupForm;
    if (!firstName || !lastName || !email || !password || !confirm) { setAlert({ type:"error", msg:"Please fill in all required fields." }); return; }
    if (!/\S+@\S+\.\S+/.test(email))   { setAlert({ type:"error", msg:"Enter a valid email address." }); return; }
    if (password !== confirm)           { setAlert({ type:"error", msg:"Passwords do not match." }); return; }
    const str = pwStrength(password);
    if (str && str.score < 2)           { setAlert({ type:"error", msg:"Please choose a stronger password." }); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setAlert({ type:"success", msg:"Account created! Please verify your email." }); toast("Welcome to Noir & Brew!", "🎉"); }, 2000);
  };

  const strength = pwStrength(signupForm.password);

  return (
    <div className="h_auth_page">
      <div className="h_auth_bg">
        <div className="h_bg_overlay" />
        <div className="h_bg_mesh" />
      </div>

      <div className="h_auth_container">
        {/* Brand Header */}
        <div className="h_auth_brand">
          <div className="h_brand_mark">☕</div>
          <div className="h_brand_text">
            <span className="h_brand_name">Noir & Brew</span>
            <span className="h_brand_sub">Café & Bar</span>
          </div>
        </div>

        <div className="h_auth_card">
          {/* Tabs */}
          <div className="h_tabs">
            <button className={`h_tab${tab === "login"  ? " h_active" : ""}`} onClick={() => switchTab("login")}>Sign In</button>
            <button className={`h_tab${tab === "signup" ? " h_active" : ""}`} onClick={() => switchTab("signup")}>Create Account</button>
          </div>

          <div className="h_auth_content">
            <h2 className="h_auth_title">
              {tab === "login" ? "Welcome Back" : "Join the Club"}
            </h2>
            <p className="h_auth_sub">
              {tab === "login" ? "Access your exclusive member dashboard" : "Register for Ahmedabad's finest craft experience"}
            </p>

            {alert && (
              <div className={`h_alert h_alert_${alert.type}`}>
                <span>{alert.type === "error" ? "⚠" : "✓"}</span> {alert.msg}
              </div>
            )}

            {/* ══ LOGIN ══ */}
            {tab === "login" && (
              <form onSubmit={doLogin} noValidate>
                <div className="h_fg">
                  <label className="h_label">Email Address</label>
                  <div className="h_input_wrap">
                    <span className="h_ico">✉</span>
                    <input className="h_input" type="email" placeholder="you@example.com"
                      value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                      autoComplete="email" />
                  </div>
                </div>
                <div className="h_fg">
                  <label className="h_label">Password</label>
                  <div className="h_input_wrap">
                    <span className="h_ico">🔒</span>
                    <input className="h_input" type={showPw ? "text" : "password"} placeholder="Enter your password"
                      value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                      autoComplete="current-password" />
                    <button type="button" className="h_eye_btn" onClick={() => setShowPw(!showPw)}>
                      <EyeIcon open={showPw} />
                    </button>
                  </div>
                </div>
                <div className="h_meta">
                  <label className="h_ck_label">
                    <input type="checkbox" className="h_ck" checked={remember} onChange={e => setRemember(e.target.checked)} />
                    Remember me
                  </label>
                  <a href="#" className="h_fgt">Forgot password?</a>
                </div>
                <button type="submit" className="h_submit" disabled={loading}>
                  {loading ? <><div className="h_spin" /> Processing…</> : "Sign In"}
                </button>

                <div className="h_divider">
                  <span className="h_div_line" /><span className="h_div_txt">or continue with</span><span className="h_div_line" />
                </div>
                <div className="h_socials">
                  <button type="button" className="h_soc_btn">
                    <b style={{ color:"#ea4335" }}>G</b> Google
                  </button>
                  <button type="button" className="h_soc_btn">
                    <b style={{ color:"#1877f2" }}>f</b> Facebook
                  </button>
                </div>
              </form>
            )}

            {/* ══ SIGNUP ══ */}
            {tab === "signup" && (
              <form onSubmit={doSignup} noValidate>
                <div className="h_2col">
                  <div className="h_fg">
                    <label className="h_label">First Name</label>
                    <div className="h_input_wrap">
                      <span className="h_ico">👤</span>
                      <input className="h_input" type="text" placeholder="Jane"
                        value={signupForm.firstName} onChange={e => setSignupForm({ ...signupForm, firstName: e.target.value })} autoComplete="given-name" />
                    </div>
                  </div>
                  <div className="h_fg">
                    <label className="h_label">Last Name</label>
                    <div className="h_input_wrap">
                      <span className="h_ico">👤</span>
                      <input className="h_input" type="text" placeholder="Doe"
                        value={signupForm.lastName} onChange={e => setSignupForm({ ...signupForm, lastName: e.target.value })} autoComplete="family-name" />
                    </div>
                  </div>
                </div>
                <div className="h_fg">
                  <label className="h_label">Email Address</label>
                  <div className="h_input_wrap">
                    <span className="h_ico">✉</span>
                    <input className="h_input" type="email" placeholder="you@example.com"
                      value={signupForm.email} onChange={e => setSignupForm({ ...signupForm, email: e.target.value })} autoComplete="email" />
                  </div>
                </div>
                <div className="h_fg">
                  <label className="h_label">Password</label>
                  <div className="h_input_wrap">
                    <span className="h_ico">🔒</span>
                    <input className="h_input" type={showPw ? "text" : "password"} placeholder="Create a strong password"
                      value={signupForm.password} onChange={e => setSignupForm({ ...signupForm, password: e.target.value })} autoComplete="new-password" />
                    <button type="button" className="h_eye_btn" onClick={() => setShowPw(!showPw)}>
                      <EyeIcon open={showPw} />
                    </button>
                  </div>
                  {signupForm.password && strength && (
                    <div className="h_str_bar"><div className={`h_str_fill ${strength.cls}`} style={{ width: `${strength.pct}%` }} /></div>
                  )}
                </div>
                <button type="submit" className="h_submit" disabled={loading}>
                  {loading ? <><div className="h_spin" /> Processing…</> : "Create Account"}
                </button>
              </form>
            )}
            
            <p className="h_auth_footer">
              {tab === "login" ? (
                <>New here? <a href="#" onClick={e => { e.preventDefault(); switchTab("signup"); }}>Create an account</a></>
              ) : (
                <>Already a member? <a href="#" onClick={e => { e.preventDefault(); switchTab("login"); }}>Sign in here</a></>
              )}
            </p>
          </div>
        </div>
      </div>

      <Toasts items={toasts} remove={id => setToasts(p => p.filter(t => t.id !== id))} />
    </div>
  );
}