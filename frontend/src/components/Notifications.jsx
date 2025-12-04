import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { Bell, Calendar, Newspaper, BookOpen } from "lucide-react";

function formatTime(ts) {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hr ago`;
  if (diffDay === 1) return "Yesterday";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Get icon and color based on notification category
function getCategoryStyle(category) {
  switch (category) {
    case "event":
      return { icon: Calendar, bgColor: "bg-blue-600", textColor: "text-blue-400" };
    case "news":
      return { icon: Newspaper, bgColor: "bg-orange-600", textColor: "text-orange-400" };
    case "notes":
      return { icon: BookOpen, bgColor: "bg-green-600", textColor: "text-green-400" };
    default:
      return { icon: Bell, bgColor: "bg-purple-700", textColor: "text-purple-400" };
  }
}

// Get navigation path based on category
function getNavigationPath(notification) {
  const { category, actionUrl, metadata } = notification;
  
  // If actionUrl is a valid internal path, use it
  if (actionUrl && !actionUrl.startsWith("http") && actionUrl.startsWith("/")) {
    return actionUrl;
  }
  
  // Navigate based on category
  switch (category) {
    case "event":
      return "/events";
    case "news":
      return "/news";
    case "notes":
      // If metadata has subject info, navigate to specific subject
      if (metadata?.subjectId) {
        return `/notes/${metadata.subjectId}`;
      }
      return "/notes";
    default:
      // For unknown categories, still close dropdown but don't navigate
      return null;
  }
}

export default function Notifications({ onOpen }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await API.get("/notifications");
      setItems(res?.data?.notifications || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const onUpdated = () => fetchNotifications();
    window.addEventListener("notifications:updated", onUpdated);
    return () => window.removeEventListener("notifications:updated", onUpdated);
  }, []);

  const markOne = async (id) => {
    try {
      await API.post("/notifications/mark-read", { id });
      window.dispatchEvent(new CustomEvent("notifications:updated"));
    } catch (err) {
      console.error("markOne failed:", err);
    }
  };

  const handleClick = (e, n) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Get the path first
    const path = getNavigationPath(n);
    
    // Mark as read in background
    if (!n.isRead) {
      markOne(n._id);
    }
    
    // Close the dropdown
    if (onOpen) onOpen();

    // Navigate if we have a valid path
    if (path) {
      navigate(path);
    }
  };

  if (loading) return <div className="p-3 text-slate-400">Loading...</div>;

  return (
    <div className="w-80 bg-bg-1 rounded-xl shadow-2xl border border-white/10 overflow-hidden" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between p-3 border-b border-white/10 bg-purple-900/20">
        <h3 className="text-white font-semibold">Notifications</h3>
      </div>

      <div className="max-h-72 overflow-y-auto">
        {items.length === 0 && (
          <div className="p-4 text-slate-500 text-sm text-center">No notifications</div>
        )}

        {items.slice(0, 5).map((n) => {
          const style = getCategoryStyle(n.category);
          const IconComponent = style.icon;
          
          return (
            <div
              key={n._id}
              className={`p-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${
                !n.isRead ? "bg-purple-900/10" : ""
              }`}
              onClick={(e) => handleClick(e, n)}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 ${style.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <IconComponent size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${style.textColor} capitalize`}>{n.category || "General"}</span>
                    {!n.isRead && (
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    )}
                  </div>
                  <div className="text-sm text-white font-medium truncate">{n.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.msg}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {formatTime(n.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {items.length > 5 && (
        <div className="p-2 text-center text-xs text-slate-500 border-t border-white/5">
          +{items.length - 5} more notifications
        </div>
      )}
    </div>
  );
}
