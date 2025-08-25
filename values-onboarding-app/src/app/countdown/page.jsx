'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function CountdownPage() {
  const [timeLeft, setTimeLeft] = useState('');
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [profile, setProfile] = useState(null);
  // Removed showProfile state
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
        .select('dob, first_name, last_name')
        .eq('id', user.id)
        .single();
      if (profileError || !data?.dob) {
        router.replace('/home');
        return;
      }
      setProfile(data);
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('question_answers').delete().eq('user_id', user.id);
        await supabase.from('profiles').delete().eq('id', user.id);
      }
    } catch (_) {}
    await supabase.auth.signOut();
    router.replace('/signup');
  };

  if (loading || !authed) return <p className="text-center mt-10">Loading...</p>;

  // Calculate age from dob
  let age = "";
  if (profile?.dob) {
    const dob = new Date(profile.dob);
    const now = new Date();
    age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
      age--;
    }
  }

  return (
  <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
  <h1 className="text-5xl font-extrabold mb-4 text-blue-900 drop-shadow">Map My 20&#39;s</h1>
      <p className="text-lg text-slate-700 mb-6 max-w-xl mx-auto">
        Welcome, and thank you for taking this questionnaire.<br />
        Before we get started, let’s take a moment and step back to look at how much time you have to maximize your potential while being in your 20s.
      </p>
      <div className="mb-8">
        <span className="text-5xl font-mono text-blue-800 select-none">{timeLeft}</span>
        <div className="text-xl font-semibold text-blue-800 mt-4">
          until you turn 30.<br />
          What will you do until then?
        </div>
      </div>
      <div className="flex flex-col space-y-4 w-full max-w-xs mx-auto">
        <button
          onClick={() => router.push('/questions')}
          className="bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 transition text-lg font-bold"
        >
          Start Questionnaire
        </button>
  {/* Profile button and panel removed as requested */}
      </div>
  {/* No animation */}
    </div>
  );
}
