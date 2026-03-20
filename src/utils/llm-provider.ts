import { LLMProvider, LLMChatRequest, LLMChatResponse } from '@hazeljs/agent';
import OpenAI from 'openai';

export class OpenAILLMProvider implements LLMProvider {
  private openai: OpenAI;

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  async chat(request: LLMChatRequest): Promise<LLMChatResponse> {
    const response = await this.openai.chat.completions.create({
      model: request.model || 'gpt-4o-mini',
      messages: request.messages as any,
      temperature: request.temperature,
      max_tokens: request.maxTokens,
      stream: false,
    });

    return {
      content: response.choices[0].message.content || '',
      finishReason: response.choices[0].finish_reason || 'stop',
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
    };
  }
}
