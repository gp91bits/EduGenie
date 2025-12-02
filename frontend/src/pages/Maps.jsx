import React from "react";
import { Navbar, HeaderBar } from "../components/index.components";

function Maps() {
    return (
        <div className="flex h-screen bg-bg">
            <Navbar />

            {/* Main Content Area */}
            <div className="flex-1  transition-all duration-300">
                    <HeaderBar />
                <div className="p-10 rounded-lg gap-5 flex flex-col h-full overflow-auto">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-white mb-4">Campus Maps</h1>
                        <p className="text-gray-300 text-lg">Navigate your campus with interactive maps!</p>

                        <div className="bg-white/10 p-8 rounded-lg mt-8 text-center">
                            <h3 className="text-xl font-semibold text-white mb-4">Interactive Campus Map</h3>
                            <p className="text-gray-300 mb-6">Find classrooms, libraries, cafeterias and more</p>

                            <div className="bg-white/5 h-64 rounded-lg flex items-center justify-center mb-4">
                                <p className="text-gray-400">Campus Map Component Goes Here</p>
                            </div>

                            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
                                View Full Map
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Maps;