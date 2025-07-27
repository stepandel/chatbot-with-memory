import { generateWithSystemPrompt } from "./openai";

export interface ConversationContext {
  userMessage: string;
  assistantResponse?: string;
}

export class ConversationTitleGenerator {
  private static readonly SYSTEM_PROMPT = `You are a conversation title generator. Your task is to create concise, descriptive titles for chat conversations based on the content.

Rules:
- Generate titles that are 3-6 words long
- Make titles descriptive and specific to the conversation topic
- Use clear, simple language
- Avoid generic words like "chat", "conversation", "help"
- Focus on the main topic or question being discussed
- Use title case (capitalize first letter of each main word)

Examples:
- User asks about React hooks → "React Hooks Explanation"
- User asks for recipe suggestions → "Recipe Recommendations"
- User discusses JavaScript arrays → "JavaScript Array Methods"
- User needs coding help → "Debugging Code Issues"
- User asks about travel → "Travel Planning Advice"

Respond with ONLY the title, no quotes, no additional text.`;

  /**
   * Generate a meaningful title based on conversation context
   */
  static async generateTitle(context: ConversationContext): Promise<string> {
    try {
      let prompt = `User message: "${context.userMessage}"`;
      
      if (context.assistantResponse) {
        prompt += `\nAssistant response: "${context.assistantResponse.slice(0, 200)}..."`;
      }
      
      prompt += "\n\nGenerate a concise title for this conversation:";

      const completion = await generateWithSystemPrompt(
        this.SYSTEM_PROMPT,
        prompt
      );

      const title = completion.choices[0]?.message?.content?.trim();
      
      if (!title) {
        throw new Error("No title generated");
      }

      // Clean up the title (remove quotes if present, limit length)
      const cleanTitle = title
        .replace(/^["']|["']$/g, "") // Remove surrounding quotes
        .slice(0, 60) // Max 60 characters
        .trim();

      return cleanTitle || this.getFallbackTitle(context.userMessage);
    } catch (error) {
      console.error("Error generating conversation title:", error);
      return this.getFallbackTitle(context.userMessage);
    }
  }

  /**
   * Generate a fallback title when AI generation fails
   */
  private static getFallbackTitle(userMessage: string): string {
    // Extract meaningful words (remove common words)
    const commonWords = new Set([
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 
      'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 
      'will', 'with', 'can', 'could', 'should', 'would', 'how', 'what', 'when', 
      'where', 'why', 'please', 'help', 'me', 'you', 'i', 'my'
    ]);

    const words = userMessage
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.has(word))
      .slice(0, 4); // Take first 4 meaningful words

    if (words.length === 0) {
      return "New Conversation";
    }

    // Capitalize first letter of each word
    const title = words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return title.slice(0, 50); // Limit to 50 characters
  }

  /**
   * Update conversation title after assistant response is available
   */
  static async updateTitleWithResponse(
    conversationId: string,
    userMessage: string,
    assistantResponse: string,
    onTitleUpdated?: (newTitle: string) => void
  ): Promise<void> {
    try {
      const title = await this.generateTitle({
        userMessage,
        assistantResponse
      });

      // Update the conversation title in the database
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (response.ok && onTitleUpdated) {
        onTitleUpdated(title);
      }
    } catch (error) {
      console.error("Error updating conversation title:", error);
    }
  }
}