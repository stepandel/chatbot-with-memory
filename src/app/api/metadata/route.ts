import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MetadataService } from "@/lib/metadata-service";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const metadata = await MetadataService.getUserMetadata(userId);

    if (!metadata) {
      return Response.json({
        message: "No metadata found for user",
        metadata: null
      });
    }

    return Response.json({
      message: "User metadata retrieved successfully",
      metadata
    });

  } catch (error) {
    console.error("Metadata API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const success = await MetadataService.deleteUserMetadata(userId);

    if (success) {
      return Response.json({
        message: "User metadata deleted successfully"
      });
    } else {
      return Response.json({
        message: "Failed to delete user metadata"
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Metadata delete error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}