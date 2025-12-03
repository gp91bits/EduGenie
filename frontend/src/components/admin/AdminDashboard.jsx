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

                // Calculate stats
                const totalNews = newsRes?.data?.news?.length || 0;
                const totalEvents = eventsRes?.data?.events?.length || 0;
                const totalUsers = usersRes?.data?.users?.length || 0;

                // Get recent activity (combine news and events by date)
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
                    totalNotes: 0, // Will be updated when notes stats endpoint is available
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

    const StatCard = ({ icon: Icon, title, value, trend, color }) => (
        <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-white/80 text-sm font-medium mb-2">{title}</p>
                    <h3 className="text-4xl font-bold text-white mb-2">{value}</h3>
                    {trend && (
                        <div className="flex items-center gap-1 text-green-300 text-sm">
                            <TrendingUp size={16} />
                            <span>{trend}% this month</span>
                        </div>
                    )}
                </div>
                <div className="bg-white/20 p-3 rounded-xl">
                    <Icon size={28} className="text-white" />
                </div>
            </div>
        </div>
    );

    const ActivityItem = ({ item }) => (
        <div className="flex items-start gap-4 pb-4 border-b border-gray-200 last:border-b-0">
            <div className="bg-purple-100 p-3 rounded-xl mt-1">
                <item.icon size={18} className="text-purple-600" />
            </div>
            <div className="flex-1">
                <p className="text-gray-800 font-medium text-sm">{item.title}</p>
                <p className="text-gray-500 text-xs">
                    {item.date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </p>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="text-center">
                    <div className="animate-spin mb-4">
                        <BarChart3 size={48} className="text-purple-600" />
                    </div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div id="adminDashboard" className="w-full min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                    <p className="text-gray-600">Welcome back! Here's your platform overview.</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={Users}
                        title="Total Users"
                        value={stats.totalUsers}
                        color="from-blue-500 to-blue-600"
                        trend={12}
                    />
                    <StatCard
                        icon={Newspaper}
                        title="Total News"
                        value={stats.totalNews}
                        color="from-purple-500 to-purple-600"
                        trend={8}
                    />
                    <StatCard
                        icon={Calendar}
                        title="Total Events"
                        value={stats.totalEvents}
                        color="from-green-500 to-green-600"
                        trend={5}
                    />
                    <StatCard
                        icon={BookOpen}
                        title="Study Notes"
                        value={stats.totalNotes}
                        color="from-orange-500 to-orange-600"
                        trend={15}
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center gap-2 mb-6">
                            <Clock size={24} className="text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                        </div>

                        {stats.recentActivity.length > 0 ? (
                            <div>
                                {stats.recentActivity.map((item, idx) => (
                                    <ActivityItem key={idx} item={item} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <FileText size={48} className="text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No recent activity</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="space-y-6">
                        {/* Platform Status */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Platform Status</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 text-sm">Server Status</span>
                                    <span className="inline-flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        <span className="text-green-600 font-medium text-sm">Online</span>
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 text-sm">Database</span>
                                    <span className="inline-flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        <span className="text-green-600 font-medium text-sm">Connected</span>
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 text-sm">API Status</span>
                                    <span className="inline-flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        <span className="text-green-600 font-medium text-sm">Healthy</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => {
                                        // Scroll to the adminUsers section
                                        const element = document.getElementById("adminUsers");
                                        if (element) {
                                            element.scrollIntoView({ behavior: "smooth", block: "start" });
                                        }
                                    }}
                                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium text-sm flex items-center justify-between px-4"
                                >
                                    <span>👥 Manage Users</span>
                                    <ArrowRight size={16} />
                                </button>
                                <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2.5 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 font-medium text-sm">
                                    + Create News
                                </button>
                                <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 font-medium text-sm">
                                    + Create Event
                                </button>
                                <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2.5 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-medium text-sm">
                                    + Add Notes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-8 text-center text-gray-500 text-sm">
                    <p>Last updated: {new Date().toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
