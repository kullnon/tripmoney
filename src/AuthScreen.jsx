import { useState } from 'react';
import { useAuth } from './AuthContext';

const T = {
  bg: "#0A0F1E", surface: "#111827", card: "#1A2235",
  border: "#1E2D45", accent: "#00D4FF", green: "#00E5A0",
  red: "#FF4560", purple: "#7B61FF",
  text: "#F0F4FF", textMid: "#8A9BC4", textDim: "#4A5880",
};

const inputStyle = {
  width: "100%", background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
  padding: "14px 16px", color: T.text, fontSize: 16, boxSizing: "border-box", outline: "none", fontFamily: "inherit",
};

function PasswordInput({ value, onChange, placeholder, onKeyDown }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input value={value} onChange={onChange} type={show ? "text" : "password"} placeholder={placeholder}
        style={{ ...inputStyle, paddingRight: 48 }} onKeyDown={onKeyDown} />
      <button onClick={() => setShow(!show)} style={{
        position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
        background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: 4,
        color: T.textDim,
      }}>{show ? "🙈" : "👁️"}</button>
    </div>
  );
}

export function AuthScreen({ onBack }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        if (!fullName.trim()) { setError("Please enter your name"); setLoading(false); return; }
        if (!email.trim()) { setError("Please enter your email"); setLoading(false); return; }
        if (password.length < 6) { setError("Password must be at least 6 characters"); setLoading(false); return; }
        if (password !== confirmPassword) { setError("Passwords do not match"); setLoading(false); return; }
        await signUp(email, password, fullName);
        setCheckEmail(true);
      } else {
        if (!email.trim()) { setError("Please enter your email"); setLoading(false); return; }
        if (!password) { setError("Please enter your password"); setLoading(false); return; }
        await signIn(email, password);
      }
    } catch (e) {
      setError(e.message || "Something went wrong");
    }
    setLoading(false);
  };

  if (checkEmail) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>📧</div>
        <div style={{ color: T.text, fontSize: 24, fontWeight: 900, marginBottom: 12 }}>Check your email</div>
        <div style={{ color: T.textMid, fontSize: 15, lineHeight: 1.6, maxWidth: 300, marginBottom: 32 }}>
          We sent a confirmation link to <span style={{ color: T.accent, fontWeight: 700 }}>{email}</span>. Click it to activate your account.
        </div>
        <button onClick={() => { setCheckEmail(false); setMode("login"); }} style={{ background: T.accent, color: T.bg, border: "none", borderRadius: 14, padding: "14px 36px", fontSize: 16, fontWeight: 800, cursor: "pointer" }}>Back to Login</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <button onClick={onBack} style={{ color: T.accent, background: "none", border: "none", fontSize: 14, cursor: "pointer", fontWeight: 600, marginBottom: 24, padding: 0 }}>← Back</button>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: T.text, marginBottom: 6 }}>
            <span>My</span><span style={{ color: T.accent }}>Trip</span><span>Money</span>
          </div>
          <div style={{ color: T.textMid, fontSize: 15 }}>{mode === "login" ? "Welcome back" : "Create your account"}</div>
        </div>

        {error && (
          <div style={{ background: T.red + "22", border: `1px solid ${T.red}44`, borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: T.red, fontSize: 14, fontWeight: 600, textAlign: "center" }}>{error}</div>
        )}

        {mode === "signup" && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ color: T.textMid, fontSize: 12, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Full Name</div>
            <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Andy" style={inputStyle} />
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <div style={{ color: T.textMid, fontSize: 12, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Email</div>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com" style={inputStyle} />
        </div>

        <div style={{ marginBottom: mode === "signup" ? 14 : 24 }}>
          <div style={{ color: T.textMid, fontSize: 12, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Password</div>
          <PasswordInput value={password} onChange={e => setPassword(e.target.value)} placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
            onKeyDown={e => e.key === "Enter" && mode === "login" && handleSubmit()} />
        </div>

        {mode === "signup" && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ color: T.textMid, fontSize: 12, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Confirm Password</div>
            <PasswordInput value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Type password again"
              onKeyDown={e => e.key === "Enter" && handleSubmit()} />
            {confirmPassword && password && confirmPassword !== password && (
              <div style={{ color: T.red, fontSize: 12, fontWeight: 600, marginTop: 6 }}>Passwords do not match</div>
            )}
            {confirmPassword && password && confirmPassword === password && (
              <div style={{ color: T.green, fontSize: 12, fontWeight: 600, marginTop: 6 }}>✓ Passwords match</div>
            )}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading || !email || !password || (mode === "signup" && password !== confirmPassword)} style={{
          width: "100%",
          background: (email && password && !loading && (mode === "login" || password === confirmPassword)) ? T.accent : T.border,
          color: (email && password && !loading && (mode === "login" || password === confirmPassword)) ? T.bg : T.textDim,
          border: "none", borderRadius: 14, padding: "16px", fontSize: 17, fontWeight: 900,
          cursor: (email && password && !loading && (mode === "login" || password === confirmPassword)) ? "pointer" : "not-allowed",
          marginBottom: 20,
        }}>
          {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
        </button>

        <div style={{ textAlign: "center" }}>
          <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setConfirmPassword(""); }} style={{ background: "none", border: "none", color: T.accent, fontSize: 14, cursor: "pointer", fontWeight: 600 }}>
            {mode === "login" ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
