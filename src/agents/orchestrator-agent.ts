import { Agent, Delegate } from '@hazeljs/agent';

@Agent({
  name: 'ContentOrchestratorAgent',
  description: 'Orchestrates research, writing, and editing tasks to create complete articles',
  systemPrompt: `You orchestrate content creation workflows. Your process:
1. First, use researchTopic to gather comprehensive information
2. Then, use writeArticle to create well-structured content from the research
3. Finally, use editContent to polish and improve the final output
4. Always follow this sequence for best results
5. Provide clear, complete responses to the user`,
})
export class ContentOrchestratorAgent {
  @Delegate({
    agent: 'ResearchAgent',
    description: 'Research a topic thoroughly and return key findings with sources',
    inputField: 'query',
  })
  async researchTopic(query: string): Promise<string> {
    return '';
  }

  @Delegate({
    agent: 'WriterAgent',
    description: 'Write a polished article from research notes and findings',
    inputField: 'content',
  })
  async writeArticle(content: string): Promise<string> {
    return '';
  }

  @Delegate({
    agent: 'EditorAgent',
    description: 'Edit and improve content for quality, clarity, and correctness',
    inputField: 'content',
  })
  async editContent(content: string): Promise<string> {
    return '';
  }
}
