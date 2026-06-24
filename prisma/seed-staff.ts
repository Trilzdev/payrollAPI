// prisma/seed.ts
import { PrismaClient, PositionType, AuthRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // --------------------------------------------------------
  // 1. Create Departments (The Master Parents)
  // --------------------------------------------------------
  const engDept = await prisma.department.create({
    data: { name: 'Engineering', costCenterCode: 'CC-ENG-01' }
  });
  const opsDept = await prisma.department.create({
    data: { name: 'Operations', costCenterCode: 'CC-OPS-02' }
  });

  // --------------------------------------------------------
  // 2. Create Locations
  // --------------------------------------------------------
  const hqLocation = await prisma.location.create({
    data: { name: 'Lagos HQ', locationType: 'ONSHORE', hasLunchAllowance: true }
  });
  const rigLocation = await prisma.location.create({
    data: { name: 'Warri Rig 1', locationType: 'OFFSHORE', hasLunchAllowance: false }
  });

  // --------------------------------------------------------
  // 3. Create Positions (Linked to Departments)
  // --------------------------------------------------------
  const welderPos = await prisma.departmentPosition.create({
    data: { 
      title: 'Senior Welder', 
      positionLevel: 3, 
      positionType: PositionType.WELDER, 
      hasDetergentAllowance: true, 
      departmentId: engDept.id // Foreign Key!
    }
  });
  const managerPos = await prisma.departmentPosition.create({
    data: { 
      title: 'Operations Manager', 
      positionLevel: 5, 
      positionType: PositionType.MANAGER, 
      hasDetergentAllowance: false, 
      departmentId: opsDept.id // Foreign Key!
    }
  });

  // --------------------------------------------------------
  // 4. Create Paygrades (Linked to Departments)
  // --------------------------------------------------------
  await prisma.departmentPaygrade.create({
    data: { 
      payGrade: 'Grade 3', 
      basicSalary: 150000, 
      housingAllowance: 60000, 
      transportAllowance: 45000, 
      departmentId: engDept.id 
    }
  });
  await prisma.departmentPaygrade.create({
    data: { 
      payGrade: 'Grade 5', 
      basicSalary: 350000, 
      housingAllowance: 140000, 
      transportAllowance: 105000, 
      departmentId: opsDept.id 
    }
  });

  // --------------------------------------------------------
  // 5. Create Staff (Linked to EVERYTHING)
  // --------------------------------------------------------
  await prisma.staff.create({
    data: {
      staffId: 'V00001',
      name: 'Moses Chukwujindu',
      bankName: 'GTBank',
      accountNumber: '0123456789',
      accountName: 'Moses Chukwujindu',
      bankSortCode: '058152052',
      payGrade: 'Grade 3', // String reference
      isActive: true,
      departmentId: engDept.id,
      locationId: rigLocation.id,
      positionId: welderPos.positionId,
    }
  });

  await prisma.staff.create({
    data: {
      staffId: 'V00002',
      name: 'Sarah Olanrewaju',
      bankName: 'Access Bank',
      accountNumber: '9876543210',
      accountName: 'Sarah Olanrewaju',
      bankSortCode: '044150149',
      payGrade: 'Grade 5', // String reference
      isActive: true,
      departmentId: opsDept.id,
      locationId: hqLocation.id,
      positionId: managerPos.positionId,
    }
  });

  // --------------------------------------------------------
  // 6. Global Settings & Admin User
  // --------------------------------------------------------
  await prisma.companySetting.upsert({
    where: { id: 'GLOBAL' },
    update: {},
    create: { id: 'GLOBAL' }
  });

  const passwordHash = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      firstName: 'System',
      lastName: 'Admin',
      email: 'admin@company.com',
      passwordHash,
      role: AuthRole.SUPER_HR
    }
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });