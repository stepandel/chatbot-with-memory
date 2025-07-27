import { prisma } from "./prisma";
import {
  MetadataGenerator,
  ConversationContext,
  ExistingMetadata,
} from "./metadata-generator";

export class MetadataService {
  static async updateUserMetadata(
    userId: string,
    conversation: ConversationContext
  ): Promise<void> {
    try {
      // Get existing metadata for the user
      const existingRecord = await prisma.userContextualMetadata.findUnique({
        where: { userId },
      });

      let existingMetadata: ExistingMetadata;

      if (existingRecord) {
        // Parse existing metadata from the database
        existingMetadata = {
          prominentTopics: existingRecord.prominentTopics as string[],
          representativeConversations:
            existingRecord.representativeConversations as string[],
          narrativeOverviews: existingRecord.narrativeOverviews as string[],
          keyQuestions: existingRecord.keyQuestions as string[],
          emergingTrends: existingRecord.emergingTrends as string[],
          userSentiments: existingRecord.userSentiments as string[],
          peopleMentions: existingRecord.peopleMentions as Array<{
            name: string;
            context: string;
          }>,
        };
      } else {
        // First interaction for this user
        existingMetadata = {
          prominentTopics: [],
          representativeConversations: [],
          narrativeOverviews: [],
          keyQuestions: [],
          emergingTrends: [],
          userSentiments: [],
          peopleMentions: [],
        };
      }

      // Generate new metadata using LLM
      const newMetadata = await MetadataGenerator.generateMetadata(
        conversation,
        existingMetadata
      );

      // Merge existing and new metadata
      const mergedMetadata = MetadataGenerator.mergeMetadata(
        existingMetadata,
        newMetadata
      );

      console.log("mergedMetadata", mergedMetadata);

      // Upsert the metadata record
      await prisma.userContextualMetadata.upsert({
        where: { userId },
        create: {
          userId,
          prominentTopics: mergedMetadata.prominentTopics,
          representativeConversations:
            mergedMetadata.representativeConversations,
          narrativeOverviews: mergedMetadata.narrativeOverviews,
          keyQuestions: mergedMetadata.keyQuestions,
          emergingTrends: mergedMetadata.emergingTrends,
          userSentiments: mergedMetadata.userSentiments,
          peopleMentions: mergedMetadata.peopleMentions,
          lastInteractionAt: new Date(conversation.timestamp),
          interactionCount: 1,
        },
        update: {
          prominentTopics: mergedMetadata.prominentTopics,
          representativeConversations:
            mergedMetadata.representativeConversations,
          narrativeOverviews: mergedMetadata.narrativeOverviews,
          keyQuestions: mergedMetadata.keyQuestions,
          emergingTrends: mergedMetadata.emergingTrends,
          userSentiments: mergedMetadata.userSentiments,
          peopleMentions: mergedMetadata.peopleMentions,
          lastInteractionAt: new Date(conversation.timestamp),
          interactionCount: {
            increment: 1,
          },
          updatedAt: new Date(),
        },
      });

      console.log(`Successfully updated metadata for user ${userId}`);
    } catch (error) {
      console.error("Error updating user metadata:", error);
      // Don't throw - we don't want metadata updates to break the chat flow
    }
  }

  static async getUserMetadata(userId: string) {
    try {
      const metadata = await prisma.userContextualMetadata.findUnique({
        where: { userId },
      });

      if (!metadata) {
        return null;
      }

      return {
        id: metadata.id,
        userId: metadata.userId,
        prominentTopics: metadata.prominentTopics as string[],
        representativeConversations:
          metadata.representativeConversations as string[],
        narrativeOverviews: metadata.narrativeOverviews as string[],
        keyQuestions: metadata.keyQuestions as string[],
        emergingTrends: metadata.emergingTrends as string[],
        userSentiments: metadata.userSentiments as string[],
        peopleMentions: metadata.peopleMentions as Array<{
          name: string;
          context: string;
        }>,
        createdAt: metadata.createdAt,
        updatedAt: metadata.updatedAt,
        lastInteractionAt: metadata.lastInteractionAt,
        interactionCount: metadata.interactionCount,
      };
    } catch (error) {
      console.error("Error fetching user metadata:", error);
      return null;
    }
  }

  static async deleteUserMetadata(userId: string): Promise<boolean> {
    try {
      await prisma.userContextualMetadata.delete({
        where: { userId },
      });
      return true;
    } catch (error) {
      console.error("Error deleting user metadata:", error);
      return false;
    }
  }

  static async getAllUsersWithMetadata() {
    try {
      const users = await prisma.userContextualMetadata.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          lastInteractionAt: "desc",
        },
      });

      return users.map((record) => ({
        user: record.user,
        metadata: {
          prominentTopics: record.prominentTopics as string[],
          representativeConversations:
            record.representativeConversations as string[],
          narrativeOverviews: record.narrativeOverviews as string[],
          keyQuestions: record.keyQuestions as string[],
          emergingTrends: record.emergingTrends as string[],
          userSentiments: record.userSentiments as string[],
          peopleMentions: record.peopleMentions as Array<{
            name: string;
            context: string;
          }>,
          lastInteractionAt: record.lastInteractionAt,
          interactionCount: record.interactionCount,
        },
      }));
    } catch (error) {
      console.error("Error fetching all users with metadata:", error);
      return [];
    }
  }

  static async getMetadataStats() {
    try {
      const stats = await prisma.userContextualMetadata.aggregate({
        _count: {
          id: true,
        },
        _avg: {
          interactionCount: true,
        },
        _max: {
          lastInteractionAt: true,
        },
      });

      const recentUsers = await prisma.userContextualMetadata.count({
        where: {
          lastInteractionAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      });

      return {
        totalUsers: stats._count.id || 0,
        averageInteractions: Math.round(stats._avg.interactionCount || 0),
        lastInteraction: stats._max.lastInteractionAt,
        activeUsersLastWeek: recentUsers,
      };
    } catch (error) {
      console.error("Error fetching metadata stats:", error);
      return {
        totalUsers: 0,
        averageInteractions: 0,
        lastInteraction: null,
        activeUsersLastWeek: 0,
      };
    }
  }

  static async processMetadataAsync(
    userId: string,
    userMessage: string,
    assistantResponse: string,
    timestamp: number = Date.now()
  ): Promise<void> {
    // Run metadata update asynchronously to avoid blocking the chat response
    setImmediate(async () => {
      await this.updateUserMetadata(userId, {
        userMessage,
        assistantResponse,
        timestamp,
      });
    });
  }
}
