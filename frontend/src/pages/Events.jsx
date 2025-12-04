import React, { useEffect, useState } from "react";
import { Navbar, EventsPage, HeaderBar } from "../components/index.components";
import { getTasks, getEvents } from "../api/tasks";

// State management for tasks and events with backend integration

function Events() {
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const response = await getEvents();
      setEvents(response.events || []);
    } catch (error) {
      console.error(
        "Event fetch Error:",
        error.response?.data || error.message
      );
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await getTasks();
      setTasks(response.tasks || []);
    } catch (error) {
      console.error("Task fetch Error:", error.response?.data || error.message);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchEvents(), fetchTasks()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);
  return (
    <div className="flex h-screen bg-bg">
      <Navbar />
      {/* Main Content Area */}
      <div className="flex-1 transition-all duration-300">
        <HeaderBar />
        <div className="m-4 h-full overflow-auto">
          <div className="max-w-[980px] w-full mx-auto h-full">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-xl text-gray-600">
                  Loading tasks and events...
                </div>
              </div>
            ) : (
              <EventsPage
                tasks={tasks}
                setTasks={setTasks}
                events={events}
                setEvents={setEvents}
                onTasksUpdate={fetchTasks}
                onEventsUpdate={fetchEvents}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Events;
