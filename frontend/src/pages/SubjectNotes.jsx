import React from "react";
import {
  HeaderBar,
  Navbar,
  SingleNotes,
} from "../components/index.components";

function SubjectNotes() {
  return (
    <div className="flex h-screen bg-bg">
      <Navbar />

      {/* Main Content Area */}
      <div className="flex-1 transition-all duration-300">
        <div className="pb-0 pr-0 rounded-lg gap-5 flex flex-col h-full">
          <HeaderBar />

          <div className="flex-1 overflow-y-auto">
            <SingleNotes />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubjectNotes;
