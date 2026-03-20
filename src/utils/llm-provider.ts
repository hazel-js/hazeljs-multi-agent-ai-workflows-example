import { LLMProvider, LLMChatRequest, LLMChatResponse, LLMStreamChunk } from '@hazeljs/agent';
import OpenAI from 'openai';

export class OpenAILLMProvider implements LLMProvider {
  private openai: OpenAI;

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
    
    // Bind methods to preserve 'this' context when called by agent runtime
    this.streamChat = this.streamChat.bind(this);
    this.chat = this.chat.bind(this);
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

  async *streamChat(request: LLMChatRequest): AsyncIterable<LLMStreamChunk> {
    const stream = await this.openai.chat.completions.create({
      model: request.model || 'gpt-4o-mini',
      messages: request.messages as any,
      temperature: request.temperature,
      max_tokens: request.maxTokens,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      if (delta?.content) {
        yield {
          content: delta.content,
        };
      }
    }
  }

  /**
   * Stream chat with callback for true real-time streaming (bypasses async generator buffering)
   * This uses the OpenAI SDK's controller/stream approach for immediate token delivery
   */
  async streamChatRealtime(
    request: LLMChatRequest,
    onToken: (content: string) => void,
    onComplete?: (fullContent: string) => void
  ): Promise<void> {
    const stream = await this.openai.chat.completions.create({
      model: request.model || 'gpt-4o-mini',
      messages: request.messages as any,
      temperature: request.temperature,
      max_tokens: request.maxTokens,
      stream: true,
    });

    let fullContent = '';

    // Use the stream's iterator directly without for-await to avoid buffering
    const reader = stream[Symbol.asyncIterator]();
    
    while (true) {
      const { done, value } = await reader.next();
      
      if (done) break;
      
      const delta = value.choices[0]?.delta;
      if (delta?.content) {
        fullContent += delta.content;
        // Call callback immediately - no buffering
        onToken(delta.content);
      }
    }

    if (onComplete) {
      onComplete(fullContent);
    }
  }
}
