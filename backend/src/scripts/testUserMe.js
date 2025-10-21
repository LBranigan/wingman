const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testUserMe() {
  try {
    // Test with Liam Branigan's ID
    const userId = '2b104d9f-58e9-4638-8b20-a08d839ee800';

    console.log('Testing /users/me logic for user:', userId);

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    console.log('\nUser found:', {
      id: user.id,
      name: user.name,
      email: user.email,
      partnerId: user.partnerId
    });

    // Manually fetch partner if partnerId exists
    let partner = null;
    if (user.partnerId) {
      console.log('\nFetching partner with ID:', user.partnerId);
      partner = await prisma.user.findUnique({
        where: { id: user.partnerId },
        select: {
          id: true,
          name: true,
          bio: true,
          email: true
        }
      });
      console.log('Partner found:', partner);
    } else {
      console.log('\nNo partnerId found');
    }

    const { password, ...userWithoutPassword } = user;

    const response = {
      ...userWithoutPassword,
      partner
    };

    console.log('\nFinal response would be:');
    console.log(JSON.stringify(response, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserMe();
