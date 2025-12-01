import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuizResults, sendExplanationEmail } from "../../api/quiz";
import { toast } from "react-hot-toast";
import { Navbar } from "../index.components";

function QuizResults() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [shouldSendEmail, setShouldSendEmail] = useState(false);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const response = await getQuizResults(attemptId);
        setResults(response.data);
        setEmailSent(response.data.explanationEmailSent || false);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load results:", error);
        toast.error("Failed to load quiz results");
        navigate("/quiz");
      }
    };

    loadResults();
  }, [attemptId, navigate]);

  const getGrade = (score) => {
    if (score >= 90) return { letter: "A+", color: "text-green-500" };
    if (score >= 80) return { letter: "A", color: "text-green-500" };
    if (score >= 70) return { letter: "B", color: "text-blue-500" };
    if (score >= 60) return { letter: "C", color: "text-yellow-500" };
    if (score >= 50) return { letter: "D", color: "text-orange-500" };
    return { letter: "F", color: "text-red-500" };
  };

  const getPerformanceMessage = (score) => {
    if (score >= 90) return "Outstanding! You have excellent knowledge on this topic.";
    if (score >= 80) return "Great job! You have a strong understanding.";
    if (score >= 70) return "Good work! You have solid knowledge.";
    if (score >= 60) return "Not bad! Keep practicing to improve.";
    if (score >= 50) return "Keep studying! Focus on weak areas.";
    return "Need more practice! Review the material carefully.";
  };

  const handleSendEmail = async () => {
    setSendingEmail(true);
    try {
      await sendExplanationEmail(attemptId, { shouldSendEmail: true });
      toast.success("Explanation email sent successfully!");
      setEmailSent(true);
      setShouldSendEmail(false);
    } catch (error) {
      console.error("Failed to send email:", error);
      toast.error("Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-1 flex items-center justify-center">
        <div className="text-white text-lg">Loading results...</div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-bg-1 flex items-center justify-center">
        <div className="text-white text-lg">No results available</div>
      </div>
    );
  }

  const grade = getGrade(results.score);
  const performanceMessage = getPerformanceMessage(results.score);

  return (
    <div className="flex h-screen bg-bg">
      <Navbar />
      <div className="flex-1  transition-all duration-300 overflow-auto">
        <div className="min-h-screen bg-bg-1 p-6">
          <div className="max-w-2xl mx-auto">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Quiz Results</h1>
          <p className="text-gray-300">{results.topic}</p>
        </div>

        <div className="bg-bg-2 rounded-2xl p-8 shadow-xl mb-6">
          
          <div className="text-center mb-8">
            <div className="relative w-40 h-40 mx-auto mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke="#374151" 
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="8"
                  strokeDasharray={`${(results.score / 100) * 283} 283`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white">{results.score}</span>
                <span className="text-gray-400">%</span>
              </div>
            </div>

            <h2 className={`text-5xl font-bold ${grade.color} mb-2`}>
              {grade.letter}
            </h2>
            <p className="text-gray-300 text-lg">{performanceMessage}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-bg-1 p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-white">{results.totalQuestions}</div>
              <div className="text-gray-400 text-sm">Total Questions</div>
            </div>
            <div className="bg-bg-1 p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-green-500">{results.correctAnswers}</div>
              <div className="text-gray-400 text-sm">Correct</div>
            </div>
            <div className="bg-bg-1 p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-red-500">{results.incorrectAnswers}</div>
              <div className="text-gray-400 text-sm">Incorrect</div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Accuracy</span>
              <span className="text-white font-semibold">{results.score}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-linear-to-r from-blue-600 to-green-600 h-3 rounded-full transition-all"
                style={{ width: `${results.score}%` }}
              ></div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="emailCheckbox"
                checked={shouldSendEmail}
                onChange={(e) => setShouldSendEmail(e.target.checked)}
                disabled={emailSent || sendingEmail}
                className="w-5 h-5 cursor-pointer"
              />
              <label htmlFor="emailCheckbox" className="text-gray-300 cursor-pointer">
                Send me detailed explanations and answer sheet via email
              </label>
            </div>

            {emailSent && (
              <div className="bg-green-900 bg-opacity-30 border border-green-600 rounded-lg p-3 mb-4">
                <p className="text-green-400 text-sm">Email sent successfully to your registered email address.</p>
              </div>
            )}

            <button
              onClick={handleSendEmail}
              disabled={emailSent || !shouldSendEmail || sendingEmail}
              className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all"
            >
              {sendingEmail ? "Sending..." : emailSent ? "Email Already Sent" : "Send Explanations"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/quiz/create")}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Take Another Quiz
          </button>
          <button
            onClick={() => navigate("/quiz/history")}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            View History
          </button>
        </div>

        <div className="text-center mt-4">
          <button
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizResults;