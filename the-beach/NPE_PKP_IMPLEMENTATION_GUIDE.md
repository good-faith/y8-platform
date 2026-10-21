# 🛠️ NPE + PKP Implementation Guide

## Step-by-Step Setup for Autonomous Development Pipeline

---

## Phase 1: Git Infrastructure Setup (Week 1)

### Step 1.1: Create Branch Structure

```bash
#!/bin/bash
# setup-git-branches.sh

# Navigate to repository
cd /home/goodfaith/projects/xr/babylon

# Create main branch structure
git checkout -b main
git checkout -b staging
git checkout -b qa-chamber
git checkout -b dev

# Create NPE agent branches
git checkout -b feature/npe-node-software
git checkout -b feature/npe-smart-contracts
git checkout -b feature/npe-desktop-app
git checkout -b feature/npe-api-integration
git checkout -b feature/npe-security

# Push all branches to remote
git push -u origin main staging qa-chamber dev
git push -u origin feature/npe-node-software
git push -u origin feature/npe-smart-contracts
git push -u origin feature/npe-desktop-app
git push -u origin feature/npe-api-integration
git push -u origin feature/npe-security

echo "✅ Branch structure created"
```

### Step 1.2: Set Branch Protection Rules

```typescript
// github-protection-rules.ts

import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

async function setupBranchProtection() {
  const owner = 'jasonsprouse';
  const repo = 'babylon';
  
  // Protect main branch
  await octokit.repos.updateBranchProtection({
    owner,
    repo,
    branch: 'main',
    required_status_checks: {
      strict: true,
      contexts: [
        'qa-chamber/unit-tests',
        'qa-chamber/integration-tests',
        'qa-chamber/e2e-tests',
        'pkp-agent/job-submitter',
        'pkp-agent/node-monitor',
        'pkp-agent/payment-auditor',
        'pkp-agent/performance-tracker',
        'pkp-agent/security-scanner',
        'pkp-agent/code-reviewer',
        'pkp-agent/integration-tester',
        'pkp-agent/regression-guard',
      ],
    },
    enforce_admins: false,
    required_pull_request_reviews: {
      dismiss_stale_reviews: true,
      require_code_owner_reviews: true,
      required_approving_review_count: 2, // 1 PKP + 1 human
    },
    restrictions: null,
  });
  
  console.log('✅ Branch protection configured');
}

setupBranchProtection();
```

### Step 1.3: Create GitHub Actions for QA Chamber

```yaml
# .github/workflows/qa-chamber.yml

name: QA Chamber

on:
  push:
    branches:
      - 'feature/**'
      - 'qa-chamber'
  pull_request:
    branches:
      - 'staging'
      - 'main'

jobs:
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:unit
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unit

  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    needs: unit-tests
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:integration
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/test
          REDIS_URL: redis://localhost:6379

  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: integration-tests
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  pkp-agent-validation:
    name: PKP Agent Validation
    runs-on: ubuntu-latest
    needs: e2e-tests
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - name: Run PKP Agent Validation
        run: npm run pkp:validate
        env:
          LIT_NETWORK: cayenne
          PKP_PUBLIC_KEY_JOB_SUBMITTER: ${{ secrets.PKP_PUBLIC_KEY_JOB_SUBMITTER }}
          PKP_PUBLIC_KEY_NODE_MONITOR: ${{ secrets.PKP_PUBLIC_KEY_NODE_MONITOR }}
          PKP_PUBLIC_KEY_PAYMENT_AUDITOR: ${{ secrets.PKP_PUBLIC_KEY_PAYMENT_AUDITOR }}
          PKP_PUBLIC_KEY_PERFORMANCE_TRACKER: ${{ secrets.PKP_PUBLIC_KEY_PERFORMANCE_TRACKER }}
          PKP_PUBLIC_KEY_SECURITY_SCANNER: ${{ secrets.PKP_PUBLIC_KEY_SECURITY_SCANNER }}
          PKP_PUBLIC_KEY_CODE_REVIEWER: ${{ secrets.PKP_PUBLIC_KEY_CODE_REVIEWER }}
          PKP_PUBLIC_KEY_INTEGRATION_TESTER: ${{ secrets.PKP_PUBLIC_KEY_INTEGRATION_TESTER }}
          PKP_PUBLIC_KEY_REGRESSION_GUARD: ${{ secrets.PKP_PUBLIC_KEY_REGRESSION_GUARD }}

  quality-gates:
    name: Quality Gates
    runs-on: ubuntu-latest
    needs: pkp-agent-validation
    steps:
      - uses: actions/checkout@v3
      - name: Check code coverage
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "❌ Code coverage ($COVERAGE%) below 80%"
            exit 1
          fi
          echo "✅ Code coverage: $COVERAGE%"
      
      - name: Check for critical bugs
        run: |
          BUGS=$(gh api repos/:owner/:repo/issues -q '.[] | select(.labels[].name == "bug" and .labels[].name == "critical") | .number' | wc -l)
          if [ $BUGS -gt 0 ]; then
            echo "❌ $BUGS critical bugs found"
            exit 1
          fi
          echo "✅ No critical bugs"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Performance benchmark
        run: npm run benchmark
      
      - name: Security scan
        run: npm audit --audit-level=high

  auto-merge:
    name: Auto Merge to Staging
    runs-on: ubuntu-latest
    needs: quality-gates
    if: github.event_name == 'push' && startsWith(github.ref, 'refs/heads/feature/')
    steps:
      - uses: actions/checkout@v3
      - name: Create PR to staging
        run: |
          gh pr create \
            --base staging \
            --head ${{ github.ref_name }} \
            --title "[QA Passed] ${{ github.ref_name }}" \
            --body "All QA checks passed. Auto-created by QA Chamber."
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Auto-approve with PKP signature
        run: |
          PR_NUMBER=$(gh pr list --head ${{ github.ref_name }} --json number -q '.[0].number')
          # Sign with PKP
          node scripts/pkp-sign-pr.js $PR_NUMBER
          # Approve PR
          gh pr review $PR_NUMBER --approve
        env:
          GITHUB_TOKEN: ${{ secrets.PKP_GITHUB_TOKEN }}
      
      - name: Auto-merge
        run: |
          PR_NUMBER=$(gh pr list --head ${{ github.ref_name }} --json number -q '.[0].number')
          gh pr merge $PR_NUMBER --squash --auto
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Phase 2: PKP Agent Setup (Week 2)

### Step 2.1: Mint PKP Wallets for Agents

```typescript
// scripts/mint-pkp-agents.ts

import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { ethers } from 'ethers';
import * as fs from 'fs';

async function mintPKPAgents() {
  // Initialize Lit client
  const litNodeClient = new LitNodeClient({
    litNetwork: 'cayenne',
  });
  await litNodeClient.connect();

  // Connect wallet
  const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY!);
  
  const agents = [
    'PKP_JobSubmitter',
    'PKP_NodeMonitor',
    'PKP_PaymentAuditor',
    'PKP_PerformanceTracker',
    'PKP_SecurityScanner',
    'PKP_CodeReviewer',
    'PKP_IntegrationTester',
    'PKP_RegressionGuard',
  ];
  
  const pkpKeys: Record<string, string> = {};
  
  for (const agent of agents) {
    console.log(`Minting PKP for ${agent}...`);
    
    // Mint PKP
    const { pkpPublicKey, tokenId } = await litNodeClient.mintPKP({
      authMethod: {
        authMethodType: 'EthWallet',
        accessToken: JSON.stringify({
          sig: await wallet.signMessage('Mint PKP for ' + agent),
          derivedVia: 'web3.eth.personal.sign',
          signedMessage: 'Mint PKP for ' + agent,
          address: wallet.address,
        }),
      },
    });
    
    pkpKeys[agent] = pkpPublicKey;
    
    console.log(`✅ ${agent}: ${pkpPublicKey}`);
    console.log(`   Token ID: ${tokenId}`);
  }
  
  // Save to .env file
  let envContent = '';
  for (const [agent, publicKey] of Object.entries(pkpKeys)) {
    envContent += `${agent.toUpperCase()}_PUBLIC_KEY=${publicKey}\n`;
  }
  
  fs.writeFileSync('.env.pkp', envContent);
  console.log('\n✅ PKP agents minted and saved to .env.pkp');
  
  return pkpKeys;
}

mintPKPAgents()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### Step 2.2: Implement PKP Agent Base Class

```typescript
// src/pkp/pkp-agent.base.ts

import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LitAbility, LitActionResource } from '@lit-protocol/auth-helpers';

export enum PKPRole {
  JOB_SUBMITTER = 'job_submitter',
  NODE_MONITOR = 'node_monitor',
  PAYMENT_AUDITOR = 'payment_auditor',
  PERFORMANCE_TRACKER = 'performance_tracker',
  SECURITY_SCANNER = 'security_scanner',
  CODE_REVIEWER = 'code_reviewer',
  INTEGRATION_TESTER = 'integration_tester',
  REGRESSION_GUARD = 'regression_guard',
}

export interface PKPAgentConfig {
  pkpPublicKey: string;
  role: PKPRole;
  capabilities: string[];
  schedule: string; // Cron expression
  branches: string[];
  thresholds: QualityThresholds;
}

export interface QualityThresholds {
  minCodeCoverage?: number;
  maxResponseTime?: number;
  minSuccessRate?: number;
  maxBugCount?: number;
}

export abstract class PKPAgentBase {
  protected litNodeClient: LitNodeClient;
  protected sessionSigs: any;
  
  constructor(
    protected config: PKPAgentConfig,
  ) {}
  
  /**
   * Initialize Lit connection and authenticate
   */
  async initialize(): Promise<void> {
    this.litNodeClient = new LitNodeClient({
      litNetwork: process.env.LIT_NETWORK || 'cayenne',
    });
    
    await this.litNodeClient.connect();
    
    // Get session signatures
    this.sessionSigs = await this.getSessionSigs();
    
    console.log(`✅ ${this.config.role} initialized`);
  }
  
  /**
   * Get session signatures for PKP
   */
  private async getSessionSigs(): Promise<any> {
    const sessionSigs = await this.litNodeClient.getSessionSigs({
      chain: 'ethereum',
      expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
      resourceAbilityRequests: [
        {
          resource: new LitActionResource('*'),
          ability: LitAbility.LitActionExecution,
        },
      ],
      authNeededCallback: async ({ uri, expiration, resourceAbilityRequests }) => {
        // Sign authentication message
        const authSig = await this.signAuthMessage(uri);
        return authSig;
      },
    });
    
    return sessionSigs;
  }
  
  /**
   * Sign authentication message with PKP
   */
  private async signAuthMessage(uri: string): Promise<any> {
    // In production, this would use the PKP's private key
    // For now, we'll use a placeholder
    return {
      sig: '0x...',
      derivedVia: 'web3.eth.personal.sign',
      signedMessage: uri,
      address: this.config.pkpPublicKey,
    };
  }
  
  /**
   * Execute Lit Action
   */
  protected async executeLitAction(code: string, params: any): Promise<any> {
    const result = await this.litNodeClient.executeJs({
      code,
      sessionSigs: this.sessionSigs,
      jsParams: params,
    });
    
    return result;
  }
  
  /**
   * Run validation for a specific branch
   */
  abstract validate(branch: string): Promise<ValidationResult>;
  
  /**
   * Main execution loop (called by cron)
   */
  abstract run(): Promise<void>;
  
  /**
   * Encrypt data for NPE agent
   */
  protected async encryptForNPE(npePublicKey: string, data: any): Promise<string> {
    const { ciphertext, dataToEncryptHash } = await this.litNodeClient.encrypt({
      dataToEncrypt: new TextEncoder().encode(JSON.stringify(data)),
      accessControlConditions: [
        {
          contractAddress: '',
          standardContractType: '',
          chain: 'ethereum',
          method: '',
          parameters: [':userAddress'],
          returnValueTest: {
            comparator: '=',
            value: npePublicKey,
          },
        },
      ],
    });
    
    return JSON.stringify({ ciphertext, dataToEncryptHash });
  }
  
  /**
   * Report metrics to database
   */
  protected async reportMetrics(metrics: any): Promise<void> {
    // Store in PostgreSQL
    // Implementation depends on your database setup
  }
}

export interface ValidationResult {
  passed: boolean;
  score?: number;
  issues?: string[];
  metrics?: any;
}
```

### Step 2.3: Implement Job Submitter Agent

```typescript
// src/pkp/agents/job-submitter.agent.ts

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PKPAgentBase, PKPRole, ValidationResult } from '../pkp-agent.base';
import { LitComputeAPIService } from '../../lit-compute/lit-compute-api.service';
import { randomBytes } from 'crypto';

@Injectable()
export class JobSubmitterAgent extends PKPAgentBase {
  private readonly logger = new Logger(JobSubmitterAgent.name);
  
  constructor(
    private readonly litComputeAPI: LitComputeAPIService,
  ) {
    super({
      pkpPublicKey: process.env.PKP_JOB_SUBMITTER_PUBLIC_KEY!,
      role: PKPRole.JOB_SUBMITTER,
      capabilities: ['submit_jobs', 'monitor_completion', 'validate_results'],
      schedule: '*/5 * * * *', // Every 5 minutes
      branches: ['feature/*', 'qa-chamber', 'staging'],
      thresholds: {
        minSuccessRate: 0.99,
        maxResponseTime: 300000, // 5 minutes
      },
    });
  }
  
  /**
   * Run job submission cycle (every 5 minutes)
   */
  @Cron('*/5 * * * *')
  async run(): Promise<void> {
    this.logger.log('🚀 Starting job submission cycle');
    
    try {
      // 1. Generate test data
      const testData = this.generateTestData();
      
      // 2. Upload to IPFS
      const inputCID = await this.uploadToIPFS(testData);
      
      // 3. Submit job
      const job = await this.litComputeAPI.submitJob({
        inputCID,
        pkpPublicKey: this.config.pkpPublicKey,
        fee: '0.001',
        expectedOutputType: 'encrypted',
      });
      
      this.logger.log(`📤 Job submitted: ${job.id}`);
      
      // 4. Monitor completion
      const result = await this.waitForCompletion(job.id, 300000);
      
      // 5. Validate output
      const isValid = await this.validateOutput(result);
      
      // 6. Report metrics
      await this.reportMetrics({
        agentRole: this.config.role,
        jobId: job.id,
        success: isValid,
        duration: result.duration,
        fee: job.fee,
        timestamp: new Date(),
      });
      
      // 7. Alert if failure
      if (!isValid) {
        this.logger.error(`❌ Job ${job.id} failed validation`);
        await this.alertFailure(job.id);
      } else {
        this.logger.log(`✅ Job ${job.id} completed successfully`);
      }
      
    } catch (error) {
      this.logger.error(`❌ Job submission cycle failed: ${error.message}`);
    }
  }
  
  /**
   * Validate a specific branch
   */
  async validate(branch: string): Promise<ValidationResult> {
    this.logger.log(`🔍 Validating ${branch}`);
    
    // Submit 10 test jobs to this branch
    const results = await Promise.all(
      Array(10).fill(null).map(() => this.submitTestJob(branch))
    );
    
    const successCount = results.filter(r => r.success).length;
    const successRate = successCount / results.length;
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    
    return {
      passed: successRate >= this.config.thresholds.minSuccessRate!,
      score: successRate * 100,
      metrics: {
        successRate,
        avgDuration,
        totalJobs: results.length,
        successfulJobs: successCount,
      },
    };
  }
  
  private generateTestData(): any {
    return {
      type: 'test',
      data: randomBytes(1024).toString('hex'),
      timestamp: Date.now(),
    };
  }
  
  private async uploadToIPFS(data: any): Promise<string> {
    // Upload to IPFS
    // Implementation depends on your IPFS setup
    return 'QmTest...';
  }
  
  private async waitForCompletion(jobId: string, timeout: number): Promise<any> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const status = await this.litComputeAPI.getJobStatus(jobId);
      
      if (status.completed) {
        return status;
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5 seconds
    }
    
    throw new Error(`Job ${jobId} timed out after ${timeout}ms`);
  }
  
  private async validateOutput(result: any): Promise<boolean> {
    // Validate the job output
    return result.success && result.outputCID;
  }
  
  private async submitTestJob(branch: string): Promise<any> {
    // Submit a test job to a specific branch
    // Implementation depends on your branching strategy
    return { success: true, duration: 5000 };
  }
  
  private async alertFailure(jobId: string): Promise<void> {
    // Send alert (Slack, Discord, etc.)
  }
}
```

### Step 2.4: Create PKP Agent Module

```typescript
// src/pkp/pkp.module.ts

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { JobSubmitterAgent } from './agents/job-submitter.agent';
import { NodeMonitorAgent } from './agents/node-monitor.agent';
import { PaymentAuditorAgent } from './agents/payment-auditor.agent';
import { PerformanceTrackerAgent } from './agents/performance-tracker.agent';
import { SecurityScannerAgent } from './agents/security-scanner.agent';
import { CodeReviewerAgent } from './agents/code-reviewer.agent';
import { IntegrationTesterAgent } from './agents/integration-tester.agent';
import { RegressionGuardAgent } from './agents/regression-guard.agent';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    JobSubmitterAgent,
    NodeMonitorAgent,
    PaymentAuditorAgent,
    PerformanceTrackerAgent,
    SecurityScannerAgent,
    CodeReviewerAgent,
    IntegrationTesterAgent,
    RegressionGuardAgent,
  ],
  exports: [
    JobSubmitterAgent,
    NodeMonitorAgent,
    PaymentAuditorAgent,
    PerformanceTrackerAgent,
    SecurityScannerAgent,
    CodeReviewerAgent,
    IntegrationTesterAgent,
    RegressionGuardAgent,
  ],
})
export class PKPModule {}
```

---

## Phase 3: QA Chamber Implementation (Week 3)

### Step 3.1: Create QA Chamber Service

```typescript
// src/qa-chamber/qa-chamber.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { JobSubmitterAgent } from '../pkp/agents/job-submitter.agent';
import { NodeMonitorAgent } from '../pkp/agents/node-monitor.agent';
import { PaymentAuditorAgent } from '../pkp/agents/payment-auditor.agent';
import { PerformanceTrackerAgent } from '../pkp/agents/performance-tracker.agent';
import { SecurityScannerAgent } from '../pkp/agents/security-scanner.agent';
import { CodeReviewerAgent } from '../pkp/agents/code-reviewer.agent';
import { IntegrationTesterAgent } from '../pkp/agents/integration-tester.agent';
import { RegressionGuardAgent } from '../pkp/agents/regression-guard.agent';
import { GitService } from '../git/git.service';

@Injectable()
export class QAChamberService {
  private readonly logger = new Logger(QAChamberService.name);
  
  constructor(
    private readonly jobSubmitter: JobSubmitterAgent,
    private readonly nodeMonitor: NodeMonitorAgent,
    private readonly paymentAuditor: PaymentAuditorAgent,
    private readonly performanceTracker: PerformanceTrackerAgent,
    private readonly securityScanner: SecurityScannerAgent,
    private readonly codeReviewer: CodeReviewerAgent,
    private readonly integrationTester: IntegrationTesterAgent,
    private readonly regressionGuard: RegressionGuardAgent,
    private readonly gitService: GitService,
  ) {}
  
  /**
   * Process feature branches every hour
   */
  @Cron('0 * * * *')
  async processFeatureBranches(): Promise<void> {
    this.logger.log('🏭 QA Chamber: Processing feature branches');
    
    // Get all feature branches
    const branches = await this.gitService.getBranches('feature/*');
    
    for (const branch of branches) {
      await this.processFeatureBranch(branch);
    }
  }
  
  /**
   * Process a single feature branch
   */
  async processFeatureBranch(branch: string): Promise<QAResult> {
    this.logger.log(`🔍 Processing ${branch}`);
    
    // Stage 1: Unit Tests
    const unitTests = await this.runUnitTests(branch);
    if (!unitTests.passed) {
      return this.failWithFeedback(branch, 'Unit tests failed', unitTests);
    }
    
    // Stage 2: Integration Tests
    const integrationTests = await this.runIntegrationTests(branch);
    if (!integrationTests.passed) {
      return this.failWithFeedback(branch, 'Integration tests failed', integrationTests);
    }
    
    // Stage 3: E2E Tests
    const e2eTests = await this.runE2ETests(branch);
    if (!e2eTests.passed) {
      return this.failWithFeedback(branch, 'E2E tests failed', e2eTests);
    }
    
    // Stage 4: PKP Agent Validation
    const pkpValidation = await this.runPKPValidation(branch);
    if (!pkpValidation.allPassed) {
      return this.failWithFeedback(branch, 'PKP validation failed', pkpValidation);
    }
    
    // Stage 5: Quality Gates
    const qualityGates = await this.checkQualityGates(branch);
    if (!qualityGates.passed) {
      return this.failWithFeedback(branch, 'Quality gates not met', qualityGates);
    }
    
    // All checks passed!
    return this.passWithApproval(branch);
  }
  
  private async runPKPValidation(branch: string): Promise<any> {
    const results = await Promise.all([
      this.jobSubmitter.validate(branch),
      this.nodeMonitor.validate(branch),
      this.paymentAuditor.validate(branch),
      this.performanceTracker.validate(branch),
      this.securityScanner.validate(branch),
      this.codeReviewer.validate(branch),
      this.integrationTester.validate(branch),
      this.regressionGuard.validate(branch),
    ]);
    
    return {
      allPassed: results.every(r => r.passed),
      results,
    };
  }
  
  private async passWithApproval(branch: string): Promise<QAResult> {
    // Create PR to staging
    const pr = await this.gitService.createPR({
      from: branch,
      to: 'staging',
      title: `[QA Passed] ${branch}`,
      body: 'All QA checks passed.',
    });
    
    // Auto-approve
    await this.gitService.approvePR(pr.number, this.jobSubmitter.config.pkpPublicKey);
    
    // Auto-merge
    await this.gitService.mergePR(pr.number);
    
    this.logger.log(`✅ ${branch} merged to staging`);
    
    return { passed: true, branch, pr: pr.number };
  }
  
  private async failWithFeedback(branch: string, reason: string, details: any): Promise<QAResult> {
    this.logger.error(`❌ ${branch} failed: ${reason}`);
    
    // Post feedback as GitHub comment
    await this.gitService.commentOnBranch(branch, {
      reason,
      details,
    });
    
    return { passed: false, branch, reason };
  }
}

interface QAResult {
  passed: boolean;
  branch: string;
  reason?: string;
  pr?: number;
}
```

---

## Phase 4: NPE Agent Integration (Week 4)

### Step 4.1: Update NPE Agents to Use Branches

```typescript
// src/npe/agents/npe-node-software.agent.ts

import { Injectable, Logger } from '@nestjs/common';
import { NPEAgentBase } from '../npe-agent.base';
import { GitService } from '../../git/git.service';

@Injectable()
export class NPENodeSoftwareAgent extends NPEAgentBase {
  private readonly logger = new Logger(NPENodeSoftwareAgent.name);
  
  constructor(
    private readonly gitService: GitService,
  ) {
    super({
      id: 'npe-node-software',
      name: 'NPE_NodeSoftware',
      role: 'Senior Backend Engineer',
      expertise: ['Distributed Systems', 'Node.js', 'TypeScript'],
      branch: 'feature/npe-node-software',
    });
  }
  
  /**
   * Execute a development task
   */
  async executeTask(task: Task): Promise<TaskResult> {
    this.logger.log(`📋 Executing task: ${task.title}`);
    
    // 1. Create feature branch
    const branchName = await this.createFeatureBranch(task);
    
    // 2. Analyze requirements
    const analysis = await this.analyzeRequirements(task);
    
    // 3. Research best practices
    const research = await this.researchBestPractices(task.domain);
    
    // 4. Create implementation plan
    const plan = await this.createImplementationPlan(analysis, research);
    
    // 5. Generate code
    const code = await this.generateCode(plan);
    
    // 6. Write tests
    const tests = await this.generateTests(code);
    
    // 7. Commit changes
    await this.gitService.commitFiles(branchName, [
      ...code.files,
      ...tests.files,
    ], `feat: ${task.title}`);
    
    // 8. Push to remote
    await this.gitService.push(branchName);
    
    // 9. Tag for QA
    await this.gitService.createTag(branchName, 'ready-for-qa');
    
    this.logger.log(`✅ Task completed: ${task.title}`);
    
    return {
      success: true,
      branch: branchName,
      filesCreated: code.files.length + tests.files.length,
    };
  }
  
  private async createFeatureBranch(task: Task): Promise<string> {
    const branchName = `feature/npe-node-software-${task.slug}-${task.id}`;
    await this.gitService.createBranch(branchName, this.config.branch);
    return branchName;
  }
}
```

---

## 📊 Monitoring Dashboard

### Step 5.1: Create Dashboard Component

```typescript
// src/dashboard/qa-dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { QADashboardService } from './qa-dashboard.service';

@Component({
  selector: 'app-qa-dashboard',
  template: `
    <div class="dashboard">
      <h1>PKP Agent QA Dashboard</h1>
      
      <div class="agents-grid">
        <div *ngFor="let agent of agents" class="agent-card">
          <div class="agent-status" [class]="agent.status">
            {{ agent.status === 'running' ? '🟢' : '🔴' }}
          </div>
          <h3>{{ agent.name }}</h3>
          <div class="agent-metrics">
            <p>Success Rate: {{ agent.successRate }}%</p>
            <p>Last Run: {{ agent.lastRun | date:'short' }}</p>
            <p>Total Validations: {{ agent.totalValidations }}</p>
          </div>
        </div>
      </div>
      
      <div class="qa-chamber-status">
        <h2>QA Chamber Activity</h2>
        <div *ngFor="let result of recentResults" class="qa-result">
          <span [class]="result.passed ? 'passed' : 'failed'">
            {{ result.passed ? '✅' : '❌' }}
          </span>
          <span>{{ result.branch }}</span>
          <span>{{ result.timestamp | date:'short' }}</span>
        </div>
      </div>
    </div>
  `,
})
export class QADashboardComponent implements OnInit {
  agents: any[] = [];
  recentResults: any[] = [];
  
  constructor(private qaService: QADashboardService) {}
  
  ngOnInit() {
    this.loadAgentStatus();
    this.loadRecentResults();
  }
  
  async loadAgentStatus() {
    this.agents = await this.qaService.getAgentStatus();
  }
  
  async loadRecentResults() {
    this.recentResults = await this.qaService.getRecentResults();
  }
}
```

---

## ✅ Deployment Checklist

### Pre-Deployment

- [ ] All PKP wallets minted
- [ ] GitHub Actions configured
- [ ] Branch protection rules enabled
- [ ] 8 PKP agents implemented
- [ ] QA Chamber service deployed
- [ ] NPE agents updated to use branches
- [ ] Dashboard deployed

### Post-Deployment

- [ ] Monitor PKP agents for 24 hours
- [ ] Verify QA Chamber processes test branch
- [ ] Confirm NPE agents can create feature branches
- [ ] Test complete workflow end-to-end
- [ ] Set up alerts for failures
- [ ] Document any issues

---

**Timeline**: 4 weeks  
**Team**: 2 engineers  
**Cost**: ~$50K (mostly Lit Protocol fees)  
**ROI**: 10x productivity increase within 3 months
