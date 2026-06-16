import "dotenv/config";
import prisma from "./lib/prisma";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "./crud/userCrud";
import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  publishPost,
  deletePost,
} from "./crud/postCrud";

async function main() {
  console.log("\n========================================");
  console.log("  PostgreSQL CRUD Demo – Prisma + TS");
  console.log("========================================\n");

  // ── Users ──────────────────────────────────────────────────────────────────
  console.log("--- USER CRUD ---\n");

  const alice = await createUser({ name: "Alice Johnson", email: "alice@example.com" });
  const bob   = await createUser({ name: "Bob Smith",    email: "bob@example.com"   });

  await getAllUsers();
  await getUserById(alice.id);

  await updateUser(alice.id, { name: "Alice Updated" });

  // ── Posts ──────────────────────────────────────────────────────────────────
  console.log("\n--- POST CRUD ---\n");

  const post1 = await createPost({
    title: "Hello Prisma",
    content: "My first post using Prisma ORM with TypeScript.",
    author: { connect: { id: alice.id } },
  });

  const post2 = await createPost({
    title: "PostgreSQL is awesome",
    content: "Learning PostgreSQL CRUD with Supabase.",
    author: { connect: { id: bob.id } },
  });

  await getAllPosts();
  await getPostById(post1.id);

  await publishPost(post1.id);
  await updatePost(post2.id, { title: "PostgreSQL + Prisma = ❤️" });

  await getAllPosts(true); // published only

  // ── Cleanup ────────────────────────────────────────────────────────────────
  console.log("\n--- CLEANUP ---\n");

  await deletePost(post1.id);
  await deletePost(post2.id);
  await deleteUser(alice.id);
  await deleteUser(bob.id);

  console.log("\n✅ All CRUD operations completed successfully!\n");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
