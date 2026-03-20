import { Agent, Tool } from '@hazeljs/agent';

@Agent({
  name: 'EditorAgent',
  description: 'Professional editor who reviews and improves content quality',
  systemPrompt: `You are a professional editor. Your responsibilities:
1. Review content for clarity, coherence, and correctness
2. Check grammar, spelling, and punctuation
3. Ensure consistent tone and style
4. Improve readability and flow
5. Verify technical accuracy
6. Suggest improvements without changing the core message`,
})
export class EditorAgent {
  @Tool({
    description: 'Review and edit content for quality and clarity',
    parameters: [
      { name: 'content', type: 'string', description: 'Content to review', required: true },
      { name: 'focusAreas', type: 'string', description: 'Specific areas to focus on (grammar, style, technical)', required: false },
    ],
  })
  async reviewContent(input: { content: string; focusAreas?: string }) {
    const issues = this.findIssues(input.content);
    const suggestions = this.generateSuggestions(input.content);
    
    return {
      originalLength: input.content.length,
      issuesFound: issues.length,
      issues,
      suggestions,
      overallScore: this.calculateScore(issues.length, input.content.length),
      focusAreas: input.focusAreas || 'general',
    };
  }

  @Tool({
    description: 'Check grammar and spelling',
    parameters: [
      { name: 'text', type: 'string', description: 'Text to check', required: true },
    ],
  })
  async checkGrammar(input: { text: string }) {
    const errors = [
      { type: 'spelling', position: 45, suggestion: 'correct spelling', severity: 'low' },
      { type: 'grammar', position: 120, suggestion: 'subject-verb agreement', severity: 'medium' },
    ];

    return {
      text: input.text,
      errorsFound: errors.length,
      errors,
      cleanText: input.text,
    };
  }

  @Tool({
    description: 'Improve readability and flow',
    parameters: [
      { name: 'content', type: 'string', description: 'Content to improve', required: true },
      { name: 'targetAudience', type: 'string', description: 'Target audience level', required: false },
    ],
  })
  async improveReadability(input: { content: string; targetAudience?: string }) {
    const readabilityScore = this.calculateReadability(input.content);
    
    return {
      originalScore: readabilityScore,
      improvements: [
        'Break long paragraphs into shorter ones',
        'Use more active voice',
        'Add transition words between sections',
        'Simplify complex sentences',
      ],
      targetAudience: input.targetAudience || 'general',
      estimatedImprovement: '+15% readability',
    };
  }

  @Tool({
    description: 'Verify technical accuracy and consistency',
    parameters: [
      { name: 'content', type: 'string', description: 'Technical content to verify', required: true },
      { name: 'domain', type: 'string', description: 'Technical domain', required: false },
    ],
  })
  async verifyTechnicalAccuracy(input: { content: string; domain?: string }) {
    return {
      verified: true,
      confidence: 0.88,
      domain: input.domain || 'general technology',
      findings: [
        'Technical terminology used correctly',
        'Code examples follow best practices',
        'Concepts explained accurately',
      ],
      recommendations: [
        'Consider adding more code examples',
        'Include links to official documentation',
      ],
    };
  }

  @Tool({
    description: 'Generate final polished version of content',
    parameters: [
      { name: 'content', type: 'string', description: 'Content to polish', required: true },
      { name: 'applyAllSuggestions', type: 'boolean', description: 'Apply all suggestions automatically', required: false },
    ],
  })
  async generateFinalVersion(input: { content: string; applyAllSuggestions?: boolean }) {
    const polished = this.applyPolish(input.content);
    
    return {
      polishedContent: polished,
      changesApplied: input.applyAllSuggestions ? 12 : 8,
      improvementScore: '+22%',
      readyForPublishing: true,
    };
  }

  private findIssues(content: string): Array<{ type: string; description: string; severity: string }> {
    const issues = [];
    
    if (content.length < 100) {
      issues.push({ type: 'length', description: 'Content too short', severity: 'high' });
    }
    
    if (!content.includes('\n\n')) {
      issues.push({ type: 'formatting', description: 'Missing paragraph breaks', severity: 'medium' });
    }
    
    return issues;
  }

  private generateSuggestions(content: string): string[] {
    return [
      'Add more specific examples',
      'Include visual elements or diagrams',
      'Strengthen the conclusion',
      'Add call-to-action',
    ];
  }

  private calculateScore(issuesCount: number, contentLength: number): number {
    const baseScore = 100;
    const penalty = issuesCount * 5;
    const lengthBonus = contentLength > 500 ? 10 : 0;
    return Math.max(0, Math.min(100, baseScore - penalty + lengthBonus));
  }

  private calculateReadability(content: string): number {
    const words = content.split(/\s+/).length;
    const sentences = content.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / sentences;
    
    return Math.max(0, 100 - avgWordsPerSentence * 2);
  }

  private applyPolish(content: string): string {
    return content
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}
