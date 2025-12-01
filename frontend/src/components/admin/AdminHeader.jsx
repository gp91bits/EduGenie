import React, { useState, useEffect } from "react";
import { LogOut, User, Calendar,} from "lucide-react";
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
      <div className=" bg-linear-to-r from-purple-900/40 via-bg-2 to-bg-1 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Left Section - with padding for hamburger menu */}
          <div className="flex items-center gap-6 pl-14">
            <div className="hidden sm:block">
              <h2 className="text-white font-semibold text-lg">
                Welcome back, <span className="text-purple-400">{userData?.name || "User"}</span> 👋
              </h2>
              <p className="text-gray-400 text-xs flex items-center gap-1">
                <Calendar size={12} />
                {currentDate}
              </p>
            </div>
            
         
          </div>

        

          {/* Right Section - Action Buttons */}
          <div className="flex items-center gap-2">
             <div className="hidden md:flex items-center gap-2 bg-bg-1/50 px-4 py-2 rounded-xl border border-white/10">
            <div className="text-2xl font-bold text-white font-mono tracking-wider">
              {currentTime}
            </div>
          </div>
       
            
            <div className="w-px h-8 bg-white/10 mx-1 hidden sm:block"></div>
            
            <button
              className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition-all duration-200"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
      
  
      
  
    </div>
  );
}

export default AdminHeader;
