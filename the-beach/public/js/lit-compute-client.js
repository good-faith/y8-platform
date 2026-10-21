/**
 * Lit Compute Network - Frontend Client
 * Connects to The Beach backend for real-time encryption job management
 */

class LitComputeClient {
    constructor() {
        this.socket = null;
        this.currentJobId = null;
        this.stats = {
            pendingJobs: 0,
            completedJobs: 0,
            activeNodes: 0,
            totalJobsProcessed: 0
        };
        this.recentJobs = [];
        
        this.init();
    }
    
    init() {
        console.log('Initializing Lit Compute Client...');
        
        // Connect to Socket.IO
        this.connectWebSocket();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Fetch initial stats
        this.fetchSystemStats();
        
        // Fetch recent jobs
        this.fetchPendingJobs();
    }
    
    connectWebSocket() {
        // Connect to the lit-compute namespace
        const backendUrl = window.location.origin;
        this.socket = io(`${backendUrl}/lit-compute`, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });
        
        // Connection events
        this.socket.on('connect', () => {
            console.log('Connected to Lit Compute WebSocket');
            this.updateConnectionStatus(true);
        });
        
        this.socket.on('disconnect', () => {
            console.log('Disconnected from Lit Compute WebSocket');
            this.updateConnectionStatus(false);
        });
        
        this.socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            this.updateConnectionStatus(false);
        });
        
        // Job update events
        this.socket.on('job:update', (data) => {
            console.log('Job update received:', data);
            this.handleJobUpdate(data);
        });
        
        // System stats events
        this.socket.on('system:stats', (data) => {
            console.log('System stats received:', data);
            this.updateStats(data);
        });
        
        // System events
        this.socket.on('system:event', (data) => {
            console.log('System event received:', data);
        });
    }
    
    setupEventListeners() {
        // File input
        const fileInput = document.getElementById('fileInput');
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const sizeKB = (file.size / 1024).toFixed(2);
                document.getElementById('fileInfo').textContent = 
                    `Selected: ${file.name} (${sizeKB} KB)`;
            } else {
                document.getElementById('fileInfo').textContent = 'No file selected';
            }
        });
        
        // Job form submission
        const jobForm = document.getElementById('jobForm');
        jobForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitJob();
        });
    }
    
    async submitJob() {
        const fileInput = document.getElementById('fileInput');
        const ipfsCID = document.getElementById('ipfsCID').value.trim();
        const feeAmount = document.getElementById('feeAmount').value;
        const submitBtn = document.getElementById('submitBtn');
        
        // Validation
        if (!fileInput.files[0] && !ipfsCID) {
            this.showToast('Please upload a file or enter an IPFS CID', 'error');
            return;
        }
        
        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
            
            let cid = ipfsCID;
            
            // If file is provided, upload to IPFS (mocked for now)
            if (fileInput.files[0]) {
                const file = fileInput.files[0];
                cid = await this.uploadToIPFS(file);
                document.getElementById('ipfsCID').value = cid;
            }
            
            // Submit job to backend
            const response = await fetch('/lit-compute/jobs/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputCID: cid,
                    accessControl: {
                        // Mock PKP - in production, this would come from authentication
                        publicKey: 'mock-pkp-public-key',
                        conditions: []
                    },
                    feeAmount: feeAmount,
                    submitter: 'mock-eth-address-0x1234...'
                })
            });
            
            if (!response.ok) {
                throw new Error(`Failed to submit job: ${response.statusText}`);
            }
            
            const job = await response.json();
            this.currentJobId = job.id;
            
            // Subscribe to job updates via WebSocket
            this.socket.emit('subscribe:job', { jobId: job.id });
            
            // Show job status panel
            this.showJobStatus(job);
            
            // Add to recent jobs
            this.addRecentJob(job);
            
            // Show success toast
            this.showToast(`Job submitted successfully! ID: ${job.id.substring(0, 8)}...`, 'success');
            
            // Reset form
            fileInput.value = '';
            document.getElementById('fileInfo').textContent = 'No file selected';
            
            // Refresh stats
            this.fetchSystemStats();
            
        } catch (error) {
            console.error('Error submitting job:', error);
            this.showToast('Failed to submit job: ' + error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Job';
        }
    }
    
    async uploadToIPFS(file) {
        // Mock IPFS upload - in production, this would use Pinata or Web3.Storage
        console.log('Uploading to IPFS (mocked):', file.name);
        
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate mock CID
        const mockCID = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
        
        this.showToast(`File uploaded to IPFS: ${mockCID}`, 'success');
        
        return mockCID;
    }
    
    async fetchSystemStats() {
        try {
            const response = await fetch('/lit-compute/jobs/stats');
            if (!response.ok) {
                throw new Error('Failed to fetch stats');
            }
            
            const stats = await response.json();
            this.updateStats(stats);
            
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }
    
    async fetchPendingJobs() {
        try {
            const response = await fetch('/lit-compute/jobs/pending/list');
            if (!response.ok) {
                throw new Error('Failed to fetch pending jobs');
            }
            
            const data = await response.json();
            this.recentJobs = data.jobs || [];
            this.updateJobsList();
            
        } catch (error) {
            console.error('Error fetching pending jobs:', error);
        }
    }
    
    updateStats(stats) {
        this.stats = {
            pendingJobs: stats.pendingJobs || 0,
            completedJobs: stats.completedJobs || 0,
            activeNodes: stats.activeNodes || 0,
            totalJobsProcessed: stats.totalJobsProcessed || this.stats.totalJobsProcessed || 0
        };
        
        // Update UI
        document.getElementById('pendingJobs').textContent = this.stats.pendingJobs;
        document.getElementById('completedJobs').textContent = this.stats.completedJobs;
        document.getElementById('activeNodes').textContent = this.stats.activeNodes;
        document.getElementById('totalJobs').textContent = this.stats.totalJobsProcessed;
    }
    
    handleJobUpdate(data) {
        console.log('Processing job update:', data);
        
        // Update current job status if it matches
        if (this.currentJobId && data.jobId === this.currentJobId) {
            this.updateCurrentJobStatus(data);
        }
        
        // Update job in recent jobs list
        const jobIndex = this.recentJobs.findIndex(j => j.id === data.jobId);
        if (jobIndex !== -1) {
            this.recentJobs[jobIndex] = { ...this.recentJobs[jobIndex], ...data };
            this.updateJobsList();
        }
        
        // Show toast notification
        const statusEmoji = {
            pending: '⏳',
            active: '⚡',
            completed: '✅',
            failed: '❌'
        };
        
        this.showToast(
            `${statusEmoji[data.status]} Job ${data.jobId.substring(0, 8)}... is now ${data.status}`,
            data.status === 'completed' ? 'success' : 'info'
        );
    }
    
    showJobStatus(job) {
        const statusPanel = document.getElementById('jobStatus');
        statusPanel.classList.add('active');
        
        document.getElementById('currentJobId').textContent = job.id;
        this.updateCurrentJobStatus(job);
    }
    
    updateCurrentJobStatus(data) {
        const statusBadge = document.getElementById('currentJobStatus');
        statusBadge.textContent = data.status.toUpperCase();
        statusBadge.className = `status-badge status-${data.status}`;
        
        // Show/hide node info
        if (data.nodeId) {
            document.getElementById('nodeInfo').style.display = 'block';
            document.getElementById('currentNodeId').textContent = data.nodeId;
        }
        
        // Show/hide output CID
        if (data.outputCID) {
            document.getElementById('outputInfo').style.display = 'block';
            document.getElementById('currentOutputCID').textContent = data.outputCID;
        }
    }
    
    addRecentJob(job) {
        this.recentJobs.unshift(job);
        if (this.recentJobs.length > 10) {
            this.recentJobs.pop();
        }
        this.updateJobsList();
    }
    
    updateJobsList() {
        const jobsList = document.getElementById('jobsList');
        
        if (this.recentJobs.length === 0) {
            jobsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <p>No jobs submitted yet</p>
                </div>
            `;
            return;
        }
        
        jobsList.innerHTML = this.recentJobs.map(job => `
            <div class="job-item">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span class="job-id">${job.id}</span>
                    <span class="status-badge status-${job.status}">${job.status}</span>
                </div>
                <div style="font-size: 12px; color: #666;">
                    <div>Fee: ${job.feeAmount} ETH</div>
                    <div>Submitted: ${new Date(job.submittedAt).toLocaleString()}</div>
                    ${job.nodeId ? `<div>Node: ${job.nodeId}</div>` : ''}
                </div>
            </div>
        `).join('');
    }
    
    updateConnectionStatus(connected) {
        const statusEl = document.getElementById('connectionStatus');
        if (connected) {
            statusEl.textContent = '🟢 Connected';
            statusEl.className = 'connection-status connected';
        } else {
            statusEl.textContent = '🔴 Disconnected';
            statusEl.className = 'connection-status disconnected';
        }
    }
    
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.litComputeClient = new LitComputeClient();
    });
} else {
    window.litComputeClient = new LitComputeClient();
}
