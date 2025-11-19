// Point to the root .env file (two levels up: backend/prisma/ -> root)
require('dotenv').config({ path: '../../.env' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const slugify = require('slugify');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Use env vars passed from Docker Compose (or local .env)
  // We expect DATABASE_USERNAME/EMAIL/PASSWORD to be set in the container env
  const username = process.env.DATABASE_USERNAME;
  const email = process.env.DATABASE_EMAIL;
  const password = process.env.DATABASE_PASSWORD;

  console.log(`Seeding admin user: ${username}`);

  // 1. Hash your password so it's secure
  const hashedPassword = await bcrypt.hash(password, 10);

  // 2. Create (or update) the admin user
  const adminUser = await prisma.user.upsert({
    where: { username: username },
    update: {
      password: hashedPassword, // Update password if user exists but config changed
      email: email
    }, 
    create: {
      username: username,
      email: email,
      password: hashedPassword,
    },
  });

  console.log('Created/Updated User:', adminUser);
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });