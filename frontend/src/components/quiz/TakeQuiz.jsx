import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getActiveQuiz, submitAnswer, submitQuiz } from "../../api/quiz";
import { toast } from "react-hot-toast";
import { Navbar } from "../index.components";

function TakeQuiz() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load quiz data
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const response = await getActiveQuiz(attemptId);
        setQuizData(response.data);
        setTimeLeft(response.data.remainingTime || response.data.timeLimit * 60);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load quiz:", error);
        toast.error("Failed to load quiz");
        navigate("/quiz");
      }
    };

    loadQuiz();
  }, [attemptId, navigate]);

  // Timer effect
  useEffect(() => {
    if (!quizData || timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizData, timeLeft]);

  const handleAutoSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await submitQuiz(attemptId, answers);
      toast.success("Quiz submitted automatically due to time limit");
      navigate(`/quiz/results/${attemptId}`);
    } catch (error) {
      console.error("Auto-submit error:", error);
      toast.error("Error submitting quiz");
    }
  }, [attemptId, answers, navigate]);

  const handleSelectAnswer = async (selectedAnswer) => {
    const newAnswers = { ...answers };
    newAnswers[currentQuestionIndex] = selectedAnswer;
    setAnswers(newAnswers);

    try {
      await submitAnswer(attemptId, {
        questionIndex: currentQuestionIndex,
        selectedAnswer: selectedAnswer
      });
    } catch (error) {
      console.error("Failed to submit answer:", error);
      toast.error("Failed to save answer");
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData.totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!window.confirm("Are you sure you want to submit the quiz?")) {
      return;
    }

    setIsSubmitting(true);
    try {
      await submitQuiz(attemptId, answers);
      toast.success("Quiz submitted successfully");
      navigate(`/quiz/results/${attemptId}`);
    } catch (error) {
      console.error("Submit quiz error:", error);
      toast.error("Failed to submit quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-1 flex items-center justify-center">
        <div className="text-white">Loading quiz...</div>
      </div>
    );
  }

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
      <div className="min-h-screen bg-bg-1 flex items-center justify-center">
        <div className="text-white">No questions available</div>
      </div>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isTimeWarning = timeLeft < 60;

  return (
    <div className="flex h-screen bg-bg">
      <Navbar />
      <div className="flex-1  transition-all duration-300">
        <div className="min-h-screen bg-bg-1 p-6">
          <div className="max-w-4xl mx-auto">
        
            <div className="flex justify-between items-center mb-8">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">{quizData.topic}</h1>
              </div>
              <div className={`text-3xl font-bold font-mono ${isTimeWarning ? "text-red-500" : "text-green-500"}`}>
                {minutes}:{seconds.toString().padStart(2, "0")}
              </div>
            </div>

        <div className="bg-bg-2 rounded-2xl p-8 shadow-xl">
          
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-300">Question {currentQuestionIndex + 1} of {quizData.totalQuestions}</span>
              <div className="w-1/3 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${((currentQuestionIndex + 1) / quizData.totalQuestions) * 100}%` }}
                ></div>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-white mb-6">
              {currentQuestion.questionText}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options && currentQuestion.options.map((option, index) => {
                const optionText = typeof option === 'string' ? option : option.text;
                return (
                  <button
                    key={index}
                    onClick={() => handleSelectAnswer(optionText)}
                    className={`w-full p-4 rounded-xl text-left font-medium transition-all ${
                      answers[currentQuestionIndex] === optionText
                        ? "bg-blue-600 text-white border-2 border-blue-500"
                        : "bg-bg-1 text-gray-300 border-2 border-gray-600 hover:border-blue-500"
                    }`}
                  >
                    <span className="mr-3">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {optionText}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
            >
              Previous
            </button>

            <div className="flex gap-2">
              {Array.from({ length: Math.min(5, quizData.totalQuestions) }).map((_, i) => {
                const pageNum = Math.floor(currentQuestionIndex / 5);
                const startIdx = pageNum * 5;
                const qIndex = startIdx + i;
                
                if (qIndex >= quizData.totalQuestions) return null;
                
                return (
                  <button
                    key={qIndex}
                    onClick={() => setCurrentQuestionIndex(qIndex)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all ${
                      currentQuestionIndex === qIndex
                        ? "bg-blue-600 text-white"
                        : answers[qIndex] !== undefined && answers[qIndex] !== null
                        ? "bg-green-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {qIndex + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === quizData.totalQuestions - 1}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
            >
              Next
            </button>
          </div>

          <button
            onClick={handleSubmitQuiz}
            disabled={isSubmitting}
            className="w-full mt-8 bg-linear-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all"
          >
            {isSubmitting ? "Submitting..." : "Submit Quiz"}
          </button>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TakeQuiz;