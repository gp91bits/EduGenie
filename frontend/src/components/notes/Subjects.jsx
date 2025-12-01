import React, { useMemo, useState, useEffect } from "react";
import {
  semesterData,
  fetchSubjectProgress,
  initSemesterProgress,
} from "../../semesterData";
import { useNavigate } from "react-router-dom";

function Subjects() {
  const [subjectsProgress, setSubjectsProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const studentId = useMemo(() => {
    if (typeof window !== "undefined") {
      try {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        return userData.id;
      } catch (error) {
        console.error("Error reading localStorage:", error);
        return null;
      }
    }
    return null;
  }, []);

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
    if (!studentId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);

      const semSubjects = semesterData[currentSemester]?.subjects || [];
      await initSemesterProgress(currentSemester, semSubjects);

      const data = await fetchSubjectProgress(currentSemester);
      setSubjectsProgress(Array.isArray(data) ? data : []);
      setLoading(false);
    };

    load();

    const onUpdated = (e) => {
      const { semesterId: sId } = e?.detail || {};
      if (!sId || String(sId) === String(currentSemester)) {
        load();
      }
    };

    window.addEventListener("subjectNotes:updated", onUpdated);
    return () => window.removeEventListener("subjectNotes:updated", onUpdated);
  }, [studentId, currentSemester]);

  useEffect(() => {
    const semSubjects = semesterData[currentSemester]?.subjects || [];
    initSemesterProgress(currentSemester, semSubjects);
  }, []);
  const subjects = semesterData[currentSemester]?.subjects || [];

  const subjectsWithProgress = subjects.map((subject) => {
    const progressData = subjectsProgress.find(
      (p) => String(p.subjectId) === String(subject.id)
    );

    return {
      ...subject,
      lectures: progressData?.videosCompleted?.length || 0,
      notes: progressData?.notesCompleted?.length || 0,
      completion: progressData?.completion ?? 0,
    };
  });

  if (loading) {
    return (
      <div className="md:col-span-1 p-6 rounded-xl bg-bg-1 overflow-y-auto  flex items-center justify-center">
        <div className="text-slate-400">Loading subjects...</div>
      </div>
    );
  }

  return (
    <div className="md:col-span-1 bg-bg-1 rounded-xl p-6 md:p-8 overflow-y-auto ">
      <h3 className="text-xl md:text-2xl font-bold text-white mb-6">
        Your Subjects
      </h3>

      <div className="space-y-4">
        {subjectsWithProgress.length > 0 ? (
          subjectsWithProgress.map((subject) => (
            <div
              key={subject.id}
              onClick={() => {
                navigate(`/notes/${subject.id}`);
              }}
              className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600 transition-colors cursor-pointer group"
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 rounded-md bg-slate-700/50 flex items-center justify-center text-lg font-semibold text-slate-300 group-hover:bg-slate-700 transition-colors shrink-0">
                  {subject.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold group-hover:text-emerald-400 transition-colors">
                    {subject.name}
                  </h4>
                  <p className="text-xs md:text-sm text-slate-400">
                    {subject.description}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mb-3 ml-13">
                <div className="flex items-center gap-1">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-blue-500/30 text-blue-300 text-xs font-semibold">
                    ◉
                  </span>
                  <span className="text-xs text-slate-300">
                    {subject.lectures} Lecture
                    {subject.lectures !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-amber-500/30 text-amber-300 text-xs font-semibold">
                    ◆
                  </span>
                  <span className="text-xs text-slate-300">
                    {subject.notes} Note{subject.notes !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className="ml-13">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">Progress</span>
                  <span className="text-sm font-semibold text-emerald-400">
                    {subject.completion}%
                  </span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-linear-to-r from-emerald-500 to-emerald-400 h-full transition-all duration-500"
                    style={{ width: `${subject.completion}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400">No subjects yet for this semester</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Subjects;
