'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function ResetPasswordClient({ searchParams }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Support either server-passed object or URLSearchParams-like object
  const accessToken =
    typeof searchParams?.get === 'function'
      ? searchParams.get('access_token')
      : searchParams?.access_token ?? searchParams?.token ?? null;

  useEffect(() => {
    if (!accessToken) {
      setError('Invalid or missing reset token.');
    }
  }, [accessToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    if (!password) {
      setError('Please enter a new password.');
      setSubmitting(false);
      return;
    }

    try {
      const { data, error: updateError } = await supabase.auth.updateUser(
        { password },
        { accessToken }
      );

      if (updateError) {
        setError(updateError.message || 'Failed to update password');
        setSubmitting(false);
        return;
      }

      // Clear any existing session so user must re-login with new password
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        // not fatal; continue to redirect to login
        console.warn('Failed to sign out after password change', signOutError);
      }

      setSuccess('Password updated. Please log in with your new password.');
      setSubmitting(false);
      setTimeout(() => router.replace('/login'), 1200);
    } catch (err) {
      console.error('ResetPasswordClient error', err);
      setError(err?.message || 'An unexpected error occurred');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 space-y-6">
      <h1 className="text-2xl font-semibold text-center">Reset Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-3 rounded w-full"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-3 px-6 rounded w-full"
          disabled={submitting || !accessToken}
        >
          {submitting ? 'Saving...' : 'Set New Password'}
        </button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}
      </form>
    </div>
  );
}
