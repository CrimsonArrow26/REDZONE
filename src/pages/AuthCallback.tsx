// src/pages/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data.session) {
        // Upsert user after Google login
        const { user } = data.session;
        await supabase.from('app_users').upsert([{
          id: user.id,
          email: user.email,
          username: user.user_metadata?.name || '',
          phone: user.user_metadata?.phone || ''
        }]);
        navigate('/home');
      } else {
        navigate('/login');
      }
    };
    checkSession();
  }, [navigate]);

  return <p>Authenticating...</p>;
};

export default AuthCallback;
