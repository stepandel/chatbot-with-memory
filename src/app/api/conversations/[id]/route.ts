import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/conversations/[id] - Get a specific conversation with messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Only allow for regular mode users
    if (session.user.mode === "fun") {
      return new Response("Not available in fun mode", { status: 400 });
    }

    const { id } = await params;
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
          }
        }
      }
    });

    if (!conversation) {
      return new Response("Conversation not found", { status: 404 });
    }

    return Response.json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

// DELETE /api/conversations/[id] - Delete a specific conversation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Only allow for regular mode users
    if (session.user.mode === "fun") {
      return new Response("Not available in fun mode", { status: 400 });
    }

    const { id } = await params;

    // Verify the conversation belongs to the user before deleting
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId: session.user.id,
      }
    });

    if (!conversation) {
      return new Response("Conversation not found", { status: 404 });
    }

    // Delete the conversation (messages will be deleted due to cascade)
    await prisma.conversation.delete({
      where: { id }
    });

    return new Response("Conversation deleted", { status: 200 });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

// PATCH /api/conversations/[id] - Update conversation title
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Verify the conversation belongs to the user before updating
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId: session.user.id,
      }
    });

    if (!conversation) {
      return new Response("Conversation not found", { status: 404 });
    }

    const updatedConversation = await prisma.conversation.update({
      where: { id },
      data: { title: title.trim() },
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

    return Response.json(updatedConversation);
  } catch (error) {
    console.error("Error updating conversation:", error);
    return new Response("Internal server error", { status: 500 });
  }
}