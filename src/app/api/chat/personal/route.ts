import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createEmbedding, createChatCompletion } from "@/lib/openai";
import { queryMessages, upsertMessage, ChatMessage } from "@/lib/pinecone";
import { MetadataService } from "@/lib/metadata-service";
import { ContextFormatter } from "@/lib/context-formatter";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Only allow for regular mode users
    if (session.user.mode === "fun") {
      return new Response("Not available in fun mode", { status: 400 });
    }

    const { message, conversationId } = await request.json();

    if (!message) {
      return new Response("Message is required", { status: 400 });
    }

    if (!conversationId) {
      return new Response("Conversation ID is required", { status: 400 });
    }

    const userId = session.user.id;

    // Verify conversation belongs to user
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: userId,
      }
    });

    if (!conversation) {
      return new Response("Conversation not found", { status: 404 });
    }

    // Get conversation history from database
    const dbMessages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      select: {
        role: true,
        content: true,
      }
    });

    // Step 1, 2, 3: Parallelize metadata loading, embedding creation, and context query
    const [userMetadata, userEmbedding] = await Promise.all([
      MetadataService.getUserMetadata(userId),
      createEmbedding(message),
    ]);

    const relevantMessages = await queryMessages(userEmbedding, userId, 5);

    // Step 4: Build chat history with context
    const contextMessages = relevantMessages
      .sort((a, b) => a.metadata.timestamp - b.metadata.timestamp)
      .map((match) => ({
        role: match.metadata.role as "user",
        content: match.metadata.message,
      }));

    // Step 5: Create system message with metadata context
    const systemPrompt =
      ContextFormatter.createSystemPromptWithContext(userMetadata);

    // Build messages array with system context and conversation history
    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...contextMessages,
      ...dbMessages.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user" as const, content: message },
    ];

    // Step 6: Create chat completion with streaming
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

          // Step 7: Save both messages to database and Pinecone after completion
          const timestamp = Date.now();

          // Save to database
          await prisma.$transaction(async (tx) => {
            // Save user message
            await tx.message.create({
              data: {
                id: uuidv4(),
                conversationId,
                role: "user",
                content: message,
              }
            });

            // Save assistant response
            await tx.message.create({
              data: {
                id: uuidv4(),
                conversationId,
                role: "assistant",
                content: assistantResponse,
              }
            });

            // Update conversation's updatedAt timestamp
            await tx.conversation.update({
              where: { id: conversationId },
              data: { updatedAt: new Date() }
            });
          });

          // Save to Pinecone for vector search
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

          // Save assistant response to Pinecone
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

          // Step 8: Update contextual metadata asynchronously
          MetadataService.processMetadataAsync(
            userId,
            message,
            assistantResponse,
            timestamp
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
    console.error("Personal chat API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}