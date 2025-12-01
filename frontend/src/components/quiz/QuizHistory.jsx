import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getQuizHistory, deleteQuizAttempt } from "../../api/quiz";
import { toast } from "react-hot-toast";
import { Navbar } from "../index.components";
import { Trash2, X } from "lucide-react";

function QuizHistory() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ show: false, attemptId: null, topic: "" });
  const [deleting, setDeleting] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await getQuizHistory();
        setHistory(response.data.attempts || []);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load history:", error);
        toast.error("Failed to load quiz history");
        navigate("/quiz");
      }
    };

    loadHistory();
  }, [navigate]);

  const getGrade = (score) => {
    if (score >= 90) return { letter: "A+", color: "bg-green-600 text-white" };
    if (score >= 80) return { letter: "A", color: "bg-green-500 text-white" };
    if (score >= 70) return { letter: "B", color: "bg-blue-500 text-white" };
    if (score >= 60) return { letter: "C", color: "bg-yellow-600 text-white" };
    if (score >= 50) return { letter: "D", color: "bg-orange-600 text-white" };
    return { letter: "F", color: "bg-red-600 text-white" };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-1 flex items-center justify-center">
        <div className="text-white text-lg">Loading history...</div>
      </div>
    );
  }

  const totalPages = Math.ceil(history.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedHistory = history.slice(startIndex, startIndex + itemsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleDeleteClick = (e, attemptId, topic) => {
    e.stopPropagation();
    setDeleteModal({ show: true, attemptId, topic });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.attemptId) return;
    
    setDeleting(true);
    try {
      await deleteQuizAttempt(deleteModal.attemptId);
      setHistory(history.filter(h => h._id !== deleteModal.attemptId));
      toast.success("Quiz deleted successfully");
      setDeleteModal({ show: false, attemptId: null, topic: "" });
    } catch (error) {
      console.error("Failed to delete quiz:", error);
      toast.error("Failed to delete quiz");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, attemptId: null, topic: "" });
  };

  return (
    <div className="flex h-screen bg-bg">
      <Navbar />
      <div className="flex-1  transition-all duration-300 overflow-auto">
        <div className="min-h-screen bg-bg-1 p-6">
          <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Quiz History</h1>
          <p className="text-gray-300">Review your past quiz attempts</p>
        </div>

        <div className="bg-bg-2 rounded-2xl p-8 shadow-xl">
          
          {history.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">No quiz attempts yet</p>
              <button
                onClick={() => navigate("/quiz/create")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Take Your First Quiz
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-8">
                {displayedHistory.map((attempt, index) => {
                  const grade = getGrade(attempt.score);
                  return (
                    <div
                      key={attempt._id || index}
                      className="bg-bg-1 p-6 rounded-xl hover:bg-opacity-80 transition-all cursor-pointer relative group"
                      onClick={() => navigate(`/quiz/results/${attempt._id}`)}
                    >
                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDeleteClick(e, attempt._id, attempt.topic)}
                        className="absolute top-4 right-4 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                        title="Delete Quiz"
                      >
                        <Trash2 size={18} />
                      </button>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg mb-2">{attempt.topic}</h3>
                          <div className="text-gray-400 text-sm space-y-1">
                            <p>Questions: {attempt.totalQuestions}</p>
                            <p>{formatDate(attempt.createdAt)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="relative w-24 h-24">
                              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle 
                                  cx="50" 
                                  cy="50" 
                                  r="40" 
                                  fill="none" 
                                  stroke="#374151" 
                                  strokeWidth="6"
                                />
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  fill="none"
                                  stroke="#3B82F6"
                                  strokeWidth="6"
                                  strokeDasharray={`${(attempt.score / 100) * 251} 251`}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-bold text-white">{attempt.score}</span>
                              </div>
                            </div>
                            <p className="text-gray-400 text-xs mt-2">Accuracy</p>
                          </div>

                          <div className={`px-6 py-4 rounded-xl font-bold text-lg ${grade.color}`}>
                            {grade.letter}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Correct: </span>
                          <span className="text-green-400 font-semibold">{attempt.correctAnswers}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Incorrect: </span>
                          <span className="text-red-400 font-semibold">{attempt.incorrectAnswers}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-8 border-t border-gray-700">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const page = i + 1;
                      const isVisible = Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages;
                      
                      if (!isVisible && page !== currentPage + 3 && page !== currentPage - 3) {
                        return null;
                      }

                      if (!isVisible) {
                        return (
                          <span key={page} className="text-gray-400">
                            ...
                          </span>
                        );
                      }

                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                            currentPage === page
                              ? "bg-blue-600 text-white"
                              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}

              <div className="text-center mt-8 text-gray-400 text-sm">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, history.length)} of {history.length} quizzes
              </div>
            </>
          )}
        </div>

        <div className="text-center mt-6 space-y-4">
          <button
            onClick={() => navigate("/quiz/create")}
            className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
          >
            Take a New Quiz
          </button>
          
          <button
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
          </div>
        </div>
        
        {/* Delete Confirmation Modal */}
        {deleteModal.show && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-bg-2 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Delete Quiz</h3>
                <button 
                  onClick={handleDeleteCancel}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              
              <p className="text-gray-300 mb-2">Are you sure you want to delete this quiz?</p>
              <p className="text-purple-400 font-medium mb-6">"{deleteModal.topic}"</p>
              
              <p className="text-gray-400 text-sm mb-6">This action cannot be undone. The quiz and all its results will be permanently removed.</p>
              
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteCancel}
                  className="flex-1 py-2.5 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizHistory;