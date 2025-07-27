import { generateWithSystemPrompt } from "./openai";

export interface ConversationContext {
  userMessage: string;
  assistantResponse: string;
  timestamp: number;
}

export interface GeneratedMetadata {
  prominentTopics: string[];
  representativeConversations: string[];
  narrativeOverviews: string[];
  keyQuestions: string[];
  emergingTrends: string[];
  userSentiments: string[];
  peopleMentions: Array<{
    name: string;
    context: string;
  }>;
}

export interface ExistingMetadata {
  prominentTopics: string[];
  representativeConversations: string[];
  narrativeOverviews: string[];
  keyQuestions: string[];
  emergingTrends: string[];
  userSentiments: string[];
  peopleMentions: Array<{
    name: string;
    context: string;
  }>;
}

export class MetadataGenerator {
  private static readonly SYSTEM_PROMPT = `You are a contextual metadata analyst focused on creating CONCISE, HIGH-VALUE metadata for semantic search. Your goal is to compress and consolidate information efficiently.

Given a new conversation and existing metadata, provide MINIMAL updates to these categories:

1. **Prominent Topics**: Broad themes (max 3-5 words each). Consolidate similar topics.
2. **Representative Conversations**: Only significant conversations worth remembering (max 1-2 per update)
3. **Narrative Overviews**: High-level patterns only (max 1 per update)
4. **Key Questions**: Only genuinely important recurring questions
5. **Emerging Trends**: New directions in conversation (be selective)
6. **User Sentiments**: Major sentiment shifts only
7. **People Mentions**: Only important names/entities mentioned

CRITICAL COMPRESSION RULES:
- CONSOLIDATE similar existing topics instead of adding new ones (e.g. "database issues" + "SQL problems" → "database/SQL issues")
- Add MAXIMUM 1 item per category per conversation
- Use broad, searchable terms rather than specific details
- Skip trivial or one-off mentions
- If existing metadata already covers the topic, return empty array for that category
- Prioritize QUALITY over QUANTITY - be extremely selective


CRITICAL: Respond with ONLY valid JSON. Do NOT wrap in markdown code blocks. Do NOT include any text before or after the JSON. Return raw JSON only.

Example response:
{
  "prominentTopics": ["database optimization"],
  "representativeConversations": [],
  "narrativeOverviews": [],
  "keyQuestions": [],
  "emergingTrends": [],
  "userSentiments": [],
  "peopleMentions": []
}`;

  static async generateMetadata(
    conversation: ConversationContext,
    existingMetadata: ExistingMetadata
  ): Promise<GeneratedMetadata> {
    try {
      const userPrompt = `
EXISTING METADATA:
${JSON.stringify(existingMetadata, null, 2)}

NEW CONVERSATION:
User: "${conversation.userMessage}"
Assistant: "${conversation.assistantResponse}"
Timestamp: ${new Date(conversation.timestamp).toISOString()}

Based on this new conversation and the existing metadata, what updates should be made? Return only new information that adds value for semantic search and user understanding.`;

      const completion = await generateWithSystemPrompt(
        this.SYSTEM_PROMPT,
        userPrompt
      );

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content received from OpenAI");
      }

      console.log("content", content);

      // Extract JSON from markdown code blocks if present
      const cleanContent = this.extractJSON(content);
      const metadata = JSON.parse(cleanContent) as GeneratedMetadata;

      console.log("metadata", metadata);

      // Validate the structure
      this.validateMetadata(metadata);

      return metadata;
    } catch (error) {
      console.error("Error generating metadata:", error);
      // Return empty metadata if generation fails
      return {
        prominentTopics: [],
        representativeConversations: [],
        narrativeOverviews: [],
        keyQuestions: [],
        emergingTrends: [],
        userSentiments: [],
        peopleMentions: [],
      };
    }
  }

  static async generateInitialMetadata(
    conversation: ConversationContext
  ): Promise<GeneratedMetadata> {
    const emptyMetadata: ExistingMetadata = {
      prominentTopics: [],
      representativeConversations: [],
      narrativeOverviews: [],
      keyQuestions: [],
      emergingTrends: [],
      userSentiments: [],
      peopleMentions: [],
    };

    return this.generateMetadata(conversation, emptyMetadata);
  }

  private static validateMetadata(metadata: GeneratedMetadata): void {
    const requiredFields = [
      "prominentTopics",
      "representativeConversations",
      "narrativeOverviews",
      "keyQuestions",
      "emergingTrends",
      "userSentiments",
      "peopleMentions",
    ];

    for (const field of requiredFields) {
      if (
        !(field in metadata) ||
        !Array.isArray(metadata[field as keyof GeneratedMetadata])
      ) {
        // Set missing or invalid fields to empty arrays
        (metadata as unknown as Record<string, unknown>)[field] = [];
      }
    }

    // Validate people mentions structure
    if (Array.isArray(metadata.peopleMentions)) {
      for (const mention of metadata.peopleMentions) {
        if (!mention.name || !mention.context) {
          // If mention is missing name or context, set to empty array and break
          metadata.peopleMentions = [];
          break;
        }
      }
    } else {
      metadata.peopleMentions = [];
    }
  }

  static mergeMetadata(
    existing: ExistingMetadata,
    newMetadata: GeneratedMetadata
  ): ExistingMetadata {
    const merged: ExistingMetadata = {
      prominentTopics: [...existing.prominentTopics],
      representativeConversations: [...existing.representativeConversations],
      narrativeOverviews: [...existing.narrativeOverviews],
      keyQuestions: [...existing.keyQuestions],
      emergingTrends: [...existing.emergingTrends],
      userSentiments: [...existing.userSentiments],
      peopleMentions: [...existing.peopleMentions],
    };

    // Merge topics with similarity checking to avoid near-duplicates
    merged.prominentTopics.push(
      ...newMetadata.prominentTopics.filter(
        (newTopic) => !this.isTopicSimilar(newTopic, existing.prominentTopics)
      )
    );

    // Simple duplicate checking for other categories
    merged.representativeConversations.push(
      ...newMetadata.representativeConversations.filter(
        (conv) => !existing.representativeConversations.includes(conv)
      )
    );

    merged.narrativeOverviews.push(
      ...newMetadata.narrativeOverviews.filter(
        (overview) => !existing.narrativeOverviews.includes(overview)
      )
    );

    merged.keyQuestions.push(
      ...newMetadata.keyQuestions.filter(
        (question) => !existing.keyQuestions.includes(question)
      )
    );

    merged.emergingTrends.push(
      ...newMetadata.emergingTrends.filter(
        (trend) => !existing.emergingTrends.includes(trend)
      )
    );

    merged.userSentiments.push(
      ...newMetadata.userSentiments.filter(
        (sentiment) => !existing.userSentiments.includes(sentiment)
      )
    );

    // For people mentions, check for duplicate names
    const existingNames = existing.peopleMentions.map((p) =>
      p.name.toLowerCase()
    );
    merged.peopleMentions.push(
      ...newMetadata.peopleMentions.filter(
        (mention) => !existingNames.includes(mention.name.toLowerCase())
      )
    );

    // Apply strict limits to prevent unbounded growth
    const strictLimits = {
      prominentTopics: 15,
      representativeConversations: 10,
      narrativeOverviews: 8,
      keyQuestions: 12,
      emergingTrends: 10,
      userSentiments: 12,
      peopleMentions: 25,
    };

    Object.entries(strictLimits).forEach(([key, limit]) => {
      const field = key as keyof ExistingMetadata;
      if (merged[field].length > limit) {
        // Keep most recent entries
        merged[field] = merged[field].slice(-limit);
      }
    });

    return merged;
  }

  private static extractJSON(content: string): string {
    // Remove markdown code blocks if present
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      return jsonMatch[1].trim();
    }

    // If no markdown blocks, try to find JSON object
    const jsonObjectMatch = content.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      return jsonObjectMatch[0].trim();
    }

    // Return original content if no patterns match
    return content.trim();
  }

  private static isTopicSimilar(
    newTopic: string,
    existingTopics: string[]
  ): boolean {
    const newWords = newTopic.toLowerCase().split(/\s+/);

    for (const existingTopic of existingTopics) {
      const existingWords = existingTopic.toLowerCase().split(/\s+/);

      // Check for significant word overlap (>50% of words in common)
      const commonWords = newWords.filter((word) =>
        existingWords.some(
          (existing) => existing.includes(word) || word.includes(existing)
        )
      );

      const overlapRatio =
        commonWords.length / Math.min(newWords.length, existingWords.length);

      if (overlapRatio > 0.5) {
        return true; // Topics are similar enough
      }
    }

    return false;
  }
}
