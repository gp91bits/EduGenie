import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { Navbar } from "../components/index.components";

function Events() {
  const [events, setEvents] = useState([]);
  const getEvents = async () => {
    try {
      const { data } = await API.get("/event/getEvents");
      setEvents(data.events || []);
    } catch (error) {
      console.error(
        "Event fetch Error:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    getEvents();
  }, []);
  return (
    <div className="grid md:grid-rows-1 md:grid-cols-[minmax(180px,220px)_1fr_minmax(220px,260px)] h-screen bg-bg ">
      <Navbar />
      {/* Upcoming Events */}
      <div className="rounded-lg m-4 p-4 bg-bg-2">
        <h3 className="text-xl font-semibold mb-4 ">Upcoming Events</h3>
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
    </div>
  );
}

export default Events;
