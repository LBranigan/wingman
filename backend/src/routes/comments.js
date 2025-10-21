const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();
const prisma = new PrismaClient();

// Add comment to a goal
router.post('/', authMiddleware, validate('createComment'), async (req, res) => {
  try {
    const { goalId, text } = req.body;
    
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: { user: true }
    });
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    // Verify the user is commenting on their partner's goal
    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId }
    });
    
    if (goal.userId !== currentUser.partnerId) {
      return res.status(403).json({ error: 'Can only comment on partner\'s goals' });
    }
    
    const comment = await prisma.comment.create({
      data: {
        text,
        goalId,
        authorId: req.userId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;