"use client";
import { useRouter } from "next/navigation";

export default function ProfileTab() {
  const router = useRouter();
  return (
    <button
      className="bg-gray-200 rounded-full px-4 py-2 shadow font-semibold text-black"
      onClick={() => router.push("/profile")}
    >
      Profile
    </button>
  );
}
