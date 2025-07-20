import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let interval: NodeJS.Timeout;

    const checkSession = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (isMounted) {
        if (error || !data.user) {
          await supabase.auth.signOut();
          setIsLoggedIn(false);
          setIsLoading(false);
        } else {
          setIsLoggedIn(true);
          setIsLoading(false);
        }
      }
    };

    checkSession(); // Initial check

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (isMounted) {
        setIsLoggedIn(!!session?.user);
        setIsLoading(false);
      }
    });

    // Check session every 5 minutes
    interval = setInterval(checkSession, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      listener?.subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  if (isLoading) return null; // or a loading spinner

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 