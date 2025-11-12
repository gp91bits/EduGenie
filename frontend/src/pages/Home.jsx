import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Dashboard, Calendar, CreateEvent } from "../components/index.components";

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
    <div className="grid md:grid-rows-1 md:grid-cols-[minmax(180px,220px)_1fr_minmax(220px,260px)] h-screen bg-bg">
      <Navbar />
      <Dashboard />
      <Calendar refresh={refreshEvents} /> 
      <CreateEvent open={isModalOpen} onClose={handleClose} />
    </div>
  );
}

export default Home;
