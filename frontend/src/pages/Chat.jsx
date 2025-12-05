import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import API from "../api/axios";
import { Bell, LocateIcon } from "lucide-react";

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Chat() {
  const user = JSON.parse(localStorage.getItem("user"));
  const semesterId = user?.semester;
  const currentUser = { id: user?.id, name: user?.name };

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(0);

  const socketRef = useRef(null);
  const listRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isAtBottomRef = useRef(true);

  const pushMessage = (msg) => {
    setMessages((prev) => {
      if (msg._id && prev.some((m) => m._id === msg._id)) return prev;
      return [...prev, msg];
    });

    if (!isAtBottomRef.current) setUnreadCount((c) => c + 1);
    scrollToBottom();
  };

  const scrollToBottom = (smooth = false) => {
    requestAnimationFrame(() => {
      if (!listRef.current) return;
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
      isAtBottomRef.current = true;
      setUnreadCount(0);
    });
  };

  const loadHistory = async ({ page = 0, prepend = false } = {}) => {
    setLoadingHistory(true);
    try {
      const res = await API.get(`/chat/semester/${semesterId}/messages`, {
        params: { page, limit: 50 },
      });

      const msgs = res.data.messages || [];
      setPage(page);
      setMessages((prev) => (prepend ? [...msgs, ...prev] : msgs));

      if (!prepend) {
        requestAnimationFrame(() => scrollToBottom());
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (!semesterId) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("joinRoom", {
        room: `semester:${semesterId}`,
      });
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("connect_error", (err) =>
      console.error("Socket error:", err.message)
    );

    socket.on("message:new", (msg) => {
      if (msg.sender?.id === currentUser.id) return;
      pushMessage(msg);
    });

    socket.on("message:ack", ({ tempId, message }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.tempId === tempId ? { ...message, status: "sent" } : m
        )
      );
    });

    socket.on("user:typing", ({ userId, name }) => {
      setTypingUsers((prev) =>
        prev.some((p) => p.userId === userId)
          ? prev
          : [...prev, { userId, name }]
      );

      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((p) => p.userId !== userId));
      }, 4000);
    });

    socket.on("user:stopTyping", ({ userId }) =>
      setTypingUsers((prev) => prev.filter((p) => p.userId !== userId))
    );

    return () => {
      socket.emit("leaveRoom", {
        room: `semester:${semesterId}`,
      });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [semesterId]);

  useEffect(() => {
    if (!semesterId) return;
    loadHistory({ page: 0 });

    const reload = () => loadHistory({ page: 0 });
    window.addEventListener("notifications:updated", reload);
    return () => window.removeEventListener("notifications:updated", reload);
  }, [semesterId]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const onScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      isAtBottomRef.current = atBottom;
      if (atBottom) setUnreadCount(0);
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);
  const emitTyping = () => {
    const socket = socketRef.current;
    if (!socket?.connected) return;

    socket.emit("typing", {
      room: `semester:${semesterId}`,
      userId: currentUser?.id,
      name: currentUser?.name,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        room: `semester:${semesterId}`,
        userId: currentUser?.id,
      });
    }, 1200);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;

    const tempId = `tmp_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 9)}`;

    const optimistic = {
      tempId,
      text,
      sender: { id: currentUser?.id, name: currentUser?.name },
      createdAt: new Date().toISOString(),
      status: "sending",
    };
    pushMessage(optimistic);
    setInput("");

    const socket = socketRef.current;

    if (socket?.connected) {
      socket.emit(
        "message:create",
        {
          room: `semester:${semesterId}`,
          text,
          tempId,
          user: {
            id: currentUser.id,
            name: currentUser.name,
          },
        },
        (ack) => {
          if (ack?.error) {
            setMessages((prev) =>
              prev.map((m) =>
                m.tempId === tempId ? { ...m, status: "failed" } : m
              )
            );
          } else if (ack?.message) {
            setMessages((prev) =>
              prev.map((m) =>
                m.tempId === tempId ? { ...ack.message, status: "sent" } : m
              )
            );
          }
        }
      );
    } else {
      try {
        const res = await API.post(`/chat/semester/${semesterId}/messages`, {
          text,
          tempId,
        });

        const msg = res.data.message;
        setMessages((prev) => prev.map((m) => (m.tempId === tempId ? msg : m)));
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.tempId === tempId ? { ...m, status: "failed" } : m
          )
        );
      }
    }
  };

  const loadOlder = async () => {
    const next = page + 1;
    try {
      const res = await API.get(`/chat/semester/${semesterId}/messages`, {
        params: { page: next, limit: 50 },
      });

      const older = res.data.messages || [];
      if (older.length) {
        setMessages((prev) => [...older, ...prev]);
        setPage(next);
      }
    } catch (err) {
      console.error("Failed to load older messages:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-bg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Bell className="text-white" />
          <div>
            <div className="text-sm font-semibold text-white">
              Semester Chat
            </div>
            <div className="text-xs text-slate-400">
              Room: {semesterId} • {connected ? "online" : "offline"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadOlder}
            className="text-xs px-2 py-1 rounded bg-slate-800/50 text-slate-300"
          >
            Load older
          </button>

          {unreadCount > 0 && (
            <button
              onClick={() => scrollToBottom(true)}
              className="text-xs px-2 py-1 rounded bg-purple-700 text-white"
            >
              {unreadCount} new
            </button>
          )}
        </div>
      </div>

      <div
        ref={listRef}
        className="flex-1 overflow-auto p-2 space-y-2 rounded bg-bg"
        style={{ minHeight: 200 }}
      >
        {loadingHistory ? (
          <div className="text-slate-400 text-center py-6">Loading chat...</div>
        ) : messages.length === 0 ? (
          <div className="text-slate-500 text-center py-6">No messages yet</div>
        ) : (
          messages.map((m) => {
            const mine = m.sender?.id === currentUser?.id;
            return (
              <div
                key={m._id || m.tempId}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] p-2 rounded-lg shadow-sm ${
                    mine
                      ? "bg-accent text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  <div className="text-xs font-medium">
                    {mine ? "You" : m.sender?.name || "Unknown"}
                  </div>
                  <div className="mt-1 text-sm break-words">{m.text}</div>
                  <div className="mt-1 text-[11px] text-slate-400 flex justify-between">
                    <span>{formatTime(m.createdAt)}</span>
                    <span>
                      {m.status === "sending" && "…"}
                      {m.status === "failed" && "failed"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="h-6 text-xs text-slate-400 mt-1">
        {typingUsers.length > 0 &&
          `${typingUsers.map((t) => t.name).join(", ")} typing...`}
      </div>

      <form onSubmit={handleSend} className="mt-2 flex gap-2 items-center">
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            emitTyping();
          }}
          placeholder="Say something to your semester..."
          className="flex-1 rounded-lg px-3 py-2 bg-slate-900 text-slate-100 placeholder:text-slate-500"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-purple-600 text-white disabled:opacity-50"
          disabled={!input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}
