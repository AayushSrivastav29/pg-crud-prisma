import "dotenv/config";
import prisma from "./lib/prisma";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create users with posts
  const user1 = await prisma.user.create({
    data: {
      name: "Alice Seed",
      email: "alice.seed@example.com",
      posts: {
        create: [
          { title: "Seeded Post 1", content: "Content 1", published: true },
          { title: "Seeded Post 2", content: "Content 2" },
        ],
      },
    },
    include: { posts: true },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Bob Seed",
      email: "bob.seed@example.com",
      posts: {
        create: [{ title: "Bob's Post", content: "Bob's content", published: true }],
      },
    },
    include: { posts: true },
  });

  console.log("✅ Seeded:", { user1, user2 });
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
