const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupInvitationTokens() {
  try {
    console.log('\n🧹 CLEANING UP INVITATION TOKENS FOR PARTNERED USERS\n');
    console.log('='.repeat(70));

    // Find all users who have a partner but still have an invitation token
    const usersWithBothPartnerAndToken = await prisma.user.findMany({
      where: {
        AND: [
          { partnerId: { not: null } },
          { invitationToken: { not: null } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        partnerId: true,
        invitationToken: true
      }
    });

    if (usersWithBothPartnerAndToken.length === 0) {
      console.log('✅ No users found with both partner and invitation token');
      console.log('='.repeat(70));
      return;
    }

    console.log(`\nFound ${usersWithBothPartnerAndToken.length} user(s) to clean up:\n`);

    for (const user of usersWithBothPartnerAndToken) {
      console.log(`📝 ${user.name} (${user.email})`);
      console.log(`   Token: ${user.invitationToken.substring(0, 20)}...`);

      // Clear the invitation token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          invitationToken: null,
          invitationSentAt: null
        }
      });

      console.log(`   ✅ Cleared invitation token\n`);
    }

    console.log('='.repeat(70));
    console.log('\n✅ Cleanup complete!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupInvitationTokens();
