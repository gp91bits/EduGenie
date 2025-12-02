import React, { useEffect } from "react";
import {
  AdminEvent,
  AdminHeader,
  AdminNavbar,
  AdminNews,
  AdminNotes,
} from "../components/index.components";
import { useNavigate } from "react-router-dom";

function Admin() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const admins = import.meta.env.VITE_ADMIN.split(",").map((s) => s.trim());
  useEffect(() => {
    if (admins.includes(user.email)) {
      setTimeout(() => navigate("/admin#addNotes"), 0);
    } else {
      setTimeout(() => navigate("/"), 0);
    }
  }, []);

  return (
    <div className="bg-bg h-screen w-screen overflow-hidden">
      <AdminNavbar />
      <AdminHeader />
      <AdminNotes />
      <AdminEvent />
      <AdminNews />
    </div>
  );
}

export default Admin;
