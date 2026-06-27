export type JobStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface ComputeJob {
  id: string;
  type: string;
  payload: Record<string, any>;
  status: JobStatus;
  result?: any;
  error?: string;
  agentId?: string;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  attempts: number;
}

export interface CreateJobDto {
  type: string;
  payload: Record<string, any>;
  agentId?: string;
  priority?: number;
}
