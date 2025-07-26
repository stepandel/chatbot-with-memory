import { Index, Pinecone } from "@pinecone-database/pinecone";

let pinecone: Pinecone | null = null;
const indexCache: Map<string, Index> = new Map();

class IndexManager {
  private static instance: IndexManager;
  private indexCreationPromises: Map<string, Promise<boolean>> = new Map();

  private constructor() {}

  static getInstance(): IndexManager {
    if (!IndexManager.instance) {
      IndexManager.instance = new IndexManager();
    }
    return IndexManager.instance;
  }

  async ensureUserIndex(
    userId: string,
    createDedicated: boolean = false
  ): Promise<{ index: Index; isNamespace: boolean }> {
    if (createDedicated) {
      const userIndexName = getUserIndexName(userId);

      // Check if we're already creating this index
      if (this.indexCreationPromises.has(userIndexName)) {
        await this.indexCreationPromises.get(userIndexName);
      } else if (!(await hasUserIndex(userId))) {
        // Create the index if it doesn't exist
        const creationPromise = this.createUserIndexInternal(userId);
        this.indexCreationPromises.set(userIndexName, creationPromise);

        const success = await creationPromise;
        this.indexCreationPromises.delete(userIndexName);

        if (!success) {
          throw new Error(
            `Failed to create dedicated index for user: ${userId}`
          );
        }
      }

      return { index: getIndex(userIndexName), isNamespace: false };
    } else {
      // Use namespace approach with shared index
      return { index: getIndex(), isNamespace: true };
    }
  }

  private async createUserIndexInternal(userId: string): Promise<boolean> {
    try {
      const client = getPinecone();
      const userIndexName = getUserIndexName(userId);

      // Double-check if index exists (race condition protection)
      if (await hasUserIndex(userId)) {
        console.log(`Index already exists for user: ${userId}`);
        return true;
      }

      await client.createIndex({
        name: userIndexName,
        dimension: 512,
        metric: "cosine",
        spec: {
          serverless: {
            cloud: "aws",
            region: "us-east-1",
          },
        },
      });

      console.log(`Created dedicated index for user: ${userId}`);
      return true;
    } catch (error) {
      console.error(`Error creating index for user ${userId}:`, error);
      return false;
    }
  }
}

function getPinecone() {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return pinecone;
}

function getIndex(indexName?: string): Index {
  const targetIndex = indexName || process.env.PINECONE_INDEX!;

  if (!indexCache.has(targetIndex)) {
    const client = getPinecone();
    indexCache.set(targetIndex, client.index(targetIndex));
  }

  return indexCache.get(targetIndex)!;
}

// Helper function to generate user-specific index name
function getUserIndexName(userId: string): string {
  return `chat-user-${userId.replace(/-/g, "")}`.toLowerCase();
}

// Check if user has a dedicated index
export async function hasUserIndex(userId: string): Promise<boolean> {
  try {
    const client = getPinecone();
    const userIndexName = getUserIndexName(userId);
    const indexes = await client.listIndexes();
    return indexes.indexes?.some((idx) => idx.name === userIndexName) || false;
  } catch (error) {
    console.error("Error checking user index:", error);
    return false;
  }
}

// Create a dedicated index for a user
export async function createUserIndex(userId: string): Promise<boolean> {
  try {
    const client = getPinecone();
    const userIndexName = getUserIndexName(userId);

    // Check if index already exists
    if (await hasUserIndex(userId)) {
      console.log(`Index already exists for user: ${userId}`);
      return true;
    }

    await client.createIndex({
      name: userIndexName,
      dimension: 512, // Match OpenAI embedding dimension
      metric: "cosine",
      spec: {
        serverless: {
          cloud: "aws",
          region: "us-east-1",
        },
      },
    });

    console.log(`Created dedicated index for user: ${userId}`);
    return true;
  } catch (error) {
    console.error(`Error creating index for user ${userId}:`, error);
    return false;
  }
}

// Delete a user's dedicated index
export async function deleteUserIndex(userId: string): Promise<boolean> {
  try {
    const client = getPinecone();
    const userIndexName = getUserIndexName(userId);

    if (await hasUserIndex(userId)) {
      await client.deleteIndex(userIndexName);
      indexCache.delete(userIndexName);
      console.log(`Deleted index for user: ${userId}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error deleting index for user ${userId}:`, error);
    return false;
  }
}

export interface ChatMessage {
  id: string;
  message: string;
  role: "user" | "assistant";
  timestamp: number;
  [key: string]: string | number;
}

export async function queryMessages(
  embedding: number[],
  userId: string,
  topK: number = 5,
  useDedicatedIndex: boolean = false
) {
  try {
    const indexManager = IndexManager.getInstance();
    const { index, isNamespace } = await indexManager.ensureUserIndex(
      userId,
      useDedicatedIndex
    );

    let queryResponse;
    if (isNamespace) {
      // Use namespace in shared index
      queryResponse = await index.namespace(userId).query({
        vector: embedding,
        topK,
        includeMetadata: true,
      });
    } else {
      // Use dedicated index
      queryResponse = await index.query({
        vector: embedding,
        topK,
        includeMetadata: true,
      });
    }

    return (
      queryResponse.matches?.map((match) => ({
        id: match.id,
        score: match.score,
        metadata: match.metadata as ChatMessage,
      })) || []
    );
  } catch (error) {
    console.error(`Error querying messages for user ${userId}:`, error);
    return [];
  }
}

export async function upsertMessage(
  id: string,
  embedding: number[],
  message: ChatMessage,
  userId: string,
  useDedicatedIndex: boolean = false
) {
  try {
    const indexManager = IndexManager.getInstance();
    const { index, isNamespace } = await indexManager.ensureUserIndex(
      userId,
      useDedicatedIndex
    );

    if (isNamespace) {
      // Use namespace in shared index
      await index.namespace(userId).upsert([
        {
          id,
          values: embedding,
          metadata: message,
        },
      ]);
    } else {
      // Use dedicated index
      await index.upsert([
        {
          id,
          values: embedding,
          metadata: message,
        },
      ]);
    }
  } catch (error) {
    console.error(`Error upserting message for user ${userId}:`, error);
    throw error;
  }
}

// Enhanced function to set up user storage (creates index if needed)
export async function setupUserStorage(
  userId: string,
  createDedicatedIndex: boolean = false
): Promise<boolean> {
  try {
    if (createDedicatedIndex) {
      return await createUserIndex(userId);
    }

    // For namespace approach, no setup needed - just ensure user ID is provided
    console.log(`Using namespace approach for user: ${userId}`);
    return true;
  } catch (error) {
    console.error(`Error setting up storage for user ${userId}:`, error);
    return false;
  }
}

export { pinecone };
