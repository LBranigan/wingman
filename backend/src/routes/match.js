const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { sendPartnerInvitation } = require('../services/emailService');
const { findTopMatches } = require('../utils/compatibilityScore');
const { createPartnership, deletePartnership, arePartners } = require('../utils/partnerships');
const crypto = require('crypto');

const router = express.Router();
const prisma = new PrismaClient();

// Get top 3 compatible matches
router.get('/suggestions', authMiddleware, async (req, res) => {
  try {
    console.log('[SUGGESTIONS] Request from user:', req.userId);

    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, bio: true, partnerId: true, name: true }
    });

    console.log('[SUGGESTIONS] Current user:', { id: currentUser.id, name: currentUser.name, partnerId: currentUser.partnerId });

    if (currentUser.partnerId) {
      console.log('[SUGGESTIONS] User already has partner:', currentUser.partnerId);
      return res.status(400).json({ error: 'Already matched with a partner' });
    }

    // Get all unmatched users
    const allUsers = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: req.userId } },
          { partnerId: null }
        ]
      },
      select: {
        id: true,
        name: true,
        bio: true,
        createdAt: true
      }
    });

    console.log('[SUGGESTIONS] Found unmatched users:', allUsers.length);

    if (allUsers.length === 0) {
      return res.status(404).json({ error: 'No available partners at the moment' });
    }

    // Find top 3 compatible matches
    const topMatches = findTopMatches(currentUser, allUsers, 3);

    console.log('[SUGGESTIONS] Top matches:', topMatches.map(u => ({ name: u.name, score: u.compatibilityScore })));

    res.json({
      matches: topMatches.map(user => ({
        id: user.id,
        name: user.name,
        bio: user.bio,
        compatibilityScore: user.compatibilityScore,
        memberSince: user.createdAt
      }))
    });
  } catch (error) {
    console.error('[SUGGESTIONS] Error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Send partner request to a specific user
router.post('/request', authMiddleware, async (req, res) => {
  try {
    const { partnerId } = req.body;

    if (!partnerId) {
      return res.status(400).json({ error: 'Partner ID is required' });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, partnerId: true }
    });

    if (currentUser.partnerId) {
      return res.status(400).json({ error: 'Already matched with a partner' });
    }

    // Check if target user exists and is available
    const targetUser = await prisma.user.findUnique({
      where: { id: partnerId },
      select: { id: true, name: true, bio: true, partnerId: true }
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (targetUser.partnerId) {
      return res.status(400).json({ error: 'This user already has a partner' });
    }

    // Check if request already exists
    const existingRequest = await prisma.partnershipRequest.findFirst({
      where: {
        OR: [
          { senderId: req.userId, receiverId: partnerId },
          { senderId: partnerId, receiverId: req.userId }
        ]
      }
    });

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return res.status(400).json({ error: 'Partnership request already pending' });
      }
    }

    // Create partnership request
    const request = await prisma.partnershipRequest.create({
      data: {
        senderId: req.userId,
        receiverId: partnerId,
        status: 'pending'
      },
      include: {
        sender: { select: { id: true, name: true, bio: true } },
        receiver: { select: { id: true, name: true, bio: true } }
      }
    });

    res.json({
      message: 'Partnership request sent!',
      request
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get pending partnership requests (both sent and received)
router.get('/requests', authMiddleware, async (req, res) => {
  try {
    const requests = await prisma.partnershipRequest.findMany({
      where: {
        OR: [
          { receiverId: req.userId },
          { senderId: req.userId }
        ],
        status: 'pending'
      },
      include: {
        sender: { select: { id: true, name: true, bio: true, email: true } },
        receiver: { select: { id: true, name: true, bio: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Accept partnership request
router.post('/requests/:requestId/accept', authMiddleware, async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await prisma.partnershipRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: true,
        receiver: true
      }
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Only the receiver can accept
    if (request.receiverId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to accept this request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request is no longer pending' });
    }

    // Create partnership using new Partnership model
    await createPartnership(request.senderId, request.receiverId);

    // Update request status
    await prisma.partnershipRequest.update({
      where: { id: requestId },
      data: { status: 'accepted' }
    });

    res.json({
      message: 'Partnership accepted!',
      partner: {
        id: request.sender.id,
        name: request.sender.name,
        bio: request.sender.bio
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reject partnership request
router.post('/requests/:requestId/reject', authMiddleware, async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await prisma.partnershipRequest.findUnique({
      where: { id: requestId }
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Only the receiver can reject
    if (request.receiverId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to reject this request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request is no longer pending' });
    }

    // Update request status
    await prisma.partnershipRequest.update({
      where: { id: requestId },
      data: { status: 'rejected' }
    });

    res.json({ message: 'Partnership request rejected' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Unmatch
router.post('/unmatch', authMiddleware, async (req, res) => {
  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (!currentUser.partnerId) {
      return res.status(400).json({ error: 'No partner to unmatch' });
    }

    // Remove partnership
    await prisma.user.update({
      where: { id: req.userId },
      data: { partnerId: null, matchedAt: null }
    });

    await prisma.user.update({
      where: { id: currentUser.partnerId },
      data: { partnerId: null, matchedAt: null }
    });

    res.json({ message: 'Successfully unmatched' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send partner invitation
router.post('/invite', authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;

    console.log('[INVITE] Request from user:', req.userId, 'to email:', email);

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, partnerId: true, email: true }
    });

    console.log('[INVITE] Current user:', { id: currentUser.id, name: currentUser.name, partnerId: currentUser.partnerId });

    // Check if user already has a partner
    if (currentUser.partnerId) {
      console.log('[INVITE] User already has partner:', currentUser.partnerId);
      return res.status(400).json({ error: 'You already have a partner. Unmatch first before sending invitations.' });
    }

    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('[INVITE] Email already registered:', email);
      return res.status(400).json({ error: 'This email is already registered. They can use the random match feature instead.' });
    }

    // Generate unique invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');

    // Create invitation record in new Invitation model
    await prisma.invitation.create({
      data: {
        email,
        invitationToken,
        senderId: req.userId,
        status: 'pending'
      }
    });

    console.log('[INVITE] Invitation record created');

    // Generate invitation URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const invitationUrl = `${frontendUrl}/register?inviteToken=${invitationToken}`;

    // Try to send invitation email (non-blocking - don't wait for it)
    const emailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;
    let emailSent = false;

    if (emailConfigured) {
      sendPartnerInvitation(email, currentUser.name, invitationToken)
        .then(() => {
          console.log('[INVITE] Invitation email sent successfully');
        })
        .catch((emailError) => {
          console.error('[INVITE] Email send failed:', emailError.message);
        });
      emailSent = true;
    } else {
      console.log('[INVITE] Email not configured - skipping email send');
    }

    res.json({
      message: emailSent ? 'Invitation sent successfully!' : 'Invitation link generated!',
      email,
      invitedBy: currentUser.name,
      invitationUrl,
      emailSent
    });
  } catch (error) {
    console.error('[INVITE] Error:', error);
    res.status(500).json({ error: 'Failed to send invitation. Please check your email configuration.', details: error.message });
  }
});

module.exports = router;