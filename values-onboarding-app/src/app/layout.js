"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ProfileTab from "./ProfileTab";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import SessionAutoSignOut from "../components/SessionAutoSignOut";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({ children }) {
  const [showProfile, setShowProfile] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        // Hide profile button on /signup
        if (mounted) setShowProfile(!!user && pathname !== "/signup");
      } catch { if (mounted) setShowProfile(false); }
    })();
    return () => { mounted = false; };
  }, [pathname]);
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex items-center justify-center p-4 bg-blue-100`}
      >
        <div className="w-full max-w-5xl mx-auto space-y-6 text-center">
          <SessionAutoSignOut />
          {/* Nav bar with Profile button top right */}
          <div className="w-full flex flex-col items-center mb-2">
            <div className="text-4xl font-extrabold text-slate-800 tracking-tight mb-2">Map Your 20s</div>
            <div className="absolute right-0 top-4 mr-8">{showProfile && <ProfileTab />}</div>
          </div>
          <main>{children}</main>
          <footer className="text-sm text-slate-500">
            © {new Date().getFullYear()} Map Your 20s
          </footer>
        </div>
      </body>
    </html>
  );
}
