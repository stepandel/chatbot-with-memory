import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/conversations - List all conversations for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Only return conversations for regular mode users
    if (session.user.mode === "fun") {
      return new Response("Not available in fun mode", { status: 400 });
    }

    // First, ensure the user exists in the database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      // If user doesn't exist, return empty array instead of error
      console.log(`User ${session.user.id} not found in database, returning empty conversations`);
      return Response.json([]);
    }

    const conversations = await prisma.conversation.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    return Response.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

// POST /api/conversations - Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Only allow for regular mode users
    if (session.user.mode === "fun") {
      return new Response("Not available in fun mode", { status: 400 });
    }

    const { title } = await request.json();

    if (!title || typeof title !== "string") {
      return new Response("Title is required", { status: 400 });
    }

    // Ensure the user exists in the database
    let user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      // Create the user if they don't exist
      user = await prisma.user.create({
        data: {
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.name || "",
          image: session.user.image || null,
        }
      });
    }

    const conversation = await prisma.conversation.create({
      data: {
        userId: session.user.id,
        title: title.trim(),
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { messages: true }
        }
      }
    });

    return Response.json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    return new Response("Internal server error", { status: 500 });
  }
}