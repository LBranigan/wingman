const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugPartnershipIssue() {
  try {
    console.log('\n🔍 DEBUGGING PARTNERSHIP ISSUE\n');
    console.log('='.repeat(70));

    // Find both users
    const user1 = await prisma.user.findUnique({
      where: { email: 'branigan.liam@gmail.com' },
      select: {
        id: true,
        name: true,
        email: true,
        partnerId: true,
        matchedAt: true,
        invitationToken: true,
        invitedBy: true
      }
    });

    const user2 = await prisma.user.findUnique({
      where: { email: 'primetimedistributors@gmail.com' },
      select: {
        id: true,
        name: true,
        email: true,
        partnerId: true,
        matchedAt: true,
        invitationToken: true,
        invitedBy: true
      }
    });

    console.log('\n📊 USER 1: branigan.liam@gmail.com');
    if (user1) {
      console.log(JSON.stringify(user1, null, 2));

      if (user1.partnerId) {
        const partner1 = await prisma.user.findUnique({
          where: { id: user1.partnerId },
          select: { id: true, name: true, email: true, partnerId: true }
        });
        console.log('\n  Partner details:');
        console.log(JSON.stringify(partner1, null, 2));
      }
    } else {
      console.log('  ❌ User not found!');
    }

    console.log('\n📊 USER 2: primetimedistributors@gmail.com');
    if (user2) {
      console.log(JSON.stringify(user2, null, 2));

      if (user2.partnerId) {
        const partner2 = await prisma.user.findUnique({
          where: { id: user2.partnerId },
          select: { id: true, name: true, email: true, partnerId: true }
        });
        console.log('\n  Partner details:');
        console.log(JSON.stringify(partner2, null, 2));
      }
    } else {
      console.log('  ❌ User not found!');
    }

    // Check if partnership is mutual
    console.log('\n🔗 PARTNERSHIP STATUS:');
    if (user1 && user2) {
      const user1HasPartner = user1.partnerId === user2.id;
      const user2HasPartner = user2.partnerId === user1.id;

      console.log(`  User 1 points to User 2: ${user1HasPartner ? '✅' : '❌'}`);
      console.log(`  User 2 points to User 1: ${user2HasPartner ? '✅' : '❌'}`);

      if (user1HasPartner && user2HasPartner) {
        console.log('  ✅ Partnership is MUTUAL and CORRECT');
      } else if (user1HasPartner || user2HasPartner) {
        console.log('  ⚠️  Partnership is ONE-SIDED (BUG!)');
      } else if (user1.partnerId || user2.partnerId) {
        console.log('  ⚠️  One or both users have DIFFERENT partners');
      } else {
        console.log('  ℹ️  Neither user has a partner');
      }
    }

    // Check pending partnership requests
    console.log('\n📨 PARTNERSHIP REQUESTS:');
    if (user1 && user2) {
      const requests = await prisma.partnershipRequest.findMany({
        where: {
          OR: [
            { senderId: user1.id, receiverId: user2.id },
            { senderId: user2.id, receiverId: user1.id }
          ]
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
          senderId: true,
          receiverId: true
        }
      });

      if (requests.length > 0) {
        console.log(`  Found ${requests.length} request(s):`);
        requests.forEach(req => {
          const direction = req.senderId === user1.id ? 'User1 → User2' : 'User2 → User1';
          console.log(`    - ${direction}: ${req.status} (${req.createdAt})`);
        });
      } else {
        console.log('  No partnership requests found between these users');
      }
    }

    console.log('\n='.repeat(70));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugPartnershipIssue();
