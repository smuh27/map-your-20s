'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function CountdownPage() {
  const [timeLeft, setTimeLeft] = useState('');
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchDOB = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.replace('/signup');
        return;
      }
      setAuthed(true);
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('dob')
        .eq('id', user.id)
        .single();
      if (profileError || !data?.dob) {
        router.replace('/home');
        return;
      }
      const dob = new Date(data.dob);
      const thirtiethBirthday = new Date(dob);
      thirtiethBirthday.setFullYear(thirtiethBirthday.getFullYear() + 30);
      const updateCountdown = () => {
        const now = new Date();
        const distance = thirtiethBirthday.getTime() - now.getTime();
        if (distance <= 0) {
          setTimeLeft('🎉 You’re 30! Time’s up!');
          return;
        }
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((distance / (1000 * 60)) % 60);
        const seconds = Math.floor((distance / 1000) % 60);
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      };
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    };
    fetchDOB().then(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
  localStorage.setItem('lastPage', '/home');
    await supabase.auth.signOut();
    router.replace('/signup');
  };

  if (loading || !authed) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-4xl font-bold mb-6">⏳ Countdown to 30</h1>
      <div className="text-6xl font-mono text-blue-700">{timeLeft}</div>
      <div className="flex flex-col space-y-4 mt-10">
        <button
          onClick={() => router.push('/questions')}
          className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition"
        >
          Go to Questions
        </button>
        <button
          onClick={() => router.push('/home')}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
        >
          Back to Home
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 transition"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
