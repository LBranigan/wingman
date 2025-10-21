const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function unmatchUser(userEmail) {
  try {
    console.log(`Looking for user with email: ${userEmail}...`);

    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      console.log('User not found!');
      return;
    }

    if (!user.partnerId) {
      console.log(`${user.name} already has no partner.`);
      return;
    }

    const partnerId = user.partnerId;
    const partner = await prisma.user.findUnique({
      where: { id: partnerId },
      select: { name: true }
    });

    console.log(`\nUnmatching ${user.name} from ${partner?.name || 'unknown'}...`);

    // Unmatch both users
    await prisma.user.update({
      where: { id: user.id },
      data: { partnerId: null, matchedAt: null }
    });

    await prisma.user.update({
      where: { id: partnerId },
      data: { partnerId: null, matchedAt: null }
    });

    console.log('✓ Successfully unmatched!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node unmatchUser.js <email>');
  console.log('Example: node unmatchUser.js branigan.liam@gmail.com');
  process.exit(1);
}

unmatchUser(email);
