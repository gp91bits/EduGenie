import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import { Trash2, Edit2 } from "lucide-react";

export default function AdminNews() {
  const [headline, setHeadline] = useState("");
  const [news, setNews] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [newsList, setNewsList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  // Fetch all news
  const fetchNews = async () => {
    setLoadingList(true);
    try {
      const res = await API.get("/admin/getNews");
      setNewsList(res?.data?.news || []);
    } catch (err) {
      console.error("fetchNews error:", err);
      setNewsList([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Reset form
  const resetForm = () => {
    setHeadline("");
    setNews("");
    setEditingId(null);
    setMessage(null);
  };

  // Populate for editing
  const populateForEdit = (item) => {
    setEditingId(item._id);
    setHeadline(item.headline);
    setNews(item.news);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete news
  const deleteNews = async (id) => {
    if (!confirm("Delete this news?")) return;

    try {
      await API.delete(`/admin/deleteNews/${id}`);
      setMessage({ type: "success", text: "News deleted." });
      fetchNews();
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      console.error("deleteNews error:", err);
      setMessage({ type: "error", text: "Failed to delete news" });
    }
  };

  // Submit create/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!headline.trim() || !news.trim()) return;

    setLoading(true);

    try {
      if (editingId) {
        // UPDATE NEWS
        await API.put(`/admin/updateNews/${editingId}`, {
          headline,
          news,
        });

        setMessage({ type: "success", text: "News updated." });
      } else {
        // CREATE NEWS
        await API.post("/admin/createNews", {
          headline,
          news,
        });

        setMessage({ type: "success", text: "News created." });
      }

      resetForm();
      fetchNews();

      setTimeout(() => setMessage(null), 2500);
    } catch (err) {
      console.error("create/update error:", err);
      const txt =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to save news";
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

        {/* Heading */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
            Manage News
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2">
            Create, update, or delete news items. Users will see these in the dashboard.
          </p>
        </div>

        {/* Card */}
        <div className="bg-bg-2 p-6 sm:p-8 md:p-10 rounded-xl border border-slate-700 shadow-xl">

          {/* Status message */}
          {message && (
            <div
              className={`mb-6 px-4 py-3 rounded-md ${
                message.type === "success" ? "bg-green-700" : "bg-red-700"
              } text-white`}
            >
              {message.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Headline
              </label>
              <input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full bg-bg-top text-white px-4 py-3 rounded-lg border border-slate-600
                focus:ring-2 focus:ring-accent focus:border-accent text-lg"
                placeholder="Enter headline"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                News
              </label>
              <textarea
                value={news}
                onChange={(e) => setNews(e.target.value)}
                className="w-full bg-bg-top text-white px-4 py-3 rounded-lg border border-slate-600
                focus:ring-2 focus:ring-accent focus:border-accent text-lg h-44 sm:h-56 resize-vertical"
                placeholder="Enter news content"
                required
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className={`bg-accent text-white px-6 py-3 rounded-lg text-lg ${
                  loading ? "opacity-60 cursor-not-allowed" : "hover:bg-accent-1"
                }`}
              >
                {loading ? "Saving..." : editingId ? "Update News" : "Create News"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="bg-slate-700 text-white px-4 py-3 rounded-lg text-sm hover:bg-slate-600"
              >
                Reset
              </button>
            </div>
          </form>

          {/* News List */}
          <div className="mt-10">
            <h3 className="text-white font-semibold mb-4 text-lg">Existing News</h3>

            {loadingList ? (
              <div className="text-slate-400">Loading news...</div>
            ) : newsList.length === 0 ? (
              <div className="text-slate-400">No news found.</div>
            ) : (
              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                {newsList.map((item) => (
                  <div
                    key={item._id}
                    className="bg-bg-top p-4 rounded-xl border border-slate-700 flex items-start justify-between hover:border-slate-500"
                  >
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-white">{item.headline}</div>
                      <div className="text-sm text-slate-300">{item.news}</div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <button
                        onClick={() => populateForEdit(item)}
                        className="text-gray-300 hover:text-white"
                      >
                        <Edit2 />
                      </button>

                      <button
                        onClick={() => deleteNews(item._id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
