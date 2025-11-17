require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const slugify = require('slugify');
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // 1. Hash your password so it's secure
  const hashedPassword = await bcrypt.hash(process.env.DATABASE_PASSWORD, 10);

  // 2. Create (or update) the admin user
  const adminUser = await prisma.user.upsert({
    where: { username: process.env.DATABASE_USERNAME },
    update: {}, // If exists, do nothing
    create: {
      username: process.env.DATABASE_USERNAME,
      email: process.env.DATABASE_EMAIL,
      password: hashedPassword,
    },
  });

  console.log('Created User:', adminUser);
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