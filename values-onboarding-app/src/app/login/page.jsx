"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const router = useRouter();

  // Auto-login if already authenticated and onboarded
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const userId = session.user.id;
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_complete")
        .eq("id", userId)
        .single();
      if (profile?.onboarding_complete) {
        router.replace("/countdown");
      } else {
        router.replace("/onboarding");
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    try {
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL || "https://mapyour20s.com"}/onboarding`;
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo },
      });
      if (otpError) throw otpError;
  setInfo("If your email exists, you will receive a sign-in link shortly. Please check your inbox and follow the instructions to complete authentication.");
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
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
        disabled={loading}
      >
        {loading ? "Sending link…" : "Sign up"}
      </button>
      {info && <p className="text-slate-700 text-sm">{info}</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </form>
  );
}
