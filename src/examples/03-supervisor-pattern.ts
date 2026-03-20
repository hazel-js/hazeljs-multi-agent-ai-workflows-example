import { AgentRuntime } from '@hazeljs/agent';
import { OpenAILLMProvider } from '../utils/llm-provider';
import { ResearchAgent } from '../agents/research-agent';
import { WriterAgent } from '../agents/writer-agent';
import { EditorAgent } from '../agents/editor-agent';
import { CoderAgent } from '../agents/coder-agent';

async function main() {
  console.log('='.repeat(80));
  console.log('Pattern 3: SupervisorAgent - LLM-Driven Dynamic Routing');
  console.log('='.repeat(80));
  console.log();

  const runtime = new AgentRuntime({
    llmProvider: new OpenAILLMProvider(process.env.OPENAI_API_KEY),
    defaultMaxSteps: 10,
  });

  [ResearchAgent, WriterAgent, EditorAgent, CoderAgent].forEach(A =>
    runtime.registerAgent(A)
  );

  runtime.registerAgentInstance('ResearchAgent', new ResearchAgent());
  runtime.registerAgentInstance('WriterAgent', new WriterAgent());
  runtime.registerAgentInstance('EditorAgent', new EditorAgent());
  runtime.registerAgentInstance('CoderAgent', new CoderAgent());

  const supervisor = runtime.createSupervisor({
    name: 'project-manager',
    workers: ['ResearchAgent', 'WriterAgent', 'EditorAgent', 'CoderAgent'],
    maxRounds: 8,
    model: 'gpt-4o-mini',
    temperature: 0.7,
  });

  console.log('Supervisor Configuration:');
  console.log('  Name: project-manager');
  console.log('  Workers: ResearchAgent, WriterAgent, EditorAgent, CoderAgent');
  console.log('  Max Rounds: 8');
  console.log('  LLM: gpt-4o-mini\n');

  console.log('Task: Build a REST API for a todo app with documentation\n');
  console.log('The supervisor will:');
  console.log('1. Decompose the task into subtasks');
  console.log('2. Route each subtask to the appropriate worker');
  console.log('3. Accumulate results and decide next steps');
  console.log('4. Continue until task is complete\n');

  console.log('Executing...\n');

  const result = await supervisor.run(
    'Build a REST API for a todo app with proper documentation and example usage',
    { sessionId: 'supervisor-demo-1' }
  );

  console.log('\n' + '='.repeat(80));
  console.log('EXECUTION SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total rounds: ${result.rounds.length}`);
  console.log();

  result.rounds.forEach((round, i) => {
    console.log(`Round ${i + 1}:`);
    if (round.decision.action === 'delegate') {
      console.log(`  Worker: ${round.decision.worker}`);
      console.log(`  Subtask: ${round.decision.subtask?.slice(0, 80)}...`);
      if (round.workerResult) {
        console.log(`  Result: ${round.workerResult.response?.slice(0, 100)}...`);
      }
    } else {
      console.log(`  Action: ${round.decision.action}`);
    }
    console.log();
  });

  console.log('='.repeat(80));
  console.log('FINAL RESULT');
  console.log('='.repeat(80));
  console.log(result.response);
  console.log('='.repeat(80));
}

main().catch(console.error);
