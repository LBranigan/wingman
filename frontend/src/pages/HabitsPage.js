import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, Trophy, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { goals as goalsApi } from '../services/api';
import { habitIconMap, availableHabitIcons } from '../components/HabitIcons';

// Karate belt color progression (monthly progression)
const getBeltColor = (monthsActive) => {
  const belts = [
    { name: 'White Belt', bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-600' }, // 0 months
    { name: 'Yellow Belt', bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700' }, // 1 month
    { name: 'Orange Belt', bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700' }, // 2 months
    { name: 'Green Belt', bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700' }, // 3 months
    { name: 'Blue Belt', bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' }, // 4 months
    { name: 'Purple Belt', bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700' }, // 5 months
    { name: 'Brown Belt', bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-800' }, // 6 months
    { name: 'Black Belt', bg: 'bg-gray-900', border: 'border-gray-900', text: 'text-white' }, // 7+ months
  ];

  const index = Math.min(monthsActive, belts.length - 1);
  return belts[index];
};

const calculateMonthsActive = (startDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const diffTime = Math.abs(now - start);
  const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
  return diffMonths;
};

// Icon map is now imported from HabitIcons component

const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const startDay = start.getDate();
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const endDay = end.getDate();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}`;
  } else {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
  }
};

const HabitsPage = () => {
  const [expandedSetId, setExpandedSetId] = useState(null);
  const [archivedSets, setArchivedSets] = useState([]);
  const [habits, setHabits] = useState([]);
  const [showCreateHabit, setShowCreateHabit] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    icon: 'AntiSocialMedia'
  });
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showEditIconPicker, setShowEditIconPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newlyPromoted, setNewlyPromoted] = useState([]);
  const [editingHabit, setEditingHabit] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', startDate: '', icon: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load archived goal sets from localStorage for now
      const savedArchive = localStorage.getItem('archivedGoalSets');
      if (savedArchive) {
        setArchivedSets(JSON.parse(savedArchive));
      }

      // Load habits from localStorage
      const savedHabits = localStorage.getItem('habits');
      if (savedHabits) {
        const habitsData = JSON.parse(savedHabits);
        setHabits(habitsData);

        // Check for newly promoted habits
        const lastVisit = localStorage.getItem('habitsLastVisit');
        const now = new Date().toISOString();

        if (lastVisit) {
          const promoted = habitsData.filter(habit => {
            const lastVisitMonths = calculateMonthsActive(lastVisit);
            const currentMonths = calculateMonthsActive(habit.startDate);
            const lastBelt = getBeltColor(lastVisitMonths);
            const currentBelt = getBeltColor(currentMonths);
            return lastBelt.name !== currentBelt.name;
          });

          if (promoted.length > 0) {
            setNewlyPromoted(promoted.map(h => h.id));
            // Clear after animation
            setTimeout(() => setNewlyPromoted([]), 3000);
          }
        }

        localStorage.setItem('habitsLastVisit', now);
      }
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSet = (setId) => {
    setExpandedSetId(expandedSetId === setId ? null : setId);
  };

  const handleCreateHabit = () => {
    if (!newHabit.name.trim()) {
      toast.error('Please enter a habit name');
      return;
    }

    const habit = {
      id: Date.now().toString(),
      name: newHabit.name.trim(),
      startDate: newHabit.startDate,
      icon: newHabit.icon,
      createdAt: new Date().toISOString()
    };

    const updatedHabits = [...habits, habit];
    setHabits(updatedHabits);
    localStorage.setItem('habits', JSON.stringify(updatedHabits));

    setNewHabit({
      name: '',
      startDate: new Date().toISOString().split('T')[0],
      icon: 'AntiSocialMedia'
    });
    setShowCreateHabit(false);
    toast.success('Habit created! 🎯');
  };

  const handleDeleteHabit = (habitId) => {
    const updatedHabits = habits.filter(h => h.id !== habitId);
    setHabits(updatedHabits);
    localStorage.setItem('habits', JSON.stringify(updatedHabits));
    toast.success('Habit removed');
  };

  const handleEditHabit = (habit) => {
    setEditingHabit(habit.id);
    setEditForm({
      name: habit.name,
      startDate: habit.startDate,
      icon: habit.icon
    });
  };

  const handleSaveEdit = () => {
    if (!editForm.name.trim()) {
      toast.error('Please enter a habit name');
      return;
    }

    const updatedHabits = habits.map(h =>
      h.id === editingHabit
        ? { ...h, name: editForm.name.trim(), startDate: editForm.startDate, icon: editForm.icon }
        : h
    );

    setHabits(updatedHabits);
    localStorage.setItem('habits', JSON.stringify(updatedHabits));
    setEditingHabit(null);
    setEditForm({ name: '', startDate: '', icon: '' });
    setShowEditIconPicker(false);
    toast.success('Habit updated!');
  };

  const handleCancelEdit = () => {
    setEditingHabit(null);
    setEditForm({ name: '', startDate: '', icon: '' });
    setShowEditIconPicker(false);
  };

  return (
    <div className="space-y-6">
      {/* Habit Badges Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Habit Collection</h2>
          <button
            onClick={() => setShowCreateHabit(!showCreateHabit)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
          >
            <Plus size={18} />
            New Habit
          </button>
        </div>

        {/* Create Habit Form */}
        {showCreateHabit && (
          <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Habit Name
                </label>
                <input
                  type="text"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                  placeholder="e.g., Removed social media from phone"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:border-indigo-500 outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={newHabit.startDate}
                  onChange={(e) => setNewHabit({ ...newHabit, startDate: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-white transition"
                  >
                    {React.createElement(habitIconMap[newHabit.icon] || habitIconMap['AntiSocialMedia'], { size: 24 })}
                    <span className="text-sm">
                      {availableHabitIcons.find(i => i.name === newHabit.icon)?.label || newHabit.icon}
                    </span>
                  </button>

                  {showIconPicker && (
                    <div className="absolute z-10 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-xl grid grid-cols-3 gap-3 max-w-sm">
                      {availableHabitIcons.map(({ name, component: Icon, label }) => (
                        <button
                          key={name}
                          onClick={() => {
                            setNewHabit({ ...newHabit, icon: name });
                            setShowIconPicker(false);
                          }}
                          className={`p-3 rounded-lg hover:bg-gray-100 transition flex flex-col items-center gap-2 ${
                            newHabit.icon === name ? 'bg-indigo-100 border-2 border-indigo-500' : 'border-2 border-transparent'
                          }`}
                          title={label}
                        >
                          <Icon size={28} />
                          <span className="text-xs font-medium text-center">{label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreateHabit}
                  className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
                >
                  Create Habit
                </button>
                <button
                  onClick={() => setShowCreateHabit(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Habit Badges Grid */}
        {habits.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Trophy size={48} className="mx-auto mb-4 opacity-30" />
            <p>No habits yet.</p>
            <p className="text-sm mt-2">Create your first habit to start collecting badges!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {habits.map((habit) => {
              const monthsActive = calculateMonthsActive(habit.startDate);
              const beltColor = getBeltColor(monthsActive);
              const IconComponent = habitIconMap[habit.icon] || habitIconMap['AntiSocialMedia'];
              const startDate = new Date(habit.startDate);
              const isActive = startDate <= new Date();
              const isNewlyPromoted = newlyPromoted.includes(habit.id);
              const isEditing = editingHabit === habit.id;

              if (isEditing) {
                return (
                  <div
                    key={habit.id}
                    className={`relative rounded-xl border-2 p-6 ${beltColor.bg} ${beltColor.border}`}
                    style={{ aspectRatio: '1.586 / 1' }}
                  >
                    <div className="space-y-3 h-full flex flex-col">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-indigo-500 outline-none"
                        placeholder="Habit name"
                      />
                      <input
                        type="date"
                        value={editForm.startDate}
                        onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-indigo-500 outline-none"
                      />

                      {/* Icon picker for edit mode */}
                      <div className="relative">
                        <button
                          onClick={() => setShowEditIconPicker(!showEditIconPicker)}
                          className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded text-sm hover:bg-white transition"
                        >
                          {React.createElement(habitIconMap[editForm.icon] || habitIconMap['AntiSocialMedia'], { size: 20 })}
                          <span className="text-xs">
                            {availableHabitIcons.find(i => i.name === editForm.icon)?.label || editForm.icon}
                          </span>
                        </button>

                        {showEditIconPicker && (
                          <div className="absolute z-10 mt-2 p-3 bg-white border border-gray-300 rounded-lg shadow-xl grid grid-cols-3 gap-2 max-w-sm">
                            {availableHabitIcons.map(({ name, component: Icon, label }) => (
                              <button
                                key={name}
                                onClick={() => {
                                  setEditForm({ ...editForm, icon: name });
                                  setShowEditIconPicker(false);
                                }}
                                className={`p-2 rounded-lg hover:bg-gray-100 transition flex flex-col items-center gap-1 ${
                                  editForm.icon === name ? 'bg-indigo-100 border-2 border-indigo-500' : 'border-2 border-transparent'
                                }`}
                                title={label}
                              >
                                <Icon size={20} />
                                <span className="text-xs font-medium text-center leading-tight">{label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex-1"></div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="flex-1 px-3 py-2 bg-black text-white text-sm rounded hover:bg-gray-800"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={habit.id}
                  className={`relative rounded-xl border-2 p-6 transition-all duration-500 ${
                    beltColor.bg
                  } ${beltColor.border} ${
                    isActive ? 'animate-subtle-pulse' : 'opacity-50'
                  }`}
                  style={{
                    aspectRatio: '1.586 / 1', // Credit card ratio
                  }}
                >
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={() => handleEditHabit(habit)}
                      className="p-1 text-gray-400 hover:text-indigo-600 transition"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <div className={`inline-block p-3 rounded-lg ${beltColor.bg} ${beltColor.border} border-2`}>
                        <IconComponent size={36} className={beltColor.text} />
                      </div>
                    </div>

                    <div>
                      <h3 className={`text-lg font-semibold mb-2 ${beltColor.text}`}>
                        {habit.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className={`text-sm ${beltColor.text} opacity-75`}>
                          {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <div className={`text-xs font-bold ${beltColor.text} opacity-90`}>
                          {beltColor.name}
                        </div>
                      </div>
                      {monthsActive > 0 && (
                        <p className={`text-xs ${beltColor.text} opacity-75 mt-1`}>
                          {monthsActive} month{monthsActive !== 1 ? 's' : ''} active
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Archived Goal Sets Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Past Goal Sets</h2>

        {archivedSets.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Calendar size={48} className="mx-auto mb-4 opacity-30" />
            <p>No past goal sets yet.</p>
            <p className="text-sm mt-2">Completed goal sets will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {archivedSets.map((set) => (
              <div key={set.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSet(set.id)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">{set.duration}</p>
                    <p className="text-sm text-gray-500">
                      {formatDateRange(set.startDate, set.endDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                      {set.goals.filter(g => g.completed).length} / {set.goals.length} completed
                    </div>
                    <svg
                      className={`w-5 h-5 transition-transform ${expandedSetId === set.id ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {expandedSetId === set.id && (
                  <div className="px-4 pb-4 pt-2 bg-gray-50">
                    <div className="space-y-2">
                      {set.goals.map((goal) => (
                        <div key={goal.id} className="flex items-start gap-3">
                          <div className={`w-5 h-5 mt-0.5 border-2 rounded flex-shrink-0 flex items-center justify-center ${
                            goal.completed ? 'bg-black border-black text-white' : 'border-gray-300'
                          }`}>
                            {goal.completed && (
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`${goal.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                              {goal.text}
                            </p>
                            {goal.migrated && (
                              <span className="text-xs text-blue-600 italic">Migrated to new set</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitsPage;
