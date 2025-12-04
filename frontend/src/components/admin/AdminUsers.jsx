import React, { useState, useEffect } from "react";
import {
    Trash2,
    Ban,
    CheckCircle,
    Search,
    Calendar,
    Mail,
    Flame,
    Users,
    AlertCircle,
} from "lucide-react";
import API from "../../api/axios";

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterBlocked, setFilterBlocked] = useState("all");
    const [selectedUsers, setSelectedUsers] = useState(new Set());
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [confirmBlock, setConfirmBlock] = useState(null);
    const [operationLoading, setOperationLoading] = useState(null);

    // Fetch all users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await API.get("/admin/users");
                if (response.data.success) {
                    setUsers(response.data.users);
                    setError(null);
                }
            } catch (err) {
                console.error("Error fetching users:", err);
                setError("Failed to load users. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Filter users based on search and filter
    useEffect(() => {
        let filtered = users;

        // Filter by search query
        if (searchQuery.trim()) {
            filtered = filtered.filter(
                (user) =>
                    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by blocked status
        if (filterBlocked !== "all") {
            const isBlocked = filterBlocked === "blocked";
            filtered = filtered.filter((user) => user.blocked === isBlocked);
        }

        setFilteredUsers(filtered);
    }, [users, searchQuery, filterBlocked]);

    // Delete user
    const handleDeleteUser = async (userId) => {
        try {
            setOperationLoading(`delete-${userId}`);
            const response = await API.delete(`/admin/users/${userId}`);
            if (response.data.success) {
                setUsers(users.filter((u) => u._id !== userId));
                setConfirmDelete(null);
            }
        } catch (err) {
            console.error("Error deleting user:", err);
            setError("Failed to delete user");
        } finally {
            setOperationLoading(null);
        }
    };

    // Block/Unblock user
    const handleBlockUser = async (userId, isCurrentlyBlocked) => {
        try {
            setOperationLoading(`block-${userId}`);
            const response = await API.put(`/admin/users/${userId}/block`, {
                blocked: !isCurrentlyBlocked,
            });
            if (response.data.success) {
                setUsers(
                    users.map((u) =>
                        u._id === userId ? { ...u, blocked: !isCurrentlyBlocked } : u
                    )
                );
                setConfirmBlock(null);
            }
        } catch (err) {
            console.error("Error blocking user:", err);
            setError("Failed to update user status");
        } finally {
            setOperationLoading(null);
        }
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return "Never";
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    // User stats card
    const StatsCard = ({ icon: Icon, label, value, color }) => (
        <div className={`bg-gradient-to-br ${color} rounded-xl p-4 shadow-lg`}>
            <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2.5 rounded-lg">
                    <Icon size={20} className="text-white" />
                </div>
                <div>
                    <p className="text-white/80 text-xs">{label}</p>
                    <p className="text-2xl font-bold text-white">{value}</p>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div
                id="adminUsers"
                className="w-full min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pt-24 pb-10 px-8"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-12">
                        <div className="animate-spin mb-4">
                            <Users size={48} className="text-purple-600 mx-auto" />
                        </div>
                        <p className="text-gray-600">Loading users...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            id="adminUsers"
            className="w-full min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pt-24 pb-10 px-8"
        >
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        User Management
                    </h1>
                    <p className="text-gray-600">
                        Manage platform users, block/unblock, and delete accounts
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-red-700 font-medium">Error</p>
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatsCard
                        icon={Users}
                        label="Total Users"
                        value={users.length}
                        color="from-blue-500 to-blue-600"
                    />
                    <StatsCard
                        icon={Ban}
                        label="Blocked Users"
                        value={users.filter((u) => u.blocked).length}
                        color="from-red-500 to-red-600"
                    />
                    <StatsCard
                        icon={CheckCircle}
                        label="Active Users"
                        value={users.filter((u) => !u.blocked).length}
                        color="from-green-500 to-green-600"
                    />
                    <StatsCard
                        icon={Flame}
                        label="Avg Streak"
                        value={
                            users.length > 0
                                ? Math.round(
                                    users.reduce((sum, u) => sum + (u.streak || 0), 0) /
                                    users.length
                                )
                                : 0
                        }
                        color="from-orange-500 to-orange-600"
                    />
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 hover:shadow-xl transition-shadow duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search
                                size={20}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        {/* Filter */}
                        <select
                            value={filterBlocked}
                            onChange={(e) => setFilterBlocked(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                        >
                            <option value="all">All Users</option>
                            <option value="active">Active Only</option>
                            <option value="blocked">Blocked Only</option>
                        </select>
                    </div>
                    <p className="text-gray-600 text-sm mt-3">
                        Showing {filteredUsers.length} of {users.length} users
                    </p>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 mb-8">
                    {filteredUsers.length > 0 ? (
                        <div className="overflow-auto rounded-2xl admin-scroll max-h-[600px]">
                            <table className="w-full min-w-[1000px]">
                                <thead className="bg-gradient-to-r from-purple-600 to-purple-700 text-white sticky top-0 z-10">
                                    <tr>
                                        <th className="px-5 py-4 text-left text-sm font-semibold whitespace-nowrap">
                                            Name
                                        </th>
                                        <th className="px-5 py-4 text-left text-sm font-semibold whitespace-nowrap">
                                            Email
                                        </th>
                                        <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">
                                            Sem
                                        </th>
                                        <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">
                                            Streak
                                        </th>
                                        <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">
                                            Best
                                        </th>
                                        <th className="px-5 py-4 text-left text-sm font-semibold whitespace-nowrap">
                                            Last Login
                                        </th>
                                        <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">
                                            Status
                                        </th>
                                        <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user, idx) => (
                                        <tr
                                            key={user._id}
                                            className={`border-b border-gray-100 hover:bg-purple-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                                        >
                                            <td className="px-5 py-2">
                                                <div className="flex items-center gap-2">
                                                    {user.profilePicture ? (
                                                        <img
                                                            src={user.profilePicture.startsWith('http') ? user.profilePicture : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}${user.profilePicture}`}
                                                            alt={user.name}
                                                            className="w-8 h-8 rounded-full object-cover border-2 border-purple-200"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                                                            {user.name?.charAt(0)?.toUpperCase()}
                                                        </div>
                                                    )}
                                                    <span className="font-medium text-gray-900 text-sm">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-2">
                                                <span className="text-gray-600 text-sm">{user.email}</span>
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs">
                                                    {user.semester || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Flame size={12} className="text-orange-500" />
                                                    <span className="text-gray-700 font-medium text-sm">{user.streak || 0}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <span className="text-purple-600 font-bold text-sm">🏆 {user.bestStreak || 0}</span>
                                            </td>
                                            <td className="px-5 py-2">
                                                <div className="flex items-center gap-1 text-gray-500 text-xs">
                                                    <Calendar size={12} />
                                                    {formatDate(user.lastLoginDate)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${user.blocked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${user.blocked ? "bg-red-500" : "bg-green-500"}`}></span>
                                                    {user.blocked ? "Blocked" : "Active"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => setConfirmBlock(user._id)}
                                                        disabled={operationLoading === `block-${user._id}`}
                                                        className={`p-1.5 rounded-lg transition-all ${user.blocked ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"} disabled:opacity-50`}
                                                        title={user.blocked ? "Unblock" : "Block"}
                                                    >
                                                        <Ban size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmDelete(user._id)}
                                                        disabled={operationLoading === `delete-${user._id}`}
                                                        className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all disabled:opacity-50"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Users size={48} className="text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No users found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="bg-red-100 p-3 rounded-lg">
                                <AlertCircle size={24} className="text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Delete User</h2>
                                <p className="text-gray-600 text-sm mt-1">
                                    Are you sure you want to permanently delete this user? This
                                    action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteUser(confirmDelete)}
                                disabled={operationLoading === `delete-${confirmDelete}`}
                                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {operationLoading === `delete-${confirmDelete}`
                                    ? "Deleting..."
                                    : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Block Confirmation Modal */}
            {confirmBlock && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="bg-yellow-100 p-3 rounded-lg">
                                <Ban size={24} className="text-yellow-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {users.find((u) => u._id === confirmBlock)?.blocked
                                        ? "Unblock"
                                        : "Block"}{" "}
                                    User
                                </h2>
                                <p className="text-gray-600 text-sm mt-1">
                                    {users.find((u) => u._id === confirmBlock)?.blocked
                                        ? "Are you sure you want to unblock this user? They will be able to access the platform again."
                                        : "Are you sure you want to block this user? They will not be able to access the platform."}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmBlock(null)}
                                className="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() =>
                                    handleBlockUser(
                                        confirmBlock,
                                        users.find((u) => u._id === confirmBlock)?.blocked
                                    )
                                }
                                disabled={operationLoading === `block-${confirmBlock}`}
                                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-white ${users.find((u) => u._id === confirmBlock)?.blocked
                                        ? "bg-green-600 hover:bg-green-700"
                                        : "bg-yellow-600 hover:bg-yellow-700"
                                    }`}
                            >
                                {operationLoading === `block-${confirmBlock}`
                                    ? "Processing..."
                                    : users.find((u) => u._id === confirmBlock)?.blocked
                                        ? "Unblock"
                                        : "Block"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminUsers;
