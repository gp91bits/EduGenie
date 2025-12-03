import React, { useState } from "react";
import {
  Home,
  BookOpen,
  Brain,
  Calendar,
  Map,
  Newspaper,
  Menu,
  X,
  User,
  BarChart3,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

function AdminNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // use section id instead of embedding hashes in path
  const navItems = [
    { name: "Dashboard", id: "adminDashboard", icon: BarChart3 },
    { name: "Users", id: "adminUsers", icon: User },
    { name: "Notes", id: "addNotes", icon: Brain },
    { name: "Events", id: "addEvents", icon: Calendar },
    { name: "News", id: "addNews", icon: Newspaper },
  ];

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const isActive = (id) => {
    // Active when on /admin and hash matches the section id.
    if (location.pathname !== "/admin") return false;
    if (location.hash === `#${id}`) return true;

    if (!location.hash && id === "adminNotes") return true;
    return false;
  };

  const goToSection = (id) => {
    setIsOpen(false);
    // If already on /admin, update router location hash (so useLocation updates)
    // then scroll to the element after the location change.
    if (location.pathname === "/admin") {
      navigate(`${location.pathname}#${id}`, { replace: true });
      // allow the hash update to propagate, then scroll
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
      return;
    }

    // If not on /admin, navigate there with the hash
    navigate(`/admin#${id}`);
  };

  return (
    <>
      {/* Hamburger Menu Button - Fixed position, always visible */}
      <button
        onClick={toggleMenu}
        className={`fixed top-3 left-3 z-50 p-2.5 rounded-xl transition-all duration-300 shadow-lg ${isOpen
            ? "bg-white text-purple-700"
            : "bg-purple-600 text-white hover:bg-purple-700 hover:scale-105"
          }`}
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X size={22} strokeWidth={2.5} />
        ) : (
          <Menu size={22} strokeWidth={2.5} />
        )}
      </button>

      {/* Sidebar Navigation */}
      <div
        className={`fixed top-0 left-0 h-screen w-72 transition-all duration-300 z-40
           ${isOpen ? "translate-x-0" : "-translate-x-full"} 
           bg-linear-to-b from-purple-600 via-purple-700 to-purple-900
           flex flex-col text-white shadow-2xl`}
      >
        {/* Logo Section */}
        <div className="pt-20 pb-6 px-6 border-b border-white/10">
          <h1
            className="text-2xl font-bold cursor-pointer hover:scale-105 transition-transform flex items-center gap-2"
            onClick={() => {
              navigate("/admin");
              setIsOpen(false);
            }}
          >
            <span className="text-3xl">🎓</span>
            <span>EduGenie</span>
          </h1>
          <p className="text-white/60 text-sm mt-1">Your Learning Companion</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.id);
              return (
                <li key={item.name}>
                  <button
                    className={`w-full flex items-center gap-4 text-left font-medium py-3.5 px-4 rounded-xl
                             transition-all duration-200 cursor-pointer
                             ${active
                        ? "bg-white text-purple-700 shadow-lg"
                        : "hover:bg-white/10 text-white/90 hover:text-white hover:translate-x-1"
                      }`}
                    onClick={() => goToSection(item.id)}
                  >
                    <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                    <span className="text-base">{item.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-purple-900/50">
          <p className="text-white/50 text-xs text-center">© 2025 EduGenie</p>
          <p className="text-white/30 text-xs text-center mt-1">
            Made with ❤️ for learners
          </p>
        </div>
      </div>

      {/* Overlay when menu is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

export default AdminNavbar;
