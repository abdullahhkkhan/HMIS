import React, { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { IoEye, IoEyeOff, IoLockClosed, IoPerson, IoAlertCircle } from "react-icons/io5";
import logo from "../../assets/images/hmis_logo_mark.png";
import { useHmis } from "../../store/HmisStore";
import { ROLE_HOME, ROLE_LABELS } from "../../utils/constants";
import { Button } from "../../components/ui";
import { Field, Input } from "../../components/forms/Field";

// Demo accounts are only listed while the app runs on local demo data.
const DEMO_ACCOUNTS = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "reception", password: "reception123", role: "registration" },
  { username: "drali", password: "doctor123", role: "doctor" },
  { username: "pharmacy", password: "pharmacy123", role: "dispensary" },
];

export default function Login() {
  const { login, currentUser } = useHmis();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (currentUser) return <Navigate to={ROLE_HOME[currentUser.role]} replace />;

  const handleLogin = (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Enter your username and password");
      return;
    }
    setSubmitting(true);
    const res = login(username, password);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    const from = location.state?.from;
    navigate(from && from !== "/login" ? from : ROLE_HOME[res.user.role], { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-10 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-blue-600/10 blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-6">
          <img src={logo} alt="HMIS" className="w-24 h-24 object-contain mb-2" />
          <h1 className="text-xl font-semibold text-white">Sign in to HMIS</h1>
          <p className="text-sm text-slate-400 mt-1">Hospital Management Information System</p>
        </div>

        <form
          onSubmit={handleLogin}
          noValidate
          className="bg-slate-800/80 border border-white/10 rounded-xl p-6 shadow-2xl space-y-4"
        >
          {error && (
            <div className="flex items-center gap-2 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
              <IoAlertCircle className="shrink-0" /> {error}
            </div>
          )}

          <Field label="Username" htmlFor="username">
            <div className="relative">
              <IoPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input
                id="username"
                autoFocus
                autoComplete="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                placeholder="Enter username"
                className="pl-9"
              />
            </div>
          </Field>

          <Field label="Password" htmlFor="password">
            <div className="relative">
              <IoLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Enter password"
                className="pl-9 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <IoEyeOff /> : <IoEye />}
              </button>
            </div>
          </Field>

          <Button type="submit" size="lg" className="w-full" loading={submitting}>
            Sign in
          </Button>
          <p className="text-xs text-center text-slate-500">
            Your role and pages are set by your account. Contact the admin for access.
          </p>
        </form>

        <div className="mt-5 rounded-xl border border-dashed border-white/10 p-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-2 text-center">Demo accounts</p>
          <div className="grid grid-cols-2 gap-1.5">
            {DEMO_ACCOUNTS.map((a) => (
              <button
                key={a.username}
                type="button"
                onClick={() => {
                  setUsername(a.username);
                  setPassword(a.password);
                  setError("");
                }}
                className="cursor-pointer text-left rounded-lg px-2.5 py-1.5 bg-slate-800/60 hover:bg-slate-700/60 ring-1 ring-inset ring-white/5"
              >
                <span className="block text-xs text-slate-200">{ROLE_LABELS[a.role]}</span>
                <span className="block text-[11px] text-slate-500">{a.username} / {a.password}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
