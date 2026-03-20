import { AgentRuntime, END, GraphState } from '@hazeljs/agent';
import { OpenAILLMProvider } from '../utils/llm-provider';
import { ResearchAgent } from '../agents/research-agent';
import { WriterAgent } from '../agents/writer-agent';
import { EditorAgent } from '../agents/editor-agent';
import { ClassifierAgent } from '../agents/classifier-agent';
import { CoderAgent } from '../agents/coder-agent';

async function sequentialPipeline() {
  console.log('\n' + '='.repeat(80));
  console.log('Example 2.1: Sequential Pipeline');
  console.log('='.repeat(80));
  console.log();

  const runtime = new AgentRuntime({
    llmProvider: new OpenAILLMProvider(process.env.OPENAI_API_KEY),
    defaultMaxSteps: 10,
  });

  [ResearchAgent, WriterAgent, EditorAgent].forEach(A => runtime.registerAgent(A));
  runtime.registerAgentInstance('ResearchAgent', new ResearchAgent());
  runtime.registerAgentInstance('WriterAgent', new WriterAgent());
  runtime.registerAgentInstance('EditorAgent', new EditorAgent());

  const pipeline = runtime
    .createGraph('blog-pipeline')
    .addNode('researcher', { type: 'agent', agentName: 'ResearchAgent' })
    .addNode('writer', { type: 'agent', agentName: 'WriterAgent' })
    .addNode('editor', { type: 'agent', agentName: 'EditorAgent' })
    .addEdge('researcher', 'writer')
    .addEdge('writer', 'editor')
    .addEdge('editor', END)
    .setEntryPoint('researcher')
    .compile();

  console.log('Pipeline structure:');
  console.log('  researcher → writer → editor → END\n');

  console.log('Executing: Write about TypeScript generics\n');

  for await (const chunk of pipeline.stream('Write a detailed article about TypeScript generics')) {
    if (chunk.nodeOutput) {
      console.log(`✓ ${chunk.nodeId} completed`);
      console.log(`  Output preview: ${chunk.nodeOutput.slice(0, 100)}...\n`);
    }
  }
}

async function conditionalRouting() {
  console.log('\n' + '='.repeat(80));
  console.log('Example 2.2: Conditional Routing');
  console.log('='.repeat(80));
  console.log();

  const runtime = new AgentRuntime({
    llmProvider: new OpenAILLMProvider(process.env.OPENAI_API_KEY),
    defaultMaxSteps: 10,
  });

  [ClassifierAgent, CoderAgent, WriterAgent].forEach(A => runtime.registerAgent(A));
  runtime.registerAgentInstance('ClassifierAgent', new ClassifierAgent());
  runtime.registerAgentInstance('CoderAgent', new CoderAgent());
  runtime.registerAgentInstance('WriterAgent', new WriterAgent());

  const router = runtime
    .createGraph('smart-router')
    .addNode('classifier', { type: 'agent', agentName: 'ClassifierAgent' })
    .addNode('coder', { type: 'agent', agentName: 'CoderAgent' })
    .addNode('writer', { type: 'agent', agentName: 'WriterAgent' })
    .setEntryPoint('classifier')
    .addConditionalEdge('classifier', (state: GraphState) => {
      // Parse the classifier's output to determine routing
      const output = state.output || '';
      const isCode = output.toLowerCase().includes('code') || 
                     output.toLowerCase().includes('implement') ||
                     output.toLowerCase().includes('algorithm');
      const type = isCode ? 'coder' : 'writer';
      console.log(`  → Routing decision: ${type} (based on classifier output)`);
      return type;
    })
    .addEdge('coder', END)
    .addEdge('writer', END)
    .compile();

  console.log('Router structure:');
  console.log('  classifier → [coder | writer] → END\n');

  const testCases = [
    'Implement a binary search algorithm in TypeScript',
    'Write a blog post about clean code principles',
  ];

  for (const testCase of testCases) {
    console.log(`\nTest: "${testCase}"`);
    const result = await router.execute(testCase);
    console.log(`Result: ${result.response?.slice(0, 150)}...\n`);
  }
}

async function parallelExecution() {
  console.log('\n' + '='.repeat(80));
  console.log('Example 2.3: Parallel Fan-Out / Fan-In');
  console.log('='.repeat(80));
  console.log();

  const runtime = new AgentRuntime({
    llmProvider: new OpenAILLMProvider(process.env.OPENAI_API_KEY),
    defaultMaxSteps: 10,
  });

  [ResearchAgent].forEach(A => runtime.registerAgent(A));
  runtime.registerAgentInstance('ResearchAgent', new ResearchAgent());

  async function splitTask(state: GraphState) {
    console.log('  📊 Splitting task into parallel branches...');
    return {
      ...state,
      data: { ...state.data, split: true, timestamp: Date.now() },
    };
  }

  async function mergeResults(state: GraphState) {
    console.log('  🔀 Merging results from parallel branches...');
    const results = (state.data?.branchResults || []) as any[];
    const combined = results.map((r: any) => r.state?.output || '').join('\n\n---\n\n');
    return {
      ...state,
      output: `# Combined Analysis\n\n${combined}`,
    };
  }

  const parallel = runtime
    .createGraph('parallel-research')
    .addNode('splitter', { type: 'function', fn: splitTask })
    .addNode('parallel-1', {
      type: 'parallel',
      branches: ['tech-researcher', 'market-researcher', 'competitor-researcher'],
    })
    .addNode('tech-researcher', { type: 'agent', agentName: 'ResearchAgent' })
    .addNode('market-researcher', { type: 'agent', agentName: 'ResearchAgent' })
    .addNode('competitor-researcher', { type: 'agent', agentName: 'ResearchAgent' })
    .addNode('combiner', { type: 'function', fn: mergeResults })
    .addEdge('splitter', 'parallel-1')
    .addEdge('parallel-1', 'combiner')
    .addEdge('combiner', END)
    .setEntryPoint('splitter')
    .compile();

  console.log('Parallel structure:');
  console.log('  splitter → [tech ‖ market ‖ competitor] → combiner → END\n');

  const result = await parallel.execute('Analyze the AI framework market comprehensively');
  console.log('\nCombined Result:');
  console.log(result.state.output?.slice(0, 300) + '...');
}

async function main() {
  console.log('='.repeat(80));
  console.log('Pattern 2: AgentGraph - DAG Workflow Pipelines');
  console.log('='.repeat(80));

  await sequentialPipeline();
  await conditionalRouting();
  await parallelExecution();

  console.log('\n' + '='.repeat(80));
  console.log('All AgentGraph examples completed!');
  console.log('='.repeat(80));
}

main().catch(console.error);
