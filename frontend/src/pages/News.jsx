import React, { useEffect, useState } from "react";
import { Navbar, HeaderBar } from "../components/index.components";
import API from "../api/axios";

function News() {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const response = await API.get("/admin/getNews");
        setNewsItems(response?.data?.news || []);
      } catch (error) {
        console.error("Failed to fetch news:", error);
        setNewsItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const formatDate = (iso) => {
    if (!iso) return "Unknown date";
    try {
      return new Date(iso).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="flex h-screen bg-bg">
      <Navbar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300">
        <HeaderBar />
        <div className="flex-1 px-10 py-5 rounded-lg gap-5 flex flex-col overflow-auto">
          <h1 className="text-3xl font-bold text-white mb-6">Latest News</h1>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-slate-400">Loading news...</span>
            </div>
          ) : newsItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">No news available at the moment.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {newsItems.map((item) => (
                <div
                  key={item._id || item.id}
                  className="bg-white/10 p-6 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-gray-400 text-sm">
                      {formatDate(item.createdAt || item.date)}
                    </span>
                  </div>

                  <h2 className="text-xl font-semibold text-white mb-3">
                    {item.headline}
                  </h2>
                  <p className="text-gray-300 mb-4">{item.news}</p>

                  <button className="text-purple-400 hover:text-purple-300 font-medium">
                    Read More →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default News;
