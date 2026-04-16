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

export function AuthScreen({ onBack }) {
  const [mode, setMode] = useState("login"); // login or signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        if (!fullName) { setError("Enter your name"); setLoading(false); return; }
        if (password.length < 6) { setError("Password must be at least 6 characters"); setLoading(false); return; }
        await signUp(email, password, fullName);
        setCheckEmail(true);
      } else {
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

        <div style={{ marginBottom: 24 }}>
          <div style={{ color: T.textMid, fontSize: 12, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Password</div>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder={mode === "signup" ? "At least 6 characters" : "Your password"} style={inputStyle}
            onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        </div>

        <button onClick={handleSubmit} disabled={loading || !email || !password} style={{
          width: "100%", background: (email && password && !loading) ? T.accent : T.border,
          color: (email && password && !loading) ? T.bg : T.textDim,
          border: "none", borderRadius: 14, padding: "16px", fontSize: 17, fontWeight: 900,
          cursor: (email && password && !loading) ? "pointer" : "not-allowed",
          marginBottom: 20,
        }}>
          {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
        </button>

        <div style={{ textAlign: "center" }}>
          <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }} style={{ background: "none", border: "none", color: T.accent, fontSize: 14, cursor: "pointer", fontWeight: 600 }}>
            {mode === "login" ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
