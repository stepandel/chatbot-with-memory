import OpenAI from "openai";

let openai: OpenAI | null = null;

function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export async function createEmbedding(text: string) {
  const client = getOpenAI();
  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    dimensions: 512,
  });

  return response.data[0].embedding;
}

export async function createChatCompletion(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
) {
  const client = getOpenAI();
  return client.chat.completions.create({
    model: "gpt-4o",
    messages,
    stream: true,
  });
}

export async function generateAutocomplete(
  prompt: string,
  model: string = "gpt-4o"
) {
  const client = getOpenAI();
  return client.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
  });
}

export async function generateWithSystemPrompt(
  systemPrompt: string,
  userPrompt: string,
  model: string = "gpt-4o"
) {
  const client = getOpenAI();
  return client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
  });
}

export { getOpenAI as openai };
