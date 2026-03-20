import { Agent, Tool } from '@hazeljs/agent';

@Agent({
  name: 'ClassifierAgent',
  description: 'Classifies requests to route them to the appropriate specialist agent',
  systemPrompt: `You classify user requests into categories:
- "code": Requests for code implementation, algorithms, or programming
- "article": Requests for written content, blog posts, or documentation
- "analysis": Requests for data analysis, research, or investigation
- "design": Requests for system design, architecture, or planning

Always use the classify tool to categorize the request.`,
})
export class ClassifierAgent {
  @Tool({
    description: 'Classify a request into a category',
    parameters: [
      { name: 'request', type: 'string', description: 'The user request to classify', required: true },
    ],
  })
  async classify(input: { request: string }) {
    const request = input.request.toLowerCase();
    
    let type = 'article';
    let confidence = 0.7;
    
    if (request.includes('code') || request.includes('implement') || request.includes('algorithm') || request.includes('function')) {
      type = 'code';
      confidence = 0.9;
    } else if (request.includes('analyze') || request.includes('research') || request.includes('investigate') || request.includes('study')) {
      type = 'analysis';
      confidence = 0.85;
    } else if (request.includes('design') || request.includes('architect') || request.includes('plan') || request.includes('structure')) {
      type = 'design';
      confidence = 0.88;
    } else if (request.includes('write') || request.includes('blog') || request.includes('article') || request.includes('document')) {
      type = 'article';
      confidence = 0.92;
    }

    return {
      type,
      confidence,
      request: input.request,
      reasoning: `Classified as '${type}' based on keywords and context`,
    };
  }
}
