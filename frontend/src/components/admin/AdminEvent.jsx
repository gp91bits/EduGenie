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
      className="w-full min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pt-20 pb-10 px-4 sm:px-6 lg:px-12 flex items-start justify-center overflow-y-auto"
    >
      <div className="w-full max-w-3xl">
        {/* Heading Section  */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
            Manage Events
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Create or update public events. These events will appear in users' dashboard.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 sm:p-8">
          {/* Status Message */}
          {message && (
            <div
              role="status"
              className={`mb-6 px-4 py-3 rounded-lg flex items-center gap-3 border ${message.type === "success"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-700"
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
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  Event Title
                </label>
                <input
                  id="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500 transition"
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="event"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  Event Details
                </label>
                <textarea
                  id="event"
                  value={formData.event}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500 transition h-32 sm:h-40 resize-vertical"
                  placeholder="Event description"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  Event Date
                </label>
                <input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 transition"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2.5 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
                  >
                    Reset
                  </button>
                </div>

                <div className="text-sm text-gray-600">
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
          <div className="mt-10 pt-8 border-t border-gray-200">
            <h3 className="text-gray-900 font-semibold mb-4 text-lg">
              📅 Existing Events
            </h3>

            {loadingEvents ? (
              <div className="text-gray-500 text-center py-8">Loading events...</div>
            ) : events.length === 0 ? (
              <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">No events found.</div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {events.map((ev) => (
                  <div
                    key={ev._id}
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 flex items-start justify-between"
                  >
                    <div className="flex-1">
                      <div className="text-base font-semibold text-gray-900">
                        {ev.title}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{ev.event}</div>
                      <div className="text-xs text-gray-500 mt-2">
                        📅 {new Date(ev.date).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-3">
                      <button
                        onClick={() => populateForEdit(ev)}
                        className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit event"
                      >
                        <Edit2 size={18} />
                      </button>

                      <button
                        onClick={() => handleDelete(ev._id)}
                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete event"
                      >
                        <Trash2 size={18} />
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
