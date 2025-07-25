import { Index, Pinecone } from "@pinecone-database/pinecone";

let pinecone: Pinecone | null = null;
let index: Index | null = null;

function getPinecone() {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return pinecone;
}

function getIndex() {
  if (!index) {
    const client = getPinecone();
    index = client.index(process.env.PINECONE_INDEX!);
  }
  return index;
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
  userId: string = "default",
  topK: number = 5
) {
  const index = getIndex();
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
  const index = getIndex();
  await index.namespace(userId).upsert([
    {
      id,
      values: embedding,
      metadata: message,
    },
  ]);
}

export { pinecone };
