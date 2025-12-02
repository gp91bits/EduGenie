import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { Bell } from "lucide-react";

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

export default function Notifications({ onOpen }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetch = async () => {
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
    fetch();
    const onUpdated = () => fetch();
    window.addEventListener("notifications:updated", onUpdated);
    return () => window.removeEventListener("notifications:updated", onUpdated);
  }, []);

  const markOne = async (id) => {
    try {
      await API.post("/notifications/mark-read", { id });
      window.dispatchEvent(new CustomEvent("notifications:updated"));
      await fetch();
    } catch (err) {
      console.error("markOne failed:", err);
    }
  };

  const handleClick = async (n) => {
    if (!n.isRead) await markOne(n._id);
    if (onOpen) onOpen();

    if (n.actionUrl) {
      if (/^https?:\/\//.test(n.actionUrl)) {
        window.location.href = n.actionUrl;
      } else {
        navigate("/notifications");
      }
    }
  };

  if (loading) return <div className="p-3 text-slate-400">Loading...</div>;

  return (
    
    <div className="w-80 bg-bg-1 rounded-xl shadow-2xl border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-white/10 bg-purple-900/20">
        <h3 className="text-white font-semibold">Notifications</h3>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {items.length === 0 && (
          <div className="p-3 text-slate-500 text-sm">No notifications</div>
        )}

        {items.slice(0, 4).map((n) => (
          <div
            key={n._id}
            className={`p-3 border-b border-white/5 cursor-pointer hover:bg-white/5 ${
              !n.isRead ? "bg-purple-900/10" : ""
            }`}
            onClick={() => handleClick(n)}
          >
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 bg-purple-700 rounded flex items-center justify-center">
                <Bell size={16} className="text-white" />
              </div>
              <div>
                <div className="text-sm text-white font-medium">{n.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">{n.msg}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {formatTime(n.createdAt)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show All */}
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
