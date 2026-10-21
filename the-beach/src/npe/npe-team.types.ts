/**
 * NPE Team Structure for Lit Compute Network
 * 
 * This file defines the TypeScript types and interfaces for the NPE development team
 * that will build the Lit Compute Network distributed processing system.
 * 
 * Based on: LIT_COMPUTE_NPE_TEAM.md
 */

// ============================================================================
// Core NPE Types
// ============================================================================

export interface NPEAgent {
  id: string;
  name: string;
  type: NPEType;
  role: NPERole;
  specialization: string;
  capabilities: string[];
  status: NPEStatus;
  createdAt: Date;
  lastActive: Date;
}

export enum NPEType {
  TEAM_LEAD = 'team_lead',
  ENGINEER = 'engineer',
  GAME_MANAGER = 'game_manager',
  REVIEWER = 'reviewer',
}

export enum NPERole {
  LEAD_ARCHITECT = 'lead_architect',
  NODE_SOFTWARE = 'node_software',
  SMART_CONTRACTS = 'smart_contracts',
  DESKTOP_APP = 'desktop_app',
  API_INTEGRATION = 'api_integration',
  SECURITY_AUDIT = 'security_audit',
  PROJECT_MANAGER = 'project_manager',
}

export enum NPEStatus {
  ACTIVE = 'active',
  IDLE = 'idle',
  WORKING = 'working',
  BLOCKED = 'blocked',
  OFFLINE = 'offline',
}

// ============================================================================
// Team Structure
// ============================================================================

export interface NPETeam {
  id: string;
  name: string;
  project: string;
  branch: string;
  lead: NPEAgent;
  engineers: NPEAgent[];
  gameManager: NPEAgent;
  createdAt: Date;
  phase: ProjectPhase;
  status: TeamStatus;
}

export enum ProjectPhase {
  PLANNING = 'planning',
  PHASE_1_MVP = 'phase_1_mvp',          // Months 1-3
  PHASE_2_DESKTOP = 'phase_2_desktop',   // Months 4-6
  PHASE_3_PRODUCTION = 'phase_3_production', // Months 7-9
  PHASE_4_SCALE = 'phase_4_scale',       // Months 10-12
  MAINTENANCE = 'maintenance',
}

export enum TeamStatus {
  FORMING = 'forming',
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  ON_TRACK = 'on_track',
  AT_RISK = 'at_risk',
  COMPLETE = 'complete',
}

// ============================================================================
// Goal & Milestone Tracking
// ============================================================================

export interface Goal {
  id: string;
  phase: ProjectPhase;
  number: number;
  title: string;
  description: string;
  owner: string; // NPE ID
  targetDate: Date;
  status: GoalStatus;
  tasks: Task[];
  validationCriteria: ValidationCriteria[];
  blockers: Blocker[];
}

export enum GoalStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  AT_RISK = 'at_risk',
  BLOCKED = 'blocked',
  COMPLETE = 'complete',
  VALIDATED = 'validated',
}

export interface Task {
  id: string;
  goalId: string;
  title: string;
  description: string;
  assignee: string; // NPE ID
  status: TaskStatus;
  priority: Priority;
  estimatedHours: number;
  actualHours: number;
  createdAt: Date;
  completedAt?: Date;
  gitBranch?: string;
  pullRequest?: string;
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  BLOCKED = 'blocked',
  COMPLETE = 'complete',
}

export enum Priority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export interface ValidationCriteria {
  id: string;
  description: string;
  metric: string;
  target: number | string;
  actual?: number | string;
  validated: boolean;
  validatedAt?: Date;
  validatedBy?: string; // GameManager ID
}

export interface Blocker {
  id: string;
  goalId?: string;
  taskId?: string;
  description: string;
  severity: BlockerSeverity;
  reportedBy: string; // NPE ID
  reportedAt: Date;
  resolvedAt?: Date;
  resolution?: string;
  escalatedTo?: EscalationLevel;
}

export enum BlockerSeverity {
  MINOR = 'minor',       // Can work around it
  MODERATE = 'moderate', // Slowing progress
  MAJOR = 'major',       // Blocking multiple tasks
  CRITICAL = 'critical', // Project at risk
}

export enum EscalationLevel {
  TEAM_LEAD = 'team_lead',
  GAME_MANAGER = 'game_manager',
  STAKEHOLDERS = 'stakeholders',
  EMERGENCY = 'emergency',
}

// ============================================================================
// Metrics & Reporting
// ============================================================================

export interface DailyReport {
  date: Date;
  team: string;
  activeNodes: number;
  jobsProcessed: number;
  successRate: number;
  avgJobTime: number;
  blockers: Blocker[];
  velocity: number;
  testCoverage: number;
  prsMerged: number;
  bugsFixed: number;
}

export interface WeeklyReport {
  week: number;
  year: number;
  team: string;
  goalsCompleted: number;
  goalsPending: number;
  goalsAtRisk: number;
  velocity: Velocity;
  metrics: WeeklyMetrics;
  achievements: Achievement[];
  challenges: Challenge[];
  nextWeekPriorities: string[];
}

export interface MonthlyReport {
  month: number;
  year: number;
  team: string;
  phase: ProjectPhase;
  goalsStatus: GoalsSummary;
  keyMetrics: KeyMetrics;
  achievements: Achievement[];
  challenges: Challenge[];
  nextMonthFocus: string[];
  budget: BudgetUpdate;
}

export interface Velocity {
  storyPointsCompleted: number;
  storyPointsPlanned: number;
  percentComplete: number;
  trend: 'accelerating' | 'stable' | 'decelerating';
  projectedCompletion: Date;
}

export interface WeeklyMetrics {
  activeNodes: MetricTrend;
  jobsPerDay: MetricTrend;
  successRate: MetricTrend;
  avgJobTime: MetricTrend;
  testCoverage: MetricTrend;
  uptime: MetricTrend;
}

export interface MetricTrend {
  current: number;
  target: number;
  trend: '↗️' | '↘️' | '→';
  percentOfTarget: number;
}

export interface KeyMetrics {
  [key: string]: {
    target: number | string;
    actual: number | string;
    trend: '↗️' | '↘️' | '→';
  };
}

export interface GoalsSummary {
  phase1Complete: number;
  phase1Total: number;
  phase2Complete: number;
  phase2Total: number;
  phase3Complete: number;
  phase3Total: number;
  overall: number;
}

export interface Achievement {
  date: Date;
  title: string;
  description: string;
  impact: string;
  celebratedBy: string[];
}

export interface Challenge {
  title: string;
  description: string;
  severity: BlockerSeverity;
  mitigationPlan: string;
  owner: string;
}

export interface BudgetUpdate {
  allocated: number;
  spent: number;
  remaining: number;
  burnRate: number; // per month
  runway: number; // months
  projectedTotal: number;
}

// ============================================================================
// Good Faith Metrics
// ============================================================================

export interface GoodFaithMetrics {
  commitmentScore: number;      // % of deadlines met (target: >90%)
  disciplineScore: number;      // Code quality metrics (target: >90%)
  integrityScore: number;       // Honest reporting rate (target: >90%)
  directSourcingScore: number;  // Documentation quality (target: >90%)
  investmentImpact: number;     // $ reinvested in community
  overallScore: number;         // Average of all scores
  alignment: 'excellent' | 'good' | 'needs_improvement' | 'critical';
}

// ============================================================================
// Test Metrics
// ============================================================================

export interface TestMetrics {
  unitCoverage: number;          // Target: 80%+
  integrationCoverage: number;   // Target: 60%+
  e2eCoverage: number;           // Target: 100% critical paths
  passRate: number;              // Target: 100%
  avgTestDuration: number;       // Target: <5 min (in seconds)
  testsWritten: number;
  testsFailed: number;
  testsPassing: number;
}

// ============================================================================
// Code Review
// ============================================================================

export interface CodeReview {
  id: string;
  pullRequest: string;
  author: string; // NPE ID
  reviewer: string; // Usually NPE_LitCompute_Lead
  status: CodeReviewStatus;
  submittedAt: Date;
  reviewedAt?: Date;
  comments: ReviewComment[];
  decision: ReviewDecision;
  checksPass: boolean;
  securityIssues: number;
  performanceIssues: number;
  qualityScore: number; // 0-100
}

export enum CodeReviewStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  CHANGES_REQUESTED = 'changes_requested',
  APPROVED = 'approved',
  MERGED = 'merged',
}

export enum ReviewDecision {
  APPROVE = 'approve',
  REQUEST_CHANGES = 'request_changes',
  COMMENT = 'comment',
}

export interface ReviewComment {
  id: string;
  reviewer: string;
  line?: number;
  file?: string;
  type: CommentType;
  severity: CommentSeverity;
  message: string;
  suggestion?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

export enum CommentType {
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  STYLE = 'style',
  BUG = 'bug',
  QUESTION = 'question',
  SUGGESTION = 'suggestion',
}

export enum CommentSeverity {
  BLOCKER = 'blocker',     // Must fix before merge
  CRITICAL = 'critical',   // Should fix before merge
  MAJOR = 'major',         // Should fix soon
  MINOR = 'minor',         // Nice to have
  NITPICK = 'nitpick',     // Optional
}

// ============================================================================
// Communication
// ============================================================================

export interface TeamCommunication {
  id: string;
  type: CommunicationType;
  from: string; // NPE ID
  to: string[]; // NPE IDs or 'all'
  channel: CommunicationChannel;
  subject: string;
  message: string;
  attachments?: Attachment[];
  timestamp: Date;
  read: boolean;
  actionRequired: boolean;
}

export enum CommunicationType {
  STANDUP = 'standup',
  BLOCKER_ALERT = 'blocker_alert',
  PR_REVIEW = 'pr_review',
  MILESTONE_COMPLETE = 'milestone_complete',
  WEEKLY_SYNC = 'weekly_sync',
  EMERGENCY = 'emergency',
  ANNOUNCEMENT = 'announcement',
  QUESTION = 'question',
}

export enum CommunicationChannel {
  SLACK = 'slack',
  EMAIL = 'email',
  GITHUB = 'github',
  DASHBOARD = 'dashboard',
  VIDEO_CALL = 'video_call',
}

export interface Attachment {
  name: string;
  type: string;
  url: string;
  size: number;
}

// ============================================================================
// NPE Capabilities & Actions
// ============================================================================

export interface NPEAction {
  id: string;
  npeId: string;
  type: ActionType;
  description: string;
  startedAt: Date;
  completedAt?: Date;
  status: ActionStatus;
  result?: ActionResult;
}

export enum ActionType {
  CODE_REVIEW = 'code_review',
  WRITE_CODE = 'write_code',
  WRITE_TESTS = 'write_tests',
  DEBUG_ISSUE = 'debug_issue',
  UPDATE_DOCS = 'update_docs',
  DEPLOY = 'deploy',
  SECURITY_AUDIT = 'security_audit',
  PERFORMANCE_TEST = 'performance_test',
  TEAM_SYNC = 'team_sync',
  REPORT_BLOCKER = 'report_blocker',
}

export enum ActionStatus {
  STARTED = 'started',
  IN_PROGRESS = 'in_progress',
  COMPLETE = 'complete',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface ActionResult {
  success: boolean;
  output?: any;
  error?: string;
  metrics?: {
    duration: number;
    linesOfCode?: number;
    testsWritten?: number;
    bugsFixed?: number;
  };
}

// ============================================================================
// Dashboard Data
// ============================================================================

export interface DashboardData {
  team: NPETeam;
  currentSprint: Sprint;
  goals: Goal[];
  metrics: DashboardMetrics;
  recentActivity: NPEAction[];
  alerts: Alert[];
  goodFaith: GoodFaithMetrics;
  timestamp: Date;
}

export interface Sprint {
  number: number;
  startDate: Date;
  endDate: Date;
  goals: string[]; // Goal IDs
  storyPoints: number;
  completed: number;
  burndown: number[]; // Daily story points remaining
}

export interface DashboardMetrics {
  activeNodes: number;
  jobsPerDay: number;
  successRate: number;
  avgJobTime: number;
  testCoverage: number;
  deploymentFrequency: number; // per week
  incidentCount: number;
  velocity: number; // story points per sprint
  uptime: number;
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  source: string; // NPE ID or system
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
}

export enum AlertType {
  GOAL_AT_RISK = 'goal_at_risk',
  BLOCKER_CRITICAL = 'blocker_critical',
  TEST_FAILURE = 'test_failure',
  SECURITY_ISSUE = 'security_issue',
  PERFORMANCE_DEGRADATION = 'performance_degradation',
  DEPLOYMENT_FAILED = 'deployment_failed',
  BUDGET_WARNING = 'budget_warning',
  DEADLINE_APPROACHING = 'deadline_approaching',
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}
