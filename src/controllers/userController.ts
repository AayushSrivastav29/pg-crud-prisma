import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { posts: true, comments: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        posts: {
          orderBy: { createdAt: "desc" }
        },
        _count: {
          select: { comments: true }
        }
      }
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }
    
    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "Email is already taken" });
    }

    const user = await prisma.user.create({
      data: { name, email }
    });
    res.status(201).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const { name, email } = req.body;
    
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== id) {
        return res.status(400).json({ error: "Email is already taken" });
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: { name, email }
    });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const user = await prisma.user.delete({
      where: { id }
    });
    res.json({ message: "User deleted successfully", user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
