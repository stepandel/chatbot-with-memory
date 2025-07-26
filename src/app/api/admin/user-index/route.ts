import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  createUserIndex,
  deleteUserIndex,
  hasUserIndex,
  setupUserStorage,
} from "@/lib/pinecone";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { action, userId, createDedicatedIndex } = await request.json();

    // For now, users can only manage their own indexes
    // In future, add admin role check for managing other users
    if (userId && userId !== session.user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    const targetUserId = userId || session.user.id;

    switch (action) {
      case "create":
        const created = await createUserIndex(targetUserId);
        return Response.json({
          success: created,
          message: created
            ? "Index created successfully"
            : "Failed to create index",
          userId: targetUserId,
        });

      case "delete":
        const deleted = await deleteUserIndex(targetUserId);
        return Response.json({
          success: deleted,
          message: deleted
            ? "Index deleted successfully"
            : "Index not found or failed to delete",
          userId: targetUserId,
        });

      case "check":
        const exists = await hasUserIndex(targetUserId);
        return Response.json({
          exists,
          userId: targetUserId,
          indexType: exists ? "dedicated" : "namespace",
        });

      case "setup":
        const setupSuccess = await setupUserStorage(
          targetUserId,
          createDedicatedIndex || false
        );
        return Response.json({
          success: setupSuccess,
          message: setupSuccess
            ? "User storage setup successfully"
            : "Failed to setup user storage",
          userId: targetUserId,
          type: createDedicatedIndex ? "dedicated" : "namespace",
        });

      default:
        return new Response("Invalid action", { status: 400 });
    }
  } catch (error) {
    console.error("User index API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || session.user.id;

    // For now, users can only check their own indexes
    if (userId !== session.user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    const exists = await hasUserIndex(userId);

    return Response.json({
      exists,
      userId,
      indexType: exists ? "dedicated" : "namespace",
    });
  } catch (error) {
    console.error("User index GET API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
