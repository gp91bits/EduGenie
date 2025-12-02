import React, { useState } from "react";
import { Home, BookOpen, Brain, Calendar, Map, Newspaper, Menu, X, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";


function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Learning", path: "/notes", icon: BookOpen },
    { name: "Quiz", path: "/quiz", icon: Brain },
    { name: "Events", path: "/events", icon: Calendar },
    { name: "Maps", path: "/maps", icon: Map },
    { name: "News", path: "/news", icon: Newspaper },
    { name: "Profile", path: "/profile", icon: User, isProfile: true },
  ];

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <button
        onClick={toggleMenu}
        className={`fixed top-3 left-3 z-50 p-2.5 rounded-xl transition-all duration-300 shadow-lg ${
          isOpen ? "bg-white text-purple-700" : "bg-purple-600 text-white hover:bg-purple-700 hover:scale-105"
        }`}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
      </button>

      <div
        className={`fixed top-0 left-0 h-screen w-72 transition-all duration-300 z-40
           ${isOpen ? "translate-x-0" : "-translate-x-full"} 
           bg-linear-to-b from-purple-600 via-purple-700 to-purple-900
           flex flex-col text-white shadow-2xl`}
      >
        <div className="pt-20 pb-6 px-6 border-b border-white/10">
          <h1
            className="text-2xl font-bold cursor-pointer hover:scale-105 transition-transform flex items-center gap-2"
            onClick={() => {
              navigate("/");
              setIsOpen(false);
            }}
          >
            <span className="text-3xl">🎓</span>
            <span>EduGenie</span>
          </h1>
          <p className="text-white/60 text-sm mt-1">Your Learning Companion</p>
        </div>

        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <li key={item.name}>
                  <button
                    className={`w-full flex items-center gap-4 text-left font-medium py-3.5 px-4 rounded-xl
                             transition-all duration-200 cursor-pointer
                             ${active ? "bg-white text-purple-700 shadow-lg" : "hover:bg-white/10 text-white/90 hover:text-white hover:translate-x-1"}`}
                    onClick={() => {
                      setIsOpen(false);
                      navigate(item.path);
                    }}
                  >
                    <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                    <span className="text-base">{item.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-white/10 bg-purple-900/50">
          <p className="text-white/50 text-xs text-center">© 2025 EduGenie</p>
          <p className="text-white/30 text-xs text-center mt-1">Made with ❤️ for learners</p>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

export default Navbar;
