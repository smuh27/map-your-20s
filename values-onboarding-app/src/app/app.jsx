'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';


export default function DebugUser() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  return (
    <div className="p-4">
      <h2>Session Debug</h2>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}
