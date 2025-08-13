"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function ResultsPage() {
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAnswers = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      const userId = session.user.id;
      // Get all answers for this user
      const { data, error } = await supabase
        .from("question_answers")
        .select("question_id, answer")
        .eq("user_id", userId);
      if (error) {
        setAnswers([]);
      } else {
        setAnswers(data);
      }
      setLoading(false);
    };
    fetchAnswers();
  }, [router]);

  // Example: Map question IDs to text (should match your questions)
  const questionMap = {
    1: "What have been 3-5 emotionally memorable moments or phases so far in your 20s?",
    2: "Looking back, what do you regret most about how you spent your time and why?",
    3: "When have you felt you spent your time meaningfully and what made these moments matter?",
    4: "What is your biggest goal for the next 5 years?",
    5: "What kind of person do you want to become by the end of your 20s?",
    6: "What are 3 things you want to experience or achieve before you turn 30?",
    7: "Right now, are you closer to your version of success or failure in your 20s?",
    8: "What habits, actions, situations, behaviours, and people are quietly leading to your downfall?",
    9: "What habits, actions, situations, behaviours, and people are pushing you towards success?",
    10: "If money wasn’t a factor, how would you spend your life? What would bring purpose to your everyday life?",
    11: "What are the biggest differences between the life you are living right now and the life you want?",
    12: "What is one thing you are doing every single day that is bringing you 1% closer towards the future you want to avoid?",
    13: "What is one small system you can start today that will bring you 1% closer to the life you want?",
    14: "With the time you have left in your 20s, what needs to change to make your 20s a decade of life you're proud of?",
    15: "Write a letter to your 30-year-old self. What would you wish they had accomplished by then? What would you want to thank them for?",
  };

  const handleExportPDF = async () => {
    // Dynamically import jsPDF
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    let y = 10;
    answers.forEach(({ question_id, answer }, idx) => {
      doc.text(`${idx + 1}. ${questionMap[question_id]}`, 10, y);
      y += 8;
      doc.text(`Answer: ${answer || "(No answer)"}`, 10, y);
      y += 12;
    });
    doc.save("results.pdf");
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="bg-white rounded shadow p-8 w-full max-w-2xl text-black">
        <h1 className="text-2xl font-bold mb-6 text-center">Your Results</h1>
        {answers.length === 0 ? (
          <div>No answers found.</div>
        ) : (
          <div className="space-y-6">
            {answers.map(({ question_id, answer }, idx) => (
              <div key={question_id} className="mb-4">
                <div className="font-semibold mb-1">{idx + 1}. {questionMap[question_id]}</div>
                <div className="ml-2">{answer || <span className="italic text-gray-500">(No answer)</span>}</div>
              </div>
            ))}
          </div>
        )}
        <button
          className="w-full bg-blue-600 text-white py-3 rounded mt-8"
          onClick={handleExportPDF}
        >
          Export as PDF
        </button>
      </div>
    </div>
  );
}
