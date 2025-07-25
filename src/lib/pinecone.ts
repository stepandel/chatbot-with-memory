import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const index = pinecone.index(process.env.PINECONE_INDEX!);

export interface ChatMessage {
  id: string;
  message: string;
  role: "user" | "assistant";
  timestamp: number;
  [key: string]: string | number;
}

export async function queryMessages(
  embedding: number[],
  userId: string = "default",
  topK: number = 5
) {
  const queryResponse = await index.namespace(userId).query({
    vector: embedding,
    topK,
    includeMetadata: true,
  });

  return (
    queryResponse.matches?.map((match) => ({
      id: match.id,
      score: match.score,
      metadata: match.metadata as ChatMessage,
    })) || []
  );
}

export async function upsertMessage(
  id: string,
  embedding: number[],
  message: ChatMessage,
  userId: string = "default"
) {
  await index.namespace(userId).upsert([
    {
      id,
      values: embedding,
      metadata: message,
    },
  ]);
}

export { pinecone };
