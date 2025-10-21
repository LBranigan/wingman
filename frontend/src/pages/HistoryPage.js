import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, CheckCircle2, Circle, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { goals as goalsApi } from '../services/api';
import { CardSkeleton } from '../components/SkeletonLoader';

const HistoryPage = () => {
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    loadHistory();
  }, [currentPage, searchTerm, statusFilter]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await goalsApi.getHistory({
        page: currentPage,
        limit: 20,
        search: searchTerm,
        status: statusFilter
      });
      setWeeks(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      toast.error('Failed to load goal history');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  const formatDateRange = (weekStart, weekEnd) => {
    const start = new Date(weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = new Date(weekEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${start} - ${end}`;
  };

  const getWeekCompletion = (goals) => {
    if (goals.length === 0) return 0;
    const completed = goals.filter(g => g.completed).length;
    return Math.round((completed / goals.length) * 100);
  };

  if (loading && weeks.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <CardSkeleton key={i} lines={5} />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Goal History</h1>
        <p className="text-gray-600">
          View and search through all your past goals
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search goals..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              aria-label="Search goals"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-lg font-medium transition min-h-[44px] ${
                statusFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-label="Show all goals"
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition min-h-[44px] flex items-center gap-2 ${
                statusFilter === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-label="Show completed goals"
            >
              <CheckCircle2 size={18} aria-hidden="true" />
              <span>Completed</span>
            </button>
            <button
              onClick={() => handleFilterChange('incomplete')}
              className={`px-4 py-2 rounded-lg font-medium transition min-h-[44px] flex items-center gap-2 ${
                statusFilter === 'incomplete'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-label="Show incomplete goals"
            >
              <Circle size={18} aria-hidden="true" />
              <span>Incomplete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <CardSkeleton key={i} lines={5} />)}
        </div>
      ) : weeks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Calendar size={48} className="mx-auto mb-3 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No goals found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search or filters' : 'Start creating goals to see your history'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {weeks.map((week) => {
              const completion = getWeekCompletion(week.goals);

              return (
                <div key={week.weekStart} className="bg-white rounded-xl shadow-sm p-6">
                  {/* Week Header */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <Calendar size={20} className="text-indigo-600" aria-hidden="true" />
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {formatDateRange(week.weekStart, week.weekEnd)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {week.goals.length} {week.goals.length === 1 ? 'goal' : 'goals'}
                        </p>
                      </div>
                    </div>

                    {/* Completion Badge */}
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      completion === 100
                        ? 'bg-green-100 text-green-800'
                        : completion >= 50
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {completion}% Complete
                    </div>
                  </div>

                  {/* Goals List */}
                  <div className="space-y-2">
                    {week.goals.map((goal) => (
                      <div
                        key={goal.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
                      >
                        {goal.completed ? (
                          <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                        ) : (
                          <Circle size={20} className="text-gray-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                        )}
                        <div className="flex-1">
                          <p className={`${goal.completed ? 'text-gray-600 line-through' : 'text-gray-800'}`}>
                            {goal.text}
                          </p>
                          {goal.comments.length > 0 && (
                            <p className="text-sm text-gray-500 mt-1">
                              {goal.comments.length} {goal.comments.length === 1 ? 'comment' : 'comments'}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total goals)
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 rounded-lg font-medium transition min-h-[44px] flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={18} aria-hidden="true" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={pagination.page === pagination.pages}
                    className="px-4 py-2 rounded-lg font-medium transition min-h-[44px] flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next page"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HistoryPage;
