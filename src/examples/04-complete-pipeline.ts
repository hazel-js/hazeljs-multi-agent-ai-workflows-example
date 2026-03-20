import { AgentRuntime, END, GraphState, AgentEventType, AgentEvent, ExecutionStartedEvent, ToolExecutionEventData } from '@hazeljs/agent';
import { OpenAILLMProvider } from '../utils/llm-provider';
import { ResearchAgent } from '../agents/research-agent';
import { WriterAgent } from '../agents/writer-agent';
import { EditorAgent } from '../agents/editor-agent';
import { ContentOrchestratorAgent } from '../agents/orchestrator-agent';

async function main() {
  console.log('='.repeat(80));
  console.log('Complete Example: Combining All Three Patterns');
  console.log('='.repeat(80));
  console.log();
  console.log('System Architecture:');
  console.log('  SupervisorAgent (Pattern 3)');
  console.log('      ↓');
  console.log('  ContentGraph (Pattern 2)');
  console.log('      ↓');
  console.log('  OrchestratorAgent (Pattern 1 - @Delegate)');
  console.log('      ↓');
  console.log('  [Research, Writer, Editor]');
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

  async function qualityCheck(state: GraphState) {
    console.log('  🔍 Running quality check...');
    const output = state.output || '';
    const wordCount = output.split(/\s+/).length;
    const hasHeadings = output.includes('##');
    const quality = wordCount > 100 && hasHeadings ? 'high' : 'low';
    
    console.log(`    Word count: ${wordCount}`);
    console.log(`    Quality: ${quality}`);
    
    return {
      ...state,
      data: { ...state.data, quality },
    };
  }

  async function formatForPublishing(state: GraphState) {
    console.log('  📝 Formatting for publishing...');
    const content = state.output || '';
    const formatted = `---
title: Generated Article
date: ${new Date().toISOString()}
author: AI Content Team
---

${content}

---

*This article was generated using HazelJS multi-agent orchestration.*
`;
    
    return {
      ...state,
      output: formatted,
    };
  }

  console.log('Building content creation graph...\n');

  const contentGraph = runtime
    .createGraph('complete-content-pipeline')
    .addNode('orchestrator', { type: 'agent', agentName: 'ContentOrchestratorAgent' })
    .addNode('quality-check', { type: 'function', fn: qualityCheck })
    .addNode('formatter', { type: 'function', fn: formatForPublishing })
    .addEdge('orchestrator', 'quality-check')
    .addConditionalEdge('quality-check', (state: GraphState) => {
      const quality = state.data?.quality;
      console.log(`  → Quality routing: ${quality === 'high' ? 'formatter' : 'orchestrator'}`);
      return quality === 'high' ? 'formatter' : 'orchestrator';
    })
    .addEdge('formatter', END)
    .setEntryPoint('orchestrator')
    .compile();

  console.log('Graph structure:');
  console.log('  orchestrator → quality-check → [formatter | orchestrator] → END\n');

  const supervisor = runtime.createSupervisor({
    name: 'content-supervisor',
    workers: ['ContentOrchestratorAgent'],
    maxRounds: 3,
    model: 'gpt-4o-mini',
    temperature: 0.7,
  });

  console.log('Supervisor will coordinate the entire workflow\n');
  console.log('='.repeat(80));
  console.log('EXECUTING COMPLETE PIPELINE');
  console.log('='.repeat(80));
  console.log();

  const task = 'Create a comprehensive technical article about microservices architecture with real-world examples';
  console.log(`Task: ${task}\n`);

  let executionStep = 1;
  runtime.on(AgentEventType.EXECUTION_STARTED, (event) => {
    console.log(`\n[${executionStep++}] ▶ Execution started`);
  });

  runtime.on(AgentEventType.TOOL_EXECUTION_STARTED, (event) => {
    const e = event as AgentEvent<ToolExecutionEventData>;
    console.log(`    🔧 ${e.data.toolName}`);
  });

  console.log('Starting execution...\n');

  const result = await contentGraph.execute(task);

  console.log('\n' + '='.repeat(80));
  console.log('FINAL OUTPUT');
  console.log('='.repeat(80));
  console.log(result.state.output);
  console.log('\n' + '='.repeat(80));
  console.log('Pipeline completed successfully!');
  console.log('='.repeat(80));
}

main().catch(console.error);
