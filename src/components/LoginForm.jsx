// components/LoginForm.jsx
import { useState } from 'react';

export default function LoginForm({ onSuccessRedirect = '/' }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const j = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(j.error || 'Login failed');
        return;
      }
      // Login cookie set by server; redirect to dashboard
      window.location.href = onSuccessRedirect;
    } catch (err) {
      setLoading(false);
      setError('Network error');
    }
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 420, margin: '0 auto' }}>
      <h2>Vendor Login</h2>
      <div style={{ marginBottom: 8 }}>
        <input
          placeholder="Username or email"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
        />
      </div>
      <button type="submit" disabled={loading} style={{ padding: '10px 16px', background: '#0ea5e9', color: 'white', borderRadius: 6 }}>
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
      {error && <div style={{ color: 'crimson', marginTop: 10 }}>{error}</div>}
    </form>
  );
}
