'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL || "https://mapyour20s.com"}/onboarding`;
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
      });
      if (otpError) throw otpError;
  setSuccess("A sign-in link has been sent to your email address. Please check your inbox to continue.");
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 space-y-6">
  <h1 className="text-2xl font-semibold text-center">Sign Up</h1>
      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="border p-3 rounded w-full"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white py-3 px-6 rounded w-full"
        disabled={submitting}
      >
        {submitting ? 'Sending link…' : 'Sign up'}
      </button>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">{success}</p>}
    </form>
  );
}