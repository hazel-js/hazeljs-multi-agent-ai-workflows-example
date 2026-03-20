import { Module } from '@hazeljs/core';
import { Controller, Get, Req, Res } from '@hazeljs/core';
import { AgentRuntime } from '@hazeljs/agent';
import { OpenAILLMProvider } from '../utils/llm-provider';
import { ResearchAgent } from '../agents/research-agent';

/**
 * SSE Streaming Controller for Real-time Agent Execution
 * 
 * This demonstrates true word-by-word streaming using Server-Sent Events,
 * bypassing async generator buffering issues.
 */

@Controller('/api')
export class StreamingController {
  private runtime: AgentRuntime;

  constructor() {
    this.runtime = new AgentRuntime({
      llmProvider: new OpenAILLMProvider(process.env.OPENAI_API_KEY),
      defaultMaxSteps: 10,
      enableObservability: true,
    });

    this.runtime.registerAgent(ResearchAgent);
    this.runtime.registerAgentInstance('ResearchAgent', new ResearchAgent());
  }

  @Get('/stream')
  async streamAgent(@Req() req: any, @Res() res: any) {
    const query = req.query?.q || 'What are the key features of TypeScript 5.0?';
    const format = req.query?.format || 'sse'; // 'sse' for web UI, 'text' for terminal

    // Use the new sse() method from @hazeljs/core
    const stream = res.sse();

    try {
      let tokenCount = 0;
      const startTime = Date.now();

      // Send initial connection message for SSE format
      if (format === 'sse') {
        stream.write('data: {"type":"connected"}\n\n');
      }

      // Stream agent execution with real-time token delivery
      for await (const chunk of this.runtime.executeStream(
        'ResearchAgent',
        query,
        { streaming: true }
      )) {
        if (format === 'sse') {
          // SSE format with JSON for web UI
          const data = JSON.stringify({
            type: chunk.type,
            ...(chunk.type === 'token' && { content: chunk.content }),
            ...(chunk.type === 'step' && { 
              step: {
                state: chunk.step.state,
                action: chunk.step.action?.type,
              }
            }),
            ...(chunk.type === 'done' && {
              result: {
                state: chunk.result.state,
                duration: chunk.result.duration,
                response: chunk.result.response,
              }
            }),
            timestamp: Date.now() - startTime,
          });
          stream.write(`data: ${data}\n\n`);
          
          if (chunk.type === 'token') {
            tokenCount++;
          }
        } else {
          // Plain text format for terminal
          if (chunk.type === 'token') {
            stream.write(chunk.content);
            tokenCount++;
          } else if (chunk.type === 'step') {
            stream.write('\n\n');
          }
        }
      }

      // Send completion message
      if (format === 'sse') {
        stream.write(`data: {"type":"complete","tokens":${tokenCount}}\n\n`);
      } else {
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        stream.write(`\n\n---\n✅ Complete: ${tokenCount} tokens in ${duration}s\n`);
      }
      
      stream.end();

    } catch (error) {
      const errorData = JSON.stringify({
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      stream.write(`data: ${errorData}\n\n`);
      stream.end();
    }
  }

  @Get('/health')
  health() {
    return { status: 'ok', service: 'agent-streaming' };
  }

}

/**
 * Root Controller for serving static files
 */
@Controller('/')
export class RootController {
  @Get('streaming-demo.html')
  serveDemoHtml(@Res() res: any) {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.resolve(process.cwd(), 'public/streaming-demo.html');
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      res.setHeader('Content-Type', 'text/html');
      res.write(content);
      res.end();
    } else {
      res.status(404).json({ error: `File not found: ${filePath}` });
    }
  }
}

@Module({
  controllers: [StreamingController, RootController],
})
export class StreamingServerModule {}
