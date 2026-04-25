import { AIRouter, getProjectPreset, FREE_PROVIDERS } from "ai-router";
import type { AIProviderID, AIRequest, AIResponse } from "ai-router";

const preset = getProjectPreset("knowbest");

const router = new AIRouter({
  ...preset,
  projectName: "knowbest",
  defaultProvider: "auto",
  providers: [
    ...(FREE_PROVIDERS as AIProviderID[]),
    "claude",
  ],
});

interface RouteAIParams {
  type: string;
  complexity: "low" | "medium" | "high";
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
}

interface RouteAIResult {
  text: string;
  provider: string;
  model: string;
}

const complexityToSpeedVsQuality: Record<string, number> = {
  low: 0.9,
  medium: 0.5,
  high: 0.1,
};

export async function routeAI({
  type,
  complexity,
  prompt,
  systemPrompt,
  maxTokens,
}: RouteAIParams): Promise<RouteAIResult> {
  const messages: AIRequest["messages"] = [];

  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: prompt });

  const taskHint = mapTypeToTaskHint(type);

  const response: AIResponse = await router.chat({
    messages,
    maxTokens,
    provider: complexity === "high" ? "claude" : "auto",
    speedVsQuality: complexityToSpeedVsQuality[complexity] ?? 0.5,
    ...(taskHint && { taskHint }),
  });

  return {
    text: response.content,
    provider: response.provider,
    model: response.model,
  };
}

function mapTypeToTaskHint(
  type: string
): AIRequest["taskHint"] | undefined {
  const map: Record<string, AIRequest["taskHint"]> = {
    generation: "generation",
    analysis: "analysis",
    summarization: "summarization",
    classification: "classification",
    extraction: "extraction",
    conversation: "conversation",
    translation: "translation",
    code: "code",
  };
  return map[type];
}

export { router as aiRouter };
