import React from "react";
import { HeaderBar, Navbar, Progress, Subjects } from "../components/index.components";

function Notes() {
  return (
    <div className="flex h-screen bg-bg">
      <Navbar />

      {/* Main Content Area */}
      <div className="flex-1  transition-all duration-300">
          <HeaderBar />
        <div className="p-10 rounded-lg gap-5 flex flex-col h-full overflow-auto">
          <Progress />
          <Subjects />
        </div>
      </div>
    </div>
  );
}

export default Notes;
