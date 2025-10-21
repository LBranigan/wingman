const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to get sorted user IDs for consistent storage
const getSortedUserIds = (id1, id2) => {
  return id1 < id2 ? [id1, id2] : [id2, id1];
};

// Get chat messages between current user and their partner
router.get('/messages', authMiddleware, async (req, res) => {
  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { partnerId: true }
    });

    if (!currentUser.partnerId) {
      return res.status(400).json({ error: 'You must have a partner to access chat' });
    }

    const [userId1, userId2] = getSortedUserIds(req.userId, currentUser.partnerId);

    const messages = await prisma.message.findMany({
      where: {
        userId1,
        userId2
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    res.json({ messages });
  } catch (error) {
    console.error('[CHAT] Error fetching messages:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send a message to partner
router.post('/messages', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { partnerId: true, name: true }
    });

    if (!currentUser.partnerId) {
      return res.status(400).json({ error: 'You must have a partner to send messages' });
    }

    const [userId1, userId2] = getSortedUserIds(req.userId, currentUser.partnerId);

    const message = await prisma.message.create({
      data: {
        text: text.trim(),
        senderId: req.userId,
        userId1,
        userId2
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('[CHAT] Error sending message:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
