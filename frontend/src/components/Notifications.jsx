import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { Bell, Calendar, Newspaper, BookOpen } from "lucide-react";
import { semesterData } from "../semesterData";

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

function getCategoryStyle(category) {
  switch (category) {
    case "event":
      return { icon: Calendar, bg: "bg-blue-600", text: "text-blue-400" };
    case "news":
      return { icon: Newspaper, bg: "bg-orange-600", text: "text-orange-400" };
    case "notes":
      return { icon: BookOpen, bg: "bg-green-600", text: "text-green-400" };
    default:
      return { icon: Bell, bg: "bg-purple-700", text: "text-purple-400" };
  }
}

function resolveSubjectId(name) {
  if (!name) return null;
  for (const sem of Object.values(semesterData)) {
    const hit = sem.subjects.find((s) => s.name === name);
    if (hit) return hit.id;
  }
  return null;
}

export default function Notifications({ onOpen }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await API.get("/notifications");
      setItems(res?.data?.notifications || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const onUpdated = () => fetchData();
    window.addEventListener("notifications:updated", onUpdated);
    return () => window.removeEventListener("notifications:updated", onUpdated);
  }, []);

  const markOne = async (id) => {
    try {
      await API.post("/notifications/mark-read", { id });
      window.dispatchEvent(new CustomEvent("notifications:updated"));
    } catch {}
  };

  const handleClick = async (n) => {
    if (!n.isRead) await markOne(n._id);
    if (onOpen) onOpen();

    if (n.actionUrl && /^https?:\/\//.test(n.actionUrl)) {
      window.location.href = n.actionUrl;
      return;
    }

    if (n.category === "notes") {
      const subjectId =
        n.metadata?.subjectId ||
        resolveSubjectId(n.metadata?.subjectName || n.title);

      navigate(subjectId ? `/notes/${subjectId}` : "/notes");
      return;
    }

    switch (n.category) {
      case "news":
        navigate("/news");
        break;
      case "event":
      case "events":
        navigate("/events");
        break;
      default:
        navigate("/notifications");
    }
  };

  if (loading) return <div className="p-3 text-slate-400">Loading...</div>;

  const filtered = items.filter((n) =>
    filter === "all" ? true : n.category === filter
  );

  const previewItems = filtered.slice(0, 5);
  const extraCount = filtered.length > 5 ? filtered.length - 5 : 0;

  return (
    <div className="w-80 bg-bg-1 rounded-xl shadow-2xl border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-white/10 bg-purple-900/20">
        <h3 className="text-white font-semibold">Notifications</h3>
        <div className="flex gap-2 text-xs text-slate-300">
          {["all", "notes", "news", "event"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-2 py-0.5 rounded ${
                filter === t ? "bg-purple-700 text-white" : "hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-72 overflow-y-auto">
        {previewItems.length === 0 && (
          <div className="p-4 text-slate-500 text-sm text-center">
            No notifications
          </div>
        )}

        {previewItems.map((n) => {
          const style = getCategoryStyle(n.category);
          const Icon = style.icon;

          return (
            <div
              key={n._id}
              className={`p-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${
                !n.isRead ? "bg-purple-900/10" : ""
              }`}
              onClick={() => handleClick(n)}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 ${style.bg} rounded-lg flex items-center justify-center`}
                >
                  <Icon size={16} className="text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${style.text} capitalize`}>
                      {n.category || "General"}
                    </span>
                    {!n.isRead && (
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    )}
                  </div>

                  <div className="text-sm text-white font-medium truncate">
                    {n.title}
                  </div>

                  <div className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                    {n.msg}
                  </div>

                  <div className="text-xs text-slate-500 mt-1">
                    {formatTime(n.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {extraCount > 0 && (
        <div className="p-2 text-center text-xs text-slate-500 border-t border-white/5">
          +{extraCount} more notifications
        </div>
      )}

      <div className="p-3 text-center border-t border-white/10 bg-purple-900/20">
        <button
          onClick={() => {
            if (onOpen) onOpen();
            navigate("/notifications");
          }}
          className="text-sm text-purple-400 hover:text-purple-300"
        >
          Show all →
        </button>
      </div>
    </div>
  );
}
