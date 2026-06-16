import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" }
    });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTags = async (req: Request, res: Response) => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" }
    });
    res.json(tags);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const { published } = req.query;
    const whereClause: any = {};
    if (published !== undefined) {
      whereClause.published = published === "true";
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        categories: {
          select: { id: true, name: true }
        },
        tags: {
          select: { id: true, name: true }
        },
        _count: {
          select: { comments: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(posts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        categories: {
          select: { id: true, name: true }
        },
        tags: {
          select: { id: true, name: true }
        },
        comments: {
          include: {
            author: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(post);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, content, published, authorId, categoryIds, tagIds } = req.body;
    if (!title || authorId === undefined) {
      return res.status(400).json({ error: "Title and authorId are required" });
    }

    const connectCategories = Array.isArray(categoryIds)
      ? categoryIds.map((id: number) => ({ id }))
      : [];
    const connectTags = Array.isArray(tagIds)
      ? tagIds.map((id: number) => ({ id }))
      : [];

    const post = await prisma.post.create({
      data: {
        title,
        content,
        published: published ?? false,
        authorId: parseInt(authorId),
        categories: { connect: connectCategories },
        tags: { connect: connectTags }
      },
      include: {
        author: true,
        categories: true,
        tags: true
      }
    });
    res.status(201).json(post);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }
    const { title, content, published, authorId, categoryIds, tagIds } = req.body;

    const connectCategories = Array.isArray(categoryIds)
      ? categoryIds.map((cid: number) => ({ id: cid }))
      : [];
    const connectTags = Array.isArray(tagIds)
      ? tagIds.map((tid: number) => ({ id: tid }))
      : [];

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (published !== undefined) updateData.published = published;
    if (authorId !== undefined) updateData.authorId = parseInt(authorId);

    if (categoryIds !== undefined) {
      updateData.categories = {
        set: connectCategories
      };
    }
    if (tagIds !== undefined) {
      updateData.tags = {
        set: connectTags
      };
    }

    const post = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: true,
        categories: true,
        tags: true
      }
    });
    res.json(post);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }
    const post = await prisma.post.delete({
      where: { id }
    });
    res.json({ message: "Post deleted successfully", post });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
