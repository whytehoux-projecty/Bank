'use client';

import ProtectedRoute from '@/components/layout/ProtectedRoute';
import AdminHeader from '@/components/layout/AdminHeader';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API } from '@/lib/api';
import { AdminStats } from '@/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    users: 0,
    pendingApplications: 0,
    activeContracts: 0,
    activeLoans: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, appsRes] = await Promise.all([
          API.request('/admin/stats', { auth: true }),
          API.request('/admin/applications', { auth: true })
        ]);

        if (statsRes?.data) {
          setStats(statsRes.data);
        }

        if (appsRes?.data) {
          setRecentApplications(appsRes.data.slice(0, 5));
        }

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Mock Data for Charts (To be replaced with real API data later)
  const staffGrowthData = [
    { name: 'Jan', count: 120 },
    { name: 'Feb', count: 125 },
    { name: 'Mar', count: 132 },
    { name: 'Apr', count: 140 },
    { name: 'May', count: 145 },
    { name: 'Jun', count: 155 },
  ];

  const applicationStatusData = [
    { name: 'Approved', value: 65, color: '#10B981' },
    { name: 'Pending', value: stats.pendingApplications || 15, color: '#F59E0B' },
    { name: 'Rejected', value: 12, color: '#EF4444' },
  ];

  const payrollData = [
    { name: 'Jan', amount: 45000 },
    { name: 'Feb', amount: 46500 },
    { name: 'Mar', amount: 46000 },
    { name: 'Apr', amount: 48000 },
    { name: 'May', amount: 49500 },
    { name: 'Jun', amount: 52000 },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AdminHeader />

        <main className="flex-1 lg:ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <header className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
              <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Staff"
                value={loading ? '...' : stats.users}
                icon="👥"
                color="bg-blue-500"
                trend="+2.5%"
              />
              <StatCard
                title="Pending Applications"
                value={loading ? '...' : stats.pendingApplications}
                icon="📄"
                color="bg-orange-500"
                trend={`${stats.pendingApplications} require attention`}
                trendColor="text-orange-600"
              />
              <StatCard
                title="Active Contracts"
                value={loading ? '...' : stats.activeContracts}
                icon="📑"
                color="bg-green-500"
                trend="Compliance Rate"
                trendColor="text-green-600"
              />
              <StatCard
                title="Active Loans"
                value={loading ? '...' : stats.activeLoans}
                icon="💳"
                color="bg-purple-500"
                trend="Outstanding"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Staff Growth Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Staff Growth Trend</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={staffGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="count" stroke="#3B82F6" fill="#EFF6FF" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Application Status Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Application Status</h3>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={applicationStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {applicationStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Applications</h3>
                <div className="space-y-4">
                  {recentApplications.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No recent applications.</p>
                  ) : (
                    recentApplications.map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {app.user?.first_name?.[0] || 'U'}
                            {app.user?.last_name?.[0] || ''}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {app.user?.first_name} {app.user?.last_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {app.type.charAt(0).toUpperCase() + app.type.slice(1)} Request • {new Date(app.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          app.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                <button className="w-full mt-4 text-center text-sm text-[var(--primary-color)] hover:underline font-medium">
                  View All Applications
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button className="p-4 border border-gray-200 rounded-lg hover:border-[var(--primary-color)] hover:bg-blue-50 transition-all text-left group">
                    <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">👤</span>
                    <span className="font-medium text-gray-900">Add New Staff</span>
                  </button>
                  <button className="p-4 border border-gray-200 rounded-lg hover:border-[var(--primary-color)] hover:bg-blue-50 transition-all text-left group">
                    <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">📢</span>
                    <span className="font-medium text-gray-900">Post Announcement</span>
                  </button>
                  <button className="p-4 border border-gray-200 rounded-lg hover:border-[var(--primary-color)] hover:bg-blue-50 transition-all text-left group">
                    <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">💰</span>
                    <span className="font-medium text-gray-900">Run Payroll</span>
                  </button>
                  <button className="p-4 border border-gray-200 rounded-lg hover:border-[var(--primary-color)] hover:bg-blue-50 transition-all text-left group">
                    <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">📊</span>
                    <span className="font-medium text-gray-900">Generate Reports</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

function StatCard({ title, value, icon, color, trend, trendColor = 'text-gray-500' }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 transition-transform hover:scale-[1.02]">
      <div className="flex items-center justify-between mb-4">
        <div className={`h-12 w-12 rounded-lg ${color} bg-opacity-10 flex items-center justify-center text-2xl`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trendColor} bg-gray-50 px-2 py-1 rounded-full`}>
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-500">{title}</p>
    </div>
  );
}
