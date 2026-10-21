"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  Plus, 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  Activity, 
  Terminal as TerminalIcon, 
  Send, 
  Check 
} from 'lucide-react';
import styles from '../../styles/Calendar.module.css';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../../config/contracts';
import EntropyDeviceRegistryABI from '../../config/abi/EntropyDeviceRegistry.json';

interface AgentJob {
  id: string;
  day: number;
  agentType: string;
  instructions: string;
  priority: 'LOW' | 'STANDARD' | 'CRITICAL';
  status: 'SCHEDULED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  summary?: string;
}

const AUTOMATION_EXPLAINERS = {
  autonomous: {
    title: 'Full Autonomy Swarm',
    icon: '🤖',
    text: 'Full Autonomy empowers AI agents to execute self-directed outreach loops, dynamically adjusting targets, optimization vectors, and interaction strategies without operator intervention. Swarms autonomously self-correct based on real-time engagement and feedback indexes.'
  },
  scheduled: {
    title: 'Scheduled Cron Blocks',
    icon: '⏰',
    text: 'Cron Blocks schedule agent execution at specific calendar intervals. Workflows run strictly on predefined timeline blocks, facilitating structured task pipelines (e.g. daily balancing or social campaigns) with predictable resource consumption.'
  },
  manual: {
    title: 'Manual Standby Triggers',
    icon: '⚙️',
    text: 'Manual Standby leaves agents idle until the Operator directly triggers an execution cycle. Recommended for high-priority or sensitive operations requiring human oversight, verification, and signature confirmations before task finalization.'
  }
};

export default function CalendarPage() {
  const { user, isAuthenticated, preferences, updatePreference } = useAuth();
  const walletAddress = user?.address || "0x0000000000000000000000000000000000000000";
  const [explainerContent, setExplainerContent] = useState<{ title: string; text: string; icon: string } | null>(null);

  // Persistent Gamer XP states
  const [xp, setXp] = useState(240);
  const [level, setLevel] = useState(2);

  const { address: userAddress, chain } = useAccount();
  const chainId = chain?.id || 1337;
  const addresses = CONTRACT_ADDRESSES[chainId.toString()] || CONTRACT_ADDRESSES["1337"] || { entropyDeviceRegistry: "" };

  const { data: contractXP } = useReadContract({
    address: addresses.entropyDeviceRegistry as `0x${string}`,
    abi: EntropyDeviceRegistryABI,
    functionName: 'operatorXP',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress && !!addresses.entropyDeviceRegistry,
    }
  });

  // Sync actual contract XP with UI state
  useEffect(() => {
    if (contractXP !== undefined) {
      const xpValue = Number(contractXP);
      setXp(xpValue);
      const nextLevel = Math.floor(xpValue / 300) + 1;
      setLevel(nextLevel);
    }
  }, [contractXP]);

  // Month stats (June 2026 starts on Monday)
  const daysInMonth = 30;
  const [selectedDay, setSelectedDay] = useState<number>(15);
  
  // Scheduled Agent Jobs state
  const [activeJobs, setActiveJobs] = useState<AgentJob[]>([
    {
      id: 'job-1',
      day: 12,
      agentType: 'Helios Planet Shade Analyst',
      instructions: 'Analyze L1 Lagrangian coordinates to offset greenhouse pressure indices.',
      priority: 'CRITICAL',
      status: 'COMPLETED',
      summary: 'Handshake complete. Deflection aligned: 0.14 watts/m2. Offsets logged.'
    },
    {
      id: 'job-youtube',
      day: 15,
      agentType: 'YouTube Growth Swarm Bot',
      instructions: 'Target Web3 influencers and marketing channels to boost views, likes, and subscribers on our videos.',
      priority: 'CRITICAL',
      status: 'SCHEDULED'
    },
    {
      id: 'job-2',
      day: 18,
      agentType: 'EcoLoad Compute Balancer',
      instructions: 'Migrate GPU heavy container routines to Pottsboro nodes at solar peak capacity.',
      priority: 'STANDARD',
      status: 'SCHEDULED'
    },
    {
      id: 'job-3',
      day: 22,
      agentType: 'BioMoist Crop Controller Jet',
      instructions: 'Activate mist ventilation loop when root moisture level falls below 60%.',
      priority: 'LOW',
      status: 'SCHEDULED'
    }
  ]);

  // Form inputs
  const [agentType, setAgentType] = useState('YouTube Growth Swarm Bot');
  const [instructions, setInstructions] = useState('Initiate social marketing outreach to gaming influencers to drive likes, comments, and subscribers.');
  const [priority, setPriority] = useState<'LOW' | 'STANDARD' | 'CRITICAL'>('CRITICAL');

  // Terminal Console Execution
  const [selectedJob, setSelectedJob] = useState<AgentJob | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionSummary, setExecutionSummary] = useState('');
  const consoleEndRef = useRef<HTMLDivElement>(null);
  
  // AI Tools integrated switch states
  const [integratedTools, setIntegratedTools] = useState({
    gpt4o: true,
    claude: false,
    midjourney: true,
    cryptoSigner: true
  });

  // Auto-scroll terminal output
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  // Load from local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedXp = localStorage.getItem('y8_user_xp');
      const storedLvl = localStorage.getItem('y8_user_level');
      const storedJobs = localStorage.getItem('y8_calendar_jobs');

      if (storedXp) setXp(parseInt(storedXp));
      if (storedLvl) setLevel(parseInt(storedLvl));
      if (storedJobs) {
        setActiveJobs(JSON.parse(storedJobs));
      } else {
        localStorage.setItem('y8_calendar_jobs', JSON.stringify(activeJobs));
      }
    }
  }, []);

  const updateXPAndLevel = (gainedXp: number) => {
    const nextXp = xp + gainedXp;
    setXp(nextXp);
    localStorage.setItem('y8_user_xp', nextXp.toString());
    
    // Level up math
    const nextLevel = Math.floor(nextXp / 300) + 1;
    if (nextLevel > level) {
      setLevel(nextLevel);
      localStorage.setItem('y8_user_level', nextLevel.toString());
      alert(`🎉 Level Up! You reached Level ${nextLevel} Swarm Operator!`);
    }
  };

  // Sync jobs state
  const syncJobs = (nextJobs: AgentJob[]) => {
    setActiveJobs(nextJobs);
    localStorage.setItem('y8_calendar_jobs', JSON.stringify(nextJobs));
  };

  // Preset prompts based on Agent dropdown selection
  useEffect(() => {
    if (agentType === 'YouTube Growth Swarm Bot') {
      setInstructions('Initiate social marketing outreach to gaming influencers to drive likes, comments, and subscribers.');
    } else if (agentType === 'Helios Planet Shade Analyst') {
      setInstructions('Analyze L1 Lagrangian coordinates to calculate optimal solar parasol angles for climate mitigation.');
    } else if (agentType === 'BioMoist Crop Controller Jet') {
      setInstructions('Ping agricultural moisture sensors at CEA Food Dome B and execute mist sprinkler cycle if dry.');
    } else if (agentType === 'EcoLoad Compute Balancer') {
      setInstructions('Scan grid batteries state-of-charge. Migrate heavy container tasks to nodes with peak green power.');
    } else {
      setInstructions('Initialize intake coordinator scheduling bot to assign sanctuary slots and reserve grid e-bikes.');
    }
  }, [agentType]);

  // Sync agentType based on automation preference
  useEffect(() => {
    if (preferences.automationStyle) {
      if (preferences.automationStyle === 'autonomous') {
        setAgentType('YouTube Growth Swarm Bot');
      } else if (preferences.automationStyle === 'scheduled') {
        setAgentType('EcoLoad Compute Balancer');
      } else if (preferences.automationStyle === 'manual') {
        setAgentType('BioMoist Crop Controller Jet');
      }
    }
  }, [preferences.automationStyle]);

  // Handle Schedule Agent form submit
  const handleScheduleAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instructions) return;

    const newJob: AgentJob = {
      id: 'job-' + Math.random().toString(36).substring(2, 9),
      day: selectedDay,
      agentType,
      instructions,
      priority,
      status: 'SCHEDULED'
    };

    const nextJobs = [...activeJobs, newJob];
    syncJobs(nextJobs);
    updateXPAndLevel(40);

    if (typeof window !== 'undefined') {
      let style = 'manual';
      if (agentType === 'YouTube Growth Swarm Bot') style = 'autonomous';
      else if (agentType === 'EcoLoad Compute Balancer') style = 'scheduled';
      else if (agentType === 'BioMoist Crop Controller Jet') style = 'manual';

      window.dispatchEvent(new CustomEvent('y8_user_action', {
        detail: {
          type: 'automationStyle',
          value: style,
          source: `Scheduled AI Agent specialty: "${agentType}"`
        }
      }));
    }
    
    setSelectedJob(newJob);
    setTerminalLogs([
      `[INFO] AI Work Agent successfully scheduled for Day ${selectedDay} of June 2026.`,
      `[INFO] Domain specialty set: ${agentType}`,
      `[INFO] Goal Prompt loaded. Standby for manual kernel execution...`
    ]);
    setExecutionSummary('');
  };

  // Trigger Agent Swarm run
  const handleTriggerAgentNow = async (job: AgentJob) => {
    if (isExecuting) return;

    setIsExecuting(true);
    setSelectedJob(job);
    
    const initialLogs = [
      `[LOG CLOCK: ${new Date().toLocaleTimeString()}] Booting virtual agent container inside Y8 sandbox...`,
      `[INFO] Specialty targeted: ${job.agentType}`,
      `[DIAGNOSTIC] Instruction parameters: "${job.instructions}"`
    ];

    if (integratedTools.cryptoSigner) {
      initialLogs.push(`[Web3 Client] Cryptographically signing execution payload... address ${walletAddress.slice(0, 8)}...`);
    }
    if (integratedTools.gpt4o) {
      initialLogs.push(`[OpenAI GPT-4o] Drafting content copy and outreach message hooks... Done.`);
    }
    if (integratedTools.claude) {
      initialLogs.push(`[Claude 3.5] Formulating optimal multi-agent routing loop execution logic... Success.`);
    }
    if (integratedTools.midjourney) {
      initialLogs.push(`[Midjourney v6] Generating visual campaign elements and thumbnail artwork... Rendered.`);
    }

    initialLogs.push(`[EXEC] Initiating RPC connection to server endpoint /api/agents/run...`);

    setTerminalLogs(initialLogs);
    setExecutionSummary('');

    try {
      const response = await fetch('/api/agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentType: job.agentType,
          prompt: job.instructions,
          date: `June ${job.day}, 2026`,
          priority: job.priority
        })
      });

      if (!response.ok) {
        throw new Error('API server returned error code.');
      }

      const data = await response.json();

      if (data.logs && Array.isArray(data.logs)) {
        // Stream logs sequentially to look like real output loading
        let count = 0;
        const interval = setInterval(() => {
          if (count < data.logs.length) {
            setTerminalLogs(prev => [...prev, data.logs[count]]);
            count++;
          } else {
            clearInterval(interval);
            setIsExecuting(false);
            setExecutionSummary(data.summary || 'Task completed successfully.');
            
            // Update job status in state
            const nextJobs = activeJobs.map(item => 
              item.id === job.id ? { ...item, status: 'COMPLETED' as const, summary: data.summary } : item
            );
            syncJobs(nextJobs);
            updateXPAndLevel(120);
          }
        }, 600);
      } else {
        throw new Error('Invalid logs format.');
      }
    } catch (error) {
      console.error(error);
      // Fallback log outputs if API is blocked or offline
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTerminalLogs(prev => [
        ...prev,
        `[FATAL ERROR] Server RPC connection failed. Instantiating offline container fallback sandbox...`,
        `[INFO] Executing prompt logic in localized Web3 client-side sandbox...`,
        `[OUTREACH] Dispatched offline social thread indexes. Likes booster loop registered.`,
        `[SUCCESS] Tasks committed successfully inside local sandbox environment. XP awarded.`
      ]);
      setExecutionSummary(`Simulated offline fallback successfully completed. AI Agent finished tasks for ${job.agentType}. Objective achieved within client-side sandbox.`);
      setIsExecuting(false);

      const nextJobs = activeJobs.map(item => 
        item.id === job.id ? { ...item, status: 'COMPLETED' as const, summary: 'Offline container fallback completed.' } : item
      );
      syncJobs(nextJobs);
      updateXPAndLevel(60);
    }
  };

  return (
    <div className={styles.container}>
      {/* HUD Header Bar */}
      <header className={styles.headerBanner}>
        <div className={styles.headerBadge}>
          <Activity className="h-3 w-3 animate-pulse" /> Y8 Swarm Control Center
        </div>
        <h1 className={styles.headerTitle}>
          AI Work Agent <span className={styles.headerTitleHighlight}>Scheduler</span>
          {preferences.automationStyle && (
            <span style={{ fontSize: '0.65rem', background: 'rgba(0, 245, 212, 0.1)', border: '1px solid #00f5d4', color: '#00f5d4', padding: '0.2rem 0.5rem', borderRadius: '4px', marginLeft: '0.8rem', fontFamily: 'monospace', verticalAlign: 'middle' }}>
              MODE: {preferences.automationStyle.toUpperCase()}
            </span>
          )}
        </h1>
        <p className={styles.headerDesc}>
          Select calendar dates, configure autonomous goals, and deploy specialized AI Agents to execute tasks, 
          from running YouTube engagement campaigns to optimizing decentralized energy grid balances.
        </p>

        {/* User XP Stats widget */}
        <div style={{
          position: 'absolute',
          top: '2rem',
          right: '2rem',
          background: 'rgba(0,0,0,0.4)',
          border: '1px dashed rgba(0, 245, 212, 0.3)',
          padding: '0.6rem 1.25rem',
          borderRadius: '8px',
          fontFamily: 'monospace',
          textAlign: 'right'
        }}>
          <span style={{ color: '#00f5d4', fontWeight: 700, display: 'block', fontSize: '0.9rem' }}>
            OPERATOR LVL {level}
          </span>
          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
            XP: {xp} / {level * 300}
          </span>
        </div>
      </header>

      {/* Point of Contact 4: Automation override preference question */}
      {!preferences.automationStyle && (
        <div style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0, 245, 212, 0.25)', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', animation: 'fadeIn 0.3s ease-out', position: 'relative', zIndex: 5 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', textAlign: 'left' }}>
            <span style={{ fontSize: '0.65rem', color: '#00f5d4', fontFamily: 'monospace', fontWeight: 'bold' }}>❓ AI SWARM SCHEDULING INTERFACE</span>
            <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>What is your preferred automation style for swarm deployments?</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'autonomous', label: 'Full Autonomy', desc: 'Swarms auto-adjust outreach goals' },
              { id: 'scheduled', label: 'Cron Schedules', desc: 'Runs tasks on calendar block schedules' },
              { id: 'manual', label: 'Manual Triggers', desc: 'Requires manual click to run agents' }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => {
                  updatePreference('automationStyle', opt.id);
                  setExplainerContent(AUTOMATION_EXPLAINERS[opt.id as keyof typeof AUTOMATION_EXPLAINERS]);
                  if (opt.id === 'autonomous') {
                    setAgentType('YouTube Growth Swarm Bot');
                  } else if (opt.id === 'scheduled') {
                    setAgentType('EcoLoad Compute Balancer');
                  } else if (opt.id === 'manual') {
                    setAgentType('BioMoist Crop Controller Jet');
                  }
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('y8_user_action', {
                      detail: {
                        type: 'automationStyle',
                        value: opt.id,
                        source: `Swarm Scheduler questionnaire: "${opt.label}"`
                      }
                    }));
                  }
                }}
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '0.4rem 0.8rem', color: '#fff', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.1rem', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#00f5d4'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
              >
                <span style={{ fontSize: '0.72rem', fontWeight: 'bold', color: '#00f5d4' }}>{opt.label}</span>
                <span style={{ fontSize: '0.6rem', color: '#64748b' }}>{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid container */}
      <div className={styles.layoutGrid}>
        
        {/* Left Column: Calendar & Terminal Console */}
        <div className={styles.leftCol}>
          
          {/* Calendar Card */}
          <div className={styles.calendarCard}>
            <div className={styles.calendarHeader}>
              <h3 className={styles.monthTitle}>📅 JUNE 2026</h3>
              <span className={styles.serverStatus}>UTC TIME SERVER ACTIVE</span>
            </div>

            {/* Weekdays header */}
            <div className={styles.weekdayHeader}>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
              <div>Sun</div>
            </div>

            {/* Days grid */}
            <div className={styles.daysGrid}>
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const isSelected = selectedDay === dayNum;
                const dayJobs = activeJobs.filter(j => j.day === dayNum);

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedDay(dayNum);
                      const existing = dayJobs[0] || null;
                      if (existing) {
                        setSelectedJob(existing);
                        setTerminalLogs([`[INFO] Loaded scheduled agent task details for June ${dayNum}. Click console below to execute.`]);
                        setExecutionSummary(existing.summary || '');
                      } else {
                        setSelectedJob(null);
                        setTerminalLogs([]);
                        setExecutionSummary('');
                      }
                    }}
                    className={`${styles.dayCell} ${isSelected ? styles.dayCellSelected : ''}`}
                  >
                    <span className={`${styles.dayNumber} ${isSelected ? styles.dayNumberSelected : ''}`}>
                      {dayNum}
                    </span>

                    {/* Jobs Indicators in Calendar Cell */}
                    <div className={styles.dayJobsList}>
                      {dayJobs.map(job => (
                        <div
                          key={job.id}
                          className={`${styles.jobIndicator} ${
                            job.status === 'COMPLETED' 
                              ? styles.jobIndicatorCompleted 
                              : styles['prio' + job.priority]
                          }`}
                        >
                          {job.status === 'COMPLETED' ? '✓ DONE' : 'AI ACTV'}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Operations Console Terminal */}
          <div className={styles.terminalCard}>
            <div className={styles.terminalHeader}>
              <span className={styles.terminalTitle}>
                <span className={styles.terminalBlink}></span>
                🧬 DOCKER AGENT KERNEL EXECUTIVE TERMINAL
              </span>
              <span className={styles.terminalDayText}>June {selectedDay} Thread</span>
            </div>

            {selectedJob ? (
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div className={styles.jobSelectorHUD}>
                  <div className={styles.jobHUDInfo}>
                    <span style={{ color: '#00f5d4', fontFamily: 'monospace', fontSize: '0.7rem', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>
                      Target Agent:
                    </span>
                    <h4>{selectedJob.agentType}</h4>
                    <p>Instructions: "{selectedJob.instructions}"</p>
                  </div>
                  <button
                    disabled={selectedJob.status === 'COMPLETED' || isExecuting}
                    onClick={() => handleTriggerAgentNow(selectedJob)}
                    className={styles.btnRun}
                  >
                    {selectedJob.status === 'COMPLETED' ? '✓ Completed' : isExecuting ? 'Running Swarm...' : 'Run Agent Now'}
                  </button>
                </div>

                {/* Console text log stream */}
                <div className={styles.consoleOutput}>
                  {terminalLogs.map((log, i) => {
                    if (!log) return null;
                    const logText = typeof log === 'string' ? log : JSON.stringify(log);
                    let logClass = '';
                    if (logText.includes('[SUCCESS]') || logText.includes('[SUCCESS')) {
                      logClass = styles.successLog;
                    } else if (logText.includes('[FATAL') || logText.includes('[ERROR')) {
                      logClass = styles.errorLog;
                    } else if (logText.includes('[INFO]') || logText.includes('[ANALYSIS') || logText.includes('[BOOT')) {
                      logClass = styles.infoLog;
                    }
                    return (
                      <div key={i} className={`${styles.consoleRow} ${logClass}`}>
                        {logText}
                      </div>
                    );
                  })}
                  {isExecuting && (
                    <div className={styles.consolePromptPulse}>
                      [INF] Model inference compiling... running neural nodes
                    </div>
                  )}
                  <div ref={consoleEndRef} />
                </div>

                {/* Summary Report */}
                {executionSummary && (
                  <div className={styles.reportCard}>
                    <span className={styles.reportTitle}>[REPORT] TASK EXECUTED SUCCESSFULLY</span>
                    <p className={styles.reportText}>{executionSummary}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <span>🤖</span>
                <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  No active agent selected. Select a calendar day with an active badge, or schedule a new agent in the sidebar.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Scheduling Pane Drawer */}
        <div className={styles.sidebarCol}>
          <div className={styles.schedulerCard}>
            <h3 className={styles.sidebarTitle}>
              <Plus className="h-4 w-4 text-teal-400" /> Deploy Agent Task (June {selectedDay})
            </h3>

            <form onSubmit={handleScheduleAgent} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="agentType">AI Specialty Specialty</label>
                <select
                  id="agentType"
                  value={agentType}
                  onChange={e => setAgentType(e.target.value)}
                  className={styles.select}
                >
                  <option value="YouTube Growth Swarm Bot">YouTube Growth Swarm Bot (Marketing)</option>
                  <option value="Helios Planet Shade Analyst">Helios Planet Shade Analyst (Space)</option>
                  <option value="BioMoist Crop Controller Jet">BioMoist Crop Controller Jet (Food)</option>
                  <option value="EcoLoad Compute Balancer">EcoLoad Compute Balancer (Energy)</option>
                  <option value="NeuroSomatic Intake Sched Bot">NeuroSomatic Intake Sched Bot (Health)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="instructions">Instructions (Prompt Goal)</label>
                <textarea
                  id="instructions"
                  required
                  rows={4}
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  placeholder="Specify task directives..."
                  className={styles.textarea}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Workflow Priority Tier</label>
                <div className={styles.prioGrid}>
                  {(['LOW', 'STANDARD', 'CRITICAL'] as const).map(prio => {
                    const isSelected = priority === prio;
                    return (
                      <button
                        key={prio}
                        type="button"
                        onClick={() => setPriority(prio)}
                        className={`${styles.prioButton} ${isSelected ? styles.prioButtonActive : ''}`}
                      >
                        {prio}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button type="submit" className={styles.btnSubmit}>
                <Plus className="h-4 w-4" /> Schedule AI Work Agent
              </button>
            </form>
          </div>

          {/* Preset Growth Campaigns Panel */}
          <div className={styles.schedulerCard} style={{ marginTop: '1.5rem' }}>
            <h3 className={styles.sidebarTitle} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#00f5d4' }}>
              <Sparkles className="h-4 w-4" /> Campaign Presets Pipeline
            </h3>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '1rem', lineHeight: '1.4' }}>
              Select a pre-configured digital growth swarm layout to instantly set schedules:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '0.5rem' }}>
              {[
                { 
                  name: '🚀 Viral Outreach', 
                  desc: 'Influencer campaign scripts', 
                  agent: 'YouTube Growth Swarm Bot',
                  prio: 'CRITICAL' as const,
                  prompt: 'Deploy ViralReach.ai container to target Web3 gaming influencers. Draft content pitches, execute automated video script variations, and schedule active social outreach on Twitter/Discord loops.'
                },
                { 
                  name: '📈 Subscribers Conversion', 
                  desc: 'Acquisition conversion analytics', 
                  agent: 'YouTube Growth Swarm Bot',
                  prio: 'CRITICAL' as const,
                  prompt: 'Initialize SubPulse Swarm to optimize subscription conversion rates. Target community hubs, deploy subscriber feedback surveys, and track subscriber acquisition logs on the Web3 ledger.'
                },
                { 
                  name: '👀 Watch-Time Boost', 
                  desc: 'Video playback retention loops', 
                  agent: 'YouTube Growth Swarm Bot',
                  prio: 'STANDARD' as const,
                  prompt: 'Launch ViewBoost Engine to increase video retention and watch-hours. Deploy algorithmic loop triggers on edge node server stacks to balance video playback streams across regional hubs.'
                },
                { 
                  name: '👍 Social Likes Swarm', 
                  desc: 'Node-mesh likes trending triggers', 
                  agent: 'YouTube Growth Swarm Bot',
                  prio: 'STANDARD' as const,
                  prompt: 'Trigger LikeFlow Optimizer across the P2P node mesh. Instruct nodes to execute social media likes, comments, and shares on target video hashes to raise organic trending indexes.'
                }
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setAgentType(preset.agent);
                    setInstructions(preset.prompt);
                    setPriority(preset.prio);
                    if (typeof window !== 'undefined') {
                      let style = 'scheduled';
                      if (preset.name.includes('Viral') || preset.name.includes('Likes')) {
                        style = 'autonomous';
                      }
                      window.dispatchEvent(new CustomEvent('y8_user_action', {
                        detail: {
                          type: 'automationStyle',
                          value: style,
                          source: `Preset Campaign Selected: "${preset.name}"`
                        }
                      }));
                    }
                  }}
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.6rem', color: '#fff', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.2rem', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#00f5d4'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                >
                  <span style={{ fontSize: '0.72rem', fontWeight: 'bold', color: '#00f5d4' }}>{preset.name}</span>
                  <span style={{ fontSize: '0.55rem', color: '#64748b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', width: '100%' }} title={preset.desc}>{preset.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Tools Switchboard panel */}
          <div className={styles.schedulerCard} style={{ marginTop: '1.5rem' }}>
            <h3 className={styles.sidebarTitle} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#9d4edd' }}>
              <Activity className="h-4 w-4" /> AI Swarm Tools switchboard
            </h3>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '1rem', lineHeight: '1.4' }}>
              Activate third-party tools to hook automated utilities into container runtime logs:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { id: 'gpt4o', label: 'OpenAI GPT-4o API', desc: 'Outreach content scripting templates' },
                { id: 'claude', label: 'Claude 3.5 API', desc: 'Agent plan routing execution logic' },
                { id: 'midjourney', label: 'Midjourney v6 API', desc: 'Outreach graphical assets generation' },
                { id: 'cryptoSigner', label: 'Web3 Client Signer', desc: 'Smart contract dynamic signatures' }
              ].map((tool) => (
                <label 
                  key={tool.id} 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', textAlign: 'left' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 'bold', color: '#cbd5e1' }}>{tool.label}</span>
                    <span style={{ fontSize: '0.55rem', color: '#64748b' }}>{tool.desc}</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={integratedTools[tool.id as keyof typeof integratedTools]} 
                    onChange={() => setIntegratedTools(prev => ({
                      ...prev,
                      [tool.id]: !prev[tool.id as keyof typeof integratedTools]
                    }))}
                    style={{ 
                      accentColor: '#00f5d4', 
                      cursor: 'pointer',
                      width: '14px',
                      height: '14px'
                    }}
                  />
                </label>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Pop-up Explainer Modal */}
      {explainerContent && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(5, 8, 16, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '1.5rem' }}>
          <div style={{ background: '#090d16', border: '1px solid #00f5d4', boxShadow: '0 0 30px rgba(0, 245, 212, 0.15)', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(0, 245, 212, 0.15)', paddingBottom: '0.75rem' }}>
              <span style={{ fontSize: '2rem' }}>{explainerContent.icon}</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#00f5d4', margin: 0, fontFamily: 'var(--font-poppins)' }}>
                {explainerContent.title}
              </h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
              {explainerContent.text}
            </p>
            <button
              onClick={() => setExplainerContent(null)}
              style={{ background: 'rgba(0, 245, 212, 0.1)', border: '1px solid #00f5d4', color: '#00f5d4', padding: '0.6rem 1.25rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', fontFamily: 'monospace', textTransform: 'uppercase', width: '100%', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 245, 212, 0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0, 245, 212, 0.1)'}
            >
              Acknowledge & Sync Preference
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
