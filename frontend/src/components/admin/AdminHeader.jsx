import React, { useState, useEffect } from "react";
import { LogOut, User, Calendar, } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/authSlice";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";

function AdminHeader() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);








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




  return (
    <div className="fixed top-0 z-20 w-screen">
      {/* Main Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 shadow-lg border-b border-purple-400/20">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Left Section - with padding for hamburger menu */}
          <div className="flex items-center gap-6 pl-14">
            <div className="hidden sm:block">
              <h2 className="text-white font-bold text-lg">
                Welcome back, <span className="text-yellow-200">{userData?.name || "User"}</span> 👋
              </h2>
              <p className="text-white/80 text-xs flex items-center gap-1 mt-0.5">
                <Calendar size={12} />
                {currentDate}
              </p>
            </div>
          </div>

          {/* Right Section - Action Buttons */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-lg border border-white/20 hover:bg-white/20 transition-all">
              <div className="text-lg font-bold text-white font-mono tracking-wider">
                {currentTime}
              </div>
            </div>

            <div className="w-px h-8 bg-white/20"></div>

            <button
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 font-medium text-sm"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminHeader;
