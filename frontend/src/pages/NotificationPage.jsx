import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { Bell } from "lucide-react";
import { HeaderBar, Navbar } from "../components/index.components";

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

function NotificationPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await API.get("/notifications");
      setItems(res.data.notifications || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const markOne = async (id) => {
    try {
      await API.post("/notifications/mark-read", { id });
      window.dispatchEvent(new CustomEvent("notifications:updated"));
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="flex h-screen bg-bg">
      <Navbar />
      <div className="flex-1 flex flex-col transition-all duration-300">
        <HeaderBar />
        <div className="w-full flex-1 bg-bg pt-24 px-4 sm:px-6 lg:px-12 flex justify-center overflow-auto">
          <div className="w-full max-w-2xl space-y-6">
            <h1 className="text-3xl font-bold text-white">All Notifications</h1>

            {loading ? (
              <div className="text-slate-400">Loading...</div>
            ) : items.length === 0 ? (
              <div className="text-slate-500">No notifications</div>
            ) : (
              <div className="space-y-3">
                {items.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => !n.isRead && markOne(n._id)}
                    className={`bg-bg-2 p-4 rounded-xl border cursor-pointer transition 
    ${
      !n.isRead
        ? "bg-purple-900/10 border-slate-700 hover:border-slate-500"
        : "border-slate-800  0"
    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9  ${
                            n.isRead ? "bg-accent/55" : "bg-accent"
                          } rounded flex items-center justify-center`}>
                        <Bell size={18} className="text-white" />
                      </div>

                      <div className="flex-1">
                        <div
                          className={`font-semibold ${
                            n.isRead ? "text-slate-400" : "text-white"
                          }`}
                        >
                          {n.title}
                        </div>

                        <div
                          className={`text-sm ${
                            n.isRead ? "text-slate-500" : "text-slate-300"
                          }`}
                        >
                          {n.msg}
                        </div>

                        <div
                          className={`text-xs mt-1 ${
                            n.isRead ? "text-slate-500" : "text-slate-400"
                          }`}
                        >
                          {formatTime(n.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default NotificationPage;
