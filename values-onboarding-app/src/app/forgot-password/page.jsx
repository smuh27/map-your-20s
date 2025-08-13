"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    if (!email) {
      setError("Please enter your email to reset your password.");
      setSubmitting(false);
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Password reset email sent! Check your inbox.");
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 space-y-6">
      <h1 className="text-2xl font-semibold text-center">Forgot Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border p-3 rounded w-full"
        />
        <button
          type="submit"
          className="bg-yellow-600 text-white py-3 px-6 rounded w-full"
          disabled={submitting}
        >
          {submitting ? "Sending..." : "Send Reset Email"}
        </button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}
      </form>
    </div>
  );
}
