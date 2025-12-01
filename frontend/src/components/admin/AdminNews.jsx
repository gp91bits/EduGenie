import React, { useState } from "react";
import API from "../../api/axios";

function AdminNews() {
  const [headline, setHeadline] = useState("");
  const [news, setNews] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!headline.trim() || !news.trim()) return;

    setLoading(true);
    try {
      await API.post("/admin/createNews", {
        headline,
        news,
      });

      setMessage({ type: "success", text: "News created." });
      setHeadline("");
      setNews("");
    } catch (err) {
      console.error("createNews error:", err.response || err.message);
      const txt =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to create news";
      setMessage({ type: "error", text: txt });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="addNews"
      className="w-full min-h-screen bg-bg pt-20 px-4 sm:px-6 lg:px-12 flex items-start justify-center"
    >
      <div className="w-full max-w-3xl">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
            Create News
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2">
            Add a headline and short news content. News will appear to users in
            the dashboard.
          </p>
        </div>

        <div className="bg-bg-2 p-6 sm:p-8 md:p-10 rounded-xl border border-slate-700 shadow-xl">
          {message && (
            <div
              role="status"
              className={`mb-6 px-4 py-3 rounded-md flex items-center gap-3 ${
                message.type === "success"
                  ? "bg-green-700 text-white"
                  : "bg-red-700 text-white"
              }`}
            >
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="headline"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Headline
              </label>
              <input
                id="headline"
                name="headline"
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full bg-bg-top text-white px-4 py-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-accent focus:border-accent text-lg placeholder:text-slate-400 transition"
                placeholder="Enter headline"
                required
                aria-required="true"
              />
            </div>

            <div>
              <label
                htmlFor="news"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                News
              </label>
              <textarea
                id="news"
                name="news"
                value={news}
                onChange={(e) => setNews(e.target.value)}
                className="w-full bg-bg-top text-white px-4 py-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-accent focus:border-accent text-lg placeholder:text-slate-400 transition h-44 sm:h-56 resize-vertical"
                placeholder="Enter news content (short and to the point)"
                required
                aria-required="true"
              />
              <p className="text-xs text-slate-500 mt-2">
                Tip: Keep headlines short (60 chars) and news concise for better
                readability.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex items-center justify-center bg-accent text-white px-6 py-3 rounded-lg text-lg font-medium transition ${
                    loading
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:bg-accent-1"
                  }`}
                >
                  {loading ? "Saving..." : "Create News"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setHeadline("");
                    setNews("");
                    setMessage(null);
                  }}
                  className="inline-flex items-center justify-center bg-slate-700 text-white px-4 py-3 rounded-lg text-sm hover:bg-slate-600 transition"
                >
                  Reset
                </button>
              </div>

              <div className="text-sm text-slate-400">
                <span className="font-medium">Preview:</span>{" "}
                <span className="italic">
                  {headline ? headline : "No headline yet"}
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminNews;
