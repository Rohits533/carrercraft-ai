'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    // Crucial: Stops browser navigation from cutting off the fetch call in Safari
    e.preventDefault();
    
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Server returned error status ${response.status}`);
      }

      router.push('/dashboard');

    } catch (err: any) {
      console.error('[Frontend Auth Fetch Exception]:', err);
      setErrorMessage(
        err.message || 'Unable to connect to authentication server. Please check network.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Sign in to your account</h2>
      
      {errorMessage && (
        <div style={{ color: 'red', margin: '1rem 0', padding: '0.5rem', border: '1px solid red' }}>
          <strong>Load failed:</strong> {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading} style={{ marginTop: '1rem' }}>
          {loading ? 'Authenticating...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
