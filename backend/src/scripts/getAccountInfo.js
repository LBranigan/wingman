const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getAccountInfo() {
  try {
    const email = 'branigan.liam@gmail.com';

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        createdAt: true,
        partnerId: true
      }
    });

    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('\n=== ACCOUNT INFO ===');
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('Bio:', user.bio);
    console.log('Created:', user.createdAt);
    console.log('Has Partner:', user.partnerId ? 'Yes' : 'No');

    console.log('\n⚠️  Note: Passwords are hashed and cannot be retrieved.');
    console.log('If you need to log in, you can either:');
    console.log('1. Use the "Forgot Password" feature (if implemented)');
    console.log('2. Reset the password manually via database');
    console.log('3. Create a new account');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getAccountInfo();
