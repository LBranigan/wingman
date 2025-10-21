const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();
const prisma = new PrismaClient();

// Get current week's goals
router.get('/current-week', authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    const goals = await prisma.goal.findMany({
      where: {
        userId: req.userId,
        weekStart: {
          gte: weekStart,
          lt: weekEnd
        }
      },
      include: {
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    
    res.json(goals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get partner's current week goals
router.get('/partner/current-week', authMiddleware, async (req, res) => {
  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId }
    });
    
    if (!currentUser.partnerId) {
      return res.status(400).json({ error: 'No partner assigned' });
    }
    
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    const goals = await prisma.goal.findMany({
      where: {
        userId: currentUser.partnerId,
        weekStart: {
          gte: weekStart,
          lt: weekEnd
        }
      },
      include: {
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    
    res.json(goals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a goal
router.post('/', authMiddleware, validate('createGoal'), async (req, res) => {
  try {
    const { text } = req.body;

    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const goal = await prisma.goal.create({
      data: {
        text,
        userId: req.userId,
        weekStart,
        weekEnd
      }
    });

    res.status(201).json(goal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create multiple goals at once (bulk create)
router.post('/bulk', authMiddleware, validate('bulkCreateGoals'), async (req, res) => {
  try {
    const { goals } = req.body;

    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // Create all goals in a single transaction
    const createdGoals = await prisma.$transaction(
      goals.map((text) =>
        prisma.goal.create({
          data: {
            text: text.trim(),
            userId: req.userId,
            weekStart,
            weekEnd
          }
        })
      )
    );

    res.status(201).json(createdGoals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle goal completion
router.patch('/:goalId/toggle', authMiddleware, async (req, res) => {
  try {
    const { goalId } = req.params;
    
    const goal = await prisma.goal.findUnique({
      where: { id: goalId }
    });
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    if (goal.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: { completed: !goal.completed }
    });
    
    res.json(updatedGoal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a goal
router.put('/:goalId', authMiddleware, validate('updateGoal'), async (req, res) => {
  try {
    const { goalId } = req.params;
    const { text } = req.body;

    const goal = await prisma.goal.findUnique({
      where: { id: goalId }
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    if (goal.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: { text: text.trim() }
    });

    res.json(updatedGoal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a goal
router.delete('/:goalId', authMiddleware, async (req, res) => {
  try {
    const { goalId } = req.params;

    const goal = await prisma.goal.findUnique({
      where: { id: goalId }
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    if (goal.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.goal.delete({
      where: { id: goalId }
    });

    res.json({ message: 'Goal deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get goal history with pagination and filtering
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = 'all' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {
      userId: req.userId,
    };

    // Add search filter
    if (search) {
      where.text = {
        contains: search,
        mode: 'insensitive'
      };
    }

    // Add status filter
    if (status === 'completed') {
      where.completed = true;
    } else if (status === 'incomplete') {
      where.completed = false;
    }

    // Get goals with pagination
    const [goals, total] = await Promise.all([
      prisma.goal.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: [
          { weekStart: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      }),
      prisma.goal.count({ where })
    ]);

    // Group goals by week
    const goalsByWeek = goals.reduce((acc, goal) => {
      const weekKey = goal.weekStart.toISOString().split('T')[0];
      if (!acc[weekKey]) {
        acc[weekKey] = {
          weekStart: goal.weekStart,
          weekEnd: goal.weekEnd,
          goals: []
        };
      }
      acc[weekKey].goals.push(goal);
      return acc;
    }, {});

    res.json({
      data: Object.values(goalsByWeek),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user statistics
router.get('/statistics', authMiddleware, async (req, res) => {
  try {
    const allGoals = await prisma.goal.findMany({
      where: { userId: req.userId },
      orderBy: { weekStart: 'desc' }
    });

    // Calculate statistics
    const totalGoals = allGoals.length;
    const completedGoals = allGoals.filter(g => g.completed).length;
    const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

    // Calculate current streak
    let currentStreak = 0;
    const weeklyData = {};

    allGoals.forEach(goal => {
      const weekKey = goal.weekStart.toISOString().split('T')[0];
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          total: 0,
          completed: 0,
          weekStart: goal.weekStart
        };
      }
      weeklyData[weekKey].total++;
      if (goal.completed) weeklyData[weekKey].completed++;
    });

    // Sort weeks by date (most recent first)
    const sortedWeeks = Object.values(weeklyData).sort((a, b) =>
      new Date(b.weekStart) - new Date(a.weekStart)
    );

    // Calculate streak from most recent week
    for (const week of sortedWeeks) {
      if (week.completed === week.total && week.total > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Get best week
    const bestWeek = sortedWeeks.reduce((best, week) => {
      const rate = week.total > 0 ? (week.completed / week.total) * 100 : 0;
      const bestRate = best.total > 0 ? (best.completed / best.total) * 100 : 0;
      return rate > bestRate ? week : best;
    }, sortedWeeks[0] || { total: 0, completed: 0 });

    // Weekly completion data for chart (last 12 weeks)
    const last12Weeks = sortedWeeks.slice(0, 12).reverse().map(week => ({
      week: new Date(week.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      total: week.total,
      completed: week.completed,
      rate: week.total > 0 ? Math.round((week.completed / week.total) * 100) : 0
    }));

    res.json({
      totalGoals,
      completedGoals,
      incompleteGoals: totalGoals - completedGoals,
      completionRate: Math.round(completionRate),
      currentStreak,
      totalWeeks: sortedWeeks.length,
      bestWeek: {
        weekStart: bestWeek.weekStart,
        total: bestWeek.total,
        completed: bestWeek.completed,
        rate: bestWeek.total > 0 ? Math.round((bestWeek.completed / bestWeek.total) * 100) : 0
      },
      weeklyData: last12Weeks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;