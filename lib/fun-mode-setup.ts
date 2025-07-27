import { prisma } from "../src/lib/prisma";
import { FUN_MODE_USER_ID } from "../src/lib/auth";

/**
 * Ensures the Fun Mode shared user exists in the database
 */
export async function ensureFunModeUser() {
  try {
    // Check if Fun Mode user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: FUN_MODE_USER_ID },
      include: { contextualMetadata: true }
    });

    if (existingUser) {
      console.log("Fun Mode user already exists");
      return existingUser;
    }

    // Create the shared Fun Mode user
    const funModeUser = await prisma.user.create({
      data: {
        id: FUN_MODE_USER_ID,
        name: "Fun Mode Collective",
        email: "fun-mode@example.com",
        emailVerified: new Date(),
        image: null,
        contextualMetadata: {
          create: {
            prominentTopics: [],
            representativeConversations: [],
            narrativeOverviews: [],
            keyQuestions: [],
            emergingTrends: [],
            userSentiments: [],
            peopleMentions: [],
            interactionCount: 0,
          }
        }
      },
      include: { contextualMetadata: true }
    });

    console.log("Fun Mode user created successfully");
    return funModeUser;
  } catch (error) {
    console.error("Error ensuring Fun Mode user:", error);
    throw error;
  }
}

/**
 * Gets the Fun Mode user with all contextual metadata
 */
export async function getFunModeUser() {
  const user = await prisma.user.findUnique({
    where: { id: FUN_MODE_USER_ID },
    include: { contextualMetadata: true }
  });

  if (!user) {
    // Create the user if it doesn't exist
    return await ensureFunModeUser();
  }

  return user;
}