import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { supabase } from '../supabaseClient';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (data.user) {
      // Upsert user to app_users table
      await supabase.from('app_users').upsert([{
        id: data.user.id,
        email: data.user.email,
        username: data.user.user_metadata?.username || '',
        phone: data.user.user_metadata?.phone || ''
      }]);
      navigate('/home');
    } else {
      setError(error?.message || 'Invalid login credentials');
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback' // You'll handle this route
      }
    });

    if (error) {
      console.error('Google Auth Error:', error.message);
      setError('Google login failed.');
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Login</h2>

        {error && <p className="login-error">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>

        <div className="login-divider">or</div>

        <button type="button" className="google-btn" onClick={handleGoogleLogin}>
          Continue with Google
        </button>

        <p className="login-footer">
          Don't have an account? <a href="/">Register</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
