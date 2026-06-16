import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";

// ─── CREATE ───────────────────────────────────────────────────────────────────

export async function createUser(data: Prisma.UserCreateInput) {
  const user = await prisma.user.create({ data });
  console.log("✅ Created user:", user);
  return user;
}

// ─── READ ─────────────────────────────────────────────────────────────────────

export async function getAllUsers() {
  const users = await prisma.user.findMany({
    include: { posts: true },
    orderBy: { createdAt: "desc" },
  });
  console.log(`✅ Found ${users.length} users`);
  return users;
}

export async function getUserById(id: number) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { posts: true },
  });
  if (!user) console.log(`⚠️  No user found with id ${id}`);
  else console.log("✅ Found user:", user);
  return user;
}

export async function getUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { posts: true },
  });
  if (!user) console.log(`⚠️  No user found with email ${email}`);
  else console.log("✅ Found user:", user);
  return user;
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

export async function updateUser(id: number, data: Prisma.UserUpdateInput) {
  const user = await prisma.user.update({ where: { id }, data });
  console.log("✅ Updated user:", user);
  return user;
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function deleteUser(id: number) {
  const user = await prisma.user.delete({ where: { id } });
  console.log("✅ Deleted user:", user);
  return user;
}
