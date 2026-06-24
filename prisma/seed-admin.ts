// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding payroll master data...');

  // Hash a secure baseline password for your admin panel
  const saltRounds = 10;
  const adminPasswordHash = await bcrypt.hash('AdminSecure2026!', saltRounds);

  // Seed your Super HR Administrator account
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ofcengineering.com' },
    update: {},
    create: {
      firstName: 'OFC',
      lastName: 'Administrator',
      email: 'admin@ofcengineering.com',
      passwordHash: adminPasswordHash,
      role: 'SUPER_HR',
    },
  });

  console.log(`✅ Seeded default authentication profile: ${adminUser.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });