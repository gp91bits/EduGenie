import React, { useMemo, useState, useEffect } from "react";
import { semesterData, fetchSemesterProgress } from "../../semesterData";
import { BookOpen, TrendingUp } from "lucide-react";

function Progress() {
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(true);

  const currentSemester = useMemo(() => {
    if (typeof window !== "undefined") {
      try {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        return userData.semester || 1;
      } catch (error) {
        console.error("Error reading localStorage:", error);
        return 1;
      }
    }
    return 1;
  }, []);

  useEffect(() => {
    const loadProgress = async () => {
      setLoading(true);
      const data = await fetchSemesterProgress(currentSemester);

      if (data) {
        setCompletion(data.completion || 0);
      } else {
        setCompletion(0);
      }
      setLoading(false);
    };

    loadProgress();
  }, [currentSemester]);

  const semesterInfo = semesterData[currentSemester];

  if (loading) {
    return (
      <div className="bg-bg-1 px-5 py-4 rounded-xl flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-slate-400 text-sm">Loading progress...</span>
      </div>
    );
  }

  // Determine progress color based on completion
  const getProgressColor = () => {
    if (completion >= 75) return "from-emerald-500 to-emerald-400";
    if (completion >= 50) return "from-blue-500 to-blue-400";
    if (completion >= 25) return "from-yellow-500 to-yellow-400";
    return "from-orange-500 to-orange-400";
  };

  const getTextColor = () => {
    if (completion >= 75) return "text-emerald-400";
    if (completion >= 50) return "text-blue-400";
    if (completion >= 25) return "text-yellow-400";
    return "text-orange-400";
  };

  return (
    <div className="bg-bg-1 px-5 py-4 rounded-xl border border-white/5">
      <div className="flex items-center justify-between gap-4 mb-3">
        {/* Left: Icon + Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <BookOpen size={20} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">
              {semesterInfo.name}
            </h2>
            <p className="text-xs text-slate-400">Learning Progress</p>
          </div>
        </div>

        {/* Right: Percentage */}
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className={getTextColor()} />
          <span className={`text-xl font-bold ${getTextColor()}`}>
            {completion}%
          </span>
        </div>
      </div>

      {/* Progress Bar - Always Visible */}
      <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
        <div
          className={`bg-linear-to-r ${getProgressColor()} h-full rounded-full transition-all duration-500`}
          style={{ width: `${completion}%` }}
        />
      </div>
    </div>
  );
}

export default Progress;
