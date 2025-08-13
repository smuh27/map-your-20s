"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      const { user } = session;
      // Fetch profile details from supabase
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, dob, email")
        .eq("id", user.id)
        .single();
      if (error) {
        setProfile({ email: user.email });
      } else {
        setProfile({ ...data, email: user.email });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

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
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="bg-white rounded shadow p-8 w-full max-w-md text-black">
        <h1 className="text-2xl font-bold mb-6 text-center">Profile Details</h1>
        <div className="mb-4">
          <span className="font-semibold">Name:</span> {profile?.first_name || ""} {profile?.last_name || ""}
        </div>
        <div className="mb-4">
          <span className="font-semibold">Age:</span> {age || "Not provided"}
        </div>
        <div className="mb-4">
          <span className="font-semibold">Email:</span> {profile?.email || ""}
        </div>
        <button
          className="w-full bg-blue-600 text-white py-3 rounded mb-4"
          onClick={() => router.push('/results')}
        >
          View Results
        </button>
        <button
          className="w-full bg-red-500 text-white py-3 rounded"
          onClick={handleLogout}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
