import React, { useState, useEffect } from "react";
import {
  LogOut,
  MessageSquareMore,
  User,
  Bell,
  Calendar,
  BookOpen,
  Brain,
  TrendingUp,
  Flame,
  ClockFading,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { getUserStats } from "../api/quiz";

function HeaderBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);
  const [newsItems, setNewsItems] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [stats, setStats] = useState({ quizCount: 0, streak: 0 });
  const [profilePicture, setProfilePicture] = useState(null);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      text: "New quiz available: Data Structures",
      time: "2 min ago",
      read: false,
    },
    {
      id: 2,
      text: "Event reminder: Study Group at 5 PM",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      text: "You completed 5 quizzes this week!",
      time: "2 hours ago",
      read: true,
    },
  ]);

  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

  // Fetch user stats and profile picture
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
        console.error("Failed to fetch stats:", error);
        // Use streak from userData if available
        if (userData?.streak) {
          setStats((prev) => ({ ...prev, streak: userData.streak }));
        }
      }
    };

    const fetchProfilePicture = async () => {
      try {
        const response = await API.get("/user/profile-picture");
        if (response.data.success) {
          setProfilePicture(response.data.data.profilePicture);
        }
      } catch (error) {
        console.error("Failed to fetch profile picture:", error);
      }
    };
    const fetchNews = async () => {
      try {
        const response = await API.get("/admin/getNews");
        // backend returns { success: true, news: [...] } (or similar)
        const items = response?.data?.news || response?.data?.data || [];
        // normalize to simple strings for the ticker
        const normalized = items.map((n) => n?.headline);
        setNewsItems(normalized);
      } catch (error) {
        console.error("Failed to fetch news:", error);
        setNewsItems([]);
      }
    };
    fetchNews();
    fetchStats();
    fetchProfilePicture();
  }, [userData]);

  // Get profile picture URL
  const getProfilePictureUrl = () => {
    if (!profilePicture) return null;
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
      "http://localhost:3000";
    return `${baseUrl}${profilePicture}`;
  };

  // State for real-time clock
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  );

  const [currentDate, setCurrentDate] = useState(
    new Date().toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  );

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Rotate news ticker
  useEffect(() => {
    if (!newsItems || newsItems.length === 0) {
      setCurrentNewsIndex(0);
      return;
    }
    const newsTimer = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % newsItems.length);
    }, 5000);
    return () => clearInterval(newsTimer);
  }, [newsItems]);

  const handleLogout = async () => {
    const userId = localStorage.getItem("userId");
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      if (userId && refreshToken) {
        await API.post(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`, {
          id: userId,
          token: refreshToken,
        });
      }
    } catch (err) {
      console.warn("Server logout skipped or failed:", err.message);
    } finally {
      localStorage.clear();
      dispatch(logout());
      navigate("/auth/login", { replace: true });
    }
  };

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="sticky top-0 z-20">
      {/* Main Header */}
      <div className="bg-linear-to-r from-purple-900/40 via-bg-2 to-bg-1 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Left Section - with padding for hamburger menu */}
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
                <Calendar size={12} />
                {currentDate}
              </p>
            </div>

            {/* Quick Stats - Hidden on small screens */}
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

          {/* Center Section - Time Display */}
          <div className="hidden md:flex items-center gap-2 bg-bg-1/50 px-4 py-2 rounded-xl border border-white/10">
            <div className="text-2xl font-bold text-white font-mono tracking-wider">
              {currentTime}
            </div>
          </div>

          {/* Right Section - Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                className="relative p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200 group"
                title="Notifications"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell
                  size={20}
                  className="text-gray-300 group-hover:text-white"
                />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Panel */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-bg-1 rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50">
                  <div className="flex items-center justify-between p-3 border-b border-white/10 bg-purple-900/20">
                    <h3 className="text-white font-semibold">Notifications</h3>
                    <button
                      onClick={markAllRead}
                      className="text-xs text-purple-400 hover:text-purple-300"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${
                          !notif.read ? "bg-purple-900/10" : ""
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {!notif.read && (
                            <span className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 shrink-0"></span>
                          )}
                          <div className={!notif.read ? "" : "ml-4"}>
                            <p className="text-sm text-white">{notif.text}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notif.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t border-white/10 bg-bg-2/50">
                    <button className="w-full text-center text-sm text-purple-400 hover:text-purple-300 py-1">
                      View all notifications
                    </button>
                  </div>
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
              {profilePicture ? (
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

      {/* News Ticker */}
      <div className="bg-linear-to-r from-purple-600/20 via-bg-1 to-purple-600/20 border-b border-white/5">
        <div className="flex items-center h-8 px-4 overflow-hidden">
          <span className="text-xs text-purple-400 font-semibold mr-3 shrink-0 hidden sm:block">
            📢 NEWS
          </span>
          <div className="overflow-hidden flex-1">
            <p
              className="text-xs text-gray-300 whitespace-nowrap transition-all duration-500 ease-in-out"
              key={currentNewsIndex}
              style={{ animation: "fadeSlide 0.5s ease-in-out" }}
            >
              {newsItems.length > 0
                ? newsItems[currentNewsIndex]
                : "No news available"}
            </p>
          </div>
          <div className="flex gap-1 ml-3 shrink-0">
            {newsItems.length > 0 ? (
              newsItems.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentNewsIndex(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentNewsIndex
                      ? "bg-purple-500 w-3"
                      : "bg-gray-600 hover:bg-gray-500"
                  }`}
                />
              ))
            ) : (
              <span className="text-xs text-slate-400">—</span>
            )}
          </div>
        </div>
      </div>

      {/* CSS for animation */}
      <style>{`
        @keyframes fadeSlide {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default HeaderBar;
