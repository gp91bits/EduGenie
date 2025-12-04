import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  BookOpen,
  Film,
  Upload,
  GraduationCap,
  FileText,
  X,
} from "lucide-react";
import { semesterData } from "../../semesterData";

const AdminNotes = () => {
  // Navigation state: null -> semester selected -> subject selected
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  
  // Data state
  const [allNotes, setAllNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [resourceType, setResourceType] = useState("notes");
  const [formData, setFormData] = useState({
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

  // Get content for selected subject
  const getSubjectContent = () => {
    if (!selectedSemester || !selectedSubject) return { notes: [], videos: [] };
    
    const semesterNotes = allNotes.find(s => s.semesterId === selectedSemester);
    if (!semesterNotes) return { notes: [], videos: [] };
    
    // Compare as numbers to handle type mismatches
    const subjectData = semesterNotes.subjects?.find(s => Number(s.subjectId) === Number(selectedSubject.id));
    return {
      notes: subjectData?.notes || [],
      videos: subjectData?.videos || [],
    };
  };

  // Handle form submission
  const handleSubmitResource = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("accessToken");
      const endpoint = resourceType === "notes" ? "addNote" : "addVideo";

      const payload = {
        semesterId: selectedSemester,
        subjectId: selectedSubject.id,
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
        setShowAddForm(false);
        resetForm();
      } else {
        alert("Failed to add resource");
      }
    } catch (error) {
      console.error("Error adding resource:", error);
      alert("Error adding resource");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      fileUrl: "",
      youtubeUrl: "",
      duration: "",
    });
    setResourceType("notes");
  };

  // Handle delete
  const handleDelete = async (type, itemId) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      const token = localStorage.getItem("accessToken");
      const endpoint = type === "note" ? "deleteNote" : "deleteVideo";

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/subjectNotes/${endpoint}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            semesterId: selectedSemester,
            subjectId: selectedSubject.id,
            [`${type}Id`]: itemId,
          }),
        }
      );

      if (response.ok) {
        alert(`${type === "note" ? "Note" : "Video"} deleted successfully`);
        fetchAllNotes();
      } else {
        alert("Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  // Navigation handlers
  const handleSelectSemester = (semId) => {
    setSelectedSemester(semId);
    setSelectedSubject(null);
  };

  const handleSelectSubject = (subject) => {
    setSelectedSubject(subject);
  };

  const handleBack = () => {
    if (selectedSubject) {
      setSelectedSubject(null);
      setShowAddForm(false);
    } else if (selectedSemester) {
      setSelectedSemester(null);
    }
  };

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <div id="addNotes" className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-24 pb-10 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading content...</p>
          </div>
        </div>
      </div>
    );
  }

  // ========== RENDER: SEMESTER GRID ==========
  if (!selectedSemester) {
    return (
      <div id="addNotes" className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-24 pb-10 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notes & Videos Management</h1>
            <p className="text-gray-600">Select a semester to manage course materials</p>
          </div>

          {/* Semester Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(semesterData).map(([semId, sem]) => {
              const semesterContent = allNotes.find(s => s.semesterId === parseInt(semId));
              const totalNotes = semesterContent?.subjects?.reduce((acc, sub) => acc + (sub.notes?.length || 0), 0) || 0;
              const totalVideos = semesterContent?.subjects?.reduce((acc, sub) => acc + (sub.videos?.length || 0), 0) || 0;
              
              return (
                <button
                  key={semId}
                  onClick={() => handleSelectSemester(parseInt(semId))}
                  className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-indigo-500 hover:shadow-lg transition-all group"
                >
                  <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-200 transition">
                    <GraduationCap className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{sem.name}</h3>
                  <p className="text-sm text-gray-500">{sem.subjects?.length || 0} subjects</p>
                  <div className="flex justify-center gap-4 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <FileText size={12} /> {totalNotes} notes
                    </span>
                    <span className="flex items-center gap-1">
                      <Film size={12} /> {totalVideos} videos
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ========== RENDER: SUBJECT GRID ==========
  if (selectedSemester && !selectedSubject) {
    const semester = semesterData[selectedSemester];
    
    return (
      <div id="addNotes" className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-24 pb-10 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Header with Back Button */}
          <div className="mb-8">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-4 transition"
            >
              <ArrowLeft size={20} />
              Back to Semesters
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{semester.name}</h1>
            <p className="text-gray-600">Select a subject to manage content</p>
          </div>

          {/* Subject Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {semester.subjects?.map((subject) => {
              const semesterContent = allNotes.find(s => s.semesterId === selectedSemester);
              const subjectContent = semesterContent?.subjects?.find(s => Number(s.subjectId) === Number(subject.id));
              const notesCount = subjectContent?.notes?.length || 0;
              const videosCount = subjectContent?.videos?.length || 0;
              
              return (
                <button
                  key={subject.id}
                  onClick={() => handleSelectSubject(subject)}
                  className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-indigo-500 hover:shadow-lg transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl group-hover:bg-indigo-200 transition flex-shrink-0">
                      {subject.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 mb-1 line-clamp-2">{subject.name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2">{subject.description}</p>
                      <div className="flex gap-4 mt-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <FileText size={12} /> {notesCount} notes
                        </span>
                        <span className="flex items-center gap-1">
                          <Film size={12} /> {videosCount} videos
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ========== RENDER: SUBJECT CONTENT VIEW ==========
  const { notes, videos } = getSubjectContent();
  const semester = semesterData[selectedSemester];

  return (
    <div id="addNotes" className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-24 pb-10 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-4 transition"
            >
              <ArrowLeft size={20} />
              Back to {semester.name}
            </button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl">
                {selectedSubject.icon}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedSubject.name}</h1>
                <p className="text-gray-600">{semester.name}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <Plus size={20} />
            Add Content
          </button>
        </div>

        {/* Add Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Content</h2>
                <button
                  onClick={() => { setShowAddForm(false); resetForm(); }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={24} className="text-gray-500" />
                </button>
              </div>

              {/* Resource Type Toggle */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Content Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setResourceType("notes")}
                    className={`p-4 rounded-lg border-2 transition flex flex-col items-center gap-2 ${
                      resourceType === "notes"
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-300 bg-white hover:border-gray-400"
                    }`}
                  >
                    <BookOpen size={28} className="text-indigo-600" />
                    <span className="font-semibold text-gray-800">Note / PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setResourceType("videos")}
                    className={`p-4 rounded-lg border-2 transition flex flex-col items-center gap-2 ${
                      resourceType === "videos"
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-300 bg-white hover:border-gray-400"
                    }`}
                  >
                    <Film size={28} className="text-red-600" />
                    <span className="font-semibold text-gray-800">Video</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmitResource} className="space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
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
                    placeholder="Brief description of the content..."
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
                      File URL (Google Drive / PDF link) *
                    </label>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/file/d/..."
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
                        YouTube URL *
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
                    onClick={() => { setShowAddForm(false); resetForm(); }}
                    className="flex-1 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                  >
                    <Upload size={18} />
                    Add {resourceType === "notes" ? "Note" : "Video"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Content Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Notes Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Notes</h2>
              <span className="text-sm text-gray-500 ml-auto">{notes.length} items</span>
            </div>
            
            {notes.length > 0 ? (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div
                    key={note._id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 mb-1">{note.title}</h4>
                        {note.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{note.description}</p>
                        )}
                        <a
                          href={note.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:underline inline-flex items-center gap-1"
                        >
                          <FileText size={14} />
                          View Document
                        </a>
                      </div>
                      <button
                        onClick={() => handleDelete("note", note._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <FileText size={40} className="mx-auto mb-2 opacity-50" />
                <p>No notes added yet</p>
              </div>
            )}
          </div>

          {/* Videos Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
              <Film className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-bold text-gray-900">Videos</h2>
              <span className="text-sm text-gray-500 ml-auto">{videos.length} items</span>
            </div>
            
            {videos.length > 0 ? (
              <div className="space-y-3">
                {videos.map((video) => (
                  <div
                    key={video._id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 mb-1">{video.title}</h4>
                        {video.description && (
                          <p className="text-sm text-gray-600 mb-1 line-clamp-2">{video.description}</p>
                        )}
                        {video.duration && (
                          <p className="text-xs text-gray-500 mb-2">Duration: {video.duration}</p>
                        )}
                        <a
                          href={video.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-red-600 hover:underline inline-flex items-center gap-1"
                        >
                          <Film size={14} />
                          Watch Video
                        </a>
                      </div>
                      <button
                        onClick={() => handleDelete("video", video._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Film size={40} className="mx-auto mb-2 opacity-50" />
                <p>No videos added yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotes;