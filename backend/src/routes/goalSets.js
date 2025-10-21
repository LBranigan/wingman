const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all goal sets for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const goalSets = await prisma.goalSet.findMany({
      where: { userId: req.userId },
      include: {
        goals: {
          include: {
            comments: {
              include: {
                author: {
                  select: { id: true, name: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(goalSets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get partner's goal sets
router.get('/partner', authMiddleware, async (req, res) => {
  console.log('[PARTNER ROUTE] Hit! User ID:', req.userId);
  try {
    // Get current user to find their partner
    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { partnerId: true }
    });

    console.log('[PARTNER ROUTE] Current user:', currentUser);

    if (!currentUser.partnerId) {
      console.log('[PARTNER ROUTE] No partner found');
      return res.status(400).json({ error: 'You do not have a partner' });
    }

    console.log('[PARTNER ROUTE] Partner ID:', currentUser.partnerId);

    // Get partner's goal sets
    const goalSets = await prisma.goalSet.findMany({
      where: { userId: currentUser.partnerId },
      include: {
        goals: {
          include: {
            comments: {
              include: {
                author: {
                  select: { id: true, name: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`[PARTNER GOAL SETS] Found ${goalSets.length} goal sets for partner ${currentUser.partnerId}`);
    console.log('[PARTNER GOAL SETS] Goal sets:', JSON.stringify(goalSets.map(gs => ({ id: gs.id, duration: gs.duration, goalsCount: gs.goals?.length || 0 })), null, 2));

    res.json(goalSets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get active goal set
router.get('/active', authMiddleware, async (req, res) => {
  try {
    const activeSet = await prisma.goalSet.findFirst({
      where: {
        userId: req.userId,
        isActive: true
      },
      include: {
        goals: {
          include: {
            comments: {
              include: {
                author: {
                  select: { id: true, name: true }
                }
              }
            }
          }
        }
      }
    });

    if (!activeSet) {
      return res.status(404).json({ error: 'No active goal set found' });
    }

    res.json(activeSet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new goal set
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { duration, startDate, endDate, goals } = req.body;

    if (!duration || !startDate || !endDate || !goals || goals.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Deactivate any existing active goal sets
    await prisma.goalSet.updateMany({
      where: {
        userId: req.userId,
        isActive: true
      },
      data: { isActive: false }
    });

    // Create the new goal set with goals
    const goalSet = await prisma.goalSet.create({
      data: {
        userId: req.userId,
        duration,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: true,
        goals: {
          create: goals.map(goalText => ({
            text: goalText,
            userId: req.userId,
            weekStart: new Date(startDate),
            weekEnd: new Date(endDate)
          }))
        }
      },
      include: {
        goals: true
      }
    });

    res.status(201).json(goalSet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark goal set as completed
router.post('/:goalSetId/complete', authMiddleware, async (req, res) => {
  try {
    const { goalSetId } = req.params;

    const goalSet = await prisma.goalSet.findFirst({
      where: {
        id: goalSetId,
        userId: req.userId
      }
    });

    if (!goalSet) {
      return res.status(404).json({ error: 'Goal set not found' });
    }

    const updatedGoalSet = await prisma.goalSet.update({
      where: { id: goalSetId },
      data: {
        isCompleted: true,
        completedAt: new Date(),
        isActive: false
      },
      include: {
        goals: true
      }
    });

    res.json(updatedGoalSet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get goal set by ID
router.get('/:goalSetId', authMiddleware, async (req, res) => {
  console.log('[GET BY ID ROUTE] Hit! goalSetId:', req.params.goalSetId);
  try {
    const { goalSetId } = req.params;

    const goalSet = await prisma.goalSet.findFirst({
      where: {
        id: goalSetId,
        userId: req.userId
      },
      include: {
        goals: {
          include: {
            comments: {
              include: {
                author: {
                  select: { id: true, name: true }
                }
              }
            }
          }
        }
      }
    });

    if (!goalSet) {
      return res.status(404).json({ error: 'Goal set not found' });
    }

    res.json(goalSet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update goal set duration name
router.patch('/:goalSetId/duration', authMiddleware, async (req, res) => {
  try {
    const { goalSetId } = req.params;
    const { duration } = req.body;

    if (!duration || !duration.trim()) {
      return res.status(400).json({ error: 'Duration name is required' });
    }

    // Verify the goal set belongs to the user
    const goalSet = await prisma.goalSet.findFirst({
      where: {
        id: goalSetId,
        userId: req.userId
      }
    });

    if (!goalSet) {
      return res.status(404).json({ error: 'Goal set not found' });
    }

    // Update the duration
    const updatedGoalSet = await prisma.goalSet.update({
      where: { id: goalSetId },
      data: { duration: duration.trim() },
      include: {
        goals: true
      }
    });

    res.json(updatedGoalSet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete goal set
router.delete('/:goalSetId', authMiddleware, async (req, res) => {
  try {
    const { goalSetId } = req.params;

    // Verify the goal set belongs to the user
    const goalSet = await prisma.goalSet.findFirst({
      where: {
        id: goalSetId,
        userId: req.userId
      }
    });

    if (!goalSet) {
      return res.status(404).json({ error: 'Goal set not found' });
    }

    // Delete all associated goals first (cascade should handle this, but being explicit)
    await prisma.goal.deleteMany({
      where: { goalSetId: goalSetId }
    });

    // Delete the goal set
    await prisma.goalSet.delete({
      where: { id: goalSetId }
    });

    res.json({ message: 'Goal set deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
