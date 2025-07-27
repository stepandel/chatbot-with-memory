import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MetadataService } from "@/lib/metadata-service";

export async function GET(request: NextRequest) {
  try {
    // Check authentication (you might want to add admin role check here)
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    if (action === 'stats') {
      const stats = await MetadataService.getMetadataStats();
      return Response.json({
        message: "Metadata statistics retrieved successfully",
        stats
      });
    } else if (action === 'all') {
      const allUsers = await MetadataService.getAllUsersWithMetadata();
      return Response.json({
        message: "All user metadata retrieved successfully",
        users: allUsers
      });
    } else {
      return Response.json({
        message: "Invalid action. Use ?action=stats or ?action=all"
      }, { status: 400 });
    }

  } catch (error) {
    console.error("Admin metadata API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}