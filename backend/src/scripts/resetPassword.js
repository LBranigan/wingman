const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const email = 'branigan.liam@gmail.com';
    const newPassword = 'password123'; // Change this to your desired password

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    const user = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    console.log('\n✅ PASSWORD RESET SUCCESSFUL');
    console.log('=====================================');
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('New Password:', newPassword);
    console.log('=====================================');
    console.log('\nYou can now log in with these credentials.');
    console.log('\n⚠️  IMPORTANT: Change this password after logging in!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
