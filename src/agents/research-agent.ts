import { Agent, Tool } from '@hazeljs/agent';

@Agent({
  name: 'ResearchAgent',
  description: 'Expert researcher who finds and synthesizes information',
  systemPrompt: `You are an expert researcher. Your job is to:
1. Find accurate, relevant information on any topic
2. Synthesize findings into clear insights
3. Always cite sources when available
4. Provide confidence levels for your findings`,
})
export class ResearchAgent {
  @Tool({
    description: 'Search the web for information on a specific topic',
    parameters: [
      { name: 'query', type: 'string', description: 'The search query', required: true },
      { name: 'maxResults', type: 'number', description: 'Maximum number of results', required: false },
    ],
  })
  async searchWeb(input: { query: string; maxResults?: number }) {
    const maxResults = input.maxResults || 5;
    
    const mockResults = [
      {
        title: `Understanding ${input.query}: A Comprehensive Guide`,
        snippet: `${input.query} is a critical concept in modern technology. This guide covers the fundamentals, best practices, and advanced techniques.`,
        url: `https://example.com/${input.query.toLowerCase().replace(/\s+/g, '-')}`,
        relevance: 0.95,
      },
      {
        title: `${input.query}: Industry Trends and Analysis`,
        snippet: `Recent developments in ${input.query} show significant growth. Market analysis indicates strong adoption across enterprises.`,
        url: `https://techanalysis.com/${input.query.toLowerCase().replace(/\s+/g, '-')}`,
        relevance: 0.88,
      },
      {
        title: `Best Practices for ${input.query}`,
        snippet: `Learn the proven strategies and methodologies for implementing ${input.query} in production environments.`,
        url: `https://bestpractices.dev/${input.query.toLowerCase().replace(/\s+/g, '-')}`,
        relevance: 0.82,
      },
    ].slice(0, maxResults);

    return {
      query: input.query,
      results: mockResults,
      totalResults: mockResults.length,
      timestamp: new Date().toISOString(),
    };
  }

  @Tool({
    description: 'Analyze research findings and extract key insights',
    parameters: [
      { name: 'data', type: 'string', description: 'Research data to analyze', required: true },
      { name: 'focusArea', type: 'string', description: 'Specific area to focus on', required: false },
    ],
  })
  async analyzeFindings(input: { data: string; focusArea?: string }) {
    const insights = [
      `Key finding: ${input.data.slice(0, 100)}... shows strong correlation with industry trends`,
      `Analysis reveals three main themes in the research data`,
      `Confidence level: High (85%) based on multiple corroborating sources`,
    ];

    if (input.focusArea) {
      insights.push(`Focused analysis on ${input.focusArea} reveals additional context`);
    }

    return {
      insights,
      confidence: 0.85,
      focusArea: input.focusArea || 'general',
      recommendations: [
        'Further investigation recommended in emerging areas',
        'Cross-reference with recent publications',
      ],
    };
  }

  @Tool({
    description: 'Verify facts and check sources for accuracy',
    parameters: [
      { name: 'claim', type: 'string', description: 'The claim to verify', required: true },
      { name: 'sources', type: 'string', description: 'Sources to check against', required: false },
    ],
  })
  async verifyFacts(input: { claim: string; sources?: string }) {
    return {
      claim: input.claim,
      verified: true,
      confidence: 0.92,
      sources: input.sources ? [input.sources] : ['Multiple authoritative sources'],
      notes: 'Claim verified against current industry standards and documentation',
    };
  }
}
