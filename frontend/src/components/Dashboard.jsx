import React from "react";
import { semesterData } from "../semesterData";

import { Link } from "react-router-dom";

function Dashboard() {
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const currentSemester = userData.semester;

  const subjects = semesterData[currentSemester]?.subjects || [];

  const getImagePath = (subject) => {
    return `/assets/subjects/${subject.id}.jpeg`;
  };

  const getSubjectCardStyle = (subject) => {
    // Check if image exists, fallback to gradient background
    const hasImage = [1, 6, 7, 8, 9].includes(subject.id);
    
    if (hasImage) {
      return { backgroundImage: `url(${getImagePath(subject)})` };
    }
    
    // Generate gradient based on subject ID for consistency
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    ];
    
    return { 
      background: gradients[subject.id % gradients.length]
    };
  };
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 bg-bg-1 m-2 rounded-xl">
        <h2 className="text-white text-2xl font-semibold mb-6">
          Your Subjects
        </h2>

        <div
          className="
    grid 
    gap-6
    grid-cols-1
    sm:grid-cols-2
    md:grid-cols-3 
    xl:grid-cols-4
    place-items-center
  "
        >
          {subjects.map((subject) => (
            <Link
              to={`/notes/${subject.id}`}
              key={subject.id}
              className="
    group
    w-full
    max-w-[260px]
    h-44
    rounded-2xl
    bg-cover
    bg-center
    overflow-hidden
    relative
    cursor-pointer
    transition-all
    hover:scale-105
    hover:shadow-lg
  "
              style={getSubjectCardStyle(subject)}
            >
              {/* Hover overlay */}
              <div
                className="
      absolute inset-0 
      bg-black/0
      group-hover:bg-black/60 
      transition-all 
      duration-300
    "
              />

              {/* Subject Icon - Always visible */}
              <div className="absolute top-4 left-4 text-3xl">
                {subject.icon}
              </div>
              
              {/* Subject name - Always visible at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/80 to-transparent">
                <h3 className="text-white font-semibold text-sm leading-tight">
                  {subject.name}
                </h3>
              </div>

              {/* Hover overlay with description */}
              <div
                className="
      absolute inset-0
      flex 
      flex-col
      items-center 
      justify-center
      opacity-0
      group-hover:opacity-100
      transition-opacity 
      duration-300
      text-white 
      px-4
      text-center
      bg-black/60
    "
              >
                <div className="text-4xl mb-2">{subject.icon}</div>
                <h3 className="text-lg font-bold mb-2">{subject.name}</h3>
                <p className="text-sm opacity-90">{subject.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <h2 className="text-white text-2xl font-semibold mb-6 mt-12">Quick Actions</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quiz Card */}
          <Link
            to="/quiz"
            className="group bg-linear-to-br from-purple-600 to-blue-600 rounded-2xl p-6 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <div className="text-center text-white">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-lg font-bold mb-2">Take Quiz</h3>
              <p className="text-sm opacity-90">Test your knowledge on any topic</p>
            </div>
          </Link>

          {/* Events Card */}
          <Link
            to="/events"
            className="group bg-linear-to-br from-green-600 to-teal-600 rounded-2xl p-6 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <div className="text-center text-white">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-lg font-bold mb-2">Events</h3>
              <p className="text-sm opacity-90">Manage your academic events</p>
            </div>
          </Link>

          {/* Learning Resources */}
          <Link
            to="/notes"
            className="group bg-linear-to-br from-orange-600 to-red-600 rounded-2xl p-6 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <div className="text-center text-white">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-lg font-bold mb-2">Study Resources</h3>
              <p className="text-sm opacity-90">Access learning materials</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
