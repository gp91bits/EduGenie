import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import { Trash2, Edit2, Plus } from "lucide-react";

export default function AdminEvent() {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const emptyForm = {
    title: "",
    event: "",
    date: new Date().toISOString().split("T")[0],
  };

  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(true);

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await API.get("/event/getEvents");
      setEvents(res?.data?.events || []);
    } catch (err) {
      console.error("fetchEvents error:", err);
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const populateForEdit = (ev) => {
    setEditingId(ev._id);
    setFormData({
      title: ev.title || "",
      event: ev.event || "",
      date: ev.date ? ev.date.split("T")[0] : emptyForm.date,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.event.trim() || !formData.date) {
      setMessage({ type: "error", text: "All fields are required." });
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        await API.put(`/admin/updateEvent/${editingId}`, {
          title: formData.title.trim(),
          event: formData.event.trim(),
          date: formData.date,
        });
        setMessage({ type: "success", text: "Event updated successfully." });
      } else {
        await API.post("/admin/createPublicEvent", {
          title: formData.title.trim(),
          event: formData.event.trim(),
          date: formData.date,
        });
        setMessage({ type: "success", text: "Event created successfully." });
      }

      await fetchEvents();
      resetForm();

      // Hide message after timeout
      setTimeout(() => setMessage(null), 2500);
    } catch (err) {
      console.error("save event error:", err);
      setMessage({
        type: "error",
        text: err?.response?.data?.message || "Failed to save event",
      });
      setTimeout(() => setMessage(null), 3500);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this event?")) return;

    try {
      await API.delete(`/admin/deleteEvent/${id}`);
      setMessage({ type: "success", text: "Event deleted." });
      await fetchEvents();
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      console.error("delete event error:", err);
      setMessage({
        type: "error",
        text: err?.response?.data?.message || "Failed to delete event",
      });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div
      id="addEvents"
      className="
      w-full 
      h-screen
      bg-bg 
      pt-20 pb-5 
      px-4 sm:px-6 lg:px-12 
      flex items-start justify-center 
      overflow-y-auto
    "
    >
      <div className="w-full max-w-3xl">
        {/* Heading Section  */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
            Manage Events
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2">
            Create or update public events. These events will appear in users'
            dashboard timeline.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-bg-2 p-6 sm:p-8 md:p-10 rounded-xl border border-slate-700 shadow-xl min-h-8/12  overflow-y-auto">
          {/* Status Message */}
          {message && (
            <div
              role="status"
              className={`mb-6 px-4 py-3 rounded-md flex items-center gap-3 ${
                message.type === "success"
                  ? "bg-green-700 text-white"
                  : "bg-red-700 text-white"
              }`}
            >
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          {/* Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Event Title
                </label>
                <input
                  id="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-bg-top text-white px-4 py-3 rounded-lg border border-slate-600 
                focus:ring-2 focus:ring-accent focus:border-accent text-lg placeholder:text-slate-400 transition"
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="event"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Event Details
                </label>
                <textarea
                  id="event"
                  value={formData.event}
                  onChange={handleChange}
                  className="w-full bg-bg-top text-white px-4 py-3 rounded-lg border border-slate-600 
                focus:ring-2 focus:ring-accent focus:border-accent text-lg placeholder:text-slate-400 transition 
                h-36 sm:h-48 resize-vertical"
                  placeholder="Short event description"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Event Date
                </label>
                <input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full bg-bg-top text-white px-4 py-3 rounded-lg border border-slate-600 
                focus:ring-2 focus:ring-accent focus:border-accent text-lg transition"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className={`inline-flex items-center justify-center bg-accent text-white px-6 py-3 rounded-lg text-lg 
                  font-medium transition ${
                    saving
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:bg-accent-1"
                  }`}
                  >
                    {saving
                      ? "Saving..."
                      : editingId
                      ? "Update Event"
                      : "Create Event"}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center justify-center bg-slate-700 text-white px-4 py-3 
                  rounded-lg text-sm hover:bg-slate-600 transition"
                  >
                    Reset
                  </button>
                </div>

                <div className="text-sm text-slate-400">
                  <span className="font-medium">Mode:</span>{" "}
                  <span className="italic">
                    {editingId
                      ? "Editing existing event"
                      : "Creating new event"}
                  </span>
                </div>
              </div>
            </form>
          )}

          {/* Event List */}
          <div className="mt-10">
            <h3 className="text-white font-semibold mb-4 text-lg">
              Existing Events
            </h3>

            {loadingEvents ? (
              <div className="text-slate-400">Loading events...</div>
            ) : events.length === 0 ? (
              <div className="text-slate-400">No events found.</div>
            ) : (
              <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-2">
                {events.map((ev) => (
                  <div
                    key={ev._id}
                    className="bg-bg-top p-4 rounded-xl border border-slate-700 flex items-start justify-between transition hover:border-slate-500"
                  >
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-white">
                        {ev.title}
                      </div>
                      <div className="text-sm text-slate-300">{ev.event}</div>
                      <div className="text-xs text-slate-500 mt-2">
                        {new Date(ev.date).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <button
                        onClick={() => populateForEdit(ev)}
                        className="text-gray-300 hover:text-white"
                      >
                        <Edit2 />
                      </button>

                      <button
                        onClick={() => handleDelete(ev._id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 />
                      </button>
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
