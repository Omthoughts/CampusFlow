import { PrismaClient, Role, UserStatus, Year, Division, Batch } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  const passwordHash = await argon2.hash('DemoPass123!');

  // Create Departments
  const mca = await prisma.department.upsert({
    where: { code: 'MCA' },
    update: {},
    create: {
      name: 'Master of Computer Applications',
      code: 'MCA',
    },
  });

  const mba = await prisma.department.upsert({
    where: { code: 'MBA' },
    update: {},
    create: {
      name: 'Master of Business Administration',
      code: 'MBA',
    },
  });

  // Create Admin
  await prisma.user.upsert({
    where: { email: 'admin@moderncoe.edu.in' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@moderncoe.edu.in',
      passwordHash,
      role: Role.ADMIN,
      mustChangePassword: true,
      status: UserStatus.ACTIVE,
    },
  });

  // Create Faculty
  await prisma.user.upsert({
    where: { email: 'faculty_mca@moderncoe.edu.in' },
    update: {},
    create: {
      name: 'MCA Coordinator',
      email: 'faculty_mca@moderncoe.edu.in',
      passwordHash,
      role: Role.FACULTY,
      departmentId: mca.id,
      mustChangePassword: true,
      status: UserStatus.ACTIVE,
    },
  });

  // Create Students
  const students = [
    { email: 'student_f1_01@moderncoe.edu.in', name: 'Student F1 01', batch: Batch.F1 },
    { email: 'student_f1_02@moderncoe.edu.in', name: 'Student F1 02', batch: Batch.F1 },
    { email: 'student_f2_01@moderncoe.edu.in', name: 'Student F2 01', batch: Batch.F2 },
    { email: 'student_f3_01@moderncoe.edu.in', name: 'Student F3 01', batch: Batch.F3 },
  ];

  for (const s of students) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        name: s.name,
        email: s.email,
        passwordHash,
        role: Role.STUDENT,
        departmentId: mca.id,
        year: Year.FY,
        division: Division.A,
        batch: s.batch,
        mustChangePassword: true,
        status: UserStatus.ACTIVE,
      },
    });
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
