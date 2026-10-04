import { PrismaClient, Role, UserStatus, Year, Division, Batch } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const email = 'omkar_mankar_mca@moderncoe.edu.in';
  const passwordRaw = 'Pesmodern#123';

  console.log(`Hashing password for ${email}...`);
  const passwordHash = await argon2.hash(passwordRaw);

  const mca = await prisma.department.upsert({
    where: { code: 'MCA' },
    update: {},
    create: {
      name: 'Master of Computer Applications',
      code: 'MCA',
    },
  });

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      status: UserStatus.ACTIVE,
      mustChangePassword: false,
    },
    create: {
      name: 'Omkar Mankar',
      email,
      passwordHash,
      role: Role.STUDENT,
      departmentId: mca.id,
      year: Year.FY,
      division: Division.A,
      batch: Batch.F1,
      mustChangePassword: false,
      status: UserStatus.ACTIVE,
    },
  });

  console.log('✅ User successfully created/updated:');
  console.log({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  });
}

main()
  .catch((e) => {
    console.error('❌ Failed to upsert user:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
