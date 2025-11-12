import React from "react";
import { LogOut, MessageSquareMore, User } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

function HeaderBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const newsList = ["this is sample news!!", "this is also a sample news!!"];
  const handelLogout = async () => {
    dispatch(logout());
    navigate("/auth/login", { replace: true });
  };
  return (
    <div className="flex flex-wrap items-center m-2 bg-bg-1 h-16 rounded-xl">
      <div className=" px-6 text-white text-lg">
        Hello {userData?.name}!
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          {newsList.map((news, index) => (
            <span key={index} className="inline-block mx-4 text-red-300">
              {news}
            </span>
          ))}
          {newsList.map((news, index) => (
            <span key={index} className="inline-block mx-4 text-red-300">
              {news}
            </span>
          ))}
        </div>
      </div>

      <div className="hidden md:block font-bold text-white text-2xl px-6">
        {currentTime}
      </div>
      <div className="flex items-center justify-evenly gap-4 px-6 text-white">
        <button
          className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center hover:bg-red-400"
          onClick={handelLogout}
        >
          <LogOut size={20} strokeWidth={3} />
        </button>
        <button className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500">
          <MessageSquareMore size={20} strokeWidth={3} />
        </button>
        <button className="w-10 h-10 bg-accent rounded-full flex items-center justify-center hover:bg-accent-1">
          <User size={20} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
export default HeaderBar;
