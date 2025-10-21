const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugPartnerIssue() {
  try {
    console.log('=== DEBUGGING PARTNER ISSUE ===\n');

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        partnerId: true,
        bio: true,
        matchedAt: true
      }
    });

    console.log('Total users:', users.length);
    console.log('\n=== ALL USERS ===');
    users.forEach(user => {
      console.log(`\nUser: ${user.name} (${user.email})`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Partner ID: ${user.partnerId || 'None'}`);
      console.log(`  Matched At: ${user.matchedAt || 'Never'}`);
      console.log(`  Bio: ${user.bio || 'No bio'}`);
    });

    // Check for partnerships
    console.log('\n\n=== PARTNERSHIPS ===');
    const partneredUsers = users.filter(u => u.partnerId);
    if (partneredUsers.length === 0) {
      console.log('No users have partners');
    } else {
      partneredUsers.forEach(user => {
        const partner = users.find(u => u.id === user.partnerId);
        console.log(`\n${user.name} -> ${partner ? partner.name : 'INVALID PARTNER ID'}`);
        if (partner) {
          if (partner.partnerId === user.id) {
            console.log('  ✓ Bidirectional partnership confirmed');
          } else {
            console.log('  ✗ WARNING: Partnership not bidirectional!');
            console.log(`    Partner's partnerId: ${partner.partnerId}`);
          }
        }
      });
    }

    // Check for orphaned partnerships
    console.log('\n\n=== CHECKING FOR ISSUES ===');
    let issuesFound = false;

    users.forEach(user => {
      if (user.partnerId) {
        const partner = users.find(u => u.id === user.partnerId);
        if (!partner) {
          console.log(`✗ ${user.name} has partnerId ${user.partnerId} but that user doesn't exist`);
          issuesFound = true;
        } else if (partner.partnerId !== user.id) {
          console.log(`✗ ${user.name} -> ${partner.name} but ${partner.name} -> ${partner.partnerId || 'None'}`);
          issuesFound = true;
        }
      }
    });

    if (!issuesFound) {
      console.log('✓ No partnership issues found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugPartnerIssue();
