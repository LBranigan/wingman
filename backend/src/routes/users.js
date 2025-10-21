const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();
const prisma = new PrismaClient();

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Manually fetch partner if partnerId exists
    let partner = null;
    if (user.partnerId) {
      partner = await prisma.user.findUnique({
        where: { id: user.partnerId },
        select: {
          id: true,
          name: true,
          bio: true,
          email: true
        }
      });
    }

    // Don't send password
    const { password, ...userWithoutPassword } = user;

    res.json({
      ...userWithoutPassword,
      partner
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update profile
router.put('/me', authMiddleware, validate('updateUser'), async (req, res) => {
  try {
    const { name, bio } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { name, bio }
    });
    
    const { password, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;