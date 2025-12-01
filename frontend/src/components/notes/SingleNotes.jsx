import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Play } from "lucide-react";
import {
  semesterData,
  markLectureWatched,
  markNoteRead,
} from "../../semesterData";
import API from "../../api/axios";
import { useMemo } from "react";

function SingleNotes(props) {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const currentSemester = useMemo(() => {
    for (const [semId, sem] of Object.entries(semesterData)) {
      if (sem.subjects.some((s) => s.id === Number(subjectId))) {
        return Number(semId);
      }
    }
    return null; // no match
  }, [subjectId]);

  const [activeTab, setActiveTab] = useState("Notes");
  const [content, setContent] = useState({ notes: [], videos: [] });
  const [loading, setLoading] = useState(true);
  const [subjectProgress, setSubjectProgress] = useState(0);
  const [trackedItems, setTrackedItems] = useState({ notes: [], videos: [] });
  const [pendingMarks, setPendingMarks] = useState({ notes: {}, videos: {} }); // track pending state per id

  // Get subject info from static data
  const subject = useMemo(() => {
    return Object.values(semesterData)
      .flatMap((sem) => sem.subjects)
      .find((s) => s.id === parseInt(subjectId, 10));
  }, [subjectId]);

  // assume fetchNotes is the function that loads notes for current subject/semester
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await API.get(
        `/subjectNotes/getContent?subjectId=${subjectId}&semesterId=${currentSemester}`
      );
      setContent(response.data || { notes: [], videos: [] });

      const progressResp = await API.get(
        `/progress/getSubjectProgress?semesterId=${currentSemester}`
      );

      const subjectProg = Array.isArray(progressResp.data)
        ? progressResp.data.find(
            (p) => String(p.subjectId) === String(subjectId)
          )
        : null;

      if (subjectProg) {
        setSubjectProgress(subjectProg.completion ?? 0);
        setTrackedItems({
          notes: Array.isArray(subjectProg.notesCompleted)
            ? subjectProg.notesCompleted
            : [],
          videos: Array.isArray(subjectProg.videosCompleted)
            ? subjectProg.videosCompleted
            : [],
        });
      } else {
        setSubjectProgress(0);
        setTrackedItems({ notes: [], videos: [] });
      }
    } catch (error) {
      console.error("Error loading content:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!subjectId || !currentSemester) return;
    fetchNotes();
  }, [subjectId, currentSemester]);

  // useEffect(() => {
  //   const onUpdated = (e) => {
  //     const { semesterId: sId, subjectId: subId } = e?.detail || {};
  //     if (
  //       !sId ||
  //       !subId ||
  //       (String(sId) === String(currentSemester) &&
  //         String(subId) === String(currentSubject))
  //     ) {
  //       fetchNotes();
  //     }
  //   };
  //   window.addEventListener("subjectNotes:updated", onUpdated);
  //   return () => window.removeEventListener("subjectNotes:updated", onUpdated);
  // }, [currentSemester, currentSubject]);

  if (!subject) {
    return <div className="p-6 text-center text-white">Subject not found</div>;
  }

  if (loading) {
    return <div className="p-6 text-center text-white">Loading content...</div>;
  }

  // util: google drive id
  const getGoogleDriveId = (url) => {
    if (!url) return null;
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  // util: youtube id
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Mark note handler
  const handleMarkNote = async (noteId) => {
    if (trackedItems.notes.includes(noteId)) return; // already done
    if (pendingMarks.notes[noteId]) return; // already pending

    // optimistic lock for UI
    setPendingMarks((p) => ({
      ...p,
      notes: { ...(p.notes || {}), [noteId]: true },
    }));

    try {
      const resp = await markNoteRead({
        subjectId: parseInt(subjectId, 10),
        semesterId: currentSemester,
        noteId,
        totalNotes: content.notes.length,
        totalLectures: content.videos.length,
      });

      // backend should return progress in resp.data or resp.progress
      const progress = resp?.data?.progress ?? resp?.data ?? resp?.progress;

      // add to tracked items
      setTrackedItems((prev) => ({
        ...prev,
        notes: [...(prev.notes || []), noteId],
      }));

      // update subject progress if backend returned it
      if (progress && typeof progress.completion === "number") {
        setSubjectProgress(progress.completion);
      } else if (
        resp?.data?.completion &&
        typeof resp.data.completion === "number"
      ) {
        setSubjectProgress(resp.data.completion);
      }
    } catch (err) {
      console.error("Error marking note as read:", err);
      // no UI change on error
    } finally {
      setPendingMarks((p) => {
        const next = { ...(p || {}) };
        if (next.notes) {
          delete next.notes[noteId];
        }
        return next;
      });
    }
  };

  // Mark video handler
  const handleMarkVideo = async (videoId) => {
    if (trackedItems.videos.includes(videoId)) return;
    if (pendingMarks.videos && pendingMarks.videos[videoId]) return;

    setPendingMarks((p) => ({
      ...p,
      videos: { ...(p.videos || {}), [videoId]: true },
    }));

    try {
      const resp = await markLectureWatched({
        subjectId: parseInt(subjectId, 10),
        semesterId: currentSemester,
        videoId,
        totalNotes: content.notes.length,
        totalLectures: content.videos.length,
      });

      const progress = resp?.data?.progress ?? resp?.data ?? resp?.progress;

      setTrackedItems((prev) => ({
        ...prev,
        videos: [...(prev.videos || []), videoId],
      }));

      if (progress && typeof progress.completion === "number") {
        setSubjectProgress(progress.completion);
      } else if (
        resp?.data?.completion &&
        typeof resp.data.completion === "number"
      ) {
        setSubjectProgress(resp.data.completion);
      }
    } catch (err) {
      console.error("Error marking video as watched:", err);
    } finally {
      setPendingMarks((p) => {
        const next = { ...(p || {}) };
        if (next.videos) {
          delete next.videos[videoId];
        }
        return next;
      });
    }
  };

  return (
    <div className="h-fit bg-bg p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/notes")}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-md bg-slate-700/50 flex items-center justify-center text-xl">
              {subject.icon}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{subject.name}</h1>
              <p className="text-slate-400">{subject.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400">Progress</div>
            <div className="text-2xl font-bold text-emerald-400">
              {subjectProgress}%
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-700">
        {["Notes", "Videos"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === tab
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === "Notes" && (
          <>
            {content.notes.length > 0 ? (
              content.notes.map((note) => {
                const driveId = getGoogleDriveId(note.fileUrl);
                const isDone = trackedItems.notes.includes(note._id);
                const isPending =
                  pendingMarks.notes && pendingMarks.notes[note._id];

                return (
                  <div
                    key={note._id}
                    className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-md bg-red-500/30 flex items-center justify-center text-red-400">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">
                            {note.title}
                          </h3>
                          <p className="text-xs text-slate-400">
                            {note.fileType?.toUpperCase() || "DOCUMENT"}{" "}
                            Document
                          </p>
                          {note.description && (
                            <p className="text-sm text-slate-400 mt-1">
                              {note.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleMarkNote(note._id)}
                          disabled={isDone || isPending}
                          className={`px-4 py-2 rounded-lg transition-colors shrink-0 ${
                            isDone
                              ? "bg-green-700 cursor-default"
                              : "bg-blue-600 hover:bg-blue-700"
                          } ${isPending ? "opacity-70 cursor-wait" : ""}`}
                        >
                          {isDone
                            ? "Done"
                            : isPending
                            ? "Marking..."
                            : "Mark as Read"}
                        </button>
                      </div>
                    </div>

                    {driveId && (
                      <div className="mt-4 rounded-lg overflow-hidden bg-black">
                        <iframe
                          src={`https://drive.google.com/file/d/${driveId}/preview`}
                          width="100%"
                          height="480"
                          allow="autoplay"
                          title={note.title}
                        ></iframe>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-slate-400">
                No notes available for this subject
              </div>
            )}
          </>
        )}

        {activeTab === "Videos" && (
          <>
            {content.videos.length > 0 ? (
              content.videos.map((video) => {
                const videoId = getYouTubeId(video.youtubeUrl);
                const isDone = trackedItems.videos.includes(video._id);
                const isPending =
                  pendingMarks.videos && pendingMarks.videos[video._id];

                return (
                  <div
                    key={video._id}
                    className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-md bg-red-500/30 flex items-center justify-center text-red-400">
                          <Play size={20} />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">
                            {video.title}
                          </h3>
                          {video.duration && (
                            <p className="text-xs text-slate-400">
                              Duration: {video.duration}
                            </p>
                          )}
                          {video.description && (
                            <p className="text-sm text-slate-400 mt-1">
                              {video.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleMarkVideo(video._id)}
                          disabled={isDone || isPending}
                          className={`px-4 py-2 rounded-lg transition-colors shrink-0 ${
                            isDone
                              ? "bg-green-700 cursor-default"
                              : "bg-red-600 hover:bg-red-700"
                          } ${isPending ? "opacity-70 cursor-wait" : ""}`}
                        >
                          {isDone
                            ? "Done"
                            : isPending
                            ? "Marking..."
                            : "Mark as Watched"}
                        </button>
                      </div>
                    </div>

                    {videoId && (
                      <div className="mt-4 rounded-lg overflow-hidden bg-black">
                        <iframe
                          width="100%"
                          height="315"
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title={video.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-slate-400">
                No videos available for this subject
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SingleNotes;
