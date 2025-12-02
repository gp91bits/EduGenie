import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  Dashboard,
  Calendar,
  CreateEvent,
  HeaderBar,
} from "../components/index.components";

function Home() {
  const { status } = useSelector((state) => state.auth);

  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshEvents, setRefreshEvents] = useState(false);

  useEffect(() => {
    if (!status && !localStorage.getItem("accessToken")) {
      navigate("/auth/login", { replace: true });
    }
  }, [status, navigate]);

  const handleClose = () => {
    setIsModalOpen(false);
    setRefreshEvents((prev) => !prev);
  };

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Navbar />
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Full-width HeaderBar */}
        <HeaderBar />

        {/* Content area with Dashboard and Calendar side by side */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <Dashboard />
          </div>

          {/* Calendar Sidebar */}
          <div className="w-72 hidden md:block overflow-y-auto border-l border-white/5">
            <Calendar refresh={refreshEvents} />
          </div>
        </div>
      </div>
      <CreateEvent open={isModalOpen} onClose={handleClose} />
    </div>
  );
}

export default Home;
