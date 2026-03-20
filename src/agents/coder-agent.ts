import { Agent, Tool } from '@hazeljs/agent';

@Agent({
  name: 'CoderAgent',
  description: 'Expert software engineer who writes clean, efficient code',
  systemPrompt: `You are an expert software engineer. Your responsibilities:
1. Write clean, maintainable, and efficient code
2. Follow best practices and design patterns
3. Include proper error handling
4. Add helpful comments where needed
5. Consider edge cases and performance
6. Use TypeScript with proper typing`,
})
export class CoderAgent {
  @Tool({
    description: 'Generate code implementation for a specific algorithm or function',
    parameters: [
      { name: 'description', type: 'string', description: 'Description of what to implement', required: true },
      { name: 'language', type: 'string', description: 'Programming language', required: false },
    ],
  })
  async generateCode(input: { description: string; language?: string }) {
    const language = input.language || 'typescript';
    
    const code = `/**
 * ${input.description}
 * @param input - Input parameters
 * @returns Result of the operation
 */
export function implementation(input: any): any {
  try {
    // Implementation based on: ${input.description}
    const result = processInput(input);
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

function processInput(input: any): any {
  // Core logic here
  return input;
}`;

    return {
      code,
      language,
      linesOfCode: code.split('\n').length,
      description: input.description,
    };
  }

  @Tool({
    description: 'Review code for quality and suggest improvements',
    parameters: [
      { name: 'code', type: 'string', description: 'Code to review', required: true },
    ],
  })
  async reviewCode(input: { code: string }) {
    return {
      code: input.code,
      issues: [
        { severity: 'low', message: 'Consider adding more type annotations', line: 5 },
        { severity: 'medium', message: 'Error handling could be more specific', line: 12 },
      ],
      suggestions: [
        'Add unit tests',
        'Consider edge cases',
        'Improve variable naming',
      ],
      overallScore: 85,
    };
  }

  @Tool({
    description: 'Generate unit tests for code',
    parameters: [
      { name: 'code', type: 'string', description: 'Code to test', required: true },
      { name: 'framework', type: 'string', description: 'Testing framework', required: false },
    ],
  })
  async generateTests(input: { code: string; framework?: string }) {
    const framework = input.framework || 'jest';
    
    const tests = `import { implementation } from './implementation';

describe('Implementation Tests', () => {
  it('should handle valid input', () => {
    const result = implementation({ value: 'test' });
    expect(result.success).toBe(true);
  });

  it('should handle errors gracefully', () => {
    const result = implementation(null);
    expect(result.success).toBe(false);
  });

  it('should return expected output format', () => {
    const result = implementation({ value: 'test' });
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('data');
  });
});`;

    return {
      tests,
      framework,
      testCount: 3,
      coverage: 'Basic happy path and error cases',
    };
  }
}
