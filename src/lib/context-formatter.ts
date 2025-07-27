export interface UserMetadata {
  prominentTopics: string[];
  representativeConversations: string[];
  narrativeOverviews: string[];
  keyQuestions: string[];
  emergingTrends: string[];
  userSentiments: string[];
  peopleMentions: string[];
  interactionCount: number;
  lastInteractionAt: Date;
}

export class ContextFormatter {
  static formatMetadataAsContext(metadata: UserMetadata | null): string {
    if (!metadata || metadata.interactionCount === 0) {
      return "This appears to be a new conversation with no previous context.";
    }

    const contextParts: string[] = [];

    // Add interaction summary
    contextParts.push(
      `Previous conversations: ${metadata.interactionCount} interactions, last on ${metadata.lastInteractionAt.toLocaleDateString()}`
    );

    // Add prominent topics if any
    if (metadata.prominentTopics.length > 0) {
      const topicsText = metadata.prominentTopics
        .slice(0, 8) // Limit to most important topics
        .join(", ");
      contextParts.push(`Key topics discussed: ${topicsText}`);
    }

    // Add key questions if any
    if (metadata.keyQuestions.length > 0) {
      const questionsText = metadata.keyQuestions
        .slice(0, 5) // Limit to most important questions
        .join("; ");
      contextParts.push(`Important questions raised: ${questionsText}`);
    }

    // Add user sentiments if any
    if (metadata.userSentiments.length > 0) {
      const sentimentsText = metadata.userSentiments
        .slice(0, 5)
        .join("; ");
      contextParts.push(`User sentiments: ${sentimentsText}`);
    }

    // Add emerging trends if any
    if (metadata.emergingTrends.length > 0) {
      const trendsText = metadata.emergingTrends
        .slice(0, 4)
        .join(", ");
      contextParts.push(`Recent trends: ${trendsText}`);
    }

    // Add people mentions if any
    if (metadata.peopleMentions.length > 0) {
      const peopleText = metadata.peopleMentions
        .slice(0, 6)
        .join(", ");
      contextParts.push(`People/entities mentioned: ${peopleText}`);
    }

    // Add narrative overviews if any
    if (metadata.narrativeOverviews.length > 0) {
      const narrativeText = metadata.narrativeOverviews
        .slice(0, 3)
        .join(" ");
      contextParts.push(`Conversation patterns: ${narrativeText}`);
    }

    return contextParts.join("\n");
  }

  static createSystemPromptWithContext(metadata: UserMetadata | null): string {
    const basePrompt = `You are a helpful AI assistant. Provide thoughtful, accurate, and helpful responses.`;
    
    const contextualInfo = this.formatMetadataAsContext(metadata);
    
    if (metadata && metadata.interactionCount > 0) {
      return `${basePrompt}

CONVERSATION CONTEXT:
${contextualInfo}

Use this context to provide more personalized and relevant responses. Reference previous topics or patterns when appropriate, but don't be overly specific about past conversations unless directly asked.`;
    }

    return basePrompt;
  }

  static shouldIncludeDetailedContext(metadata: UserMetadata | null): boolean {
    if (!metadata) return false;
    
    // Include detailed context if user has meaningful interaction history
    return (
      metadata.interactionCount >= 3 ||
      metadata.prominentTopics.length >= 2 ||
      metadata.keyQuestions.length >= 1
    );
  }

  static summarizeUserProfile(metadata: UserMetadata | null): string {
    if (!metadata || metadata.interactionCount === 0) {
      return "New user with no conversation history.";
    }

    const summary: string[] = [];
    
    summary.push(`${metadata.interactionCount} total interactions`);
    
    if (metadata.prominentTopics.length > 0) {
      const mainTopics = metadata.prominentTopics.slice(0, 3).join(", ");
      summary.push(`mainly discusses: ${mainTopics}`);
    }

    if (metadata.userSentiments.length > 0) {
      const recentSentiment = metadata.userSentiments[metadata.userSentiments.length - 1];
      summary.push(`recent sentiment: ${recentSentiment}`);
    }

    return summary.join(" | ");
  }
}