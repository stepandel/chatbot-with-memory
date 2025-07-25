#!/usr/bin/env tsx

import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { createEmbedding } from "../src/lib/openai";
import { upsertMessage, ChatMessage } from "../src/lib/pinecone";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

// Debug: Check if environment variables are loaded
console.log("Environment variables loaded:");
console.log(
  "OPENAI_API_KEY:",
  process.env.OPENAI_API_KEY ? "✓ Present" : "✗ Missing"
);
console.log(
  "PINECONE_API_KEY:",
  process.env.PINECONE_API_KEY ? "✓ Present" : "✗ Missing"
);
console.log(
  "PINECONE_INDEX:",
  process.env.PINECONE_INDEX ? "✓ Present" : "✗ Missing"
);

// ChatGPT export format
interface ChatGPTExport {
  title: string;
  create_time: number;
  mapping: {
    [key: string]: {
      message: {
        author: { role: string };
        content: { parts: string[] };
        create_time?: number;
      } | null;
    };
  };
}

async function importConversations(
  filePath: string,
  userId: string = "default"
) {
  console.log(`Starting import from ${filePath}...`);

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
  let messages: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp?: number;
  }> = [];

  // Parse ChatGPT export format
  if (!Array.isArray(jsonData) || !jsonData[0]?.mapping) {
    console.error("Invalid ChatGPT export format.");
    console.error("Expected: Array of conversations with mapping objects");
    console.error(
      "Make sure you're using a ChatGPT conversations export file."
    );
    process.exit(1);
  }

  console.log("Processing ChatGPT export...");
  messages = [];

  for (const conversation of jsonData) {
    if (!conversation.mapping) continue;

    // Extract messages from mapping object
    const rawMessages = Object.values(conversation.mapping)
      .filter((node: any) => node.message && node.message.author)
      .map((node: any) => {
        const message = node.message;
        const role = message.author.role;
        const content = message.content.parts?.join("") || "";
        const timestamp = message.create_time
          ? message.create_time * 1000
          : undefined;

        return {
          role: role as "user" | "assistant",
          content,
          timestamp,
        };
      })
      .filter((msg: any) => 
        (msg.role === "user" || msg.role === "assistant") && msg.content.trim()
      );

    messages.push(...rawMessages);
  }

  console.log(`Found ${messages.length} messages to import`);

  let imported = 0;
  let errors = 0;

  for (const [index, message] of messages.entries()) {
    try {
      if (!message.role || !message.content) {
        console.warn(`Skipping message ${index}: missing role or content`);
        continue;
      }

      console.log(
        `Processing message ${index + 1}/${messages.length} (${message.role})`
      );

      // Create embedding for the message
      const embedding = await createEmbedding(message.content);

      // Create ChatMessage object
      const chatMessage: ChatMessage = {
        id: uuidv4(),
        message: message.content,
        role: message.role,
        timestamp: message.timestamp || Date.now() + index,
      };

      // Upsert to Pinecone
      await upsertMessage(chatMessage.id, embedding, chatMessage, userId);

      imported++;

      // Rate limiting - small delay between requests
      if (index > 0 && index % 10 === 0) {
        console.log(`Processed ${index} messages, taking a brief pause...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Error processing message ${index}:`, error);
      errors++;
    }
  }

  console.log(`\nImport complete!`);
  console.log(`✅ Successfully imported: ${imported} messages`);
  console.log(`❌ Errors: ${errors} messages`);
  console.log(`📊 Total processed: ${imported + errors} messages`);
}

// CLI usage
const args = process.argv.slice(2);
const filePath = args[0];
const userId = args[1] || "default";

if (!filePath) {
  console.log(
    "Usage: npx tsx scripts/import-conversations.ts <path-to-chatgpt-export.json> [userId]"
  );
  console.log("");
  console.log("Examples:");
  console.log("  npx tsx scripts/import-conversations.ts ./conversations.json");
  console.log(
    "  npx tsx scripts/import-conversations.ts ./conversations.json user123"
  );
  console.log("");
  console.log(
    "This script imports ChatGPT conversation exports into Pinecone."
  );
  console.log(
    "Export your ChatGPT conversations from: Settings > Data Controls > Export"
  );
  process.exit(1);
}

// Run the import
importConversations(filePath, userId).catch(console.error);
