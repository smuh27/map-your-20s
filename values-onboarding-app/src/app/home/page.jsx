'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        router.replace('/signup');
        return;
      }

      // Check if onboarding is already complete
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('onboarding_complete')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError.message);
        return;
      }
      if (!profile) {
        // No profile row, send to onboarding
        router.replace('/onboarding');
        return;
      }
      if (profile?.onboarding_complete) {
        setOnboarded(true);
        setLoading(false);
        return;
      }
      setUser(user);
      setLoading(false);
    };

    getUser();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        dob,
        onboarding_complete: true,
      })
      .eq('id', user.id);

    if (error) {
      console.error('Failed to update profile:', error.message);
    } else {
      router.replace('/countdown');
    }
  };

  if (loading) return null;

  if (!onboarded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Welcome! Please fill out the form below to set up your profile.
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full max-w-sm">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="p-2 border rounded"
            required
          />
          <label className="flex flex-col text-sm font-medium">
            Date of Birth
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="p-2 border rounded mt-1"
              required
            />
          </label>
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Continue
          </button>
        </form>
      </div>
    );
  }

  // Onboarded: show welcome and navigation
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Welcome to your dashboard!</h1>
      <button
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        onClick={() => router.push('/countdown')}
      >
        Go to Countdown
      </button>
      <button
        className="bg-red-600 text-white py-2 px-4 rounded mt-4"
        onClick={async () => { await supabase.auth.signOut(); router.replace('/signup'); }}
      >
        Log Out
      </button>
    </div>
  );
}
