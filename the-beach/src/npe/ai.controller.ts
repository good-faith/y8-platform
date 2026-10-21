import { Controller, Post, Get, Body, Param, Query, Sse, MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AIAgentService } from './services/ai-agent.service';
import { AIVRSceneAgent } from './agents/AIVRSceneAgent';
import { AIToolRegistry } from './agents/ai-powered-tools';

/**
 * AI Controller
 * 
 * Provides HTTP/SSE endpoints for AI agent interactions
 */
@Controller('npe/ai')
export class AIController {
  private toolRegistry: AIToolRegistry;

  constructor(
    private aiService: AIAgentService,
    private vrAgent: AIVRSceneAgent,
  ) {
    this.toolRegistry = new AIToolRegistry(aiService);
  }

  /**
   * Generate code from natural language
   * POST /npe/ai/generate-code
   */
  @Post('generate-code')
  async generateCode(@Body() body: { description: string; language?: string; context?: string }) {
    return await this.aiService.generateCode({
      description: body.description,
      language: body.language || 'TypeScript',
      context: body.context,
    });
  }

  /**
   * Review code for quality and security
   * POST /npe/ai/review-code
   */
  @Post('review-code')
  async reviewCode(@Body() body: { code: string; language?: string }) {
    return await this.aiService.reviewCode({
      code: body.code,
      language: body.language || 'TypeScript',
    });
  }

  /**
   * Optimize code for performance
   * POST /npe/ai/optimize-code
   */
  @Post('optimize-code')
  async optimizeCode(@Body() body: { code: string; language?: string; goals?: string[] }) {
    return await this.aiService.optimizeCode({
      code: body.code,
      language: body.language || 'TypeScript',
      goals: body.goals || ['performance'],
    });
  }

  /**
   * Generate a task plan
   * POST /npe/ai/plan-task
   */
  @Post('plan-task')
  async planTask(@Body() body: { goal: string; agentRole?: string; context?: any; constraints?: string[] }) {
    return await this.aiService.generateTaskPlan({
      agentRole: body.agentRole || 'Development Agent',
      goal: body.goal,
      context: body.context,
      constraints: body.constraints,
    });
  }

  /**
   * Analyze requirements
   * POST /npe/ai/analyze-requirements
   */
  @Post('analyze-requirements')
  async analyzeRequirements(@Body() body: { requirements: string; projectType?: string }) {
    return await this.aiService.analyzeRequirements({
      requirements: body.requirements,
      projectType: body.projectType,
    });
  }

  /**
   * Generate documentation
   * POST /npe/ai/generate-docs
   */
  @Post('generate-docs')
  async generateDocs(@Body() body: { code?: string; description: string; format?: string }) {
    return await this.aiService.generateDocumentation({
      code: body.code,
      description: body.description,
      format: body.format as any || 'markdown',
    });
  }

  /**
   * Answer a technical question
   * POST /npe/ai/ask
   */
  @Post('ask')
  async askQuestion(@Body() body: { question: string; context?: string; agentRole?: string }) {
    return await this.aiService.answerQuestion({
      question: body.question,
      context: body.context,
      agentRole: body.agentRole || 'Software Development Assistant',
    });
  }

  /**
   * Chat with AI (multi-turn conversation)
   * POST /npe/ai/chat
   */
  @Post('chat')
  async chat(@Body() body: { messages: Array<{ role: string; content: string }>; agentRole?: string }) {
    return await this.aiService.chat({
      messages: body.messages as any,
      agentRole: body.agentRole || 'Software Development Assistant',
    });
  }

  /**
   * Stream AI response (Server-Sent Events)
   * GET /npe/ai/stream?prompt=...
   */
  @Sse('stream')
  streamResponse(@Query('prompt') prompt: string, @Query('role') agentRole?: string): Observable<MessageEvent> {
    return new Observable((observer) => {
      (async () => {
        try {
          for await (const chunk of this.aiService.streamResponse({
            prompt,
            agentRole: agentRole || 'Software Development Assistant',
          })) {
            observer.next({ data: chunk } as MessageEvent);
          }
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      })();
    });
  }

  /**
   * Execute an AI tool
   * POST /npe/ai/tools/:toolId/execute
   */
  @Post('tools/:toolId/execute')
  async executeTool(@Param('toolId') toolId: string, @Body() params: any) {
    return await this.toolRegistry.executeTool(toolId, params);
  }

  /**
   * List all available AI tools
   * GET /npe/ai/tools
   */
  @Get('tools')
  async listTools(@Query('category') category?: string) {
    if (category) {
      return this.toolRegistry.getToolsByCategory(category as any);
    }
    return this.toolRegistry.getAllTools();
  }

  /**
   * Get a specific AI tool
   * GET /npe/ai/tools/:toolId
   */
  @Get('tools/:toolId')
  async getTool(@Param('toolId') toolId: string) {
    return this.toolRegistry.getTool(toolId);
  }

  // ===== VR Scene Agent Endpoints =====

  /**
   * Ask the VR agent a question
   * POST /npe/ai/vr/ask
   */
  @Post('vr/ask')
  async askVRAgent(@Body() body: { question: string }) {
    return await this.vrAgent.answerQuestion(body.question);
  }

  /**
   * Get information about a specific node
   * GET /npe/ai/vr/nodes/:nodeId
   */
  @Get('vr/nodes/:nodeId')
  async getNodeInfo(@Param('nodeId') nodeId: string) {
    const info = await this.vrAgent.getNodeInfo(parseInt(nodeId));
    return { nodeId: parseInt(nodeId), info };
  }

  /**
   * Explain a feature
   * POST /npe/ai/vr/explain
   */
  @Post('vr/explain')
  async explainFeature(@Body() body: { feature: string }) {
    const explanation = await this.vrAgent.explainFeature(body.feature);
    return { feature: body.feature, explanation };
  }

  /**
   * Get technical details
   * GET /npe/ai/vr/technical-details
   */
  @Get('vr/technical-details')
  async getTechnicalDetails(@Query('topic') topic?: string) {
    const details = await this.vrAgent.getTechnicalDetails(topic);
    return { topic: topic || 'overview', details };
  }

  /**
   * Get suggested questions
   * GET /npe/ai/vr/suggested-questions
   */
  @Get('vr/suggested-questions')
  async getSuggestedQuestions() {
    const questions = await this.vrAgent.getSuggestedQuestions();
    return { questions };
  }

  /**
   * Stream VR agent response
   * GET /npe/ai/vr/stream?question=...
   */
  @Sse('vr/stream')
  streamVRResponse(@Query('question') question: string): Observable<MessageEvent> {
    return new Observable((observer) => {
      (async () => {
        try {
          for await (const chunk of this.vrAgent.streamResponse(question)) {
            observer.next({ data: chunk } as MessageEvent);
          }
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      })();
    });
  }

  /**
   * Start guided tour (Server-Sent Events)
   * GET /npe/ai/vr/tour
   */
  @Sse('vr/tour')
  startGuidedTour(): Observable<MessageEvent> {
    return new Observable((observer) => {
      (async () => {
        try {
          for await (const tourPoint of this.vrAgent.startGuidedTour()) {
            observer.next({ data: tourPoint } as MessageEvent);
          }
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      })();
    });
  }

  /**
   * Provide feedback on VR agent response
   * POST /npe/ai/vr/feedback
   */
  @Post('vr/feedback')
  async provideFeedback(@Body() body: { feedback: 'helpful' | 'not-helpful'; lastResponse: string }) {
    await this.vrAgent.provideFeedback(body.feedback, body.lastResponse);
    return { success: true };
  }

  /**
   * Get conversation history
   * GET /npe/ai/vr/history
   */
  @Get('vr/history')
  async getConversationHistory() {
    return this.vrAgent.getConversationHistory();
  }

  /**
   * Reset conversation
   * POST /npe/ai/vr/reset
   */
  @Post('vr/reset')
  async resetConversation() {
    this.vrAgent.resetConversation();
    return { success: true };
  }
}
