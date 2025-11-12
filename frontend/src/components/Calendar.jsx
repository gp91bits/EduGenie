import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { CreateEvent } from "./index.components";

function Calendar({ refresh }) {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  const getEvents = async () => {
    try {
      const { data } = await API.get("/event/getEvents");
      setEvents(data.events || []);
    } catch (error) {
      console.error("Event fetch Error:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    getEvents();
  }, [refresh]);

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    if (clickedDate >= new Date(new Date().setHours(0, 0, 0, 0))) {
      setSelectedDate(clickedDate);
      setIsModalOpen(true);
    }
  };

  const handleModalClose = async (shouldRefresh) => {
    setIsModalOpen(false);
    setSelectedDate(null);
    if (shouldRefresh) await getEvents(); // auto-refresh after adding event
  };

  const isEventDate = (day) => {
    return events.some((e) => {
      const eventDate = new Date(e.date);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentMonth &&
        eventDate.getFullYear() === currentYear
      );
    });
  };

  return (
    <div className="min-h-screen p-2 bg-bg text-white ">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {today.toLocaleString("default", { month: "long" })} {currentYear}
        </h2>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-gray-300 mb-8">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="font-semibold text-[12px]">{d}</div>
        ))}

        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const date = new Date(currentYear, currentMonth, day);
          const isToday =
            day === new Date().getDate() &&
            currentMonth === new Date().getMonth() &&
            currentYear === new Date().getFullYear();
          const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
          const hasEvent = isEventDate(day);

          return (
            <div
              key={day}
              onClick={() => !isPast && handleDateClick(day)}
              className={`relative cursor-pointer text-sm p-2 rounded-full transition-all
                ${isPast ? "text-gray-500 bg-bg-2 cursor-not-allowed"
                : isToday ? "bg-accent text-white font-bold"
                : hasEvent ? "bg-bg-2 text-white hover:bg-accent/60"
                : "bg-bg-2 hover:bg-accent/60"}
              `}
            >
              {day}
              {/* Dot for event days */}
              {hasEvent && (
                <span className="absolute bottom-[3px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-accent rounded-full"></span>
              )}
            </div>
          );
        })}
      </div>

      {/* Upcoming Events */}
      <div className="rounded-lg p-4 bg-bg-2">
        <h3 className="text-xl font-semibold mb-4">Upcoming Events</h3>
        <ul className="flex flex-col gap-5 w-full">
          {events.map((task, index) => (
            <li
              key={index}
              className="h-16 text-left p-2.5 rounded-lg bg-accent font-semibold text-lg"
            >
              {task.title}
            </li>
          ))}
        </ul>
      </div>

      {/* Create Event Modal (only opens when a date is clicked) */}
      {isModalOpen && selectedDate && (
        <CreateEvent date={selectedDate} open={isModalOpen} onClose={handleModalClose} />
      )}
    </div>
  );
}

export default Calendar;
