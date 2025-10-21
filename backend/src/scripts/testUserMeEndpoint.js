const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testUserMeLogic() {
  try {
    console.log('=== TESTING /users/me LOGIC ===\n');

    // Test for Liam Branigan
    const userId = '2b104d9f-58e9-4638-8b20-a08d839ee800';

    console.log('Fetching user:', userId);

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      console.log('✗ User not found');
      return;
    }

    console.log('\nUser found:', user.name);
    console.log('Partner ID:', user.partnerId);

    // Manually fetch partner if partnerId exists
    let partner = null;
    if (user.partnerId) {
      console.log('\nFetching partner...');
      partner = await prisma.user.findUnique({
        where: { id: user.partnerId },
        select: {
          id: true,
          name: true,
          bio: true,
          email: true
        }
      });

      if (partner) {
        console.log('✓ Partner found:', partner.name);
        console.log('  Bio:', partner.bio);
        console.log('  Email:', partner.email);
      } else {
        console.log('✗ Partner not found despite having partnerId');
      }
    } else {
      console.log('\nNo partner ID set');
    }

    // Show what the API would return
    const { password, ...userWithoutPassword } = user;
    const apiResponse = {
      ...userWithoutPassword,
      partner
    };

    console.log('\n=== API WOULD RETURN ===');
    console.log(JSON.stringify(apiResponse, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserMeLogic();
