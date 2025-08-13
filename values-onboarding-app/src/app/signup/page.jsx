'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function SignupPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    // Password restrictions
    const password = form.password;
    const minLength = 8;
    const hasDigit = /\d/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasSymbol = /[!@#$%^&*]/.test(password);

    if (
      password.length < minLength ||
      !hasDigit ||
      !hasLower ||
      !hasUpper ||
      !hasSymbol
    ) {
      setError(
        'Password must be at least 8 characters and include digits, lowercase, uppercase, and symbols (!@#$%^&*).'
      );
      setSubmitting(false);
      return;
    }

    if (!form.email || !form.password) {
      setError('Email and password are required.');
      setSubmitting(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setSubmitting(false);
      return;
    }

    setSuccess('Sign up successful! Check your email to confirm, then log in.');
    setSubmitting(false);
    router.replace('/login');
  };



  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 space-y-6">
      <h1 className="text-2xl font-semibold text-center">Sign Up</h1>
      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        value={form.email}
        onChange={handleChange}
        className="border p-3 rounded w-full"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        required
        value={form.password}
        onChange={handleChange}
        className="border p-3 rounded w-full"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white py-3 px-6 rounded w-full"
        disabled={submitting}
      >
        {submitting ? 'Signing up...' : 'Sign Up'}
      </button>
      <button
        type="button"
        onClick={() => router.push('/login')}
        className="border border-blue-600 text-blue-600 py-3 px-6 rounded w-full"
      >
        Already have an account? Log In
      </button>
      <button
        type="button"
        onClick={() => router.push('/forgot-password')}
        className="border border-yellow-600 text-yellow-600 py-3 px-6 rounded w-full mt-2"
      >
        Forgot Password?
      </button>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">{success}</p>}
    </form>
  );
}