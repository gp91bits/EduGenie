import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createQuiz } from "../../api/quiz";
import { toast } from "react-hot-toast";
import { Navbar } from "../index.components";

function CreateQuiz() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    topic: "",
    numberOfQuestions: 10,
    timeLimit: 30
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "numberOfQuestions" || name === "timeLimit" 
        ? parseInt(value) || "" 
        : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.topic.trim()) {
      newErrors.topic = "Topic is required";
    } else if (formData.topic.trim().length < 3) {
      newErrors.topic = "Topic must be at least 3 characters";
    }

    if (!formData.numberOfQuestions || formData.numberOfQuestions < 1) {
      newErrors.numberOfQuestions = "Number of questions must be at least 1";
    } else if (formData.numberOfQuestions > 50) {
      newErrors.numberOfQuestions = "Maximum 50 questions allowed";
    }

    if (!formData.timeLimit || formData.timeLimit < 1) {
      newErrors.timeLimit = "Time limit must be at least 1 minute";
    } else if (formData.timeLimit > 180) {
      newErrors.timeLimit = "Maximum time limit is 180 minutes";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await createQuiz(formData);
      toast.success("Quiz created successfully!");
      navigate(`/quiz/attempt/${response.data.attemptId}`);
    } catch (error) {
      console.error("Create quiz error:", error);
      toast.error(error.message || "Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  const suggestedTopics = [
    "Data Structures", "Algorithms", "JavaScript", "React", "Python",
    "Machine Learning", "Web Development", "Database Systems", "Computer Networks",
    "Operating Systems", "Software Engineering", "Artificial Intelligence"
  ];

  return (
    <div className="flex h-screen bg-bg">
      <Navbar />
      <div className="flex-1  transition-all duration-300 overflow-auto">
        <div className="min-h-screen bg-bg-1 p-6">
          <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Quiz</h1>
          <p className="text-gray-300">Test your knowledge with a personalized quiz</p>
        </div>

        <div className="bg-bg-2 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label htmlFor="topic" className="block text-white font-semibold mb-3">
                Quiz Topic
              </label>
              <input
                type="text"
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                placeholder="Enter the topic..."
                className={`w-full px-4 py-3 rounded-xl bg-bg-1 text-white placeholder-gray-400 border ${
                  errors.topic ? "border-red-500" : "border-gray-600"
                } focus:border-blue-500 focus:outline-none transition-colors`}
              />
              {errors.topic && (
                <p className="text-red-400 text-sm mt-1">{errors.topic}</p>
              )}
              
              <div className="mt-3">
                <p className="text-gray-400 text-sm mb-2">Suggested topics:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedTopics.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, topic }))}
                      className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="numberOfQuestions" className="block text-white font-semibold mb-3">
                Number of Questions
              </label>
              <input
                type="number"
                id="numberOfQuestions"
                name="numberOfQuestions"
                value={formData.numberOfQuestions}
                onChange={handleChange}
                min="1"
                max="50"
                className={`w-full px-4 py-3 rounded-xl bg-bg-1 text-white border ${
                  errors.numberOfQuestions ? "border-red-500" : "border-gray-600"
                } focus:border-blue-500 focus:outline-none transition-colors`}
              />
              {errors.numberOfQuestions && (
                <p className="text-red-400 text-sm mt-1">{errors.numberOfQuestions}</p>
              )}
              
              <div className="mt-2 flex gap-2">
                {[5, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, numberOfQuestions: num }))}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      formData.numberOfQuestions === num
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="timeLimit" className="block text-white font-semibold mb-3">
                Time Limit (minutes)
              </label>
              <input
                type="number"
                id="timeLimit"
                name="timeLimit"
                value={formData.timeLimit}
                onChange={handleChange}
                min="1"
                max="180"
                className={`w-full px-4 py-3 rounded-xl bg-bg-1 text-white border ${
                  errors.timeLimit ? "border-red-500" : "border-gray-600"
                } focus:border-blue-500 focus:outline-none transition-colors`}
              />
              {errors.timeLimit && (
                <p className="text-red-400 text-sm mt-1">{errors.timeLimit}</p>
              )}
              
              <div className="mt-2 flex gap-2">
                {[15, 30, 45, 60].map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, timeLimit: time }))}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      formData.timeLimit === time
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {time}m
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-bg-1 p-4 rounded-xl">
              <h3 className="text-white font-semibold mb-2">Quiz Preview</h3>
              <div className="text-gray-300 space-y-1">
                <p>Topic: {formData.topic || "Not specified"}</p>
                <p>Questions: {formData.numberOfQuestions || 0}</p>
                <p>Duration: {formData.timeLimit || 0} minutes</p>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || !formData.topic.trim() || !formData.numberOfQuestions || !formData.timeLimit}
                className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200"
              >
                {loading ? "Creating Quiz..." : "Start Quiz"}
              </button>
            </div>
          </form>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate(-1)}
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

export default CreateQuiz;