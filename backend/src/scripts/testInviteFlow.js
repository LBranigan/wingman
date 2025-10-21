const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testInviteFlow() {
  try {
    console.log('\n🔍 TESTING INVITE FLOW\n');
    console.log('='.repeat(50));

    // Find a user with an invitation token
    const usersWithInvites = await prisma.user.findMany({
      where: {
        invitationToken: { not: null }
      },
      select: {
        id: true,
        name: true,
        email: true,
        invitationToken: true,
        invitationSentAt: true,
        partnerId: true
      }
    });

    if (usersWithInvites.length === 0) {
      console.log('ℹ️  No users with pending invitations found.');
      console.log('\nTo test the invite flow:');
      console.log('1. Log in to the app');
      console.log('2. Go to the Partner page');
      console.log('3. Use "Reach Out to a Friend" to send an invitation');
      console.log('4. Check the email for the invitation link');
      console.log('5. Register using that link');
      console.log('6. Both users should be automatically partnered\n');
      return;
    }

    console.log(`\n✅ Found ${usersWithInvites.length} user(s) with pending invitations:\n`);

    for (const user of usersWithInvites) {
      console.log(`User: ${user.name} (${user.email})`);
      console.log(`  - User ID: ${user.id}`);
      console.log(`  - Has Partner: ${user.partnerId ? 'Yes' : 'No'}`);
      console.log(`  - Invitation Token: ${user.invitationToken}`);
      console.log(`  - Sent At: ${user.invitationSentAt}`);
      console.log(`  - Registration URL: http://localhost:3000/register?inviteToken=${user.invitationToken}`);
      console.log();
    }

    console.log('📋 HOW IT WORKS:');
    console.log('1. When someone registers with the URL above');
    console.log('2. The inviteToken is extracted from the URL');
    console.log('3. The system finds the inviter by matching the token');
    console.log('4. Both users are automatically partnered upon registration');
    console.log('5. The invitation token is cleared from the inviter');
    console.log();

    // Check for recently partnered users
    const recentPartnerships = await prisma.user.findMany({
      where: {
        matchedAt: {
          not: null
        },
        invitedBy: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        partnerId: true,
        invitedBy: true,
        matchedAt: true
      },
      orderBy: {
        matchedAt: 'desc'
      },
      take: 5
    });

    if (recentPartnerships.length > 0) {
      console.log('✅ RECENT SUCCESSFUL INVITE PARTNERSHIPS:\n');
      for (const user of recentPartnerships) {
        const inviter = await prisma.user.findUnique({
          where: { id: user.invitedBy },
          select: { name: true, email: true }
        });

        const partner = await prisma.user.findUnique({
          where: { id: user.partnerId },
          select: { name: true, email: true }
        });

        console.log(`${user.name} (${user.email})`);
        console.log(`  - Invited by: ${inviter?.name || 'Unknown'}`);
        console.log(`  - Currently partnered with: ${partner?.name || 'No partner'}`);
        console.log(`  - Partnership created: ${user.matchedAt}`);
        console.log();
      }
    }

    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testInviteFlow();
