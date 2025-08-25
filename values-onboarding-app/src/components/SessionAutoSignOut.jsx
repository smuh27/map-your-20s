'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function SessionAutoSignOut() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

  async function checkSession() {
      try {
  if (!supabase) return;
    const { data } = await supabase.auth.getSession();
        const session = data?.session ?? null;
        if (!session && mounted) {
          router.replace('/');
        }
      } catch (err) {
        console.error('Session check error:', err);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (userId) {
        await supabase.from('question_answers').delete().eq('user_id', userId);
        await supabase.from('profiles').delete().eq('id', userId);
      }
    } catch (_) {}
    try { if (supabase) await supabase.auth.signOut(); } catch (_) {}
        try {
          Object.keys(localStorage).forEach((k) => {
            if (
              k.startsWith('sb-') ||
              k.startsWith('supabase') ||
              k.includes('session') ||
              k.includes('refresh')
            ) localStorage.removeItem(k);
          });
        } catch (_) {}
        if (mounted) router.replace('/');
      }
    }

    checkSession();

    const subscriptionWrap = supabase
      ? supabase.auth.onAuthStateChange((_event, session) => {
          if (!session && mounted) router.replace('/');
        })
      : { data: { subscription: undefined } };

    // Force sign out and data wipe on page unload/leave
    const handleUnload = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        if (userId) {
          await supabase.from('question_answers').delete().eq('user_id', userId);
          await supabase.from('profiles').delete().eq('id', userId);
        }
        await supabase.auth.signOut();
        Object.keys(localStorage).forEach((k) => {
          if (
            k.startsWith('sb-') ||
            k.startsWith('supabase') ||
            k.includes('session') ||
            k.includes('refresh')
          ) localStorage.removeItem(k);
        });
      } catch (_) {}
    };
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('unload', handleUnload);
    return () => {
      mounted = false;
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('unload', handleUnload);
      // Clean up subscription if present
      const subscription = subscriptionWrap?.data?.subscription;
      if (subscription?.unsubscribe) subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
