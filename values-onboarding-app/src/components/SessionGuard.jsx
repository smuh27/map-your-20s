'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function SessionGuard({ children }) {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session ?? null;
        if (!session && mounted) {
          // redirect to homepage (public) when no session
          router.replace('/');
        }
      } catch (err) {
        if (mounted) router.replace('/');
      }
    }

    checkSession();

    const { data: { subscription } = {} } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && mounted) {
        router.replace('/');
      }
    });

    return () => {
      mounted = false;
      if (subscription?.unsubscribe) subscription.unsubscribe();
    };
  }, [router]);

  return children;
}
