import { PrismaClient, OutletRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  console.log('Seeding database...');

  // Upsert outlets
  const mainStore = await prisma.outlet.upsert({
    where: { id: 'seed-outlet-main' },
    create: { id: 'seed-outlet-main', name: 'Main Store', address: '123 Nguyen Hue, Q1' },
    update: { name: 'Main Store', address: '123 Nguyen Hue, Q1' },
  });

  const branchStore = await prisma.outlet.upsert({
    where: { id: 'seed-outlet-branch' },
    create: { id: 'seed-outlet-branch', name: 'Branch Store', address: '456 Le Van Sy, Q3' },
    update: { name: 'Branch Store', address: '456 Le Van Sy, Q3' },
  });

  console.log('Outlets created:', mainStore.name, branchStore.name);

  // Find test user (phone 0901234567)
  const testUser = await prisma.user.findUnique({ where: { phone: '0901234567' } });

  if (testUser) {
    // Assign test user to Main Store as OWNER
    await prisma.userOutlet.upsert({
      where: { userId_outletId: { userId: testUser.id, outletId: mainStore.id } },
      create: { userId: testUser.id, outletId: mainStore.id, role: OutletRole.OWNER },
      update: { role: OutletRole.OWNER },
    });

    // Assign test user to Branch Store as MANAGER
    await prisma.userOutlet.upsert({
      where: { userId_outletId: { userId: testUser.id, outletId: branchStore.id } },
      create: { userId: testUser.id, outletId: branchStore.id, role: OutletRole.MANAGER },
      update: { role: OutletRole.MANAGER },
    });

    console.log(`Assigned test user (${testUser.phone}) to both outlets.`);
  } else {
    console.log('Test user (phone: 0901234567) not found — skipping user-outlet assignment.');
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
