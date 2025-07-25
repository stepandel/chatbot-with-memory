import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createEmbedding, createChatCompletion } from "@/lib/openai";
import { queryMessages, upsertMessage, ChatMessage } from "@/lib/pinecone";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { message } = await request.json();

    if (!message) {
      return new Response("Message is required", { status: 400 });
    }

    const userId = session.user.id; // Use authenticated user ID

    // Step 1: Create embedding for the user message
    const userEmbedding = await createEmbedding(message);

    // Step 2: Query Pinecone for relevant context
    const relevantMessages = await queryMessages(userEmbedding, userId, 5);

    // Step 3: Build chat history with context
    const contextMessages = relevantMessages
      .sort((a, b) => a.metadata.timestamp - b.metadata.timestamp)
      .map((match) => ({
        role: match.metadata.role as "user",
        content: match.metadata.message,
      }));

    // Add the current user message
    const messages = [
      ...contextMessages,
      { role: "user" as const, content: message },
    ];

    // Step 4: Create chat completion with streaming
    const completion = await createChatCompletion(messages);

    // Create a readable stream to handle the response
    const stream = new ReadableStream({
      async start(controller) {
        let assistantResponse = "";

        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              assistantResponse += content;
              controller.enqueue(new TextEncoder().encode(content));
            }
          }

          // Step 5: Save both messages to Pinecone after completion
          const timestamp = Date.now();

          // Save user message
          const userMessageId = uuidv4();
          const userMessage: ChatMessage = {
            id: userMessageId,
            message,
            role: "user",
            timestamp,
          };
          await upsertMessage(
            userMessageId,
            userEmbedding,
            userMessage,
            userId
          );

          // Save assistant response
          const assistantMessageId = uuidv4();
          const assistantEmbedding = await createEmbedding(assistantResponse);
          const assistantMessage: ChatMessage = {
            id: assistantMessageId,
            message: assistantResponse,
            role: "assistant",
            timestamp: timestamp + 1,
          };
          await upsertMessage(
            assistantMessageId,
            assistantEmbedding,
            assistantMessage,
            userId
          );

          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
