import { Injectable, Logger } from '@nestjs/common';
import { AIAgentService } from '../services/ai-agent.service';

/**
 * AI-Enhanced VR Scene Agent
 * 
 * An intelligent VR guide powered by AI that can:
 * - Answer questions about the scene dynamically
 * - Provide contextual explanations
 * - Adapt to user interactions
 * - Learn from conversations
 */
@Injectable()
export class AIVRSceneAgent {
  private readonly logger = new Logger(AIVRSceneAgent.name);
  private conversationHistory: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

  private sceneContext = {
    name: 'Lit Compute Network Visualization',
    description: 'A 3D VR environment showing a decentralized compute network',
    components: {
      nodes: {
        count: 8,
        description: 'Compute nodes that process PKP authentication, Lit Actions, and distributed jobs',
        technology: 'Lit Protocol PKP infrastructure',
        capabilities: ['PKP authentication', 'Lit Action execution', 'Distributed job processing'],
      },
      hub: {
        description: 'Central coordinator for job distribution and load balancing',
        role: 'Network orchestration and health monitoring',
        technology: 'NestJS with Socket.IO WebSockets',
      },
      particles: {
        description: 'Visual representation of encrypted data flows',
        technology: 'Babylon.js particle systems',
        throughput: '~500 jobs/second',
      },
      stats: {
        description: 'Real-time network performance metrics',
        metrics: ['Active Nodes', 'Jobs Processed', 'Success Rate', 'Response Time', 'Total Earnings'],
      },
    },
    backend: {
      name: 'The Beach',
      technology: 'NestJS',
      features: ['8 worker processes', 'Redis Vercel KV', 'WebSocket real-time updates', '10 REST endpoints'],
    },
    frontend: {
      name: 'Y8 App',
      technology: 'Next.js 15, React 19',
      features: ['Lit Protocol PKP auth', 'Web3Modal wallet integration', 'Real-time job tracking'],
    },
  };

  constructor(private aiService: AIAgentService) {
    // Initialize conversation with system context
    this.conversationHistory.push({
      role: 'system',
      content: `You are an intelligent VR guide for the Lit Compute Network visualization.

Scene Context:
${JSON.stringify(this.sceneContext, null, 2)}

Your role:
- Explain the VR scene and its components
- Answer questions about the Lit Compute Network
- Provide technical details when asked
- Be friendly, helpful, and engaging
- Use analogies to explain complex concepts
- Reference what users can see in the VR scene

Keep responses concise (2-3 sentences) unless asked for details.`,
    });
  }

  /**
   * Answer a question using AI
   */
  async answerQuestion(question: string): Promise<{ answer: string; confidence: number }> {
    try {
      // Add user question to history
      this.conversationHistory.push({
        role: 'user',
        content: question,
      });

      // Get AI response
      const result = await this.aiService.chat({
        messages: this.conversationHistory,
        agentRole: 'VR Scene Guide for Lit Compute Network',
      });

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: result.response,
      });

      // Keep conversation history manageable (last 10 exchanges)
      if (this.conversationHistory.length > 21) { // 1 system + 20 messages
        this.conversationHistory = [
          this.conversationHistory[0], // Keep system message
          ...this.conversationHistory.slice(-20), // Keep last 20 messages
        ];
      }

      this.logger.log(`VR Agent answered: "${question}" -> "${result.response.substring(0, 50)}..."`);

      return {
        answer: result.response,
        confidence: 85, // AI responses have high confidence
      };
    } catch (error) {
      this.logger.error(`Failed to answer question: ${error.message}`);
      return {
        answer: "I'm having trouble processing that question right now. Could you try rephrasing it?",
        confidence: 50,
      };
    }
  }

  /**
   * Explain a specific feature using AI
   */
  async explainFeature(featureName: string): Promise<string> {
    try {
      const question = `Explain the ${featureName} feature in detail`;
      const result = await this.answerQuestion(question);
      return result.answer;
    } catch (error) {
      this.logger.error(`Failed to explain feature: ${error.message}`);
      return `I can explain the ${featureName} feature. The ${featureName} is an important part of the Lit Compute Network visualization.`;
    }
  }

  /**
   * Get node-specific information
   */
  async getNodeInfo(nodeId: number): Promise<string> {
    try {
      const question = `Tell me about compute node ${nodeId}. What is it doing?`;
      const result = await this.answerQuestion(question);
      return result.answer;
    } catch (error) {
      this.logger.error(`Failed to get node info: ${error.message}`);
      return `Compute node ${nodeId} is processing jobs and participating in the distributed network.`;
    }
  }

  /**
   * Provide a guided tour using AI
   */
  async *startGuidedTour(): AsyncGenerator<{ text: string; focus: string; duration: number }, void, unknown> {
    const tourPrompt = `Create a guided tour of the Lit Compute Network VR scene. 
    
    Generate 8-10 narration points that:
    - Introduce different components
    - Explain how they work together
    - Highlight interesting technical details
    - Keep each point to 1-2 sentences
    
    Format each point as:
    FOCUS: [component name]
    TEXT: [narration text]
    ---`;

    try {
      const result = await this.aiService.chat({
        messages: [
          ...this.conversationHistory.slice(0, 1), // System message
          { role: 'user', content: tourPrompt },
        ],
        agentRole: 'VR Scene Guide',
      });

      // Parse the tour points
      const points = result.response.split('---').filter(p => p.trim());
      
      for (const point of points) {
        const focusMatch = point.match(/FOCUS:\s*(.+)/);
        const textMatch = point.match(/TEXT:\s*(.+)/);
        
        if (focusMatch && textMatch) {
          yield {
            text: textMatch[1].trim(),
            focus: focusMatch[1].trim().toLowerCase(),
            duration: 6000,
          };
          
          // Wait before next point
          await new Promise(resolve => setTimeout(resolve, 6000));
        }
      }
    } catch (error) {
      this.logger.error(`Failed to generate tour: ${error.message}`);
      
      // Fallback to basic tour
      yield {
        text: "Welcome to the Lit Compute Network! Let me show you around.",
        focus: 'overview',
        duration: 5000,
      };
    }
  }

  /**
   * Get technical details using AI
   */
  async getTechnicalDetails(topic?: string): Promise<string> {
    try {
      const question = topic 
        ? `Provide technical details about ${topic} in the Lit Compute Network`
        : 'Give me a technical overview of the entire Lit Compute Network architecture';
      
      const result = await this.answerQuestion(question);
      return result.answer;
    } catch (error) {
      this.logger.error(`Failed to get technical details: ${error.message}`);
      return 'The Lit Compute Network uses advanced blockchain and distributed systems technology.';
    }
  }

  /**
   * Interactive learning - agent learns from user feedback
   */
  async provideFeedback(feedback: 'helpful' | 'not-helpful', lastResponse: string): Promise<void> {
    try {
      if (feedback === 'not-helpful') {
        this.conversationHistory.push({
          role: 'user',
          content: `That last response wasn't helpful. Can you explain differently?`,
        });
      } else {
        this.conversationHistory.push({
          role: 'user',
          content: `That was helpful, thank you!`,
        });
      }

      this.logger.log(`Received feedback: ${feedback} for response: "${lastResponse.substring(0, 50)}..."`);
    } catch (error) {
      this.logger.error(`Failed to process feedback: ${error.message}`);
    }
  }

  /**
   * Stream a response in real-time (for chat-like interactions)
   */
  async *streamResponse(question: string): AsyncGenerator<string, void, unknown> {
    try {
      const prompt = `${this.conversationHistory[0].content}\n\nUser: ${question}\n\nAssistant:`;
      
      for await (const chunk of this.aiService.streamResponse({
        prompt,
        agentRole: 'VR Scene Guide',
      })) {
        yield chunk;
      }

      this.logger.log(`Streamed response for: "${question}"`);
    } catch (error) {
      this.logger.error(`Failed to stream response: ${error.message}`);
      yield "I'm having trouble processing that question.";
    }
  }

  /**
   * Get conversation history (for debugging/analysis)
   */
  getConversationHistory(): Array<{ role: string; content: string; timestamp?: Date }> {
    return this.conversationHistory.map((msg, idx) => ({
      ...msg,
      timestamp: new Date(),
    }));
  }

  /**
   * Reset conversation (start fresh)
   */
  resetConversation(): void {
    this.conversationHistory = this.conversationHistory.slice(0, 1); // Keep only system message
    this.logger.log('Conversation reset');
  }

  /**
   * Get suggested questions based on context
   */
  async getSuggestedQuestions(): Promise<string[]> {
    try {
      const result = await this.aiService.chat({
        messages: [
          this.conversationHistory[0],
          {
            role: 'user',
            content: 'Generate 5 interesting questions a user might ask about this VR scene. Format as a simple list.',
          },
        ],
        agentRole: 'VR Scene Guide',
      });

      // Parse questions from response
      const questions = result.response
        .split('\n')
        .filter(line => line.trim().match(/^[\d\-\*\•]/))
        .map(line => line.replace(/^[\d\-\*\•]\s*/, '').trim())
        .filter(q => q.length > 0);

      return questions.slice(0, 5);
    } catch (error) {
      this.logger.error(`Failed to generate suggested questions: ${error.message}`);
      return [
        'What are the compute nodes doing?',
        'How does the network coordinator work?',
        'What do the particle effects represent?',
        'Can you explain the Lit Protocol?',
        'How do I interact with the network?',
      ];
    }
  }
}
