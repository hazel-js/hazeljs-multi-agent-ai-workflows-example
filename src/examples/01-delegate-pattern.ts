import { AgentRuntime, AgentEventType, AgentEvent, ExecutionStartedEvent, ExecutionCompletedEvent, ToolExecutionEventData } from '@hazeljs/agent';
import { OpenAILLMProvider } from '../utils/llm-provider';
import { ResearchAgent } from '../agents/research-agent';
import { WriterAgent } from '../agents/writer-agent';
import { EditorAgent } from '../agents/editor-agent';
import { ContentOrchestratorAgent } from '../agents/orchestrator-agent';

async function main() {
  console.log('='.repeat(80));
  console.log('Pattern 1: @Delegate - Peer-to-Peer Agent Delegation');
  console.log('='.repeat(80));
  console.log();

  const runtime = new AgentRuntime({
    llmProvider: new OpenAILLMProvider(process.env.OPENAI_API_KEY),
    defaultMaxSteps: 15,
    enableObservability: true,
  });

  const orchestrator = new ContentOrchestratorAgent();
  const researcher = new ResearchAgent();
  const writer = new WriterAgent();
  const editor = new EditorAgent();

  [ResearchAgent, WriterAgent, EditorAgent, ContentOrchestratorAgent].forEach(A =>
    runtime.registerAgent(A)
  );

  runtime.registerAgentInstance('ContentOrchestratorAgent', orchestrator);
  runtime.registerAgentInstance('ResearchAgent', researcher);
  runtime.registerAgentInstance('WriterAgent', writer);
  runtime.registerAgentInstance('EditorAgent', editor);

  runtime.on(AgentEventType.EXECUTION_STARTED, (event) => {
    console.log(`\n▶ Started execution`);
  });

  runtime.on(AgentEventType.EXECUTION_COMPLETED, (event) => {
    const e = event as AgentEvent<ExecutionCompletedEvent>;
    console.log(`✓ Completed in ${e.data.steps} steps`);
  });

  runtime.on(AgentEventType.TOOL_EXECUTION_STARTED, (event) => {
    const e = event as AgentEvent<ToolExecutionEventData>;
    console.log(`  🔧 Tool: ${e.data.toolName}`);
  });

  console.log('Task: Write a blog post about multi-agent AI systems\n');
  console.log('The orchestrator will:');
  console.log('1. Delegate to ResearchAgent for information gathering');
  console.log('2. Delegate to WriterAgent for content creation');
  console.log('3. Delegate to EditorAgent for final polish\n');

  const result = await runtime.execute(
    'ContentOrchestratorAgent',
    'Write a comprehensive blog post about multi-agent AI systems and their benefits',
    { sessionId: 'delegate-demo-1', enableMemory: false }
  );

  console.log('\n' + '='.repeat(80));
  console.log('RESULT');
  console.log('='.repeat(80));
  console.log(result.response);
  console.log('\n' + '='.repeat(80));
  console.log(`Total steps: ${result.steps.length}`);
  console.log(`Execution time: ${result.metadata?.duration || 'N/A'}ms`);
  console.log('='.repeat(80));
}

main().catch(console.error);
