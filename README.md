# Multi-Agent AI Workflows Example

Complete examples demonstrating the three multi-agent orchestration patterns in HazelJS: **@Delegate**, **AgentGraph**, and **SupervisorAgent**.

## Overview

Modern AI systems require coordination between specialized agents. This project demonstrates three complementary patterns for building production-grade multi-agent systems:

1. **@Delegate** — Peer-to-peer agent delegation
2. **AgentGraph** — DAG-based workflow pipelines  
3. **SupervisorAgent** — LLM-driven dynamic routing

## Features

✅ **Complete Working Examples** — Four runnable examples with detailed logging  
✅ **Production-Ready Agents** — Research, Writer, Editor, Coder, Classifier agents  
✅ **All Three Patterns** — @Delegate, AgentGraph, and SupervisorAgent  
✅ **Type-Safe** — Full TypeScript with decorators  
✅ **Observable** — Event-driven architecture with detailed logging  
✅ **Well-Documented** — Inline comments and comprehensive README  

## Quick Start

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/hazeljs/hazeljs-multi-agent-ai-workflows-example.git
cd hazeljs-multi-agent-ai-workflows-example

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### 2. Configure Environment

Edit `.env` and add your API keys:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Run Examples

```bash
# Pattern 1: @Delegate
npm run example:delegate

# Pattern 2: AgentGraph
npm run example:graph

# Pattern 3: SupervisorAgent
npm run example:supervisor

# Complete Pipeline (all patterns combined)
npm run example:complete
```

## Project Structure

```
hazeljs-multi-agent-ai-workflows-example/
├── src/
│   ├── agents/                    # Agent implementations
│   │   ├── research-agent.ts      # Research specialist
│   │   ├── writer-agent.ts        # Content writer
│   │   ├── editor-agent.ts        # Content editor
│   │   ├── coder-agent.ts         # Code generator
│   │   ├── classifier-agent.ts    # Request classifier
│   │   └── orchestrator-agent.ts  # Orchestrator using @Delegate
│   └── examples/                  # Runnable examples
│       ├── 01-delegate-pattern.ts
│       ├── 02-graph-pattern.ts
│       ├── 03-supervisor-pattern.ts
│       └── 04-complete-pipeline.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Patterns Explained

### Pattern 1: @Delegate

**Use Case**: 2-5 agents with clear hierarchy

The `@Delegate` decorator makes one agent call another agent transparently. The LLM sees delegation as a regular tool call.

```typescript
@Agent({ name: 'OrchestratorAgent' })
export class OrchestratorAgent {
  @Delegate({
    agent: 'ResearchAgent',
    description: 'Research a topic thoroughly',
    inputField: 'query',
  })
  async researchTopic(query: string): Promise<string> {
    return ''; // Replaced at runtime
  }
}
```

**Architecture**:
```
OrchestratorAgent
   ├── @Delegate → ResearchAgent
   ├── @Delegate → WriterAgent
   └── @Delegate → EditorAgent
```

**When to use**:
- Clear orchestrator/worker split
- 2-5 agents
- Predefined delegation paths

---

### Pattern 2: AgentGraph

**Use Case**: Known workflows with conditional logic

Build directed acyclic graphs (DAGs) with sequential, conditional, and parallel execution.

```typescript
const pipeline = runtime
  .createGraph('blog-pipeline')
  .addNode('researcher', { type: 'agent', agentName: 'ResearchAgent' })
  .addNode('writer', { type: 'agent', agentName: 'WriterAgent' })
  .addEdge('researcher', 'writer')
  .addEdge('writer', END)
  .setEntryPoint('researcher')
  .compile();
```

**Architectures**:

**Sequential**:
```
Entry → NodeA → NodeB → END
```

**Conditional**:
```
Entry → Router → [NodeA | NodeB] → END
```

**Parallel**:
```
Entry → Split → [NodeA ‖ NodeB] → Merge → END
```

**When to use**:
- Workflow known at design time
- Conditional routing needed
- Parallel execution required
- 5+ steps with branching

---

### Pattern 3: SupervisorAgent

**Use Case**: Dynamic task decomposition

An LLM supervisor decomposes tasks, routes to workers, and continues until complete.

```typescript
const supervisor = runtime.createSupervisor({
  name: 'project-manager',
  workers: ['ResearchAgent', 'CoderAgent', 'WriterAgent'],
  maxRounds: 8,
  llm: async (prompt) => {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });
    return res.choices[0].message.content ?? '';
  },
});
```

**Architecture**:
```
User Task
    │
Supervisor  ←──────────────┐
    │                       │
    ▼                       │
[Route to worker?]    Worker result
    │                       │
    ▼                       │
WorkerAgent ───────────────┘
```

**When to use**:
- Task structure unknown at design time
- Complex decomposition needed
- 6+ agents
- Adaptive routing required

---

## Comparison Matrix

| Pattern | Best For | Complexity | Control | Flexibility |
|---------|----------|------------|---------|-------------|
| **@Delegate** | 2-5 agents, clear hierarchy | Low | High | Low |
| **AgentGraph** | Known workflows, conditional logic | Medium | High | Medium |
| **SupervisorAgent** | Dynamic tasks, 6+ agents | High | Low | High |

## Example Agents

### ResearchAgent

Specialized in finding and synthesizing information.

**Tools**:
- `searchWeb` — Search for information
- `analyzeFindings` — Extract key insights
- `verifyFacts` — Check accuracy

### WriterAgent

Professional technical writer creating polished content.

**Tools**:
- `writeBlogSection` — Write structured content
- `formatMarkdown` — Format as markdown
- `createIntroduction` — Generate engaging intros

### EditorAgent

Reviews and improves content quality.

**Tools**:
- `reviewContent` — Quality review
- `checkGrammar` — Grammar and spelling
- `improveReadability` — Enhance flow
- `verifyTechnicalAccuracy` — Check technical correctness

### CoderAgent

Expert software engineer writing clean code.

**Tools**:
- `generateCode` — Write implementations
- `reviewCode` — Code quality review
- `generateTests` — Create unit tests

### ClassifierAgent

Classifies requests to route them appropriately.

**Tools**:
- `classify` — Categorize requests (code, article, analysis, design)

## Running Examples

### Example 1: @Delegate Pattern

```bash
npm run example:delegate
```

**What it does**:
1. Orchestrator receives: "Write a blog post about multi-agent AI"
2. Delegates to ResearchAgent for information gathering
3. Delegates to WriterAgent for content creation
4. Delegates to EditorAgent for final polish

**Output**: Complete blog post with research, writing, and editing

---

### Example 2: AgentGraph Pattern

```bash
npm run example:graph
```

**What it demonstrates**:

**2.1 Sequential Pipeline**:
- researcher → writer → editor → END

**2.2 Conditional Routing**:
- classifier → [coder | writer] → END
- Routes based on request type

**2.3 Parallel Execution**:
- splitter → [tech ‖ market ‖ competitor] → combiner → END
- Three research agents run in parallel

---

### Example 3: SupervisorAgent Pattern

```bash
npm run example:supervisor
```

**What it does**:
1. Supervisor receives: "Build a REST API with documentation"
2. LLM decomposes into subtasks
3. Routes each subtask to appropriate worker
4. Accumulates results
5. Continues until task complete

**Output**: Complete API implementation with docs

---

### Example 4: Complete Pipeline

```bash
npm run example:complete
```

**What it demonstrates**:

Combines all three patterns:
- **SupervisorAgent** (Pattern 3) coordinates overall workflow
- **ContentGraph** (Pattern 2) manages content creation pipeline
- **OrchestratorAgent** (Pattern 1) uses @Delegate for specialists

**Architecture**:
```
SupervisorAgent
    ↓
ContentGraph (AgentGraph)
    ↓
OrchestratorAgent (@Delegate)
    ↓
[Research, Writer, Editor]
```

## Event System

All examples include detailed event logging:

```typescript
runtime.on('execution.started', (event) => {
  console.log(`Started: ${event.data.agentName}`);
});

runtime.on('tool.execution.started', (event) => {
  console.log(`Tool: ${event.data.toolName}`);
});

runtime.on('execution.completed', (event) => {
  console.log(`Completed in ${event.data.steps} steps`);
});
```

## Best Practices

### 1. Keep Agents Focused

Each agent should have a clear, single responsibility:

```typescript
// ✅ Good - Focused
@Agent({ name: 'ResearchAgent', description: 'Expert researcher' })

// ❌ Bad - Too broad
@Agent({ name: 'DoEverythingAgent', description: 'Does research, writing, coding...' })
```

### 2. Use Appropriate Pattern

```
Do you know the workflow at design time?
├─ YES → Use AgentGraph
└─ NO → Is the task highly dynamic?
    ├─ YES → Use SupervisorAgent
    └─ NO → Use @Delegate (if 2-5 agents)
```

### 3. Handle Errors in Tools

```typescript
@Tool({ description: 'Call external API' })
async callAPI(input: { endpoint: string }) {
  try {
    return await this.api.call(input.endpoint);
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
      retryable: true,
    };
  }
}
```

### 4. Add Observability

```typescript
runtime.on(AgentEventType.EXECUTION_STARTED, (e) => {
  logger.info('Agent started', { agentName: e.data.agentName });
});

runtime.on(AgentEventType.TOOL_EXECUTION_COMPLETED, (e) => {
  metrics.increment('tool.executions', { tool: e.data.toolName });
});
```

## Production Considerations

### State Persistence

For production, use Redis or database for state:

```typescript
import { RedisStateManager } from '@hazeljs/agent';

const runtime = new AgentRuntime({
  stateManager: new RedisStateManager({
    redis: redisClient,
    ttl: 3600,
  }),
});
```

### Cost Optimization

Use cheaper models for routing, powerful models for specialized work:

```typescript
// Supervisor uses cheaper model for routing
const supervisor = runtime.createSupervisor({
  llm: async (prompt) => {
    return await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Cheaper
      messages: [{ role: 'user', content: prompt }],
    });
  },
});

// Writer uses powerful model
@Agent({
  name: 'WriterAgent',
  llmConfig: { model: 'gpt-4o' }, // Better quality
})
```

### Approval Workflows

Require approval for destructive actions:

```typescript
@Tool({
  requiresApproval: true,
  description: 'Deploy to production',
})
async deploy(input: { environment: string }) {
  // Requires human approval
}

runtime.on(AgentEventType.TOOL_APPROVAL_REQUESTED, async (event) => {
  await notifyApprovalSystem(event.data);
});
```

## Troubleshooting

### Dependencies Not Found

```bash
npm install
```

### TypeScript Errors

```bash
npm run build
```

### API Key Issues

Ensure `.env` file exists with valid `OPENAI_API_KEY`:

```bash
cp .env.example .env
# Edit .env and add your key
```

### Runtime Errors

Check that all agents are registered:

```typescript
[ResearchAgent, WriterAgent, EditorAgent].forEach(A => 
  runtime.registerAgent(A)
);

runtime.registerAgentInstance('ResearchAgent', new ResearchAgent());
```

## Learn More

- **Blog Post**: [Multi-Agent Orchestration Patterns](../hazeljs/docs/blog/multi-agent-orchestration-patterns.md)
- **HazelJS Docs**: [hazeljs.ai/docs](https://hazeljs.ai/docs)
- **Agent Package**: [@hazeljs/agent](../hazeljs/packages/agent)
- **API Reference**: [hazeljs.ai/docs/api/agent](https://hazeljs.ai/docs/api/agent)

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

Apache 2.0

## Support

- **Discord**: [discord.gg/hazeljs](https://discord.gg/hazeljs)
- **GitHub Issues**: [github.com/hazeljs/hazeljs/issues](https://github.com/hazeljs/hazeljs/issues)

---

**Built with HazelJS** — Production-grade AI infrastructure for TypeScript.
