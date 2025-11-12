import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import API from "../../api/axios";

function CreateEvent({open, date, onClose }) {
  const [formData, setFormData] = useState({
    title: "",
    event: "",
    date: date ? new Date(date).toISOString().split("T")[0] : "",
  });
  const [events, setEvents] = useState([]);
  const [isOpen, setIsOpen] = useState(open);

  // Fetch events for this specific date
  const fetchEventsForDate = async () => {
    try {
      const { data } = await API.get("/event/getEvents");
      const filtered = (data.events || []).filter((e) => {
        const eventDate = new Date(e.date);
        return (
          eventDate.getDate() === new Date(date).getDate() &&
          eventDate.getMonth() === new Date(date).getMonth() &&
          eventDate.getFullYear() === new Date(date).getFullYear()
        );
      });
      setEvents(filtered);
    } catch (error) {
      console.error("Error fetching events for date:", error);
    }
  };

  useEffect(() => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        date: new Date(date).toISOString().split("T")[0],
      }));
      fetchEventsForDate();
    }
  }, [date]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/event/createEvent", formData);
      await fetchEventsForDate(); // refresh local event list
      setFormData({ title: "", event: "", date: formData.date });
      onClose?.(true); // optional refresh trigger
    } catch (error) {
      console.error("Event Creation Error:", error.response?.data || error.message);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => onClose?.(), 200); // small fade delay
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="relative bg-bg w-full max-w-lg mx-4 rounded-xl shadow-lg border border-bg-2 p-6">
        {/* Close Button */}
        <X
          size={28}
          color="white"
          className="absolute top-4 right-4 cursor-pointer hover:scale-110 transition-transform"
          onClick={handleClose}
        />

        {/* Header */}
        <h2 className="text-white text-2xl font-semibold mb-6 text-center">
          Create Event for {new Date(formData.date).toDateString()}
        </h2>

        {/* Existing Events */}
        <div className="mb-6 bg-bg-2 rounded-lg p-3">
          <h3 className="text-gray-300 text-sm mb-2 font-semibold">Existing Events</h3>
          {events.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {events.map((e, i) => (
                <li
                  key={i}
                  className="bg-accent/80 text-white rounded-md px-3 py-2 text-sm"
                >
                  <span className="font-semibold">{e.title}</span> — {e.event}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic text-sm">No events for this date.</p>
          )}
        </div>

        {/* Create Event Form */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="title" className="text-gray-400 text-sm block mb-1">
              Event Name
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-bg-top text-white px-4 py-3 rounded-lg border border-dark-secondary focus:border-accent focus:outline-none transition-colors"
              placeholder="Enter event title"
              required
            />
          </div>

          <div>
            <label htmlFor="event" className="text-gray-400 text-sm block mb-1">
              Event Details
            </label>
            <textarea
              id="event"
              value={formData.event}
              onChange={handleChange}
              className="w-full bg-bg-top text-white px-4 py-3 rounded-lg border border-dark-secondary focus:border-accent focus:outline-none transition-colors min-h-40"
              placeholder="Enter details"
              required
            />
          </div>

          <div>
            <label htmlFor="date" className="text-gray-400 text-sm block mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              className="w-full bg-bg-top text-white px-4 py-3 rounded-lg border border-dark-secondary focus:border-accent focus:outline-none transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-accent hover:bg-accent-1 text-white font-semibold py-3 rounded-lg transition-colors mt-2"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateEvent;
