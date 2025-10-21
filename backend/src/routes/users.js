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

    // Fetch all partners using new Partnership model
    const partners = await getUserPartners(req.userId);

    // Fetch pending invitations
    const pendingInvitations = await getUserSentInvitations(req.userId);

    // Don't send password
    const { password, ...userWithoutPassword } = user;

    // For backward compatibility, set `partner` to first partner if exists
    const partner = partners.length > 0 ? partners[0] : null;

    res.json({
      ...userWithoutPassword,
      partner,      // Single partner for backward compatibility
      partners,     // Array of all partners
      pendingInvitations  // Array of pending email invitations
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