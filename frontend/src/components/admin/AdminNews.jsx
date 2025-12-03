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
      className="w-full min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pt-20 pb-10 px-4 sm:px-6 lg:px-12 flex items-start justify-center"
    >
      <div className="w-full max-w-3xl">

        {/* Heading */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
            Manage News
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Create, update, or delete news items. Users will see these in their dashboard.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 sm:p-8">

          {/* Status message */}
          {message && (
            <div
              className={`mb-6 px-4 py-3 rounded-lg border flex items-start gap-3 ${message.type === "success"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-700"
                }`}
            >
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Headline
              </label>
              <input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                placeholder="Enter headline"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                News Content
              </label>
              <textarea
                value={news}
                onChange={(e) => setNews(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500 h-32 sm:h-40 resize-vertical"
                placeholder="Enter news content"
                required
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2.5 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : editingId ? "Update News" : "Create News"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                Reset
              </button>
            </div>
          </form>

          {/* News List */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            <h3 className="text-gray-900 font-semibold mb-4 text-lg">📰 Existing News</h3>

            {loadingList ? (
              <div className="text-gray-500 text-center py-8">Loading news...</div>
            ) : newsList.length === 0 ? (
              <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">No news found.</div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {newsList.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 flex items-start justify-between"
                  >
                    <div className="flex-1">
                      <div className="text-base font-semibold text-gray-900">{item.headline}</div>
                      <div className="text-sm text-gray-600 mt-1 line-clamp-2">{item.news}</div>
                    </div>

                    <div className="flex items-center gap-2 ml-3">
                      <button
                        onClick={() => populateForEdit(item)}
                        className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit news"
                      >
                        <Edit2 size={18} />
                      </button>

                      <button
                        onClick={() => deleteNews(item._id)}
                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete news"
                      >
                        <Trash2 size={18} />
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
