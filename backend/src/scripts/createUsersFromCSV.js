const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function createUsersFromCSV() {
  try {
    console.log('\n📝 CREATING USERS FROM CSV\n');
    console.log('='.repeat(70));

    // Read the CSV file
    const csvPath = path.join('C:', 'Users', 'brani', 'Desktop', 'wingman emails.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    // Parse CSV (skip header row)
    const lines = csvContent.split('\n').slice(1).filter(line => line.trim());

    console.log(`\nFound ${lines.length} users to create\n`);

    const defaultPassword = 'password123'; // Default password for all users
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    let created = 0;
    let skipped = 0;

    for (const line of lines) {
      // Simple CSV parser that handles quoted fields
      const parts = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          parts.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      parts.push(current.trim()); // Add last field

      if (parts.length < 3) {
        console.log(`⚠️  Skipping invalid line: ${line.substring(0, 50)}...`);
        continue;
      }

      const [name, email, bio] = parts;
      const cleanBio = bio.replace(/^"|"$/g, '').trim(); // Remove surrounding quotes

      if (!email || !email.includes('@')) {
        console.log(`⚠️  Skipping invalid email: ${email}`);
        skipped++;
        continue;
      }

      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: email.trim() }
        });

        if (existingUser) {
          console.log(`⏭️  User already exists: ${email} (${name})`);
          skipped++;
          continue;
        }

        // Create user
        const user = await prisma.user.create({
          data: {
            name: name.trim(),
            email: email.trim(),
            password: hashedPassword,
            bio: cleanBio
          }
        });

        console.log(`✅ Created user: ${user.email} (${user.name})`);
        created++;

      } catch (error) {
        console.error(`❌ Error creating user ${email}:`, error.message);
        skipped++;
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log(`\n✨ SUMMARY:`);
    console.log(`   Created: ${created} users`);
    console.log(`   Skipped: ${skipped} users`);
    console.log(`\n📌 Default password for all users: ${defaultPassword}`);
    console.log('   (Users should change this after first login)\n');

  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUsersFromCSV();
