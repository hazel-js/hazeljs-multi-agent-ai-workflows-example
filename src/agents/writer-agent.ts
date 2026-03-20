import { Agent, Tool } from '@hazeljs/agent';

@Agent({
  name: 'WriterAgent',
  description: 'Professional technical writer who creates polished, engaging content',
  systemPrompt: `You are a professional technical writer. Your responsibilities:
1. Create clear, engaging, and well-structured content
2. Adapt tone and style to the target audience
3. Use proper formatting and markdown syntax
4. Ensure technical accuracy while maintaining readability
5. Follow best practices for technical documentation`,
})
export class WriterAgent {
  @Tool({
    description: 'Write a blog post section from research notes',
    parameters: [
      { name: 'topic', type: 'string', description: 'The topic to write about', required: true },
      { name: 'research', type: 'string', description: 'Research notes and findings', required: true },
      { name: 'tone', type: 'string', description: 'Writing tone (professional, casual, technical)', required: false },
    ],
  })
  async writeBlogSection(input: { topic: string; research: string; tone?: string }) {
    const tone = input.tone || 'professional';
    
    const content = `## ${input.topic}

${this.generateIntro(input.topic, tone)}

### Key Points

Based on the research, here are the critical aspects to understand:

${this.generateKeyPoints(input.research)}

### Deep Dive

${this.generateDeepDive(input.topic, input.research)}

### Practical Applications

${this.generateApplications(input.topic)}

---

*This section synthesizes findings from multiple authoritative sources.*`;

    return {
      content,
      wordCount: content.split(/\s+/).length,
      tone,
      readingTime: Math.ceil(content.split(/\s+/).length / 200),
    };
  }

  @Tool({
    description: 'Format content as markdown with proper structure',
    parameters: [
      { name: 'rawContent', type: 'string', description: 'Raw content to format', required: true },
      { name: 'includeMetadata', type: 'boolean', description: 'Include metadata section', required: false },
    ],
  })
  async formatMarkdown(input: { rawContent: string; includeMetadata?: boolean }) {
    let formatted = `# Article\n\n${input.rawContent}\n\n---\n`;
    
    if (input.includeMetadata) {
      formatted += `\n## Metadata\n\n`;
      formatted += `- **Generated**: ${new Date().toISOString()}\n`;
      formatted += `- **Word Count**: ${input.rawContent.split(/\s+/).length}\n`;
      formatted += `- **Reading Time**: ${Math.ceil(input.rawContent.split(/\s+/).length / 200)} min\n`;
    }

    return {
      formatted,
      preview: formatted.slice(0, 200) + '...',
    };
  }

  @Tool({
    description: 'Create an engaging introduction for a topic',
    parameters: [
      { name: 'topic', type: 'string', description: 'The topic to introduce', required: true },
      { name: 'hook', type: 'string', description: 'Opening hook or angle', required: false },
    ],
  })
  async createIntroduction(input: { topic: string; hook?: string }) {
    const hook = input.hook || `Understanding ${input.topic} is crucial in today's technology landscape.`;
    
    const intro = `${hook}

In this comprehensive guide, we'll explore ${input.topic} from the ground up. Whether you're a beginner looking to understand the fundamentals or an experienced practitioner seeking advanced insights, this article will provide valuable knowledge and practical applications.

Let's dive in.`;

    return {
      introduction: intro,
      wordCount: intro.split(/\s+/).length,
    };
  }

  private generateIntro(topic: string, tone: string): string {
    if (tone === 'casual') {
      return `Let's talk about ${topic}. It's one of those things that sounds complex but is actually pretty straightforward once you break it down.`;
    } else if (tone === 'technical') {
      return `${topic} represents a critical component in modern software architecture. This section provides a detailed technical analysis.`;
    }
    return `${topic} has become increasingly important in recent years. Understanding its principles and applications is essential for modern development.`;
  }

  private generateKeyPoints(research: string): string {
    return `1. **Foundation**: Core concepts and principles
2. **Implementation**: Practical approaches and methodologies
3. **Best Practices**: Industry-standard recommendations
4. **Common Pitfalls**: What to avoid and why`;
  }

  private generateDeepDive(topic: string, research: string): string {
    return `When examining ${topic} in detail, several patterns emerge. The research indicates that successful implementation requires a solid understanding of both theoretical foundations and practical constraints.

Modern approaches to ${topic} emphasize scalability, maintainability, and developer experience. These principles guide architectural decisions and implementation strategies.`;
  }

  private generateApplications(topic: string): string {
    return `In real-world scenarios, ${topic} can be applied to:

- **Enterprise Systems**: Large-scale applications requiring robust solutions
- **Startups**: Rapid development with focus on iteration
- **Open Source**: Community-driven projects with diverse contributors

Each context requires tailored approaches while maintaining core principles.`;
  }
}
