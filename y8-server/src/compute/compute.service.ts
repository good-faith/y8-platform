import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';
import { ComputeJob, CreateJobDto, JobStatus } from './compute.types';

/**
 * ComputeService — in-process async job queue.
 * Drop-in replacement for Lit Actions / Lit Compute.
 * Jobs run in isolated async workers and broadcast results over WebSocket.
 * Swap the processJob() method for BullMQ when you add Redis.
 */
@Injectable()
export class ComputeService {
  private readonly logger = new Logger(ComputeService.name);
  private jobs = new Map<string, ComputeJob>();

  // Built-in job handlers: add your own
  private handlers = new Map<string, (payload: any) => Promise<any>>();

  constructor(private readonly eventEmitter: EventEmitter2) {
    this.registerBuiltinHandlers();
  }

  registerHandler(type: string, fn: (payload: any) => Promise<any>) {
    this.handlers.set(type, fn);
    this.logger.log(`🔧 Job handler registered: ${type}`);
  }

  async enqueue(dto: CreateJobDto): Promise<ComputeJob> {
    const job: ComputeJob = {
      id: randomUUID(),
      type: dto.type,
      payload: dto.payload,
      status: 'queued',
      agentId: dto.agentId,
      createdAt: Date.now(),
      attempts: 0,
    };
    this.jobs.set(job.id, job);
    this.eventEmitter.emit('job.queued', job);
    this.logger.log(`📎 Job enqueued: ${job.id} (${job.type})`);

    // Run async — don't await
    setImmediate(() => this.processJob(job.id));
    return job;
  }

  getJob(id: string): ComputeJob {
    const job = this.jobs.get(id);
    if (!job) throw new NotFoundException(`Job ${id} not found`);
    return job;
  }

  listJobs(agentId?: string): ComputeJob[] {
    const all = Array.from(this.jobs.values());
    return agentId ? all.filter((j) => j.agentId === agentId) : all;
  }

  private async processJob(id: string) {
    const job = this.jobs.get(id);
    if (!job) return;

    job.status = 'running';
    job.startedAt = Date.now();
    job.attempts++;
    this.eventEmitter.emit('job.running', job);

    try {
      const handler = this.handlers.get(job.type);
      if (!handler) throw new Error(`No handler for job type "${job.type}"`);
      job.result = await handler(job.payload);
      job.status = 'completed';
      job.completedAt = Date.now();
      this.logger.log(`✅ Job completed: ${job.id} in ${job.completedAt - job.startedAt!}ms`);
      this.eventEmitter.emit('job.completed', job);
    } catch (err) {
      job.status = 'failed';
      job.error = err.message;
      job.completedAt = Date.now();
      this.logger.error(`❌ Job failed: ${job.id} — ${err.message}`);
      this.eventEmitter.emit('job.failed', job);
    }
  }

  private registerBuiltinHandlers() {
    // Echo handler for testing
    this.registerHandler('echo', async (payload) => ({ echo: payload, ts: Date.now() }));

    // Delay handler for testing async behavior
    this.registerHandler('delay', async ({ ms = 1000, result = 'done' }) => {
      await new Promise((r) => setTimeout(r, ms));
      return { result, elapsed: ms };
    });
  }
}
