import React, { useState } from "react";
import API from "../../api/axios";

function AdminEvent() {
  const [formData, setFormData] = useState({
    title: "",
    event: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.event.trim() || !formData.date) {
      setMessage({ type: "error", text: "All fields are required." });
      return;
    }

    setLoading(true);
    try {
      await API.post("/admin/createPublicEvent", {
        title: formData.title.trim(),
        event: formData.event.trim(),
        date: formData.date,
      });

      setMessage({ type: "success", text: "Event created successfully." });
      setFormData((prev) => ({ ...prev, title: "", event: "" }));
    } catch (err) {
      console.error("createEvent error:", err.response || err.message);
      const txt = err.response?.data?.message || "Failed to create event";
      setMessage({ type: "error", text: txt });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3500);
    }
  };

  return (
    <div id="addEvents" className="w-full min-h-screen bg-bg pt-20 px-4 sm:px-6 lg:px-12 flex items-start justify-center">
      <div className="w-full max-w-3xl">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">Create Event</h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2">
            Create a new event. Admin events will be visible to all users.
          </p>
        </div>

        <div className="bg-bg-2 p-6 sm:p-8 md:p-10 rounded-xl border border-slate-700 shadow-xl">
          {message && (
            <div role="status" className={`mb-6 px-4 py-3 rounded-md ${message.type === "success" ? "bg-green-700 text-white" : "bg-red-700 text-white"}`}>
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">Event Title</label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-bg-top text-white px-4 py-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-accent focus:border-accent text-lg placeholder:text-slate-400 transition"
                placeholder="Enter event title"
                required
              />
            </div>

            <div>
              <label htmlFor="event" className="block text-sm font-medium text-slate-300 mb-2">Event Details</label>
              <textarea
                id="event"
                value={formData.event}
                onChange={handleChange}
                className="w-full bg-bg-top text-white px-4 py-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-accent focus:border-accent text-lg placeholder:text-slate-400 transition h-40 resize-vertical"
                placeholder="Enter event details"
                required
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-slate-300 mb-2">Date</label>
              <input
                id="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className="w-full bg-bg-top text-white px-4 py-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-accent focus:border-accent transition"
                required
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex items-center justify-center bg-accent text-white px-6 py-3 rounded-lg text-lg font-medium transition ${loading ? "opacity-60 cursor-not-allowed" : "hover:bg-accent-1"}`}
              >
                {loading ? "Saving..." : "Create Event"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormData({ title: "", event: "", date: new Date().toISOString().split("T")[0] });
                  setMessage(null);
                }}
                className="inline-flex items-center justify-center bg-slate-700 text-white px-4 py-3 rounded-lg text-sm hover:bg-slate-600 transition"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminEvent;
