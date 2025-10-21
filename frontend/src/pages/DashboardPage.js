import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { UserPlus, Download, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';
import { goals as goalsApi, goalSets as goalSetsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { DashboardSkeleton } from '../components/SkeletonLoader';

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

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [goalSets, setGoalSets] = useState([]);
  const [creatingNewSet, setCreatingNewSet] = useState(false);
  const [dateRangeStep, setDateRangeStep] = useState('number'); // 'number', 'unit', 'done'
  const [durationNumber, setDurationNumber] = useState(1);
  const [durationUnit, setDurationUnit] = useState('week'); // 'day', 'week', 'month'
  const [newGoals, setNewGoals] = useState(['']);
  const [activeGoalIndex, setActiveGoalIndex] = useState(0);
  const [hoveredGoalId, setHoveredGoalId] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [showExpirationNotice, setShowExpirationNotice] = useState(false);
  const [expiredSet, setExpiredSet] = useState(null);
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [selectedGoalsToMigrate, setSelectedGoalsToMigrate] = useState([]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionSet, setCompletionSet] = useState(null);
  const [editingDurationId, setEditingDurationId] = useState(null);
  const [editingDurationText, setEditingDurationText] = useState('');
  const expiredSetRef = React.useRef(null);

  useEffect(() => {
    loadGoalSets();
  }, []);

  useEffect(() => {
    // Check for expired goal sets
    if (goalSets.length > 0) {
      const activeSet = goalSets.find(set => set.isActive);
      if (activeSet && new Date(activeSet.endDate) < new Date()) {
        setExpiredSet(activeSet);
        setShowExpirationNotice(true);

        // Scroll to expired set after a brief delay
        setTimeout(() => {
          if (expiredSetRef.current) {
            expiredSetRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        }, 300);
      }
    }
  }, [goalSets]);

  const loadGoalSets = async () => {
    try {
      const response = await goalSetsApi.getAll();
      setGoalSets(response.data);

      // Check for active set that has expired
      const activeSet = response.data.find(set => set.isActive && !set.isCompleted);
      if (activeSet && new Date(activeSet.endDate) < new Date()) {
        setCompletionSet(activeSet);
        setShowCompletionModal(true);
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        toast.error('Failed to load goal sets');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNumberChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setDurationNumber(Math.max(1, Math.min(999, value)));
  };

  const handleNumberKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setDurationNumber(prev => Math.min(999, prev + 1));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setDurationNumber(prev => Math.max(1, prev - 1));
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      setDateRangeStep('unit');
    }
  };

  const handleUnitKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const units = ['day', 'week', 'month'];
      const currentIndex = units.indexOf(durationUnit);
      setDurationUnit(units[currentIndex === 0 ? 2 : currentIndex - 1]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const units = ['day', 'week', 'month'];
      const currentIndex = units.indexOf(durationUnit);
      setDurationUnit(units[(currentIndex + 1) % 3]);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      setDateRangeStep('done');
      setActiveGoalIndex(0);
    } else if (e.key.toLowerCase() === 'd') {
      e.preventDefault();
      setDurationUnit('day');
    } else if (e.key.toLowerCase() === 'w') {
      e.preventDefault();
      setDurationUnit('week');
    } else if (e.key.toLowerCase() === 'm') {
      e.preventDefault();
      setDurationUnit('month');
    }
  };

  const handleGoalKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      const newGoalsList = [...newGoals];
      if (index === newGoals.length - 1) {
        // Add new goal line
        newGoalsList.push('');
        setNewGoals(newGoalsList);
        setActiveGoalIndex(index + 1);
      } else {
        setActiveGoalIndex(index + 1);
      }
    } else if (e.key === 'Backspace' && newGoals[index] === '' && newGoals.length > 1) {
      e.preventDefault();
      const newGoalsList = newGoals.filter((_, i) => i !== index);
      setNewGoals(newGoalsList);
      setActiveGoalIndex(Math.max(0, index - 1));
    }
  };

  const handleGoalChange = (index, value) => {
    const newGoalsList = [...newGoals];
    newGoalsList[index] = value;
    setNewGoals(newGoalsList);
  };

  const handleGoalPaste = (e, index) => {
    const pastedText = e.clipboardData.getData('text');

    // Check if pasted text contains multiple lines
    const lines = pastedText.split(/\r?\n/).filter(line => line.trim().length > 0);

    if (lines.length > 1) {
      e.preventDefault(); // Prevent default paste behavior

      // Create a new goals list
      const newGoalsList = [...newGoals];

      // Replace current input with first line
      newGoalsList[index] = lines[0].trim();

      // Insert remaining lines after current index
      for (let i = 1; i < lines.length; i++) {
        newGoalsList.splice(index + i, 0, lines[i].trim());
      }

      // Remove any empty goals except the last one
      const filteredGoals = newGoalsList.filter((g, i) =>
        g.trim().length > 0 || i === newGoalsList.length - 1
      );

      // Ensure there's always an empty goal at the end
      if (filteredGoals[filteredGoals.length - 1].trim().length > 0) {
        filteredGoals.push('');
      }

      setNewGoals(filteredGoals);
      toast.success(`${lines.length} goals pasted! 📋`);

      // Focus on the next empty input
      setTimeout(() => {
        setActiveGoalIndex(index + lines.length);
      }, 0);
    }
  };

  const handleFinishSet = async () => {
    const validGoals = newGoals.filter(g => g.trim().length > 0);

    if (validGoals.length === 0) {
      toast.error('Please add at least one goal');
      return;
    }

    // Check if any goal is too short (less than 5 characters)
    const tooShortGoals = validGoals.filter(g => g.trim().length < 5);
    if (tooShortGoals.length > 0) {
      toast.error('All goals must be at least 5 characters long');
      return;
    }

    try {
      const startDate = new Date();
      const endDate = new Date(Date.now() + calculateDuration());
      const duration = `${durationNumber} ${durationNumber > 1 ? `${durationUnit}s` : durationUnit}`;

      const response = await goalSetsApi.create({
        duration,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        goals: validGoals.map(g => g.trim())
      });

      setGoalSets([response.data, ...goalSets]);
      setCreatingNewSet(false);
      setNewGoals(['']);
      setDateRangeStep('number');
      setDurationNumber(1);
      setDurationUnit('week');
      toast.success(`Goal set created with ${validGoals.length} goal${validGoals.length > 1 ? 's' : ''}! 🎯`);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create goal set';
      toast.error(errorMessage);
    }
  };

  const calculateDuration = () => {
    if (durationUnit === 'day') {
      return durationNumber * 24 * 60 * 60 * 1000;
    } else if (durationUnit === 'week') {
      return durationNumber * 7 * 24 * 60 * 60 * 1000;
    } else if (durationUnit === 'month') {
      // For months, calculate based on actual month length
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + durationNumber);
      return endDate.getTime() - Date.now();
    }
    // Default to weeks if somehow unit is invalid
    return durationNumber * 7 * 24 * 60 * 60 * 1000;
  };

  const handleToggleGoal = async (goalId, setId) => {
    try {
      const response = await goalsApi.toggle(goalId);
      setGoalSets(goalSets.map(set => {
        if (set.id === setId) {
          return {
            ...set,
            goals: set.goals.map(g => g.id === goalId ? response.data : g)
          };
        }
        return set;
      }));

      if (response.data.completed) {
        toast.success('Goal completed! 🎉');
        fireConfetti();
      }
    } catch (err) {
      toast.error('Failed to update goal');
    }
  };

  const handleSaveNote = async (goalId, setId) => {
    if (!noteText.trim()) {
      setEditingNoteId(null);
      return;
    }

    // For now, we'll store notes in the goal object (would need backend support)
    setGoalSets(goalSets.map(set => {
      if (set.id === setId) {
        return {
          ...set,
          goals: set.goals.map(g => {
            if (g.id === goalId) {
              return { ...g, note: noteText.trim() };
            }
            return g;
          })
        };
      }
      return set;
    }));

    setEditingNoteId(null);
    setNoteText('');
    toast.success('Note added');
  };

  const fireConfetti = () => {
    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        spread: 26,
        startVelocity: 55,
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  const handleStartCreatingSet = (withMigration = false) => {
    if (withMigration && expiredSet) {
      setShowMigrationModal(true);
      // Pre-select incomplete goals
      const incompleteGoals = expiredSet.goals.filter(g => !g.completed).map(g => g.id);
      setSelectedGoalsToMigrate(incompleteGoals);
    } else {
      setCreatingNewSet(true);
      setDateRangeStep('number');
    }
  };

  const handleToggleMigrationGoal = (goalId) => {
    setSelectedGoalsToMigrate(prev => {
      if (prev.includes(goalId)) {
        return prev.filter(id => id !== goalId);
      } else {
        return [...prev, goalId];
      }
    });
  };

  const handleConfirmMigration = () => {
    // Get the selected goals to migrate
    const sourceSet = completionSet || expiredSet;
    const goalsToMigrate = sourceSet.goals.filter(g => selectedGoalsToMigrate.includes(g.id));
    const migratedGoalTexts = goalsToMigrate.map(g => g.text);

    // Set them as the initial goals for the new set
    setNewGoals([...migratedGoalTexts, '']);
    setShowMigrationModal(false);
    setShowExpirationNotice(false);
    setShowCompletionModal(false);
    setCreatingNewSet(true);
    setDateRangeStep('number');
    toast.success(`Migrating ${goalsToMigrate.length} goal${goalsToMigrate.length > 1 ? 's' : ''} to new set`);
  };

  const handleSkipMigration = () => {
    setShowMigrationModal(false);
    setShowExpirationNotice(false);
    setCreatingNewSet(true);
    setDateRangeStep('number');
  };

  const handleDismissExpiration = () => {
    setShowExpirationNotice(false);

    // Archive the expired set
    const updatedGoalSets = goalSets.map(set => {
      if (set.id === expiredSet.id) {
        return { ...set, isActive: false, archived: true };
      }
      return set;
    });
    setGoalSets(updatedGoalSets);

    // Save to archived sets in localStorage
    const archivedSet = { ...expiredSet, isActive: false, archived: true };
    const existingArchive = JSON.parse(localStorage.getItem('archivedGoalSets') || '[]');
    localStorage.setItem('archivedGoalSets', JSON.stringify([archivedSet, ...existingArchive]));
  };

  const handleCompleteGoalSet = async () => {
    if (!completionSet) return;

    try {
      await goalSetsApi.complete(completionSet.id);

      // Check if there are incomplete goals to migrate
      const incompleteGoals = completionSet.goals.filter(g => !g.completed);

      if (incompleteGoals.length > 0) {
        setSelectedGoalsToMigrate(incompleteGoals.map(g => g.id));
        setShowCompletionModal(false);
        setShowMigrationModal(true);
      } else {
        setShowCompletionModal(false);
        toast.success('Goal set completed! 🎉');
        await loadGoalSets();
      }
    } catch (err) {
      toast.error('Failed to complete goal set');
    }
  };

  const handleDeleteGoalSet = async (goalSetId, goalSetDuration) => {
    if (!window.confirm(`Are you sure you want to delete "${goalSetDuration}"? This cannot be undone.`)) {
      return;
    }

    try {
      await goalSetsApi.delete(goalSetId);
      toast.success('Goal set deleted');
      await loadGoalSets();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete goal set');
    }
  };

  const handleUpdateDuration = async (goalSetId) => {
    if (!editingDurationText.trim()) {
      toast.error('Duration name cannot be empty');
      return;
    }

    try {
      await goalSetsApi.updateDuration(goalSetId, editingDurationText.trim());
      toast.success('Duration name updated');
      setEditingDurationId(null);
      setEditingDurationText('');
      await loadGoalSets();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update duration');
    }
  };

  const handleExportToPDF = (goalSet) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const usableHeight = pageHeight - (2 * margin);
    const goalCount = goalSet.goals.length;

    // Calculate spacing to fill the page
    const spacePerGoal = usableHeight / goalCount;
    const checkboxSize = 6;

    // Title
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Goal Set', margin, margin);

    // Duration info
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`${goalSet.duration} • ${formatDateRange(goalSet.startDate, goalSet.endDate)}`, margin, margin + 8);

    // Goals
    goalSet.goals.forEach((goal, index) => {
      const yPosition = margin + 20 + (index * spacePerGoal);

      // Checkbox
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.rect(margin, yPosition, checkboxSize, checkboxSize);
      if (goal.completed) {
        doc.text('✓', margin + 1, yPosition + 5);
      }

      // Goal text with word wrapping
      const textX = margin + checkboxSize + 5;
      const maxWidth = pageWidth - textX - margin;
      const lines = doc.splitTextToSize(goal.text, maxWidth);
      doc.text(lines, textX, yPosition + 5);

      // Add note if it exists (smaller, grey, italicized)
      if (goal.note) {
        const noteY = yPosition + 5 + (lines.length * 5); // Position below goal text
        doc.setFontSize(9);
        doc.setFont(undefined, 'italic');
        doc.setTextColor(128, 128, 128); // Grey color
        const noteLines = doc.splitTextToSize(`Note: ${goal.note}`, maxWidth);
        doc.text(noteLines, textX, noteY);
        doc.setTextColor(0, 0, 0); // Reset to black
      }
    });

    // Save the PDF
    doc.save(`goal-set-${goalSet.duration.replace(/\s+/g, '-')}.pdf`);
    toast.success('PDF exported successfully! 📄');
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Reach Out to a Friend - Prominent CTA */}
      {!user?.partner && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <UserPlus size={24} />
                Find Your Accountability Partner
              </h3>
              <p className="text-indigo-100">
                Invite a friend or match with someone who shares your goals
              </p>
            </div>
            <button
              onClick={() => navigate('/partner')}
              className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-bold hover:bg-indigo-50 transition whitespace-nowrap shadow-md"
            >
              Reach Out to a Friend
            </button>
          </div>
        </div>
      )}

      {/* Expiration Notice */}
      {showExpirationNotice && expiredSet && (
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Goal Set Expired</h3>
          <p className="text-gray-700 mb-4">
            Your goal set "{expiredSet.duration}" has ended. Would you like to create a new goal set?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => handleStartCreatingSet(true)}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
            >
              Create New Set (with migration)
            </button>
            <button
              onClick={() => handleStartCreatingSet(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
            >
              Create New Set
            </button>
            <button
              onClick={handleDismissExpiration}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Goal Set Completion Modal */}
      {showCompletionModal && completionSet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">🎉 Goal Set Complete!</h2>
            <p className="text-gray-600 mb-6">
              Your "{completionSet.duration}" goal set has ended. Review your goals and mark which ones you completed:
            </p>

            <div className="space-y-3 mb-8">
              {completionSet.goals.map((goal) => (
                <div
                  key={goal.id}
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg transition ${
                    goal.completed ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <button
                    onClick={async () => {
                      try {
                        await goalsApi.toggle(goal.id);
                        // Update local state
                        setCompletionSet({
                          ...completionSet,
                          goals: completionSet.goals.map(g =>
                            g.id === goal.id ? { ...g, completed: !g.completed } : g
                          )
                        });
                      } catch (err) {
                        toast.error('Failed to update goal');
                      }
                    }}
                    className={`w-6 h-6 mt-1 border-2 rounded flex-shrink-0 flex items-center justify-center transition ${
                      goal.completed
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {goal.completed && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`text-lg ${goal.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {goal.text}
                    </p>
                    {goal.completed && (
                      <span className="text-sm text-green-600 font-medium">✓ Completed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                <strong>What's next?</strong> After completing this review, you'll be able to migrate any incomplete goals to a new goal set.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCompletionModal(false)}
                className="px-6 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
              <button
                onClick={handleCompleteGoalSet}
                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition font-semibold"
              >
                Finish Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Migration Modal */}
      {showMigrationModal && (completionSet || expiredSet) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Migrate Goals</h3>
            <p className="text-gray-600 mb-6">
              Select which goals you'd like to carry over to your new goal set:
            </p>

            <div className="space-y-3 mb-6">
              {(completionSet || expiredSet).goals.map((goal) => (
                <div key={goal.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded">
                  <input
                    type="checkbox"
                    checked={selectedGoalsToMigrate.includes(goal.id)}
                    onChange={() => handleToggleMigrationGoal(goal.id)}
                    className="mt-1 w-5 h-5"
                  />
                  <div className="flex-1">
                    <p className={`${goal.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {goal.text}
                    </p>
                    {goal.completed && (
                      <span className="text-xs text-green-600">Completed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleSkipMigration}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Skip Migration
              </button>
              <button
                onClick={handleConfirmMigration}
                className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
                disabled={selectedGoalsToMigrate.length === 0}
              >
                Migrate {selectedGoalsToMigrate.length} Goals
              </button>
            </div>
          </div>
        </div>
      )}

      {!creatingNewSet && goalSets.length === 0 && (
        <div
          className="bg-white rounded-xl shadow-sm p-12 cursor-pointer hover:bg-gray-50 transition"
          onClick={handleStartCreatingSet}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Enter Goal Set</h2>
          <p className="text-gray-500">Click anywhere to start</p>
        </div>
      )}

      {creatingNewSet && (
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Enter Goal Set</h2>

          {dateRangeStep === 'number' && (
            <div className="mb-6">
              <p className="text-gray-600 mb-3">Set duration for this goal set:</p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={durationNumber}
                  onChange={handleNumberChange}
                  onKeyDown={handleNumberKeyDown}
                  onFocus={(e) => e.target.select()}
                  className="w-24 px-4 py-2 text-2xl font-bold border-b-2 border-gray-300 focus:border-indigo-600 outline-none text-center"
                  autoFocus
                  min="1"
                  max="999"
                />
                <span className="text-xl text-gray-600">{durationNumber > 1 ? `${durationUnit}s` : durationUnit}</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Press Enter or Tab to continue, or use arrow keys to adjust</p>
            </div>
          )}

          {dateRangeStep === 'unit' && (
            <div className="mb-6">
              <p className="text-gray-600 mb-3">Duration: {durationNumber}</p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={durationUnit}
                  onChange={(e) => setDurationUnit(e.target.value)}
                  onKeyDown={handleUnitKeyDown}
                  className="px-4 py-2 text-2xl font-bold border-b-2 border-gray-300 focus:border-indigo-600 outline-none"
                  autoFocus
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Type D/W/M or use arrow keys to select • Press Enter or Tab to continue
              </p>
            </div>
          )}

          {dateRangeStep === 'done' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Duration: {durationNumber} {durationNumber > 1 ? `${durationUnit}s` : durationUnit}
              </p>

              {newGoals.map((goal, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 mt-2 border-2 border-gray-300 rounded flex-shrink-0"></div>
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => handleGoalChange(index, e.target.value)}
                    onKeyDown={(e) => handleGoalKeyDown(e, index)}
                    onPaste={(e) => handleGoalPaste(e, index)}
                    className="flex-1 py-2 px-0 text-lg border-b border-gray-200 focus:border-gray-400 outline-none"
                    placeholder="Enter a goal and press Enter, or paste multiple lines..."
                    autoFocus={index === activeGoalIndex}
                  />
                </div>
              ))}

              <button
                onClick={handleFinishSet}
                className="mt-6 px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
              >
                Finish
              </button>
            </div>
          )}
        </div>
      )}

      {goalSets.map((set) => (
        <div
          key={set.id}
          ref={set.id === expiredSet?.id ? expiredSetRef : null}
          className={`bg-white rounded-xl p-6 border-2 transition-all ${
            set.id === expiredSet?.id && showExpirationNotice
              ? 'border-yellow-400 shadow-xl ring-4 ring-yellow-200'
              : set.isActive
              ? 'border-gray-200 shadow-md'
              : 'border-gray-200 shadow-sm'
          }`}
          style={{
            animation: 'fadeIn 0.3s ease-in',
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-500 flex items-center gap-2">
              {editingDurationId === set.id ? (
                <input
                  type="text"
                  value={editingDurationText}
                  onChange={(e) => setEditingDurationText(e.target.value)}
                  onBlur={() => handleUpdateDuration(set.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUpdateDuration(set.id);
                    } else if (e.key === 'Escape') {
                      setEditingDurationId(null);
                      setEditingDurationText('');
                    }
                  }}
                  autoFocus
                  className="px-2 py-1 border border-indigo-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  style={{ width: '120px' }}
                />
              ) : (
                <span
                  onMouseEnter={(e) => e.currentTarget.classList.add('cursor-pointer', 'text-indigo-600')}
                  onMouseLeave={(e) => e.currentTarget.classList.remove('cursor-pointer', 'text-indigo-600')}
                  onClick={() => {
                    setEditingDurationId(set.id);
                    setEditingDurationText(set.duration);
                  }}
                  className="transition-colors"
                  title="Click to edit duration name"
                >
                  {set.duration}
                </span>
              )}
              <span>•</span>
              <span>{formatDateRange(set.startDate, set.endDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportToPDF(set)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
              >
                <Download size={16} />
                Export PDF
              </button>
              <button
                onClick={() => handleDeleteGoalSet(set.id, set.duration)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {set.goals.map((goal) => (
              <div
                key={goal.id}
                className="relative group"
                onMouseEnter={() => setHoveredGoalId(goal.id)}
                onMouseLeave={() => setHoveredGoalId(null)}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleGoal(goal.id, set.id)}
                    className={`w-6 h-6 mt-1 border-2 rounded flex-shrink-0 flex items-center justify-center transition ${
                      goal.completed
                        ? 'bg-black border-black text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {goal.completed && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 justify-between">
                      <div className="flex items-start gap-2 flex-1">
                        <p className={`text-lg ${goal.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {goal.text}
                        </p>

                        {hoveredGoalId === goal.id && !editingNoteId && (
                          <button
                            onClick={() => {
                              setEditingNoteId(goal.id);
                              setNoteText(goal.note || '');
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700 whitespace-nowrap flex-shrink-0 mt-1"
                          >
                            + add note
                          </button>
                        )}
                      </div>

                      {hoveredGoalId === goal.id && !editingNoteId && (
                        <button
                          onClick={async () => {
                            if (window.confirm('Delete this goal?')) {
                              try {
                                await goalsApi.delete(goal.id);
                                // Update local state
                                setGoalSets(goalSets.map(gs => {
                                  if (gs.id === set.id) {
                                    return {
                                      ...gs,
                                      goals: gs.goals.filter(g => g.id !== goal.id)
                                    };
                                  }
                                  return gs;
                                }));
                                toast.success('Goal deleted');
                              } catch (err) {
                                toast.error('Failed to delete goal');
                              }
                            }
                          }}
                          className="text-red-500 hover:text-red-700 flex-shrink-0"
                          title="Delete goal"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    {goal.note && (
                      <p className="text-sm text-gray-500 mt-1 italic">Note: {goal.note}</p>
                    )}

                    {editingNoteId === goal.id && (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveNote(goal.id, set.id);
                            if (e.key === 'Escape') setEditingNoteId(null);
                          }}
                          placeholder="Add a note..."
                          className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:border-indigo-500 outline-none"
                          autoFocus
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {!creatingNewSet && goalSets.length > 0 && (
        <button
          onClick={handleStartCreatingSet}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-gray-400 hover:text-gray-600 transition"
        >
          + Create New Goal Set
        </button>
      )}
    </div>
  );
};

export default DashboardPage;
