// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding database with real data...');

  // Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { pubkey: 'GJENwjwdh7rAcZyrYh76SDjwgYrhncfhQKaMNGfSHirw' },
    update: {},
    create: {
      id: BigInt(1),
      pubkey: 'GJENwjwdh7rAcZyrYh76SDjwgYrhncfhQKaMNGfSHirw',
      reputation: 1500,
      level: 8,
      totalVotesCast: 45,
      totalCommunitiesJoined: 5,
      votingWeight: 2.5
    }
  });

  // Test User
  const testUser = await prisma.user.upsert({
    where: { pubkey: '7bbUeyCQnjUN9R29nRdWUBmqRhghs2soPTb8h4FCxcwy' },
    update: {},
    create: {
      id: BigInt(2),
      pubkey: '7bbUeyCQnjUN9R29nRdWUBmqRhghs2soPTb8h4FCxcwy',
      reputation: 250,
      level: 3,
      totalVotesCast: 12,
      totalCommunitiesJoined: 2,
      votingWeight: 1.2
    }
  });

  console.log('✅ Users created');
  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });