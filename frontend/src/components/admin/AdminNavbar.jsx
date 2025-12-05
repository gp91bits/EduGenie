import React, { useState } from "react";
import {
  BarChart3,
  User,
  Brain,
  Calendar,
  Newspaper,
  Menu,
  X,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

function AdminNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", id: "adminDashboard", icon: BarChart3 },
    { name: "Users", id: "adminUsers", icon: User },
    { name: "Notes", id: "addNotes", icon: Brain },
    { name: "Events", id: "addEvents", icon: Calendar },
    { name: "News", id: "addNews", icon: Newspaper },
  ];

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const isActive = (id) =>
    location.pathname === "/admin" && location.hash === `#${id}`;

  const goToSection = (id) => {
    setIsOpen(false);

    if (location.pathname !== "/admin") {
      navigate(`/admin#${id}`);
      return;
    }

    navigate(`/admin#${id}`, { replace: true });

    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
    }, 50);
  };

  return (
    <>
      <button
        onClick={toggleMenu}
        className={`fixed top-3 left-3 z-50 p-2.5 rounded-xl shadow-lg transition-all ${
          isOpen ? "bg-white text-purple-700" : "bg-purple-600 text-white"
        }`}
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <div
        className={`fixed top-0 left-0 h-screen w-72 z-40 transition-transform bg-gradient-to-b from-purple-600 to-purple-900 
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="pt-20 pb-6 px-6 border-b border-white/10">
          <h1
            onClick={() => navigate("/admin")}
            className="text-2xl font-bold cursor-pointer flex items-center gap-2 text-white"
          >
            🎓 EduGenie Admin
          </h1>
        </div>

        <nav className="px-4 py-6 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.id);
              return (
                <li key={item.id}>
                  <button
                    onClick={() => goToSection(item.id)}
                    className={`w-full flex items-center gap-4 py-3.5 px-4 rounded-xl transition ${
                      active
                        ? "bg-white text-purple-700 shadow-lg"
                        : "text-white/90 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

export default AdminNavbar;
