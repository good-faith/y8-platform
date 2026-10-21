# AI Agent Integration Guide

## Overview

The Lit Compute Network now includes **real AI-powered agents** using the Vercel AI SDK with OpenAI and Anthropic models. These agents provide intelligent automation, code generation, technical assistance, and interactive VR experiences.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     AI Agent System                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          AIAgentService (Core)                       │  │
│  │  - generateTaskPlan()                                │  │
│  │  - generateCode()                                    │  │
│  │  - reviewCode()                                      │  │
│  │  - answerQuestion()                                  │  │
│  │  - analyzeRequirements()                             │  │
│  │  - generateDocumentation()                           │  │
│  │  - optimizeCode()                                    │  │
│  │  - chat()                                            │  │
│  │  - streamResponse()                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                 │
│  ┌─────────────────────┐  ┌──────────────────────────────┐ │
│  │  AI-Powered Tools   │  │    AIVRSceneAgent            │ │
│  │  - Code Generation  │  │  - Dynamic narrations        │ │
│  │  - Code Review      │  │  - Question answering        │ │
│  │  - Task Planning    │  │  - Guided tours              │ │
│  │  - Documentation    │  │  - Feature explanations      │ │
│  │  - Requirements     │  │  - Technical details         │ │
│  │  - Optimization     │  │  - Conversation learning     │ │
│  │  - Tech Assistant   │  │  - Streaming responses       │ │
│  │  - Chat             │  │  - Suggested questions       │ │
│  └─────────────────────┘  └──────────────────────────────┘ │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                    AI Models                                 │
│  - GPT-4 Turbo (OpenAI) - Code & Chat                       │
│  - Claude 3.5 Sonnet (Anthropic) - Reasoning                │
└─────────────────────────────────────────────────────────────┘
```

## Setup

### 1. Install Dependencies

The AI SDK packages are already installed:

```bash
npm install ai @ai-sdk/openai @ai-sdk/anthropic
```

### 2. Configure API Keys

Copy `.env.example` to `.env` and add your API keys:

```bash
# OpenAI API Key (required)
OPENAI_API_KEY=sk-...

# Anthropic API Key (required)
ANTHROPIC_API_KEY=sk-ant-...

# Model Configuration (optional - defaults shown)
AI_MODEL_CHAT=gpt-4-turbo
AI_MODEL_CODE=gpt-4-turbo
AI_MODEL_REASONING=claude-3-5-sonnet-20241022
```

**Get API Keys:**
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/

### 3. Start the Server

```bash
npm run start:dev
```

## AI Services

### AIAgentService

Core service providing AI capabilities:

#### 1. Generate Task Plan

Create structured task plans from high-level goals:

```typescript
const plan = await aiService.generateTaskPlan({
  goal: 'Build a REST API for user management',
  context: { framework: 'NestJS', database: 'PostgreSQL' },
  constraints: ['Must use JWT authentication', 'Include rate limiting']
});

// Returns:
// {
//   tasks: [
//     { id: 1, title: 'Set up NestJS project', estimatedHours: 2, dependencies: [] },
//     { id: 2, title: 'Configure PostgreSQL', estimatedHours: 1, dependencies: [1] },
//     ...
//   ],
//   approach: 'Incremental development with TDD',
//   risks: ['Database migration complexity', 'JWT token expiration handling']
// }
```

#### 2. Generate Code

Generate code from natural language descriptions:

```typescript
const result = await aiService.generateCode({
  description: 'Create a user authentication service with JWT',
  language: 'TypeScript',
  framework: 'NestJS'
});

// Returns:
// {
//   code: '...',  // Full implementation
//   explanation: 'This service handles user authentication...',
//   tests: '...'  // Unit tests
// }
```

#### 3. Review Code

Automated code quality and security review:

```typescript
const review = await aiService.reviewCode({
  code: userCode,
  language: 'TypeScript'
});

// Returns:
// {
//   issues: [
//     { severity: 'high', type: 'security', description: 'SQL injection risk', line: 42 }
//   ],
//   score: 75,
//   summary: 'Code is functional but has security concerns'
// }
```

#### 4. Answer Questions

Technical Q&A with confidence scoring:

```typescript
const answer = await aiService.answerQuestion({
  question: 'How does Lit Protocol PKP authentication work?',
  context: 'Building a Web3 application',
  agentRole: 'Blockchain Developer Assistant'
});

// Returns:
// {
//   answer: 'PKP (Programmable Key Pair) authentication uses...',
//   confidence: 95,
//   references: ['https://developer.litprotocol.com/...']
// }
```

#### 5. Analyze Requirements

Convert requirements into architecture and timeline:

```typescript
const analysis = await aiService.analyzeRequirements({
  requirements: 'E-commerce platform with crypto payments',
  projectContext: { team: 'Full-stack', timeline: '3 months' }
});

// Returns:
// {
//   architecture: { frontend: '...', backend: '...', blockchain: '...' },
//   timeline: { phases: [...], milestones: [...] },
//   risks: ['Smart contract security', 'Payment gateway integration'],
//   recommendations: ['Use Next.js for SSR', 'Implement payment webhooks']
// }
```

#### 6. Generate Documentation

Multi-format documentation generation:

```typescript
const docs = await aiService.generateDocumentation({
  code: myCode,
  format: 'markdown',  // 'markdown' | 'jsdoc' | 'api' | 'readme'
  language: 'TypeScript'
});

// Returns markdown/jsdoc/api docs
```

#### 7. Optimize Code

Performance optimization with metrics:

```typescript
const optimized = await aiService.optimizeCode({
  code: slowCode,
  language: 'TypeScript',
  optimizationGoal: 'performance'
});

// Returns:
// {
//   optimizedCode: '...',
//   improvements: ['Used Map instead of Object lookup', 'Reduced iterations'],
//   performanceGain: '40% faster'
// }
```

#### 8. Chat (Multi-turn)

Interactive conversations with context:

```typescript
const chat = await aiService.chat({
  messages: [
    { role: 'user', content: 'Explain Redis caching' },
    { role: 'assistant', content: 'Redis is an in-memory...' },
    { role: 'user', content: 'How do I implement it in NestJS?' }
  ],
  agentRole: 'Backend Developer'
});

// Returns:
// {
//   response: 'To implement Redis in NestJS...'
// }
```

#### 9. Stream Response

Real-time streaming for UI:

```typescript
for await (const chunk of aiService.streamResponse({
  prompt: 'Explain microservices architecture',
  agentRole: 'System Architect'
})) {
  console.log(chunk);  // Display as it streams
}
```

## AI-Powered Tools

The system includes 8 AI-powered tools that implement the `PKPTool` interface:

### 1. AICodeGenerationTool
- **ID**: `ai-code-generation`
- **Category**: `code-generation`
- **Usage**: Natural language → production code

### 2. AICodeReviewTool
- **ID**: `ai-code-review`
- **Category**: `code-analysis`
- **Usage**: Automated quality/security review

### 3. AITaskPlanningTool
- **ID**: `ai-task-planning`
- **Category**: `planning`
- **Usage**: Goal → detailed task breakdown

### 4. AIDocumentationTool
- **ID**: `ai-documentation`
- **Category**: `documentation`
- **Usage**: Code → comprehensive docs

### 5. AIRequirementsAnalyzerTool
- **ID**: `ai-requirements-analyzer`
- **Category**: `planning`
- **Usage**: Requirements → architecture + timeline

### 6. AICodeOptimizerTool
- **ID**: `ai-code-optimizer`
- **Category**: `code-optimization`
- **Usage**: Code → optimized code with metrics

### 7. AITechnicalAssistantTool
- **ID**: `ai-technical-assistant`
- **Category**: `collaboration`
- **Usage**: Technical Q&A with references

### 8. AIChatTool
- **ID**: `ai-chat`
- **Category**: `collaboration`
- **Usage**: Interactive conversations

### Using Tools

```typescript
import { AIToolRegistry } from './agents/ai-powered-tools';

const registry = new AIToolRegistry(aiService);

// Execute a tool
const result = await registry.executeTool('ai-code-generation', {
  description: 'Create a WebSocket server',
  language: 'TypeScript'
});

// Get all tools in a category
const planningTools = registry.getToolsByCategory('planning');
```

## VR Scene Agent

The `AIVRSceneAgent` provides intelligent VR experiences:

### Features

1. **Dynamic Question Answering**
   ```typescript
   const answer = await vrAgent.answerQuestion('What do the particle effects represent?');
   // AI-generated response based on scene context
   ```

2. **Node Information**
   ```typescript
   const info = await vrAgent.getNodeInfo(3);
   // Detailed explanation of compute node #3
   ```

3. **Feature Explanations**
   ```typescript
   const explanation = await vrAgent.explainFeature('network coordinator');
   // In-depth technical explanation
   ```

4. **Guided Tours**
   ```typescript
   for await (const point of vrAgent.startGuidedTour()) {
     console.log(point.text);     // "Welcome to the Lit Compute Network..."
     console.log(point.focus);    // "hub"
     console.log(point.duration); // 6000ms
   }
   ```

5. **Streaming Responses**
   ```typescript
   for await (const chunk of vrAgent.streamResponse('Explain Lit Protocol')) {
     displayText += chunk;  // Real-time text display
   }
   ```

6. **Suggested Questions**
   ```typescript
   const questions = await vrAgent.getSuggestedQuestions();
   // ['What are the compute nodes doing?', 'How does PKP auth work?', ...]
   ```

7. **Conversation Learning**
   ```typescript
   await vrAgent.provideFeedback('helpful', lastResponse);
   // Agent learns from user feedback
   ```

## API Endpoints

### General AI Endpoints

#### POST `/npe/ai/generate-code`
```bash
curl -X POST http://localhost:3000/npe/ai/generate-code \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Create a user service with CRUD operations",
    "language": "TypeScript",
    "framework": "NestJS"
  }'
```

#### POST `/npe/ai/review-code`
```bash
curl -X POST http://localhost:3000/npe/ai/review-code \
  -H "Content-Type: application/json" \
  -d '{
    "code": "...",
    "language": "TypeScript"
  }'
```

#### POST `/npe/ai/ask`
```bash
curl -X POST http://localhost:3000/npe/ai/ask \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is Redis caching?",
    "agentRole": "Backend Developer"
  }'
```

#### GET `/npe/ai/stream?prompt=...`
Server-Sent Events for streaming responses:
```javascript
const eventSource = new EventSource('http://localhost:3000/npe/ai/stream?prompt=Explain+microservices');
eventSource.onmessage = (event) => {
  console.log(event.data);  // Stream chunks
};
```

#### GET `/npe/ai/tools`
List all available AI tools:
```bash
curl http://localhost:3000/npe/ai/tools
```

#### POST `/npe/ai/tools/:toolId/execute`
Execute a specific tool:
```bash
curl -X POST http://localhost:3000/npe/ai/tools/ai-code-generation/execute \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Create a REST API endpoint",
    "language": "TypeScript"
  }'
```

### VR Agent Endpoints

#### POST `/npe/ai/vr/ask`
```bash
curl -X POST http://localhost:3000/npe/ai/vr/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What are the compute nodes doing?"}'
```

#### GET `/npe/ai/vr/nodes/:nodeId`
```bash
curl http://localhost:3000/npe/ai/vr/nodes/3
```

#### POST `/npe/ai/vr/explain`
```bash
curl -X POST http://localhost:3000/npe/ai/vr/explain \
  -H "Content-Type: application/json" \
  -d '{"feature": "particle effects"}'
```

#### GET `/npe/ai/vr/suggested-questions`
```bash
curl http://localhost:3000/npe/ai/vr/suggested-questions
```

#### GET `/npe/ai/vr/stream?question=...`
Streaming VR responses (Server-Sent Events):
```javascript
const eventSource = new EventSource('http://localhost:3000/npe/ai/vr/stream?question=Tell+me+about+the+network');
eventSource.onmessage = (event) => {
  updateVRSubtitles(event.data);
};
```

#### GET `/npe/ai/vr/tour`
Guided tour (Server-Sent Events):
```javascript
const eventSource = new EventSource('http://localhost:3000/npe/ai/vr/tour');
eventSource.onmessage = (event) => {
  const tourPoint = JSON.parse(event.data);
  displayNarration(tourPoint.text);
  focusOnComponent(tourPoint.focus);
};
```

## Frontend Integration

### Using in Y8 App (Next.js)

```typescript
// hooks/useAIAgent.ts
import { useState } from 'react';

export function useAIAgent() {
  const [loading, setLoading] = useState(false);
  
  const generateCode = async (description: string) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/npe/ai/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, language: 'TypeScript' })
      });
      return await response.json();
    } finally {
      setLoading(false);
    }
  };
  
  const askVRAgent = async (question: string) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/npe/ai/vr/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      return await response.json();
    } finally {
      setLoading(false);
    }
  };
  
  return { generateCode, askVRAgent, loading };
}
```

### Streaming in React

```typescript
function StreamingChat() {
  const [text, setText] = useState('');
  
  const streamQuestion = async (question: string) => {
    const eventSource = new EventSource(
      `http://localhost:3000/npe/ai/vr/stream?question=${encodeURIComponent(question)}`
    );
    
    eventSource.onmessage = (event) => {
      setText(prev => prev + event.data);
    };
    
    eventSource.onerror = () => {
      eventSource.close();
    };
  };
  
  return <div>{text}</div>;
}
```

## Best Practices

### 1. Error Handling

```typescript
try {
  const result = await aiService.generateCode({ description: '...' });
} catch (error) {
  if (error.message.includes('API key')) {
    console.error('AI service not configured');
  } else if (error.message.includes('rate limit')) {
    console.error('Rate limit exceeded');
  }
}
```

### 2. Cost Management

- Cache frequent queries
- Use streaming for long responses
- Set rate limits in `.env`
- Monitor API usage

### 3. Context Management

```typescript
// VR Agent maintains conversation history
await vrAgent.answerQuestion('What is PKP?');
await vrAgent.answerQuestion('How do I use it?');  // Contextual
// Reset when needed
vrAgent.resetConversation();
```

### 4. Model Selection

- **GPT-4 Turbo**: Code generation, chat (fast, cost-effective)
- **Claude 3.5 Sonnet**: Complex reasoning, analysis (high quality)

## Performance

### Typical Response Times

- **Simple questions**: 1-2 seconds
- **Code generation**: 3-5 seconds
- **Code review**: 2-4 seconds
- **Streaming**: Real-time chunks every 50-100ms

### Rate Limits

Default configuration:
- OpenAI: 50 requests/minute, 90,000 tokens/minute
- Anthropic: 50 requests/minute, 100,000 tokens/minute

## Testing

### Unit Tests

```typescript
describe('AIAgentService', () => {
  it('should generate code', async () => {
    const result = await aiService.generateCode({
      description: 'Hello world function',
      language: 'TypeScript'
    });
    expect(result.code).toContain('function');
  });
});
```

### Integration Tests

```typescript
describe('AI Controller', () => {
  it('POST /npe/ai/ask', async () => {
    const response = await request(app.getHttpServer())
      .post('/npe/ai/ask')
      .send({ question: 'What is NestJS?' })
      .expect(200);
    
    expect(response.body.answer).toBeDefined();
    expect(response.body.confidence).toBeGreaterThan(0);
  });
});
```

## Troubleshooting

### Issue: "OPENAI_API_KEY not configured"

**Solution**: Add API key to `.env`:
```bash
OPENAI_API_KEY=sk-...
```

### Issue: Rate limit exceeded

**Solution**: Reduce request frequency or upgrade API plan

### Issue: Slow responses

**Solution**: 
- Use streaming for real-time feedback
- Cache common queries
- Consider using gpt-3.5-turbo for simple tasks

### Issue: Low-quality responses

**Solution**:
- Provide more context in prompts
- Use Claude 3.5 Sonnet for complex reasoning
- Review and adjust system prompts

## Next Steps

1. **Configure API Keys** - Add OpenAI and Anthropic keys to `.env`
2. **Test Endpoints** - Try the AI endpoints via curl/Postman
3. **Integrate Frontend** - Connect Y8 App to AI endpoints
4. **Monitor Usage** - Track API costs and performance
5. **Customize Agents** - Adjust system prompts for your use case

## Resources

- **Vercel AI SDK**: https://sdk.vercel.ai/
- **OpenAI API**: https://platform.openai.com/docs
- **Anthropic API**: https://docs.anthropic.com/
- **The Beach Backend**: `src/npe/` directory
- **Y8 App Frontend**: https://github.com/jasonsprouse/y8-app

---

**Built with ❤️ using Vercel AI SDK**
