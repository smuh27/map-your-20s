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
    // Dynamically import jsPDF and autoTable
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    // Use landscape A4 for more space
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

    // Prepare table data
    const tableData = answers.map(({ question_id, answer }, idx) => [
      `${idx + 1}. ${questionMap[question_id]}`,
      answer || "(No answer)"
    ]);

    let firstPage = true;
    autoTable(doc, {
      head: [["Question", "Answer"]],
      body: tableData,
      startY: 60,
      styles: { cellPadding: 8, fontSize: 12, valign: 'top', lineWidth: 0.2 },
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold', fontSize: 14 },
      columnStyles: {
        0: { cellWidth: 350 },
        1: { cellWidth: 400 },
      },
      margin: { left: 30, right: 30 },
      didDrawPage: (data) => {
        if (firstPage) {
          doc.setFontSize(18);
          doc.setTextColor(30, 64, 175);
          doc.text("Here are your results!", doc.internal.pageSize.getWidth() / 2, 32, { align: 'center' });
          firstPage = false;
        }
      },
      theme: 'grid',
      tableLineColor: [220, 220, 220],
      tableLineWidth: 0.2,
    });
    doc.save("results.pdf");
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
  <div className="min-h-screen w-full py-8 px-2 flex flex-col items-center">
      <h1 className="text-3xl font-extrabold mb-8 text-center text-blue-900 drop-shadow">Your Results</h1>
      <div className="flex flex-col items-center justify-center min-h-[40vh] w-full">
        <button
          className="bg-blue-600 text-white py-4 px-8 rounded-lg text-xl font-bold shadow hover:bg-blue-700 transition mx-auto"
          // onClick handler to show answers modal or page (to be implemented)
        >
          View your answers
        </button>
      </div>
    </div>
  );
}
