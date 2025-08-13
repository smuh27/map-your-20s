"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    const lastPage = localStorage.getItem('lastPage');
    if (lastPage) {
      localStorage.removeItem('lastPage');
      router.replace(lastPage);
    } else {
      router.replace('/home');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 space-y-6">
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
        disabled={loading}
      >
        {loading ? "Logging in..." : "Log In"}
      </button>
      {error && <p className="text-red-600">{error}</p>}
    </form>
  );
}
