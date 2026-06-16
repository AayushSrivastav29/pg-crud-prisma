import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";

// ─── CREATE ───────────────────────────────────────────────────────────────────

export async function createPost(data: Prisma.PostCreateInput) {
  const post = await prisma.post.create({ data, include: { author: true } });
  console.log("✅ Created post:", post);
  return post;
}

// ─── READ ─────────────────────────────────────────────────────────────────────

export async function getAllPosts(publishedOnly = false) {
  const posts = await prisma.post.findMany({
    where: publishedOnly ? { published: true } : undefined,
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });
  console.log(`✅ Found ${posts.length} posts`);
  return posts;
}

export async function getPostById(id: number) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: { author: true },
  });
  if (!post) console.log(`⚠️  No post found with id ${id}`);
  else console.log("✅ Found post:", post);
  return post;
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

export async function updatePost(id: number, data: Prisma.PostUpdateInput) {
  const post = await prisma.post.update({
    where: { id },
    data,
    include: { author: true },
  });
  console.log("✅ Updated post:", post);
  return post;
}

export async function publishPost(id: number) {
  return updatePost(id, { published: true });
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function deletePost(id: number) {
  const post = await prisma.post.delete({ where: { id } });
  console.log("✅ Deleted post:", post);
  return post;
}
