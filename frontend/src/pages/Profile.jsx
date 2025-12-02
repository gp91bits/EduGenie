import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Navbar, HeaderBar } from "../components/index.components";
import {
  User,
  Edit2,
  Save,
  X,
  Trophy,
  Flame,
  Brain,
  Target,
  Calendar,
  TrendingUp,
  Award,
  BookOpen,
  Mail,
  GraduationCap,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Camera,
  Upload,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import API from "../api/axios";
import { login } from "../store/authSlice";
import { toast } from "react-hot-toast";

function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth.userData);

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingSemester, setIsEditingSemester] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSemester, setSavingSemester] = useState(false);
  const [editName, setEditName] = useState(userData?.name || "");
  const [editSemester, setEditSemester] = useState(userData?.semester || 1);
  const [profilePicture, setProfilePicture] = useState(null);
  const [showPictureMenu, setShowPictureMenu] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const pictureMenuRef = useRef(null);

  const [stats, setStats] = useState({
    totalQuizzes: 0,
    bestScore: 0,
    averageScore: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    totalQuestions: 0,
    recentQuizzes: [],
    quizzesByMonth: [],
    favoriteTopics: [],
  });

  // Close picture menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        pictureMenuRef.current &&
        !pictureMenuRef.current.contains(event.target)
      ) {
        setShowPictureMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!userData) {
      navigate("/auth/login", { replace: true });
      return;
    }
    fetchProfileStats();
  }, [userData, navigate]);

  const fetchProfileStats = async () => {
    try {
      const response = await API.get("/user/profile-stats");
      if (response.data.success) {
        setStats(response.data.data);
        setEditName(response.data.data.name || userData?.name || "");
        setProfilePicture(response.data.data.profilePicture || null);
      }
    } catch (error) {
      console.error("Failed to fetch profile stats:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!editName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const response = await API.put("/user/update-name", {
        name: editName.trim(),
      });
      if (response.data.success) {
        // Update Redux and localStorage
        const updatedUser = { ...userData, name: editName.trim() };
        dispatch(
          login({
            user: updatedUser,
            accessToken: localStorage.getItem("accessToken"),
            refreshToken: localStorage.getItem("refreshToken"),
          })
        );
        toast.success("Name updated successfully!");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to update name:", error);
      toast.error("Failed to update name");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(userData?.name || "");
    setIsEditing(false);
  };

  const handleSaveSemester = async () => {
    if (editSemester < 1 || editSemester > 8) {
      toast.error("Semester must be between 1 and 8");
      return;
    }

    setSavingSemester(true);
    try {
      const response = await API.put("/user/update-semester", {
        semester: editSemester,
      });
      if (response.data.success) {
        // Update Redux and localStorage
        const updatedUser = { ...userData, semester: editSemester };
        dispatch(
          login({
            user: updatedUser,
            accessToken: localStorage.getItem("accessToken"),
            refreshToken: localStorage.getItem("refreshToken"),
          })
        );
        toast.success("Semester updated successfully!");
        setIsEditingSemester(false);
      }
    } catch (error) {
      console.error("Failed to update semester:", error);
      toast.error("Failed to update semester");
    } finally {
      setSavingSemester(false);
    }
  };

  // Profile picture handlers
  const handleFileSelect = () => {
    fileInputRef.current?.click();
    setShowPictureMenu(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    await uploadProfilePicture(file);
  };

  const uploadProfilePicture = async (file) => {
    setUploadingPicture(true);
    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      const response = await API.post(
        "/user/upload-profile-picture",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.success) {
        setProfilePicture(response.data.data.profilePicture);
        // Update Redux
        const updatedUser = {
          ...userData,
          profilePicture: response.data.data.profilePicture,
        };
        dispatch(
          login({
            user: updatedUser,
            accessToken: localStorage.getItem("accessToken"),
            refreshToken: localStorage.getItem("refreshToken"),
          })
        );
        toast.success("Profile picture updated!");
      }
    } catch (error) {
      console.error("Failed to upload profile picture:", error);
      toast.error("Failed to upload profile picture");
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleRemovePicture = async () => {
    setShowPictureMenu(false);
    try {
      const response = await API.delete("/user/remove-profile-picture");
      if (response.data.success) {
        setProfilePicture(null);
        // Update Redux
        const updatedUser = { ...userData, profilePicture: null };
        dispatch(
          login({
            user: updatedUser,
            accessToken: localStorage.getItem("accessToken"),
            refreshToken: localStorage.getItem("refreshToken"),
          })
        );
        toast.success("Profile picture removed");
      }
    } catch (error) {
      console.error("Failed to remove profile picture:", error);
      toast.error("Failed to remove profile picture");
    }
  };

  // Camera handlers
  const openCamera = async () => {
    setShowPictureMenu(false);
    setShowCameraModal(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Camera access denied:", error);
      toast.error("Unable to access camera. Please check permissions.");
      setShowCameraModal(false);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(
      async (blob) => {
        if (blob) {
          const file = new File([blob], "profile-photo.jpg", {
            type: "image/jpeg",
          });
          closeCamera();
          await uploadProfilePicture(file);
        }
      },
      "image/jpeg",
      0.9
    );
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCameraModal(false);
  };

  const getGradeFromScore = (score) => {
    if (score >= 90) return { letter: "A+", color: "text-green-400" };
    if (score >= 80) return { letter: "A", color: "text-green-500" };
    if (score >= 70) return { letter: "B", color: "text-blue-400" };
    if (score >= 60) return { letter: "C", color: "text-yellow-400" };
    if (score >= 50) return { letter: "D", color: "text-orange-400" };
    return { letter: "F", color: "text-red-400" };
  };

  const accuracyRate =
    stats.totalQuestions > 0
      ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
      : 0;

  const getProfilePictureUrl = () => {
    if (!profilePicture) return null;
    // profilePicture may be a data URL already
    if (profilePicture.startsWith("data:")) return profilePicture;
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
      "http://localhost:3000";
    return `${baseUrl}${profilePicture}`;
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-bg">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-lg flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Navbar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <HeaderBar />

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Profile Header */}
            <div className="bg-linear-to-r from-purple-900/40 via-bg-1 to-bg-1 rounded-2xl p-8 mb-6 border border-white/10">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Avatar with Picture Menu */}
                <div className="relative" ref={pictureMenuRef}>
                  <div
                    className="w-28 h-28 bg-linear-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/20 cursor-pointer group overflow-hidden"
                    onClick={() => setShowPictureMenu(!showPictureMenu)}
                  >
                    {uploadingPicture ? (
                      <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : profilePicture ? (
                      <img
                        src={getProfilePictureUrl()}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={56} className="text-white" />
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera size={28} className="text-white" />
                    </div>
                  </div>

                  {/* Picture Menu Dropdown */}
                  {showPictureMenu && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-bg-1 rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50">
                      <button
                        onClick={openCamera}
                        className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 transition-colors"
                      >
                        <Camera size={18} className="text-purple-400" />
                        <span>Take Photo</span>
                      </button>
                      <button
                        onClick={handleFileSelect}
                        className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 transition-colors"
                      >
                        <Upload size={18} className="text-blue-400" />
                        <span>Upload Photo</span>
                      </button>
                      {profilePicture && (
                        <button
                          onClick={handleRemovePicture}
                          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/10"
                        >
                          <Trash2 size={18} />
                          <span>Remove Photo</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  {isEditing ? (
                    <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-bg-2 text-white text-2xl font-bold px-4 py-2 rounded-xl border border-purple-500/50 focus:border-purple-500 focus:outline-none"
                        placeholder="Enter your name"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={saving}
                        className="p-2 bg-green-600 hover:bg-green-700 rounded-xl transition-colors"
                      >
                        {saving ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <Save size={20} className="text-white" />
                        )}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-2 bg-gray-600 hover:bg-gray-700 rounded-xl transition-colors"
                      >
                        <X size={20} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                      <h1 className="text-3xl font-bold text-white">
                        {userData?.name}
                      </h1>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                        title="Edit name"
                      >
                        <Edit2 size={18} className="text-gray-300" />
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start text-gray-400">
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      <span className="text-sm">{userData?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap size={16} className="text-purple-400" />
                      {isEditingSemester ? (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-bg-2 rounded-lg border border-purple-500/50">
                            <button
                              onClick={() =>
                                setEditSemester(Math.max(1, editSemester - 1))
                              }
                              className="p-1.5 hover:bg-white/10 rounded-l-lg transition-colors"
                              disabled={editSemester <= 1}
                            >
                              <ChevronDown
                                size={16}
                                className="text-gray-400"
                              />
                            </button>
                            <span className="text-white font-semibold px-3 min-w-[80px] text-center">
                              Sem {editSemester}
                            </span>
                            <button
                              onClick={() =>
                                setEditSemester(Math.min(8, editSemester + 1))
                              }
                              className="p-1.5 hover:bg-white/10 rounded-r-lg transition-colors"
                              disabled={editSemester >= 8}
                            >
                              <ChevronUp size={16} className="text-gray-400" />
                            </button>
                          </div>
                          <button
                            onClick={handleSaveSemester}
                            disabled={savingSemester}
                            className="p-1.5 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                          >
                            {savingSemester ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                              <Save size={16} className="text-white" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setEditSemester(userData?.semester || 1);
                              setIsEditingSemester(false);
                            }}
                            className="p-1.5 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <X size={16} className="text-white" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            Semester {userData?.semester}
                          </span>
                          <button
                            onClick={() => setIsEditingSemester(true)}
                            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                            title="Change semester"
                          >
                            <Edit2
                              size={14}
                              className="text-gray-400 hover:text-white"
                            />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Stats Badges */}
                  <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                    <div className="flex items-center gap-2 bg-orange-500/20 px-4 py-2 rounded-xl border border-orange-500/30">
                      <Flame size={18} className="text-orange-400" />
                      <span className="text-orange-400 font-semibold">
                        {stats.currentStreak} Day Streak
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-blue-500/20 px-4 py-2 rounded-xl border border-blue-500/30">
                      <Brain size={18} className="text-blue-400" />
                      <span className="text-blue-400 font-semibold">
                        {stats.totalQuizzes} Quizzes
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-xl border border-green-500/30">
                      <Trophy size={18} className="text-green-400" />
                      <span className="text-green-400 font-semibold">
                        Best: {stats.bestScore}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Total Quizzes */}
              <div className="bg-bg-1 rounded-2xl p-5 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <Brain size={24} className="text-purple-400" />
                  <span className="text-3xl font-bold text-white">
                    {stats.totalQuizzes}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">Total Quizzes Taken</p>
              </div>

              {/* Best Score */}
              <div className="bg-bg-1 rounded-2xl p-5 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <Trophy size={24} className="text-yellow-400" />
                  <span className="text-3xl font-bold text-white">
                    {stats.bestScore}%
                  </span>
                </div>
                <p className="text-gray-400 text-sm">Best Quiz Score</p>
              </div>

              {/* Average Score */}
              <div className="bg-bg-1 rounded-2xl p-5 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <BarChart3 size={24} className="text-blue-400" />
                  <span className="text-3xl font-bold text-white">
                    {stats.averageScore}%
                  </span>
                </div>
                <p className="text-gray-400 text-sm">Average Score</p>
              </div>

              {/* Best Streak */}
              <div className="bg-bg-1 rounded-2xl p-5 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <Flame size={24} className="text-orange-400" />
                  <span className="text-3xl font-bold text-white">
                    {stats.bestStreak}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">Best Login Streak</p>
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Accuracy Stats */}
              <div className="bg-bg-1 rounded-2xl p-6 border border-white/5">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Target size={20} className="text-purple-400" />
                  Accuracy Overview
                </h3>

                {/* Accuracy Ring */}
                <div className="flex items-center gap-6">
                  <div className="relative w-32 h-32">
                    <svg
                      className="w-full h-full -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#374151"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#8B5CF6"
                        strokeWidth="8"
                        strokeDasharray={`${(accuracyRate / 100) * 251} 251`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {accuracyRate}%
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-400" />
                        <span className="text-gray-300">Correct Answers</span>
                      </div>
                      <span className="text-green-400 font-semibold">
                        {stats.totalCorrect}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <XCircle size={16} className="text-red-400" />
                        <span className="text-gray-300">Incorrect Answers</span>
                      </div>
                      <span className="text-red-400 font-semibold">
                        {stats.totalIncorrect}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen size={16} className="text-blue-400" />
                        <span className="text-gray-300">Total Questions</span>
                      </div>
                      <span className="text-blue-400 font-semibold">
                        {stats.totalQuestions}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Favorite Topics */}
              <div className="bg-bg-1 rounded-2xl p-6 border border-white/5">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Award size={20} className="text-yellow-400" />
                  Top Quiz Topics
                </h3>

                {stats.favoriteTopics && stats.favoriteTopics.length > 0 ? (
                  <div className="space-y-3">
                    {stats.favoriteTopics.slice(0, 5).map((topic, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-bg-2/50 p-3 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0
                                ? "bg-yellow-500 text-black"
                                : index === 1
                                ? "bg-gray-400 text-black"
                                : index === 2
                                ? "bg-orange-600 text-white"
                                : "bg-gray-600 text-white"
                            }`}
                          >
                            {index + 1}
                          </span>
                          <span className="text-white font-medium truncate max-w-[150px]">
                            {topic.topic}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-purple-400 font-semibold">
                            {topic.count} quiz{topic.count > 1 ? "zes" : ""}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Brain size={40} className="mx-auto mb-3 opacity-50" />
                    <p>Take quizzes to see your favorite topics!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Quizzes */}
            <div className="bg-bg-1 rounded-2xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Clock size={20} className="text-blue-400" />
                  Recent Quiz Activity
                </h3>
                {stats.recentQuizzes && stats.recentQuizzes.length > 0 && (
                  <button
                    onClick={() => navigate("/quiz/history")}
                    className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                  >
                    View All →
                  </button>
                )}
              </div>

              {stats.recentQuizzes && stats.recentQuizzes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.recentQuizzes.slice(0, 6).map((quiz, index) => {
                    const grade = getGradeFromScore(quiz.score);
                    return (
                      <div
                        key={index}
                        className="bg-bg-2/50 p-4 rounded-xl hover:bg-bg-2 transition-colors cursor-pointer"
                        onClick={() => navigate(`/quiz/results/${quiz._id}`)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-white font-medium truncate flex-1 mr-2">
                            {quiz.topic}
                          </h4>
                          <span className={`text-lg font-bold ${grade.color}`}>
                            {grade.letter}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">
                            {quiz.correctAnswers}/{quiz.totalQuestions} correct
                          </span>
                          <span className="text-purple-400 font-semibold">
                            {quiz.score}%
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs mt-2">
                          {new Date(quiz.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Brain size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No quizzes taken yet</p>
                  <p className="text-sm mb-4">
                    Start your learning journey by taking a quiz!
                  </p>
                  <button
                    onClick={() => navigate("/quiz/create")}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl transition-colors"
                  >
                    Take Your First Quiz
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-bg-1 rounded-2xl overflow-hidden max-w-lg w-full border border-white/10">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Camera size={20} className="text-purple-400" />
                Take Photo
              </h3>
              <button
                onClick={closeCamera}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="relative bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full aspect-video object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="p-4 flex items-center justify-center gap-4">
              <button
                onClick={closeCamera}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={capturePhoto}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors flex items-center gap-2 font-semibold"
              >
                <Camera size={20} />
                Capture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
