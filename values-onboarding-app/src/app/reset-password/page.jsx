'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessToken = searchParams.get('access_token');

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

    const { error } = await supabase.auth.updateUser(
      { password },
      { accessToken }
    );

    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }

    setSuccess('Password updated! You can now log in.');
    setSubmitting(false);
    setTimeout(() => router.replace('/login'), 2000);
  };

  return (
    <div className="max-w-md mx-auto mt-10 space-y-6">
      <h1 className="text-2xl font-semibold text-center">Reset Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border p-3 rounded w-full"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-3 px-6 rounded w-full"
          disabled={submitting}
        >
          {submitting ? 'Saving...' : 'Set New Password'}
        </button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}
      </form>
    </div>
  );
}