import React, { useState, useEffect, useRef } from "react";
import {
  LogOut,
  MessageSquareMore,
  User,
  Bell,
  Calendar,
  BookOpen,
  Brain,
  Flame,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { getUserStats } from "../api/quiz";
import Notifications from "./Notifications";

function HeaderBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);
  const [newsItems, setNewsItems] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [stats, setStats] = useState({ quizCount: 0, streak: 0 });
  const [profilePicture, setProfilePicture] = useState(null);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const notifRef = useRef(null);

  // Fetch stats, profile picture and unread count
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getUserStats();
        if (response.success) {
          setStats({
            quizCount: response.data.quizCount || 0,
            streak: response.data.streak || 0,
          });
        }
      } catch (error) {
        if (userData?.streak)
          setStats((prev) => ({ ...prev, streak: userData.streak }));
      }
    };

    const fetchProfilePicture = async () => {
      try {
        const response = await API.get("/user/profile");
        const pic =
          response?.data?.data?.profilePicture ||
          userData?.profilePicture ||
          null;
        setProfilePicture(pic);
      } catch (error) {
        setProfilePicture(userData?.profilePicture || null);
      }
    };

    const fetchUnread = async () => {
      try {
        const res = await API.get("/notifications");
        const items = res?.data?.notifications || [];
        const unread = items.filter((i) => !i.isRead).length;
        setNotificationsCount(unread);
      } catch (err) {
        setNotificationsCount(0);
      }
    };

    const fetchNews = async () => {
      try {
        const response = await API.get("/admin/getNews");
        const items = response?.data?.news || response?.data?.data || [];
        const normalized = items.map((n) => n?.headline || n?.title || "");
        setNewsItems(normalized.filter(Boolean));
      } catch (error) {
        setNewsItems([]);
      }
    };

    fetchNews();
    fetchStats();
    fetchProfilePicture();
    fetchUnread();

    const onUpdated = () => {
      fetchUnread();
    };
    window.addEventListener("subjectNotes:updated", onUpdated);
    window.addEventListener("subjectProgress:updated", onUpdated);
    window.addEventListener("notifications:updated", onUpdated);

    return () => {
      window.removeEventListener("subjectNotes:updated", onUpdated);
      window.removeEventListener("subjectProgress:updated", onUpdated);
      window.removeEventListener("notifications:updated", onUpdated);
    };
  }, [userData]);

  const getProfilePictureUrl = () => {
    const pic = profilePicture || userData?.profilePicture || null;
    if (!pic) return null;
    if (typeof pic === "string") {
      if (pic.startsWith("data:")) return pic;
      if (pic.startsWith("http://") || pic.startsWith("https://")) return pic;
      const baseUrl =
        (import.meta.env.VITE_API_BASE_URL || "").replace(/\/api\/?$/, "") ||
        "http://localhost:3000";
      return pic.startsWith("/") ? `${baseUrl}${pic}` : `${baseUrl}/${pic}`;
    }
    return null;
  };

  const handleLogout = async () => {
    const userId = localStorage.getItem("userId");
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      if (userId && refreshToken) {
        await API.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/logout`,
          { id: userId, token: refreshToken }
        );
      }
    } catch (err) {}
    localStorage.clear();
    dispatch(logout());
    navigate("/auth/login", { replace: true });
  };

  return (
    <div className="sticky top-0 z-20">
      <div className="bg-linear-to-r from-purple-900/40 via-bg-2 to-bg-1 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-6 pl-14">
            <div className="hidden sm:block">
              <h2 className="text-white font-semibold text-lg">
                Welcome back,{" "}
                <span className="text-purple-400">
                  {userData?.name || "User"}
                </span>{" "}
                👋
              </h2>
              <p className="text-gray-400 text-xs flex items-center gap-1">
                <Calendar size={12} /> {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <div className="flex items-center gap-2 bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/20">
                <Flame size={14} className="text-orange-400" />
                <span className="text-orange-400 text-xs font-medium">
                  {stats.streak} Day Streak
                </span>
              </div>
              <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                <Brain size={14} className="text-blue-400" />
                <span className="text-blue-400 text-xs font-medium">
                  {stats.quizCount} Quizzes
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-bg-1/50 px-4 py-2 rounded-xl border border-white/10">
            <div className="text-2xl font-bold text-white font-mono tracking-wider">
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative" ref={notifRef}>
              <button
                className="relative p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200 group"
                title="Notifications"
                onClick={() => setShowNotifications((s) => !s)}
              >
                <Bell
                  size={20}
                  className="text-gray-300 group-hover:text-white"
                />
                {notificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold animate-pulse">
                    {notificationsCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 z-50">
                  <Notifications onOpen={() => setShowNotifications(false)} />
                </div>
              )}
            </div>

            <button
              className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200 group"
              title="Messages"
            >
              <MessageSquareMore
                size={20}
                className="text-gray-300 group-hover:text-white"
              />
            </button>

            <button
              className="w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-xl transition-all duration-200 overflow-hidden flex items-center justify-center"
              title="Profile"
              onClick={() => navigate("/profile")}
            >
              {getProfilePictureUrl() ? (
                <img
                  src={getProfilePictureUrl()}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={20} className="text-white" />
              )}
            </button>

            <div className="w-px h-8 bg-white/10 mx-1 hidden sm:block"></div>

            <button
              className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition-all duration-200"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline text-sm font-medium">
                Logout
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-linear-to-r from-purple-600/20 via-bg-1 to-purple-600/20 border-b border-white/5">
        <div className="flex items-center h-8 px-4 overflow-hidden">
          <span className="text-xs text-purple-400 font-semibold mr-3 shrink-0 hidden sm:block">
            📢 NEWS
          </span>
          <div className="overflow-hidden flex-1">
            <p className="text-xs text-gray-300 whitespace-nowrap">
              {newsItems.length > 0 ? newsItems[0] : "No news available"}
            </p>
          </div>
          <div className="flex gap-1 ml-3 shrink-0">
            {newsItems.length > 0
              ? newsItems.slice(0, 4).map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full ${
                      idx === 0 ? "bg-purple-500 w-3" : "bg-gray-600"
                    }`}
                  />
                ))
              : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeaderBar;
