-- CreateTable
CREATE TABLE "user_contextual_metadata" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "prominentTopics" JSONB NOT NULL DEFAULT '[]',
    "representativeConversations" JSONB NOT NULL DEFAULT '[]',
    "narrativeOverviews" JSONB NOT NULL DEFAULT '[]',
    "keyQuestions" JSONB NOT NULL DEFAULT '[]',
    "emergingTrends" JSONB NOT NULL DEFAULT '[]',
    "userSentiments" JSONB NOT NULL DEFAULT '[]',
    "peopleMentions" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastInteractionAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "interactionCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_contextual_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_contextual_metadata_userId_key" ON "user_contextual_metadata"("userId");

-- CreateIndex
CREATE INDEX "user_contextual_metadata_userId_idx" ON "user_contextual_metadata"("userId");

-- CreateIndex
CREATE INDEX "user_contextual_metadata_lastInteractionAt_idx" ON "user_contextual_metadata"("lastInteractionAt");

-- CreateIndex
CREATE INDEX "user_contextual_metadata_updatedAt_idx" ON "user_contextual_metadata"("updatedAt");

-- AddForeignKey
ALTER TABLE "user_contextual_metadata" ADD CONSTRAINT "user_contextual_metadata_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
