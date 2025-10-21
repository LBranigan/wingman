import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target, Award, Calendar, Flame } from 'lucide-react';
import toast from 'react-hot-toast';
import { goals as goalsApi } from '../services/api';
import { CardSkeleton } from '../components/SkeletonLoader';

const StatisticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const response = await goalsApi.getStatistics();
      setStats(response.data);
    } catch (err) {
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton lines={3} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <CardSkeleton key={i} lines={3} />)}
        </div>
        <CardSkeleton lines={10} />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <TrendingUp size={48} className="mx-auto mb-3 text-gray-400" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No statistics available</h3>
        <p className="text-gray-600">Start creating and completing goals to see your stats!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Statistics</h1>
        <p className="text-gray-600">
          Track your progress and celebrate your achievements
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Goals */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Target size={24} aria-hidden="true" />
            <div className="text-3xl font-bold">{stats.totalGoals}</div>
          </div>
          <p className="text-indigo-100">Total Goals</p>
        </div>

        {/* Completion Rate */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Award size={24} aria-hidden="true" />
            <div className="text-3xl font-bold">{stats.completionRate}%</div>
          </div>
          <p className="text-green-100">Completion Rate</p>
        </div>

        {/* Current Streak */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Flame size={24} aria-hidden="true" />
            <div className="text-3xl font-bold">{stats.currentStreak}</div>
          </div>
          <p className="text-orange-100">Week Streak</p>
        </div>

        {/* Total Weeks */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Calendar size={24} aria-hidden="true" />
            <div className="text-3xl font-bold">{stats.totalWeeks}</div>
          </div>
          <p className="text-purple-100">Active Weeks</p>
        </div>
      </div>

      {/* Best Week */}
      {stats.bestWeek && stats.bestWeek.total > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="text-yellow-500" size={24} aria-hidden="true" />
            Best Week
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-800">{stats.bestWeek.total}</p>
              <p className="text-sm text-gray-600">Goals Set</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{stats.bestWeek.completed}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <p className="text-2xl font-bold text-indigo-600">{stats.bestWeek.rate}%</p>
              <p className="text-sm text-gray-600">Success Rate</p>
            </div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-4">
            Week of {new Date(stats.bestWeek.weekStart).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      )}

      {/* Weekly Progress Chart */}
      {stats.weeklyData && stats.weeklyData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Weekly Progress</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="total" fill="#6366f1" name="Total Goals" radius={[8, 8, 0, 0]} />
              <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Completion Rate Trend */}
      {stats.weeklyData && stats.weeklyData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Completion Rate Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value) => `${value}%`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#6366f1"
                strokeWidth={3}
                name="Completion Rate"
                dot={{ fill: '#6366f1', r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Summary Insights */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm p-6 border border-indigo-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Insights</h2>
        <div className="space-y-3">
          {stats.completionRate >= 80 && (
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2" aria-hidden="true" />
              <p className="text-gray-700">
                Excellent! You're maintaining an {stats.completionRate}% completion rate. Keep up the amazing work!
              </p>
            </div>
          )}
          {stats.completionRate < 80 && stats.completionRate >= 50 && (
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" aria-hidden="true" />
              <p className="text-gray-700">
                You're doing well with a {stats.completionRate}% completion rate. Try setting more achievable goals to boost your success!
              </p>
            </div>
          )}
          {stats.completionRate < 50 && stats.totalGoals > 0 && (
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" aria-hidden="true" />
              <p className="text-gray-700">
                Your completion rate is {stats.completionRate}%. Consider setting fewer, more focused goals each week.
              </p>
            </div>
          )}
          {stats.currentStreak > 0 && (
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" aria-hidden="true" />
              <p className="text-gray-700">
                You're on a {stats.currentStreak} week streak of completing all goals! 🔥
              </p>
            </div>
          )}
          {stats.totalGoals >= 50 && (
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2" aria-hidden="true" />
              <p className="text-gray-700">
                Impressive! You've set {stats.totalGoals} goals. Your dedication is inspiring!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
