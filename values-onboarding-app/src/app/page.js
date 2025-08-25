"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function RootPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const redirectUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/signup");
        return;
      }
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("onboarding_complete")
        .eq("id", user.id)
        .single();
      if (error || !profile) {
        router.replace("/signup");
        return;
      }
      if (profile.onboarding_complete) {
        router.replace("/countdown");
      } else {
        router.replace("/onboarding");
      }
    };
    redirectUser().then(() => setLoading(false));
  }, [router]);

  if (loading) return null;
  return null;
}
