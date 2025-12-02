import React, { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import { semesterData } from "../../semesterData";

function AdminNotes() {
  const semesters = useMemo(() => {
    if (!semesterData) return [];
    if (Array.isArray(semesterData))
      return semesterData.map((s, i) => ({ id: i, name: s.name || `Semester ${i + 1}` }));
    return Object.keys(semesterData).map((k) => ({ id: k, name: semesterData[k].name || `Semester ${k}` }));
  }, []);

  const [semesterId, setSemesterId] = useState(semesters[0]?.id ?? null);
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState(null);

  const [content, setContent] = useState({ notes: [], videos: [], quizzes: [] });
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ type: "note", title: "", description: "", url: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // NEW: editing state
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", url: "" });

  useEffect(() => {
    if (!semesterId) return;
    const sem = semesterData[semesterId] || semesterData[parseInt(semesterId)];
    if (!sem) {
      setSubjects([]);
      setSubjectId(null);
      return;
    }
    const subs = sem.subjects || sem.subjectList || sem.subjectsMap || [];
    const normalized = Array.isArray(subs)
      ? subs.map((s) => ({ id: s.id ?? s.subjectId ?? s.subjectId, name: s.name ?? s.title ?? String(s.id) }))
      : Object.keys(subs).map((k) => ({ id: k, name: subs[k].name || subs[k].title || k }));
    setSubjects(normalized);
    setSubjectId(normalized[0]?.id ?? null);
  }, [semesterId]);

  useEffect(() => {
    const fetchContent = async () => {
      if (!semesterId || !subjectId) {
        setContent({ notes: [], videos: [], quizzes: [] });
        return;
      }
      setLoading(true);
      try {
        const res = await API.get("/subjectNotes/getContent", { params: { subjectId: subjectId, semesterId: semesterId } });
        const data = res?.data || {};
        setContent({ notes: data.notes || [], videos: data.videos || [], quizzes: data.quizzes || [] });
      } catch (err) {
        console.error("fetchSubjectContent error:", err);
        setContent({ notes: [], videos: [], quizzes: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [semesterId, subjectId]);

  const handleFormChange = (e) => {
    const { id, value } = e.target;
    setForm((p) => ({ ...p, [id]: value }));
  };

  const resetForm = () => setForm({ type: "note", title: "", description: "", url: "" });

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!semesterId || !subjectId) return setMessage({ type: "error", text: "Select semester and subject first." });
    if (!form.title.trim() || !form.url.trim()) return setMessage({ type: "error", text: "Title and URL are required." });

    setSaving(true);
    try {
      if (form.type === "note") {
        await API.post("/subjectNotes/addNote", {
          subjectId: Number(subjectId) || subjectId,
          semesterId: Number(semesterId) || semesterId,
          title: form.title.trim(),
          description: form.description.trim(),
          fileType: "drive",
          fileUrl: form.url.trim(),
        });
      } else {
        await API.post("/subjectNotes/addVideo", {
          subjectId: Number(subjectId) || subjectId,
          semesterId: Number(semesterId) || semesterId,
          title: form.title.trim(),
          description: form.description.trim(),
          youtubeUrl: form.url.trim(),
        });
      }
      setMessage({ type: "success", text: `${form.type === "note" ? "Note" : "Video"} added.` });
      resetForm();
      // refresh
      const res = await API.get("/subjectNotes/getContent", { params: { subjectId, semesterId } });
      const data = res?.data || {};
      setContent({ notes: data.notes || [], videos: data.videos || [], quizzes: data.quizzes || [] });

      // notify others to refresh (semesterId/subjectId included)
      window.dispatchEvent(
        new CustomEvent("subjectNotes:updated", { detail: { semesterId, subjectId } })
      );
    } catch (err) {
      console.error("add content error:", err);
      const txt = err?.response?.data?.message || "Failed to add";
      setMessage({ type: "error", text: txt });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // EDIT / UPDATE handlers
  const startEditNote = (note) => {
    setEditingNoteId(note._id);
    setEditForm({ title: note.title || "", description: note.description || "", url: note.fileUrl || "" });
  };
  const cancelEditNote = () => {
    setEditingNoteId(null);
    setEditForm({ title: "", description: "", url: "" });
  };
  const handleUpdateNote = async (e) => {
    e.preventDefault();
    if (!editingNoteId) return;
    setSaving(true);
    try {
      await API.put("/subjectNotes/updateNote", {
        subjectId: Number(subjectId) || subjectId,
        semesterId: Number(semesterId) || semesterId,
        noteId: editingNoteId,
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        fileUrl: editForm.url.trim(),
      });
      setMessage({ type: "success", text: "Note updated." });
      cancelEditNote();
      const res = await API.get("/subjectNotes/getContent", { params: { subjectId, semesterId } });
      const data = res?.data || {};
      setContent({ notes: data.notes || [], videos: data.videos || [], quizzes: data.quizzes || [] });

      // notify others to refresh (semesterId/subjectId included)
      window.dispatchEvent(
        new CustomEvent("subjectNotes:updated", { detail: { semesterId, subjectId } })
      );
    } catch (err) {
      console.error("updateNote error:", err);
      setMessage({ type: "error", text: err?.response?.data?.message || "Failed to update note" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const startEditVideo = (video) => {
    setEditingVideoId(video._id);
    setEditForm({ title: video.title || "", description: video.description || "", url: video.youtubeUrl || "" });
  };
  const cancelEditVideo = () => {
    setEditingVideoId(null);
    setEditForm({ title: "", description: "", url: "" });
  };
  const handleUpdateVideo = async (e) => {
    e.preventDefault();
    if (!editingVideoId) return;
    setSaving(true);
    try {
      await API.put("/subjectNotes/updateVideo", {
        subjectId: Number(subjectId) || subjectId,
        semesterId: Number(semesterId) || semesterId,
        videoId: editingVideoId,
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        youtubeUrl: editForm.url.trim(),
      });
      setMessage({ type: "success", text: "Video updated." });
      cancelEditVideo();
      const res = await API.get("/subjectNotes/getContent", { params: { subjectId, semesterId } });
      const data = res?.data || {};
      setContent({ notes: data.notes || [], videos: data.videos || [], quizzes: data.quizzes || [] });

      // notify others to refresh (semesterId/subjectId included)
      window.dispatchEvent(
        new CustomEvent("subjectNotes:updated", { detail: { semesterId, subjectId } })
      );
    } catch (err) {
      console.error("updateVideo error:", err);
      setMessage({ type: "error", text: err?.response?.data?.message || "Failed to update video" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // DELETE handlers (use config.data for body with delete)
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Delete this note?")) return;
    setSaving(true);
    try {
      await API.delete("/subjectNotes/deleteNote", { data: { subjectId, semesterId, noteId } });
      setMessage({ type: "success", text: "Note deleted." });
      const res = await API.get("/subjectNotes/getContent", { params: { subjectId, semesterId } });
      const data = res?.data || {};
      setContent({ notes: data.notes || [], videos: data.videos || [], quizzes: data.quizzes || [] });

      // notify others to refresh (semesterId/subjectId included)
      window.dispatchEvent(
        new CustomEvent("subjectNotes:updated", { detail: { semesterId, subjectId } })
      );
    } catch (err) {
      console.error("deleteNote error:", err);
      setMessage({ type: "error", text: err?.response?.data?.message || "Failed to delete note" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm("Delete this video?")) return;
    setSaving(true);
    try {
      await API.delete("/subjectNotes/deleteVideo", { data: { subjectId, semesterId, videoId } });
      setMessage({ type: "success", text: "Video deleted." });
      const res = await API.get("/subjectNotes/getContent", { params: { subjectId, semesterId } });
      const data = res?.data || {};
      setContent({ notes: data.notes || [], videos: data.videos || [], quizzes: data.quizzes || [] });

      // notify others to refresh (semesterId/subjectId included)
      window.dispatchEvent(
        new CustomEvent("subjectNotes:updated", { detail: { semesterId, subjectId } })
      );
    } catch (err) {
      console.error("deleteVideo error:", err);
      setMessage({ type: "error", text: err?.response?.data?.message || "Failed to delete video" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const renderNotesList = () => {
    if (loading) return <div className="text-slate-400">Loading...</div>;
    return (
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-300 mb-2">Drive Notes</h4>
          {content.notes.length === 0 ? (
            <div className="text-slate-500 text-sm">No drive notes yet.</div>
          ) : (
            content.notes.map((n) =>
              editingNoteId === n._id ? (
                <form key={n._id} onSubmit={handleUpdateNote} className="bg-bg-2 p-3 rounded-md space-y-2">
                  <input value={editForm.title} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} className="w-full bg-bg-top text-white px-3 py-2 rounded border border-slate-600" />
                  <input value={editForm.url} onChange={(e) => setEditForm((p) => ({ ...p, url: e.target.value }))} className="w-full bg-bg-top text-white px-3 py-2 rounded border border-slate-600" />
                  <textarea value={editForm.description} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} className="w-full bg-bg-top text-white px-3 py-2 rounded border border-slate-600 h-24" />
                  <div className="flex gap-2">
                    <button type="submit" disabled={saving} className="bg-accent text-white px-4 py-2 rounded">{saving ? "Saving..." : "Update"}</button>
                    <button type="button" onClick={cancelEditNote} className="bg-slate-700 text-white px-4 py-2 rounded">Cancel</button>
                  </div>
                </form>
              ) : (
                <div key={n._id} className="bg-bg-2 p-3 rounded-md flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="font-semibold text-white truncate">{n.title}</div>
                    <div className="text-xs text-slate-400 truncate">{n.description}</div>
                    <a className="text-xs text-blue-300 mt-1 inline-block break-all" href={n.fileUrl} target="_blank" rel="noreferrer">{n.fileUrl}</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEditNote(n)} className="text-sm bg-slate-700 px-3 py-1 rounded hover:bg-slate-600">Edit</button>
                    <button onClick={() => handleDeleteNote(n._id)} disabled={saving} className="text-sm bg-red-600 px-3 py-1 rounded hover:bg-red-700">{saving ? "..." : "Delete"}</button>
                  </div>
                </div>
              )
            )
          )}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-300 mb-2">Videos</h4>
          {content.videos.length === 0 ? (
            <div className="text-slate-500 text-sm">No videos yet.</div>
          ) : (
            content.videos.map((v) =>
              editingVideoId === v._id ? (
                <form key={v._id} onSubmit={handleUpdateVideo} className="bg-bg-2 p-3 rounded-md space-y-2">
                  <input value={editForm.title} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} className="w-full bg-bg-top text-white px-3 py-2 rounded border border-slate-600" />
                  <input value={editForm.url} onChange={(e) => setEditForm((p) => ({ ...p, url: e.target.value }))} className="w-full bg-bg-top text-white px-3 py-2 rounded border border-slate-600" />
                  <textarea value={editForm.description} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} className="w-full bg-bg-top text-white px-3 py-2 rounded border border-slate-600 h-24" />
                  <div className="flex gap-2">
                    <button type="submit" disabled={saving} className="bg-accent text-white px-4 py-2 rounded">{saving ? "Saving..." : "Update"}</button>
                    <button type="button" onClick={cancelEditVideo} className="bg-slate-700 text-white px-4 py-2 rounded">Cancel</button>
                  </div>
                </form>
              ) : (
                <div key={v._id} className="bg-bg-2 p-3 rounded-md flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="font-semibold text-white truncate">{v.title}</div>
                    <div className="text-xs text-slate-400 truncate">{v.description}</div>
                    <a className="text-xs text-blue-300 mt-1 inline-block break-all" href={v.youtubeUrl} target="_blank" rel="noreferrer">{v.youtubeUrl}</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEditVideo(v)} className="text-sm bg-slate-700 px-3 py-1 rounded hover:bg-slate-600">Edit</button>
                    <button onClick={() => handleDeleteVideo(v._id)} disabled={saving} className="text-sm bg-red-600 px-3 py-1 rounded hover:bg-red-700">{saving ? "..." : "Delete"}</button>
                  </div>
                </div>
              )
            )
          )}
        </div>
      </div>
    );
  };

  return (
    <div id="addNotes" className="w-full min-h-screen pt-20 bg-bg py-10 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Admin - Subject Notes</h2>
          <p className="text-sm text-slate-400 mt-1">Select semester & subject to view / add Drive notes and YouTube videos.</p>
        </div>

        <div className="bg-bg-2 p-6 rounded-xl border border-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Semester</label>
              <select value={semesterId ?? ""} onChange={(e) => setSemesterId(e.target.value)} className="w-full bg-bg-top text-white px-3 py-2 rounded border border-slate-600">
                {semesters.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Subject</label>
              <select value={subjectId ?? ""} onChange={(e) => setSubjectId(e.target.value)} className="w-full bg-bg-top text-white px-3 py-2 rounded border border-slate-600">
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-slate-400">Last updated: <span className="text-white font-medium ml-2">{content.notes.length + content.videos.length} items</span></div>
            </div>
          </div>

          <div className="mb-6">{renderNotesList()}</div>

          <div className="pt-4 border-t border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-3">Add new item</h3>

            {message && <div className={`mb-4 px-4 py-2 rounded ${message.type === "success" ? "bg-green-700 text-white" : "bg-red-700 text-white"}`}>{message.text}</div>}

            <form onSubmit={handleAdd} className="space-y-4">
              <div className="flex gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                  <input type="radio" checked={form.type === "note"} onChange={() => setForm((p) => ({ ...p, type: "note" }))} />
                  Drive Note
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                  <input type="radio" checked={form.type === "video"} onChange={() => setForm((p) => ({ ...p, type: "video" }))} />
                  YouTube Video
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input id="title" value={form.title} onChange={handleFormChange} placeholder="Title" className="col-span-2 bg-bg-top text-white px-3 py-2 rounded border border-slate-600" />
                <input id="url" value={form.url} onChange={handleFormChange} placeholder={form.type === "note" ? "Google Drive file URL" : "YouTube URL"} className="col-span-1 bg-bg-top text-white px-3 py-2 rounded border border-slate-600" />
              </div>

              <textarea id="description" value={form.description} onChange={handleFormChange} placeholder="Short description (optional)" className="w-full bg-bg-top text-white px-3 py-2 rounded border border-slate-600 h-24" />

              <div className="flex items-center gap-3">
                <button type="submit" disabled={saving} className={`bg-accent text-white px-5 py-2 rounded ${saving ? "opacity-60 cursor-not-allowed" : "hover:bg-accent-1"}`}>{saving ? "Saving..." : `Add ${form.type === "note" ? "Drive Note" : "Video"}`}</button>
                <button type="button" onClick={resetForm} className="bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-600">Reset</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminNotes;
