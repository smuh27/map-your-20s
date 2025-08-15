'use client';

import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function SessionAutoSignOut() {
  useEffect(() => {
    const clearLocalSession = () => {
      try {
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('supabase.auth');
        localStorage.removeItem('sb:token');
        // do not remove lastPage intentionally
      } catch (e) {
        // ignore
      }
    };

    const handleUnload = () => {
      try {
        // best-effort async sign out; do not await because unload may cancel
        supabase.auth.signOut().catch(() => {});
      } catch (e) {
        // ignore
      } finally {
        clearLocalSession();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        handleUnload();
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return null;
}
