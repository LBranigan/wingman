const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { getUserPartners, getUserSentInvitations } = require('../utils/partnerships');

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

    // Don't send password
    const { password, ...userWithoutPassword } = user;

    // Get partner using the old partnerId field (Partnership table doesn't exist yet)
    let partner = null;
    if (user.partnerId) {
      partner = await prisma.user.findUnique({
        where: { id: user.partnerId },
        select: {
          id: true,
          name: true,
          email: true,
          bio: true,
          profilePicture: true,
          createdAt: true
        }
      });
    }

    // Fetch pending invitations (this doesn't use Partnership table)
    const pendingInvitations = await getUserSentInvitations(req.userId);

    res.json({
      ...userWithoutPassword,
      partner,            // Single partner for backward compatibility
      partners: partner ? [partner] : [],  // Array format for future compatibility
      pendingInvitations  // Array of pending email invitations
    });
  } catch (error) {
    console.error('[USERS] Error in /me endpoint:', error);
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