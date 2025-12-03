import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  BookOpen,
  Film,
  Upload,
} from "lucide-react";
import { semesterData } from "../../semesterData";

const AdminNotes = () => {
  const [allNotes, setAllNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [resourceType, setResourceType] = useState("notes"); // notes or videos
  const [formData, setFormData] = useState({
    semesterId: "",
    subjectId: "",
    title: "",
    description: "",
    fileUrl: "",
    youtubeUrl: "",
    duration: "",
  });

  // Fetch all notes from API
  const fetchAllNotes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/subjectNotes/getAllNotes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAllNotes(data.data || []);
      } else {
        console.error("Failed to fetch notes:", response.status);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllNotes();
  }, []);

  // Flatten and get all notes and videos
  const getAllNotes = () => {
    const notes = [];
    allNotes.forEach((semester) => {
      semester.subjects?.forEach((subject) => {
        subject.notes?.forEach((note) => {
          notes.push({
            ...note,
            type: "note",
            semesterId: semester.semesterId,
            subjectId: subject.subjectId,
            semesterName: semesterData[semester.semesterId]?.name,
            subjectName: subject.subjectName,
          });
        });
        subject.videos?.forEach((video) => {
          notes.push({
            ...video,
            type: "video",
            semesterId: semester.semesterId,
            subjectId: subject.subjectId,
            semesterName: semesterData[semester.semesterId]?.name,
            subjectName: subject.subjectName,
          });
        });
      });
    });
    return notes;
  };

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
    if (!showAddForm) {
      setFormData({
        semesterId: "",
        subjectId: "",
        title: "",
        description: "",
        fileUrl: "",
        youtubeUrl: "",
        duration: "",
      });
    }
  };

  const handleSubmitResource = async (e) => {
    e.preventDefault();

    if (!formData.semesterId || !formData.subjectId) {
      alert("Please select semester and subject");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const endpoint = resourceType === "notes" ? "addNote" : "addVideo";

      const payload = {
        semesterId: parseInt(formData.semesterId),
        subjectId: formData.subjectId,
        title: formData.title,
        description: formData.description,
        ...(resourceType === "notes" && { fileUrl: formData.fileUrl }),
        ...(resourceType === "videos" && {
          youtubeUrl: formData.youtubeUrl,
          duration: formData.duration,
        }),
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/subjectNotes/${endpoint}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        alert(`${resourceType === "notes" ? "Note" : "Video"} added successfully`);
        fetchAllNotes();
        toggleAddForm();
      } else {
        alert("Failed to add resource");
      }
    } catch (error) {
      console.error("Error adding resource:", error);
      alert("Error adding resource");
    }
  };

  // ========== MAIN RENDER ==========

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading...</div>;
  }

  const allResources = getAllNotes();
  const notes = allResources.filter((r) => r.type === "note");
  const videos = allResources.filter((r) => r.type === "video");

  return (
    <div id="addNotes" className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-24 pb-10 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notes & Videos</h1>
            <p className="text-gray-600">Manage all course materials for students</p>
          </div>
          <button
            onClick={toggleAddForm}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <Plus size={20} />
            Add Resource
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg p-8 border border-gray-200 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Resource</h2>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Resource Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setResourceType("notes")}
                  className={`p-6 rounded-lg border-2 transition flex flex-col items-center gap-3 ${resourceType === "notes"
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-300 bg-white hover:border-gray-400"
                    }`}
                >
                  <BookOpen size={32} className="text-indigo-600" />
                  <span className="font-semibold text-gray-800">Note / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setResourceType("videos")}
                  className={`p-6 rounded-lg border-2 transition flex flex-col items-center gap-3 ${resourceType === "videos"
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-300 bg-white hover:border-gray-400"
                    }`}
                >
                  <Film size={32} className="text-indigo-600" />
                  <span className="font-semibold text-gray-800">Video URL</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitResource} className="space-y-6">
              {/* Semester */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester
                </label>
                <select
                  value={formData.semesterId}
                  onChange={(e) => setFormData({ ...formData, semesterId: e.target.value, subjectId: "" })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                >
                  <option value="">Select Semester</option>
                  {Object.entries(semesterData).map(([id, sem]) => (
                    <option key={id} value={id}>{sem.name}</option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                >
                  <option value="">Select Subject</option>
                  {formData.semesterId &&
                    semesterData[parseInt(formData.semesterId)]?.subjects?.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lecture 1 - Introduction"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Notes-specific fields */}
              {resourceType === "notes" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/document.pdf"
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>
              )}

              {/* Videos-specific fields */}
              {resourceType === "videos" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      YouTube URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      value={formData.youtubeUrl}
                      onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 45:30"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                </>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={toggleAddForm}
                  className="flex-1 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                >
                  <Upload size={18} />
                  Add Resource
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notes Section */}
        {notes.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Notes</h2>
              <span className="text-lg text-gray-500">({notes.length})</span>
            </div>
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note._id} className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800">{note.title}</h3>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {note.semesterName} • {note.subjectName}
                        </span>
                      </div>
                      {note.description && (
                        <p className="text-sm text-gray-600 mb-2">{note.description}</p>
                      )}
                      <a
                        href={note.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:underline"
                      >
                        View Document →
                      </a>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition">
                        <Edit2 size={18} />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Videos Section */}
        {videos.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Film className="w-6 h-6 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900">Videos</h2>
              <span className="text-lg text-gray-500">({videos.length})</span>
            </div>
            <div className="space-y-3">
              {videos.map((video) => (
                <div key={video._id} className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800">{video.title}</h3>
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                          {video.semesterName} • {video.subjectName}
                        </span>
                      </div>
                      {video.description && (
                        <p className="text-sm text-gray-600 mb-1">{video.description}</p>
                      )}
                      {video.duration && (
                        <p className="text-xs text-gray-500 mb-2">Duration: {video.duration}</p>
                      )}
                      <a
                        href={video.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:underline"
                      >
                        Watch Video →
                      </a>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition">
                        <Edit2 size={18} />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {notes.length === 0 && videos.length === 0 && (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-2">No resources yet</p>
            <p className="text-gray-500 text-sm">Click "Add Resource" to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotes;