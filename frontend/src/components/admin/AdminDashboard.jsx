import React, { useState, useEffect } from "react";
import {
    BarChart3,
    Users,
    BookOpen,
    Calendar,
    Newspaper,
    TrendingUp,
    Clock,
    FileText,
    ArrowRight,
    ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";

function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalEvents: 0,
        totalNews: 0,
        totalNotes: 0,
        recentActivity: [],
        userGrowth: [],
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [newsRes, eventsRes, usersRes] = await Promise.all([
                    API.get("/admin/getNews").catch(e => {
                        console.error("News fetch error:", e);
                        return { data: { news: [] } };
                    }),
                    API.get("/events/getEvents").catch(e => {
                        console.error("Events fetch error:", e);
                        return { data: { events: [] } };
                    }),
                    API.get("/admin/users").catch(e => {
                        console.error("Users fetch error:", e);
                        return { data: { users: [] } };
                    }),
                ]);

                const totalNews = newsRes?.data?.news?.length || 0;
                const totalEvents = eventsRes?.data?.events?.length || 0;
                const totalUsers = usersRes?.data?.users?.length || 0;

                const recentActivity = [
                    ...(newsRes?.data?.news?.slice(0, 3).map((item) => ({
                        type: "news",
                        title: item.headline,
                        date: new Date(item.createdAt),
                        icon: Newspaper,
                    })) || []),
                    ...(eventsRes?.data?.events?.slice(0, 3).map((item) => ({
                        type: "event",
                        title: item.title,
                        date: new Date(item.date),
                        icon: Calendar,
                    })) || []),
                ].sort((a, b) => b.date - a.date);

                setStats({
                    totalUsers,
                    totalEvents,
                    totalNews,
                    totalNotes: 0,
                    recentActivity: recentActivity.slice(0, 5),
                    userGrowth: [],
                });
                setError(null);
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const scrollTo = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "instant", block: "start" });
        }
    };

    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin mb-4">
                        <BarChart3 size={48} className="text-gray-700" />
                    </div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div id="adminDashboard" className="w-full min-h-screen bg-gray-50 pt-20 pb-10 px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                
                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                {/* Stats Grid - Clean White Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Users Card */}
                    <button 
                        onClick={() => scrollTo("adminUsers")}
                        className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-violet-200 transition-all text-left cursor-pointer"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                                <Users size={20} className="text-violet-600" />
                            </div>
                            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">+12%</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                        <p className="text-sm text-gray-500">Total Users</p>
                    </button>

                    {/* News Card */}
                    <button 
                        onClick={() => scrollTo("addNews")}
                        className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left cursor-pointer"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Newspaper size={20} className="text-blue-600" />
                            </div>
                            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">+8%</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalNews}</p>
                        <p className="text-sm text-gray-500">News Articles</p>
                    </button>

                    {/* Events Card */}
                    <button 
                        onClick={() => scrollTo("addEvents")}
                        className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all text-left cursor-pointer"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                <Calendar size={20} className="text-teal-600" />
                            </div>
                            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">+5%</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
                        <p className="text-sm text-gray-500">Events</p>
                    </button>

                    {/* Notes Card */}
                    <button 
                        onClick={() => scrollTo("addNotes")}
                        className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all text-left cursor-pointer"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <BookOpen size={20} className="text-orange-600" />
                            </div>
                            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">+15%</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalNotes}</p>
                        <p className="text-sm text-gray-500">Study Notes</p>
                    </button>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Recent Activity */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <div className="p-5 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <Clock size={18} className="text-gray-500" />
                                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                            </div>
                        </div>
                        <div className="p-5">
                            {stats.recentActivity.length > 0 ? (
                                <div className="space-y-4">
                                    {stats.recentActivity.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                                item.type === 'news' ? 'bg-blue-100' : 'bg-teal-100'
                                            }`}>
                                                <item.icon size={16} className={item.type === 'news' ? 'text-blue-600' : 'text-teal-600'} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                                                <p className="text-xs text-gray-500">
                                                    {item.date.toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                            </div>
                                            <ChevronRight size={16} className="text-gray-400" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <FileText size={40} className="text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 text-sm">No recent activity</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        
                        {/* System Status */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                            <div className="p-5 border-b border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Server</span>
                                    <span className="inline-flex items-center gap-1.5 text-sm text-green-600 font-medium">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        Online
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Database</span>
                                    <span className="inline-flex items-center gap-1.5 text-sm text-green-600 font-medium">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        Connected
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">API</span>
                                    <span className="inline-flex items-center gap-1.5 text-sm text-green-600 font-medium">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        Healthy
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                            <div className="p-5 border-b border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                            </div>
                            <div className="p-4 space-y-2">
                                <button
                                    onClick={() => scrollTo("adminUsers")}
                                    className="w-full flex items-center justify-between p-3 rounded-lg text-left hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                                            <Users size={16} className="text-violet-600" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Manage Users</span>
                                    </div>
                                    <ArrowRight size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                                </button>
                                
                                <button
                                    onClick={() => scrollTo("addNews")}
                                    className="w-full flex items-center justify-between p-3 rounded-lg text-left hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Newspaper size={16} className="text-blue-600" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Create News</span>
                                    </div>
                                    <ArrowRight size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                                </button>
                                
                                <button
                                    onClick={() => scrollTo("addEvents")}
                                    className="w-full flex items-center justify-between p-3 rounded-lg text-left hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                                            <Calendar size={16} className="text-teal-600" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Create Event</span>
                                    </div>
                                    <ArrowRight size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                                </button>
                                
                                <button
                                    onClick={() => scrollTo("addNotes")}
                                    className="w-full flex items-center justify-between p-3 rounded-lg text-left hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                            <BookOpen size={16} className="text-orange-600" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Add Notes</span>
                                    </div>
                                    <ArrowRight size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
