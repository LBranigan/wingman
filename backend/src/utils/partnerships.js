const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all partners for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of partner user objects
 */
async function getUserPartners(userId) {
  const partnerships = await prisma.partnership.findMany({
    where: {
      OR: [
        { user1Id: userId },
        { user2Id: userId }
      ]
    },
    include: {
      user1: {
        select: {
          id: true,
          name: true,
          email: true,
          bio: true,
          profilePicture: true,
          createdAt: true
        }
      },
      user2: {
        select: {
          id: true,
          name: true,
          email: true,
          bio: true,
          profilePicture: true,
          createdAt: true
        }
      }
    }
  });

  // Extract partner objects (the user that is NOT the current user)
  return partnerships.map(p => {
    const partner = p.user1Id === userId ? p.user2 : p.user1;
    return {
      ...partner,
      partnershipId: p.id,
      partnershipCreatedAt: p.createdAt
    };
  });
}

/**
 * Check if two users are partners
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @returns {Promise<boolean>} True if partners, false otherwise
 */
async function arePartners(userId1, userId2) {
  const [user1Id, user2Id] = [userId1, userId2].sort();

  const partnership = await prisma.partnership.findUnique({
    where: {
      user1Id_user2Id: {
        user1Id: user1Id,
        user2Id: user2Id
      }
    }
  });

  return !!partnership;
}

/**
 * Create a partnership between two users
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @returns {Promise<Object>} Created partnership
 */
async function createPartnership(userId1, userId2) {
  const [user1Id, user2Id] = [userId1, userId2].sort();

  // Check if partnership already exists
  const existing = await prisma.partnership.findUnique({
    where: {
      user1Id_user2Id: {
        user1Id: user1Id,
        user2Id: user2Id
      }
    }
  });

  if (existing) {
    throw new Error('Partnership already exists');
  }

  return await prisma.partnership.create({
    data: {
      user1Id,
      user2Id
    },
    include: {
      user1: true,
      user2: true
    }
  });
}

/**
 * Delete a partnership
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @returns {Promise<Object>} Deleted partnership
 */
async function deletePartnership(userId1, userId2) {
  const [user1Id, user2Id] = [userId1, userId2].sort();

  return await prisma.partnership.delete({
    where: {
      user1Id_user2Id: {
        user1Id: user1Id,
        user2Id: user2Id
      }
    }
  });
}

/**
 * Get pending invitations sent by a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of invitation objects
 */
async function getUserSentInvitations(userId) {
  return await prisma.invitation.findMany({
    where: {
      senderId: userId,
      status: 'pending'
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

module.exports = {
  getUserPartners,
  arePartners,
  createPartnership,
  deletePartnership,
  getUserSentInvitations
};
