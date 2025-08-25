"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";


export default function OnboardingPage() {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [dob, setDob] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		const { data: { session } } = await supabase.auth.getSession();
		if (!session) { router.replace("/signup"); return; }
		const userId = session.user.id;
		await supabase.from("profiles").upsert({
			id: userId,
			first_name: firstName,
			last_name: lastName,
			dob,
			onboarding_complete: true
		});
		setLoading(false);
		router.replace("/countdown");
	};

		return (
			<div className="flex flex-col items-center justify-center min-h-screen px-4">
				<form onSubmit={handleSubmit} className="w-full max-w-md space-y-6 bg-white/60 p-6 rounded">
					<h1 className="text-2xl font-bold text-center">Onboarding</h1>
					<label className="block">
						<span className="block mb-2 font-medium">First Name</span>
						<input
							type="text"
							value={firstName}
							onChange={e => setFirstName(e.target.value)}
							className="border p-3 rounded w-full"
							required
						/>
					</label>
					<label className="block">
						<span className="block mb-2 font-medium">Last Name</span>
						<input
							type="text"
							value={lastName}
							onChange={e => setLastName(e.target.value)}
							className="border p-3 rounded w-full"
							required
						/>
					</label>
					<label className="block">
						<span className="block mb-2 font-medium">Date of Birth</span>
						<input
							type="date"
							value={dob}
							onChange={e => setDob(e.target.value)}
							className="border p-3 rounded w-full"
							required
						/>
					</label>
					<button type="submit" className="btn btn-primary w-full" disabled={loading}>
						{loading ? "Saving…" : "Continue"}
					</button>
				</form>
			</div>
		);
	}
