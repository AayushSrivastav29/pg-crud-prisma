import "dotenv/config";
import prisma from "./lib/prisma";

async function seed() {
  console.log("🌱 Starting full database seeding...");

  // 1. Clean existing data in dependency order
  console.log("🧹 Cleaning old data...");
  await prisma.performanceRun.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.category.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Categories
  console.log("📁 Seeding Categories...");
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Technology" } }),
    prisma.category.create({ data: { name: "Science" } }),
    prisma.category.create({ data: { name: "Art" } }),
    prisma.category.create({ data: { name: "Health & Fitness" } }),
    prisma.category.create({ data: { name: "Business" } }),
  ]);

  // 3. Seed Tags
  console.log("🏷️  Seeding Tags...");
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: "javascript" } }),
    prisma.tag.create({ data: { name: "database" } }),
    prisma.tag.create({ data: { name: "prisma" } }),
    prisma.tag.create({ data: { name: "vue" } }),
    prisma.tag.create({ data: { name: "node" } }),
    prisma.tag.create({ data: { name: "sql" } }),
    prisma.tag.create({ data: { name: "webdev" } }),
    prisma.tag.create({ data: { name: "postgres" } }),
  ]);

  // 4. Seed Users
  console.log("👤 Seeding Users...");
  const users = await Promise.all([
    prisma.user.create({ data: { name: "Alice Johnson", email: "alice@example.com" } }),
    prisma.user.create({ data: { name: "Bob Smith", email: "bob@example.com" } }),
    prisma.user.create({ data: { name: "Charlie Brown", email: "charlie@example.com" } }),
    prisma.user.create({ data: { name: "Diana Prince", email: "diana@example.com" } }),
    prisma.user.create({ data: { name: "Evan Wright", email: "evan@example.com" } }),
  ]);

  // 5. Seed Posts
  console.log("📝 Seeding Posts...");
  const postsData = [
    {
      title: "Mastering Prisma ORM",
      content: "Prisma makes database access easy and type-safe in TypeScript.",
      published: true,
      authorId: users[0].id,
      categories: { connect: [{ id: categories[0].id }, { id: categories[1].id }] },
      tags: { connect: [{ id: tags[1].id }, { id: tags[2].id }] },
    },
    {
      title: "Vue 3 Composition API Guide",
      content: "Learn how to structure Vue applications cleanly using setup syntax.",
      published: true,
      authorId: users[1].id,
      categories: { connect: [{ id: categories[0].id }] },
      tags: { connect: [{ id: tags[3].id }, { id: tags[6].id }] },
    },
    {
      title: "PostgreSQL Indexing & Optimization",
      content: "Understanding B-Tree indexes and how they speed up queries.",
      published: true,
      authorId: users[2].id,
      categories: { connect: [{ id: categories[0].id }, { id: categories[4].id }] },
      tags: { connect: [{ id: tags[1].id }, { id: tags[5].id }, { id: tags[7].id }] },
    },
    {
      title: "Design Principles for Frontend Developers",
      content: "Colors, typography, and grids make a design feel premium.",
      published: true,
      authorId: users[3].id,
      categories: { connect: [{ id: categories[2].id }] },
      tags: { connect: [{ id: tags[6].id }] },
    },
    {
      title: "Understanding Node.js Event Loop",
      content: "Deep dive into how single-threaded JavaScript handles asynchronous actions.",
      published: false,
      authorId: users[4].id,
      categories: { connect: [{ id: categories[0].id }] },
      tags: { connect: [{ id: tags[0].id }, { id: tags[4].id }] },
    },
  ];

  const posts = [];
  for (const postVal of postsData) {
    const post = await prisma.post.create({
      data: postVal,
      include: { tags: true, categories: true },
    });
    posts.push(post);
  }

  // 6. Seed Comments
  console.log("💬 Seeding Comments...");
  const commentsData = [
    { content: "This is a great guide, Alice!", postId: posts[0].id, authorId: users[1].id },
    { content: "Prisma is indeed awesome.", postId: posts[0].id, authorId: users[2].id },
    { content: "Very helpful overview, thank you.", postId: posts[1].id, authorId: users[0].id },
    { content: "I love the Composition API!", postId: posts[1].id, authorId: users[3].id },
    { content: "Can you write about composite indexes next?", postId: posts[2].id, authorId: users[4].id },
    { content: "Great tips on design typography.", postId: posts[3].id, authorId: users[2].id },
  ];

  await Promise.all(
    commentsData.map((commentVal) => prisma.comment.create({ data: commentVal }))
  );

  console.log("🚀 Database seeding completed successfully!");
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
