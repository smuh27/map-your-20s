"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

const sections = [
  {
    name: "Reflect",
    questions: [
      { id: 1, text: "What have been 3-5 emotionally memorable moments or phases so far in your 20s?" },
      { id: 2, text: "Looking back, what do you regret most about how you spent your time and why?" },
      { id: 3, text: "When have you felt you spent your time meaningfully and what made these moments matter?" },
    ],
  },
  {
    name: "Vision",
    questions: [
      { id: 4, text: "What is your biggest goal for the next 5 years?" },
      { id: 5, text: "What kind of person do you want to become by the end of your 20s?" },
      { id: 6, text: "What are 3 things you want to experience or achieve before you turn 30?" },
    ],
  },
  {
    name: "Align",
    questions: [
      { id: 7, text: "Right now, are you closer to your version of success or failure in your 20s?" },
      { id: 8, text: "What habits, actions, situations, behaviours, and people are quietly leading to your downfall?" },
      { id: 9, text: "What habits, actions, situations, behaviours, and people are pushing you towards success?" },
      { id: 10, text: "If money wasn’t a factor, how would you spend your life? What would bring purpose to your everyday life?" },
      { id: 11, text: "What are the biggest differences between the life you are living right now and the life you want?" },
      { id: 12, text: "What is one thing you are doing every single day that is bringing you 1% closer towards the future you want to avoid?" },
      { id: 13, text: "What is one small system you can start today that will bring you 1% closer to the life you want?" },
      { id: 14, text: "With the time you have left in your 20s, what needs to change to make your 20s a decade of life you're proud of?" },
      { id: 15, text: "Write a letter to your 30-year-old self. What would you wish they had accomplished by then? What would you want to thank them for?" },
    ],
  },
];

// Flatten questions for easier navigation
const allQuestions = sections.flatMap((section, sectionIdx) =>
  section.questions.map((q, idx) => ({
    ...q,
    sectionIdx,
    sectionName: section.name,
    sectionQuestionIdx: idx,
    sectionLength: section.questions.length,
  }))
);

export default function QuestionsPage() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(Array(allQuestions.length).fill(""));
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSessionAndWipe = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }
      // Always delete previous answers for this user
      await supabase.from('question_answers').delete().eq('user_id', session.user.id);
      setLoading(false);
    };
    checkSessionAndWipe();
  }, [router]);

  const handleChange = (e) => {
    const updated = [...answers];
    updated[current] = e.target.value;
    setAnswers(updated);
  };

  const handleNext = async (e) => {
    e.preventDefault();
    if (current < allQuestions.length - 1) {
      setCurrent(current + 1);
    } else {
      // Submit answers to Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }
      const userId = session.user.id;
      // Delete previous answers for this user
      await supabase.from('question_answers').delete().eq('user_id', userId);
      // Prepare answer rows
      const answerRows = allQuestions.map((q, idx) => ({
        user_id: userId,
        question_id: q.id,
        answer: answers[idx],
      }));
      // Insert all answers
      const { error } = await supabase.from('question_answers').insert(answerRows);
      if (error) {
        alert('Error saving answers: ' + error.message);
      } else {
        router.push('/thankyou');
      }
    }
  };

  const handleBack = (e) => {
    e.preventDefault();
    if (current > 0) {
      setCurrent(current - 1);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  const q = allQuestions[current];
  const partNumber = q.sectionIdx + 1;
  const partName = q.sectionName;
  const partStart = q.sectionQuestionIdx === 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      {partStart && (
        <h2 className="text-xl font-bold mb-2">Part {partNumber}: {partName}</h2>
      )}
      <h1 className="text-2xl font-bold mb-6">Question {current + 1} of {allQuestions.length}</h1>
      <form onSubmit={handleNext} className="w-full max-w-md space-y-6">
        <label className="block text-lg mb-2">{q.text}</label>
        <textarea
          value={answers[current]}
          onChange={handleChange}
          className="border p-3 rounded w-full min-h-[100px]"
        />
        <div className="flex justify-between">
          <button
            type="button"
            className="bg-gray-300 text-gray-800 py-3 px-6 rounded"
            onClick={handleBack}
            disabled={current === 0}
          >
            Back
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white py-3 px-6 rounded"
          >
            {current < allQuestions.length - 1 ? "Next" : "Submit and Download"}
          </button>
        </div>
      </form>
    </div>
  );
}
