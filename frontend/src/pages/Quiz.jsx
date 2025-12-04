import React from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/index.components";

function Quiz() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-bg">
      <Navbar />
      <div className="flex-1 transition-all duration-300 overflow-auto">
        <div className="min-h-screen bg-bg-1 p-6">
          <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Brain Quiz Center</h1>
            <p className="text-gray-300 text-lg">
              Test your knowledge and track your learning progress
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Create Quiz Card */}
            <div 
              className="bg-bg-2 rounded-3xl p-8 text-center hover:bg-gray-800 transition-colors cursor-pointer group" 
              onClick={() => navigate("/quiz/create")}
            >
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">📝</div>
              <h2 className="text-2xl font-bold text-white mb-4">Create New Quiz</h2>
              <p className="text-gray-300 mb-6">
                Start a personalized quiz on any topic with customizable questions and time limits
              </p>
              <button className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform group-hover:scale-105">
                Start Quiz
              </button>
            </div>

            {/* Quiz History Card */}
            <div 
              className="bg-bg-2 rounded-3xl p-8 text-center hover:bg-gray-800 transition-colors cursor-pointer group" 
              onClick={() => navigate("/quiz/history")}
            >
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">📊</div>
              <h2 className="text-2xl font-bold text-white mb-4">Quiz History</h2>
              <p className="text-gray-300 mb-6">
                Review your past quiz attempts, scores, and track your learning progress over time
              </p>
              <button className="bg-linear-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform group-hover:scale-105">
                View History
              </button>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white text-center mb-8">Quiz Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Personalized Questions */}
              <div className="bg-bg-2 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-4">Target Icon</div>
                <h3 className="text-lg font-semibold text-white mb-2">Personalized Questions</h3>
                <p className="text-gray-300 text-sm">
                  AI-generated questions tailored to your chosen topic and difficulty level
                </p>
              </div>

              {/* Timed Quizzes */}
              <div className="bg-bg-2 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-4">Clock Icon</div>
                <h3 className="text-lg font-semibold text-white mb-2">Timed Challenges</h3>
                <p className="text-gray-300 text-sm">
                  Customizable time limits to simulate real exam conditions and improve speed
                </p>
              </div>

              {/* Detailed Feedback */}
              <div className="bg-bg-2 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-4">Email Icon</div>
                <h3 className="text-lg font-semibold text-white mb-2">Detailed Explanations</h3>
                <p className="text-gray-300 text-sm">
                  Get comprehensive explanations via email to understand concepts better
                </p>
              </div>
            </div>
          </div>

          {/* How it Works */}
          <div className="mt-16 bg-bg-2 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white text-center mb-8">How It Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">1</div>
                <h3 className="text-white font-semibold mb-2">Choose Topic</h3>
                <p className="text-gray-300 text-sm">Enter any subject or topic you want to be quizzed on</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">2</div>
                <h3 className="text-white font-semibold mb-2">Set Parameters</h3>
                <p className="text-gray-300 text-sm">Choose number of questions and time limit</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">3</div>
                <h3 className="text-white font-semibold mb-2">Take Quiz</h3>
                <p className="text-gray-300 text-sm">Answer questions within the time limit</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">4</div>
                <h3 className="text-white font-semibold mb-2">Get Results</h3>
                <p className="text-gray-300 text-sm">View score and optionally receive detailed explanations</p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default Quiz;