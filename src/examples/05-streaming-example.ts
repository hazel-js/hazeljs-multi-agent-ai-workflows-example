import { AgentRuntime, AgentEventType } from '@hazeljs/agent';
import { OpenAILLMProvider } from '../utils/llm-provider';
import { ResearchAgent } from '../agents/research-agent';
import { WriterAgent } from '../agents/writer-agent';

/**
 * Example: Agent Streaming for Real-time UX
 * 
 * Demonstrates how to use agent streaming to provide real-time feedback
 * to users during agent execution.
 */

async function main() {
  console.log('='.repeat(80));
  console.log('Agent Streaming Example - Real-time Execution Updates');
  console.log('='.repeat(80));
  console.log();

  const runtime = new AgentRuntime({
    llmProvider: new OpenAILLMProvider(process.env.OPENAI_API_KEY),
    defaultMaxSteps: 10,
    enableObservability: true,
  });

  runtime.registerAgent(ResearchAgent);
  runtime.registerAgent(WriterAgent);
  runtime.registerAgentInstance('ResearchAgent', new ResearchAgent());
  runtime.registerAgentInstance('WriterAgent', new WriterAgent());

  console.log('Task: Research and write about TypeScript 5.0 features\n');
  console.log('Streaming execution updates in real-time...\n');
  console.log('-'.repeat(80));

  // Track streaming metrics
  let stepCount = 0;
  let tokenCount = 0;
  let toolCallCount = 0;
  const startTime = Date.now();

  try {
    // Stream agent execution with real-time updates
    for await (const chunk of runtime.executeStream(
      'ResearchAgent',
      'Research the key features introduced in TypeScript 5.0',
      { streaming: true }
    )) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      switch (chunk.type) {
        case 'step':
          stepCount++;
          console.log(`\n[${elapsed}s] 📍 Step ${stepCount}`);
          console.log(`   State: ${chunk.step.state}`);
          
          if (chunk.step.error) {
            console.error(`   ❌ Error: ${chunk.step.error.message}`);
            console.error(`   Stack: ${chunk.step.error.stack}`);
          }
          
          if (chunk.step.action) {
            console.log(`   Action: ${chunk.step.action.type}`);
            
            if (chunk.step.action.thought) {
              console.log(`   💭 Thinking: ${chunk.step.action.thought}`);
            }
            
            if (chunk.step.action.toolName) {
              toolCallCount++;
              console.log(`   🔧 Tool: ${chunk.step.action.toolName}`);
              console.log(`   📥 Input: ${JSON.stringify(chunk.step.action.toolInput).slice(0, 100)}...`);
            }
          }

          if (chunk.step.result) {
            console.log(`   ✅ Result: ${chunk.step.result.success ? 'Success' : 'Failed'}`);
            if (chunk.step.result.error) {
              console.error(`   Error Details: ${chunk.step.result.error}`);
            }
            if (chunk.step.result.output) {
              const output = typeof chunk.step.result.output === 'string' 
                ? chunk.step.result.output 
                : JSON.stringify(chunk.step.result.output);
              console.log(`   📤 Output: ${output.slice(0, 150)}...`);
            }
          }
          break;

        case 'token':
          tokenCount++;
          // Show token streaming
          if (tokenCount === 1) {
            process.stdout.write(`\n[${elapsed}s] 💬 Response: `);
          }
          process.stdout.write(chunk.content);
          break;

        case 'done':
          console.log('\n');
          console.log('-'.repeat(80));
          console.log('\n✅ Execution Complete!\n');
          console.log('📊 Execution Summary:');
          console.log(`   Duration: ${(chunk.result.duration / 1000).toFixed(2)}s`);
          console.log(`   Steps: ${stepCount}`);
          console.log(`   Tools Called: ${toolCallCount}`);
          console.log(`   Tokens Streamed: ${tokenCount}`);
          console.log(`   Final State: ${chunk.result.state}`);
          
          if (chunk.result.error) {
            console.error('\n❌ Execution Error:');
            console.error(chunk.result.error);
          }
          
          if (chunk.result.response) {
            console.log('\n📝 Final Response:');
            console.log('-'.repeat(80));
            console.log(chunk.result.response);
            console.log('-'.repeat(80));
          }
          break;
      }
    }

  } catch (error) {
    console.error('\n❌ Error during streaming:');
    console.error(error);
  }

  console.log('\n' + '='.repeat(80));
  console.log('Streaming Example Complete');
  console.log('='.repeat(80));
}

main().catch(console.error);
