const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPartnerData() {
  try {
    console.log('Checking all users and their partner status...\n');

    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        partnerId: true,
        matchedAt: true,
        invitationToken: true,
        invitationSentAt: true
      }
    });

    console.log(`Total users: ${allUsers.length}\n`);

    for (const user of allUsers) {
      console.log('---');
      console.log(`User: ${user.name} (${user.email})`);
      console.log(`ID: ${user.id}`);
      console.log(`Partner ID: ${user.partnerId || 'None'}`);
      console.log(`Matched At: ${user.matchedAt || 'Not matched'}`);
      console.log(`Invitation Token: ${user.invitationToken ? 'Has token' : 'No token'}`);
      console.log(`Invitation Sent At: ${user.invitationSentAt || 'Never'}`);

      // Check if partner exists
      if (user.partnerId) {
        const partner = await prisma.user.findUnique({
          where: { id: user.partnerId },
          select: { name: true, partnerId: true }
        });

        if (partner) {
          console.log(`Partner: ${partner.name}`);
          console.log(`Partner's partnerId: ${partner.partnerId}`);

          // Check for bidirectional match
          if (partner.partnerId === user.id) {
            console.log('✓ Bidirectional match confirmed');
          } else {
            console.log('✗ WARNING: Not bidirectional! Partner points to:', partner.partnerId);
          }
        } else {
          console.log('✗ WARNING: Partner ID exists but user not found!');
        }
      }

      console.log('');
    }

    // Check for orphaned partnerships
    console.log('\n=== Checking for issues ===\n');

    const usersWithPartner = allUsers.filter(u => u.partnerId);
    for (const user of usersWithPartner) {
      const partner = await prisma.user.findUnique({
        where: { id: user.partnerId }
      });

      if (!partner) {
        console.log(`✗ ${user.name} has invalid partnerId: ${user.partnerId}`);
      } else if (partner.partnerId !== user.id) {
        console.log(`✗ ${user.name} and ${partner.name} have non-mutual partnership`);
      }
    }

    console.log('\nCheck complete!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPartnerData();
