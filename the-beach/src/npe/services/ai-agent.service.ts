import { Injectable, Logger } from '@nestjs/common';
import { generateText, streamText, generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

/**
 * AI Agent Service
 * Powers NPE agents with real AI capabilities using Vercel AI SDK
 */
@Injectable()
export class AIAgentService {
  private readonly logger = new Logger(AIAgentService.name);
  
  // Default models
  private readonly defaultChatModel = openai('gpt-4-turbo');
  private readonly defaultCodeModel = openai('gpt-4-turbo');
  private readonly defaultReasoningModel = anthropic('claude-3-5-sonnet-20241022');

  /**
   * Generate a task plan for an agent
   */
  async generateTaskPlan(params: {
    agentRole: string;
    goal: string;
    context?: Record<string, any>;
    constraints?: string[];
  }): Promise<{
    tasks: Array<{
      id: string;
      description: string;
      estimatedTime: string;
      dependencies: string[];
      priority: 'high' | 'medium' | 'low';
    }>;
    approach: string;
    risks: string[];
  }> {
    try {
      const { object } = await generateObject({
        model: this.defaultReasoningModel,
        schema: z.object({
          tasks: z.array(z.object({
            id: z.string(),
            description: z.string(),
            estimatedTime: z.string(),
            dependencies: z.array(z.string()),
            priority: z.enum(['high', 'medium', 'low']),
          })),
          approach: z.string(),
          risks: z.array(z.string()),
        }),
        prompt: `You are a ${params.agentRole} AI agent in a multi-agent development team.

Goal: ${params.goal}

${params.context ? `Context: ${JSON.stringify(params.context, null, 2)}` : ''}

${params.constraints ? `Constraints:\n${params.constraints.map(c => `- ${c}`).join('\n')}` : ''}

Create a detailed task plan with:
1. Specific, actionable tasks
2. Realistic time estimates
3. Task dependencies
4. Priority levels
5. Overall approach
6. Potential risks

Be practical and focus on deliverables.`,
      });

      return object as any;
    } catch (error) {
      this.logger.error(`Failed to generate task plan: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate code with AI
   */
  async generateCode(params: {
    language: string;
    description: string;
    context?: string;
    style?: 'functional' | 'oop' | 'mixed';
  }): Promise<{ code: string; explanation: string; tests?: string }> {
    try {
      const { text } = await generateText({
        model: this.defaultCodeModel,
        prompt: `You are an expert ${params.language} developer.

Task: ${params.description}

${params.context ? `Context:\n${params.context}` : ''}

Style: ${params.style || 'best practices'}

Generate:
1. Clean, production-ready code
2. Proper error handling
3. TypeScript types (if applicable)
4. Comments for complex logic
5. Brief explanation

Format your response as:
CODE:
\`\`\`${params.language}
[your code here]
\`\`\`

EXPLANATION:
[brief explanation]

TESTS: (if applicable)
\`\`\`${params.language}
[test code]
\`\`\``,
      });

      // Parse the response
      const codeMatch = text.match(/CODE:\s*```[\w]*\n([\s\S]*?)```/);
      const explanationMatch = text.match(/EXPLANATION:\s*([\s\S]*?)(?:TESTS:|$)/);
      const testsMatch = text.match(/TESTS:.*?```[\w]*\n([\s\S]*?)```/);

      return {
        code: codeMatch ? codeMatch[1].trim() : text,
        explanation: explanationMatch ? explanationMatch[1].trim() : 'Code generated successfully',
        tests: testsMatch ? testsMatch[1].trim() : undefined,
      };
    } catch (error) {
      this.logger.error(`Failed to generate code: ${error.message}`);
      throw error;
    }
  }

  /**
   * Review code with AI
   */
  async reviewCode(params: {
    code: string;
    language: string;
    context?: string;
  }): Promise<{
    issues: Array<{ severity: string; line?: number; message: string; suggestion?: string }>;
    score: number;
    summary: string;
  }> {
    try {
      const { object } = await generateObject({
        model: this.defaultCodeModel,
        schema: z.object({
          issues: z.array(z.object({
            severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
            line: z.number().optional(),
            message: z.string(),
            suggestion: z.string().optional(),
          })),
          score: z.number().min(0).max(100),
          summary: z.string(),
        }),
        prompt: `Review this ${params.language} code for quality, security, and best practices.

${params.context ? `Context: ${params.context}\n\n` : ''}

Code to review:
\`\`\`${params.language}
${params.code}
\`\`\`

Provide:
1. List of issues with severity (critical, high, medium, low, info)
2. Line numbers where applicable
3. Specific suggestions for fixes
4. Overall quality score (0-100)
5. Summary of findings`,
      });

      return object as any;
    } catch (error) {
      this.logger.error(`Failed to review code: ${error.message}`);
      throw error;
    }
  }

  /**
   * Answer technical questions
   */
  async answerQuestion(params: {
    question: string;
    context?: string;
    agentRole?: string;
  }): Promise<{ answer: string; confidence: number; references?: string[] }> {
    try {
      const { text } = await generateText({
        model: this.defaultChatModel,
        prompt: `${params.agentRole ? `You are a ${params.agentRole}.` : 'You are a helpful AI assistant.'}

${params.context ? `Context:\n${params.context}\n\n` : ''}

Question: ${params.question}

Provide a clear, accurate answer with:
1. Direct answer to the question
2. Relevant examples if applicable
3. Best practices or recommendations
4. References if needed

Be concise but thorough.`,
      });

      // Simple confidence estimation based on response length and certainty words
      const certaintyWords = ['definitely', 'certainly', 'always', 'never', 'must'];
      const uncertaintyWords = ['might', 'maybe', 'possibly', 'probably', 'could'];
      
      const certaintyCount = certaintyWords.filter(word => 
        text.toLowerCase().includes(word)
      ).length;
      const uncertaintyCount = uncertaintyWords.filter(word => 
        text.toLowerCase().includes(word)
      ).length;
      
      const confidence = Math.min(95, Math.max(50, 
        70 + (certaintyCount * 5) - (uncertaintyCount * 5)
      ));

      return {
        answer: text,
        confidence,
      };
    } catch (error) {
      this.logger.error(`Failed to answer question: ${error.message}`);
      throw error;
    }
  }

  /**
   * Analyze project requirements
   */
  async analyzeRequirements(params: {
    requirements: string;
    projectType?: string;
  }): Promise<{
    architecture: {
      components: string[];
      technologies: string[];
      patterns: string[];
    };
    timeline: {
      phases: Array<{ name: string; duration: string; tasks: string[] }>;
      totalEstimate: string;
    };
    risks: Array<{ risk: string; mitigation: string; severity: string }>;
    recommendations: string[];
  }> {
    try {
      const { object } = await generateObject({
        model: this.defaultReasoningModel,
        schema: z.object({
          architecture: z.object({
            components: z.array(z.string()),
            technologies: z.array(z.string()),
            patterns: z.array(z.string()),
          }),
          timeline: z.object({
            phases: z.array(z.object({
              name: z.string(),
              duration: z.string(),
              tasks: z.array(z.string()),
            })),
            totalEstimate: z.string(),
          }),
          risks: z.array(z.object({
            risk: z.string(),
            mitigation: z.string(),
            severity: z.enum(['critical', 'high', 'medium', 'low']),
          })),
          recommendations: z.array(z.string()),
        }),
        prompt: `Analyze these project requirements and provide a comprehensive technical plan.

Project Type: ${params.projectType || 'General Software'}

Requirements:
${params.requirements}

Provide:
1. Architecture design (components, technologies, patterns)
2. Development timeline with phases and tasks
3. Risk analysis with mitigation strategies
4. Technical recommendations

Be specific and practical.`,
      });

      return object as any;
    } catch (error) {
      this.logger.error(`Failed to analyze requirements: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate documentation
   */
  async generateDocumentation(params: {
    code?: string;
    description: string;
    format: 'markdown' | 'jsdoc' | 'api' | 'readme';
  }): Promise<{ documentation: string }> {
    try {
      const { text } = await generateText({
        model: this.defaultCodeModel,
        prompt: `Generate ${params.format} documentation.

${params.code ? `Code:\n\`\`\`\n${params.code}\n\`\`\`\n\n` : ''}

Description: ${params.description}

Create comprehensive, clear documentation that includes:
${params.format === 'api' ? '- Endpoints\n- Request/response formats\n- Authentication\n- Examples' : ''}
${params.format === 'readme' ? '- Installation\n- Usage\n- Examples\n- Configuration' : ''}
${params.format === 'jsdoc' ? '- Function descriptions\n- Parameters\n- Return types\n- Examples' : ''}
${params.format === 'markdown' ? '- Clear headings\n- Code examples\n- Best practices' : ''}`,
      });

      return { documentation: text };
    } catch (error) {
      this.logger.error(`Failed to generate documentation: ${error.message}`);
      throw error;
    }
  }

  /**
   * Optimize code with AI suggestions
   */
  async optimizeCode(params: {
    code: string;
    language: string;
    goals: string[];
  }): Promise<{
    optimizedCode: string;
    improvements: Array<{ type: string; description: string; impact: string }>;
    performanceGain?: string;
  }> {
    try {
      const { text } = await generateText({
        model: this.defaultCodeModel,
        prompt: `Optimize this ${params.language} code for:
${params.goals.map(g => `- ${g}`).join('\n')}

Original code:
\`\`\`${params.language}
${params.code}
\`\`\`

Provide:
1. Optimized code
2. List of improvements made
3. Expected performance impact

Format:
OPTIMIZED CODE:
\`\`\`${params.language}
[optimized code]
\`\`\`

IMPROVEMENTS:
[list of improvements with impact]`,
      });

      const codeMatch = text.match(/OPTIMIZED CODE:\s*```[\w]*\n([\s\S]*?)```/);
      const improvementsMatch = text.match(/IMPROVEMENTS:\s*([\s\S]*?)$/);

      // Parse improvements
      const improvements: Array<{ type: string; description: string; impact: string }> = [];
      if (improvementsMatch) {
        const lines = improvementsMatch[1].trim().split('\n');
        lines.forEach(line => {
          if (line.trim()) {
            improvements.push({
              type: 'optimization',
              description: line.trim(),
              impact: 'medium',
            });
          }
        });
      }

      return {
        optimizedCode: codeMatch ? codeMatch[1].trim() : params.code,
        improvements,
      };
    } catch (error) {
      this.logger.error(`Failed to optimize code: ${error.message}`);
      throw error;
    }
  }

  /**
   * Chat with AI agent (for interactive conversations)
   */
  async chat(params: {
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    agentRole?: string;
  }): Promise<{ response: string }> {
    try {
      const systemMessage = params.agentRole 
        ? `You are a ${params.agentRole} AI agent helping with software development.`
        : 'You are a helpful AI assistant.';

      const { text } = await generateText({
        model: this.defaultChatModel,
        messages: [
          { role: 'system', content: systemMessage },
          ...params.messages,
        ],
      });

      return { response: text };
    } catch (error) {
      this.logger.error(`Failed to chat: ${error.message}`);
      throw error;
    }
  }

  /**
   * Stream AI response (for real-time interactions)
   */
  async *streamResponse(params: {
    prompt: string;
    agentRole?: string;
  }): AsyncGenerator<string, void, unknown> {
    try {
      const systemPrompt = params.agentRole
        ? `You are a ${params.agentRole} AI agent.`
        : 'You are a helpful AI assistant.';

      const { textStream } = await streamText({
        model: this.defaultChatModel,
        prompt: `${systemPrompt}\n\n${params.prompt}`,
      });

      for await (const chunk of textStream) {
        yield chunk;
      }
    } catch (error) {
      this.logger.error(`Failed to stream response: ${error.message}`);
      throw error;
    }
  }
}
