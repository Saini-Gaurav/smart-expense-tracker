import axios from 'axios';
import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import PasswordField from '../components/PasswordField';
import { useAuth } from '../state/AuthContext';

type AuthMode = 'login' | 'register';

export default function AuthPage({ mode }: { mode: AuthMode }) {
  const { login, register, loading } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const isRegister = mode === 'register';

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) await register(form);
      else await login({ email: form.email, password: form.password });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = (err.response?.data as { message?: string } | undefined)?.message;
        setError(msg || 'Something went wrong. Try again.');
      } else {
        setError('Something went wrong. Try again.');
      }
    }
  };

  return (
    <div className="auth-shell">
      <aside className="auth-brand" aria-hidden="true">
        <div className="auth-brand-inner">
          <div className="auth-logo-mark">{'\u20B9'}</div>
          <h2 className="auth-brand-title">Smart Expense Tracker</h2>
          <p className="auth-brand-tagline">
            Clarity for every rupee. Track spending, spot patterns, and stay in control—without the spreadsheet headache.
          </p>
          <ul className="auth-brand-bullets">
            <li>Secure JWT + refresh session</li>
            <li>Insights by category &amp; period</li>
            <li>Built for desktop &amp; mobile</li>
          </ul>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card-wrap">
          <div className="auth-card-header">
            <p className="auth-eyebrow">{isRegister ? 'Get started' : 'Welcome back'}</p>
            <h1 className="auth-title">{isRegister ? 'Create your account' : 'Sign in'}</h1>
            <p className="auth-sub">
              {isRegister ? (
                <>
                  Already have an account?{' '}
                  <Link className="auth-link" to="/login">
                    Sign in
                  </Link>
                </>
              ) : (
                <>
                  New here?{' '}
                  <Link className="auth-link" to="/register">
                    Create an account
                  </Link>
                </>
              )}
            </p>
          </div>

          <form className="auth-form" onSubmit={onSubmit} noValidate>
            {isRegister && (
              <div className="field">
                <label className="field-label" htmlFor="auth-name">
                  Full name
                </label>
                <input
                  id="auth-name"
                  className="field-input"
                  type="text"
                  autoComplete="name"
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  minLength={2}
                />
              </div>
            )}

            <div className="field">
              <label className="field-label" htmlFor="auth-email">
                Email
              </label>
              <input
                id="auth-email"
                className="field-input"
                type="email"
                autoComplete="email"
                placeholder={isRegister ? 'yourcomany@gmail.com' : 'demo@gmail.com'}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <PasswordField
              label="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              placeholder={isRegister ? 'At least 6 characters' : 'Demo@123'}
              required
              minLength={isRegister ? 6 : undefined}
            />

            {error ? (
              <div className="auth-error" role="alert">
                {error}
              </div>
            ) : null}

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner" aria-hidden />
                  Please wait…
                </span>
              ) : isRegister ? (
                'Create account'
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="auth-footer-note">By continuing you agree to use this app responsibly for your own expense tracking.</p>
        </div>
      </main>
    </div>
  );
}
