import React, { useState } from 'react';
import { useGetAllActivities } from '../../store/tanstackStore/services/queries';
import {
    Activity,
    Search,
    User,
    Calendar,
    Clock,
    Tag,
    Info,
    RefreshCcw,
    FileText,
    Database,
    ShieldAlert
} from 'lucide-react';
import moment from 'moment';

const ActivityLogs = () => {
    const { data, isLoading, isError, refetch } = useGetAllActivities();
    const [searchTerm, setSearchTerm] = useState('');

    const activities = data?.activities || [];

    const filteredActivities = activities.filter(activity =>
        (activity.action?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (activity.entityType?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (activity.user?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (activity.user?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const getActionColor = (action) => {
        const a = action.toLowerCase();
        if (a.includes('create') || a.includes('add')) return 'text-emerald-500 bg-emerald-50';
        if (a.includes('update') || a.includes('edit')) return 'text-amber-500 bg-amber-50';
        if (a.includes('delete') || a.includes('remove')) return 'text-rose-500 bg-rose-50';
        if (a.includes('login')) return 'text-sky-500 bg-sky-50';
        return 'text-slate-500 bg-slate-50';
    };

    const getEntityIcon = (type) => {
        const t = type.toLowerCase();
        if (t.includes('student')) return <User className="w-4 h-4" />;
        if (t.includes('book') || t.includes('thesis')) return <FileText className="w-4 h-4" />;
        if (t.includes('proposal')) return <FileText className="w-4 h-4" />;
        if (t.includes('user')) return <ShieldAlert className="w-4 h-4" />;
        return <Database className="w-4 h-4" />;
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Activity className="text-indigo-600" />
                        System Activity Logs
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Track all administrative actions and system events across the platform.
                    </p>
                </div>
                <button
                    onClick={() => refetch()}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
                >
                    <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Stats/Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Actions</p>
                        <p className="text-2xl font-bold text-slate-800">{activities.length}</p>
                    </div>
                </div>

                <div className="md:col-span-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by action, user, or entity (e.g., 'Student', 'Update')..."
                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm sm:text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Entity</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-28"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredActivities.length > 0 ? (
                                filteredActivities.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-slate-700">
                                                    {moment(log.timestamp).format('MMM DD, YYYY')}
                                                </span>
                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {moment(log.timestamp).format('hh:mm A')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 uppercase font-bold text-xs">
                                                    {log.user?.name?.charAt(0) || 'U'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-slate-800">{log.user?.name || 'System'}</span>
                                                    <span className="text-xs text-slate-400">{log.user?.email || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-tight ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <span className="p-1 rounded bg-slate-100 text-slate-500">
                                                    {getEntityIcon(log.entityType)}
                                                </span>
                                                {log.entityType}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="max-w-xs text-sm text-slate-500 line-clamp-1 group-hover:line-clamp-none transition-all cursor-help">
                                                {log.details || 'No additional details'}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3 grayscale opacity-30">
                                            <Activity className="w-12 h-12" />
                                            <p className="text-slate-500 font-medium">No activity logs found matching your search.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {!isLoading && filteredActivities.length > 0 && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                            Showing {filteredActivities.length} of {activities.length} total logs
                        </p>
                        <div className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-indigo-500" />
                            <span className="text-xs text-slate-500 italic">Logs are automatically captured for all critical system changes.</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLogs;
