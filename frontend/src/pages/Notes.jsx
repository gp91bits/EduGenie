import React from "react";
import { HeaderBar, Navbar, Progress, Subjects } from "../components/index.components";

function Notes() {
  return (
    <div className="flex h-screen bg-bg">
      <Navbar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300">
        <HeaderBar />
        <div className="flex-1 p-10 rounded-lg gap-5 flex flex-col overflow-auto">
          <Progress />
          <Subjects />
        </div>
      </div>
    </div>
  );
}

export default Notes;
