import { useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuthStore } from './useAuthStore';

export const useAuth = () => {
  const session = useAuthStore((state) => state.session);
  // PENTING: User harus diambil dari store agar bisa dibaca di screen lain
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  
  const setSession = useAuthStore((state) => state.setSession);
  const setLoading = useAuthStore((state) => state.setLoading);

  const getInitialSession = async () => {
    try {
      if (!session) setLoading(true);
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      if (error) throw error;
      setSession(currentSession);
    } catch (error) {
      console.error('Error session:', error.message);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getInitialSession();
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
      }
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); 

  // Kembalikan objek user
  return { session, user, isLoading };
};