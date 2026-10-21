import { Vector3 } from '@babylonjs/core';

/**
 * VR Agent: Interactive Scene Guide
 * 
 * An AI-powered holographic guide that explains the VR scene,
 * responds to user interactions, and provides contextual information.
 */
export class VRSceneAgent {
  private currentNarrationIndex = 0;
  private isNarrating = false;
  private onSpeechCallback?: (text: string) => void;

  private narrations = [
    {
      timestamp: 0,
      text: "Welcome to the Lit Compute Network visualization! I'm your VR Guide.",
      focus: 'agent',
      duration: 5000,
    },
    {
      timestamp: 5000,
      text: "You're looking at a real-time 3D representation of the decentralized compute network.",
      focus: 'overview',
      duration: 5000,
    },
    {
      timestamp: 10000,
      text: "Each glowing sphere represents an active compute node. There are currently 8 nodes online.",
      focus: 'nodes',
      duration: 6000,
    },
    {
      timestamp: 16000,
      text: "These nodes process PKP authentication requests, execute Lit Actions, and handle distributed jobs.",
      focus: 'nodes',
      duration: 6000,
    },
    {
      timestamp: 22000,
      text: "Notice the particle streams? That's encrypted data flowing between nodes in real-time!",
      focus: 'particles',
      duration: 6000,
    },
    {
      timestamp: 28000,
      text: "The central orange sphere is the network coordinator. It handles job distribution and load balancing.",
      focus: 'hub',
      duration: 6000,
    },
    {
      timestamp: 34000,
      text: "The orbital rings around each node represent active connections and processing capacity.",
      focus: 'rings',
      duration: 5000,
    },
    {
      timestamp: 39000,
      text: "This entire system powers the Y8 App dashboard you built earlier - providing real-time WebSocket updates!",
      focus: 'overview',
      duration: 7000,
    },
    {
      timestamp: 46000,
      text: "Click on any node to see detailed statistics. Try hovering over them to see them pulse!",
      focus: 'interaction',
      duration: 5000,
    },
    {
      timestamp: 51000,
      text: "The stats panel on your right shows live network metrics: jobs processed, success rates, and earnings.",
      focus: 'stats',
      duration: 6000,
    },
    {
      timestamp: 57000,
      text: "This is The Beach - the NestJS backend with Socket.IO WebSockets connecting everything together.",
      focus: 'hub',
      duration: 6000,
    },
    {
      timestamp: 63000,
      text: "Feel free to explore! Use your mouse to orbit, zoom, and discover more about the network. Enjoy! 🚀",
      focus: 'overview',
      duration: 7000,
    },
  ];

  private nodeExplanations = [
    "This node specializes in PKP wallet authentication and signature generation.",
    "This node handles Lit Actions execution for smart contract automation.",
    "This node processes encryption and decryption requests for secure data storage.",
    "This node manages access control conditions and permission verification.",
    "This node coordinates distributed job scheduling across the network.",
    "This node monitors network health and performance metrics in real-time.",
    "This node handles payment processing and earnings distribution.",
    "This node provides redundancy and failover capabilities for high availability.",
  ];

  private sceneFeatures = {
    nodes: {
      name: "Compute Nodes",
      description: "Decentralized processing units that handle authentication, encryption, and job execution.",
      tech: "Lit Protocol PKP infrastructure with distributed consensus",
      count: 8,
    },
    hub: {
      name: "Central Coordinator",
      description: "The heart of the network that orchestrates job distribution and load balancing.",
      tech: "NestJS with Socket.IO WebSockets for real-time coordination",
      role: "Job queue management, health monitoring, payment processing",
    },
    particles: {
      name: "Data Flows",
      description: "Visual representation of encrypted data packets moving through the network.",
      tech: "Babylon.js particle systems simulating real network traffic patterns",
      throughput: "~500 jobs/second across all nodes",
    },
    stats: {
      name: "Network Statistics",
      description: "Live metrics showing network performance and health.",
      metrics: ["Active Nodes", "Jobs Processed", "Success Rate", "Response Time", "Total Earnings"],
    },
  };

  constructor() {
    console.log('🤖 VR Scene Agent initialized');
  }

  /**
   * Start automatic narration
   */
  public startNarration(callback?: (text: string) => void) {
    this.onSpeechCallback = callback;
    this.isNarrating = true;
    this.currentNarrationIndex = 0;

    console.log('🎙️ VR Agent: Starting guided tour...');
    this.playNarration();
  }

  /**
   * Stop narration
   */
  public stopNarration() {
    this.isNarrating = false;
    console.log('🛑 VR Agent: Tour paused');
  }

  /**
   * Play current narration
   */
  private playNarration() {
    if (!this.isNarrating || this.currentNarrationIndex >= this.narrations.length) {
      console.log('✅ VR Agent: Tour complete!');
      return;
    }

    const narration = this.narrations[this.currentNarrationIndex];
    this.speak(narration.text, narration.focus);

    setTimeout(() => {
      this.currentNarrationIndex++;
      this.playNarration();
    }, narration.duration);
  }

  /**
   * Agent speaks (updates speech bubble and logs to console)
   */
  public speak(text: string, focus?: string) {
    console.log(`🤖 VR Agent: "${text}"${focus ? ` [Focus: ${focus}]` : ''}`);
    
    if (this.onSpeechCallback) {
      this.onSpeechCallback(text);
    }

    // In a real implementation, this would:
    // 1. Update the speech bubble UI
    // 2. Trigger text-to-speech
    // 3. Animate the agent
    // 4. Focus the camera on the relevant scene element
  }

  /**
   * Get explanation for a specific node
   */
  public explainNode(nodeId: number): string {
    if (nodeId < 0 || nodeId >= this.nodeExplanations.length) {
      return "This is a compute node in the Lit Network.";
    }

    const baseExplanation = this.nodeExplanations[nodeId];
    const stats = this.generateNodeStats(nodeId);

    return `🔵 Node ${nodeId + 1}\n\n${baseExplanation}\n\n${stats}`;
  }

  /**
   * Generate random but realistic stats for a node
   */
  private generateNodeStats(nodeId: number): string {
    const jobsProcessed = Math.floor(Math.random() * 500 + 100);
    const successRate = (Math.random() * 5 + 95).toFixed(1);
    const uptime = (Math.random() * 10 + 90).toFixed(1);
    const responseTime = (Math.random() * 2 + 1).toFixed(2);
    const earnings = (Math.random() * 5 + 1).toFixed(3);

    return (
      `📊 Current Statistics:\n` +
      `• Jobs Processed: ${jobsProcessed}\n` +
      `• Success Rate: ${successRate}%\n` +
      `• Uptime: ${uptime}%\n` +
      `• Avg Response: ${responseTime}s\n` +
      `• Earnings: ${earnings} ETH`
    );
  }

  /**
   * Explain a scene feature
   */
  public explainFeature(featureName: keyof typeof this.sceneFeatures): string {
    const feature = this.sceneFeatures[featureName];
    
    if (!feature) {
      return "Unknown feature. Try asking about: nodes, hub, particles, or stats.";
    }

    let explanation = `🌟 ${feature.name}\n\n${feature.description}\n\n`;

    if ('tech' in feature) {
      explanation += `🔧 Technology: ${feature.tech}\n`;
    }

    if ('count' in feature) {
      explanation += `📊 Count: ${feature.count}\n`;
    }

    if ('role' in feature) {
      explanation += `🎯 Role: ${feature.role}\n`;
    }

    if ('throughput' in feature) {
      explanation += `⚡ Throughput: ${feature.throughput}\n`;
    }

    if ('metrics' in feature) {
      explanation += `📈 Metrics Tracked: ${feature.metrics.join(', ')}\n`;
    }

    return explanation;
  }

  /**
   * Answer contextual questions
   */
  public answerQuestion(question: string): string {
    const q = question.toLowerCase();

    if (q.includes('node') && q.includes('how many')) {
      return "There are currently 8 active compute nodes in the network. Each node handles different aspects of the Lit Protocol infrastructure.";
    }

    if (q.includes('particle') || q.includes('flow')) {
      return this.explainFeature('particles');
    }

    if (q.includes('hub') || q.includes('center') || q.includes('orange')) {
      return this.explainFeature('hub');
    }

    if (q.includes('stat') || q.includes('metric')) {
      return this.explainFeature('stats');
    }

    if (q.includes('what') && q.includes('this')) {
      return (
        "This is a 3D visualization of the Lit Compute Network - the backend infrastructure " +
        "that powers the Y8 App you've been building. It shows real-time network topology, " +
        "data flows, and node activities in an immersive VR environment."
      );
    }

    if (q.includes('how') && q.includes('work')) {
      return (
        "The network works through distributed consensus:\n\n" +
        "1. Jobs arrive at the central hub\n" +
        "2. The coordinator distributes them to available nodes\n" +
        "3. Nodes process jobs (auth, encryption, Lit Actions)\n" +
        "4. Results flow back through the network\n" +
        "5. Payments are processed automatically\n\n" +
        "All connected via WebSockets for real-time updates!"
      );
    }

    if (q.includes('y8') || q.includes('app')) {
      return (
        "Y8 App is the frontend you built earlier! It connects to this backend " +
        "(The Beach) to provide the dashboard, node management, and job tracking " +
        "interfaces. The real-time updates you see in the UI come from this network."
      );
    }

    if (q.includes('beach')) {
      return (
        "The Beach is the NestJS backend service that coordinates everything. " +
        "It uses Socket.IO for WebSocket connections, Redis for pub/sub messaging, " +
        "and manages the entire Lit Compute Network infrastructure you're seeing visualized here."
      );
    }

    // Default response
    return (
      "I can explain:\n" +
      "• The compute nodes (try clicking one!)\n" +
      "• The central hub and its role\n" +
      "• Data flows and particle effects\n" +
      "• Network statistics and metrics\n" +
      "• How Y8 App connects to this\n\n" +
      "What would you like to know more about?"
    );
  }

  /**
   * Provide tips for exploration
   */
  public getExplorationTips(): string[] {
    return [
      "💡 Click on any glowing node to see detailed statistics",
      "💡 Hover over nodes to see them pulse and glow brighter",
      "💡 Use mouse wheel to zoom in and out for different perspectives",
      "💡 The particle streams show encrypted data packets in transit",
      "💡 Watch the orbital rings - they indicate processing activity",
      "💡 The stats panel updates with live network metrics",
      "💡 The central hub rotates as it coordinates network operations",
      "💡 Stars in the background represent the decentralized nature",
    ];
  }

  /**
   * Get network summary
   */
  public getNetworkSummary(): string {
    return (
      `🌐 Lit Compute Network Summary\n\n` +
      `📊 Active Infrastructure:\n` +
      `• 8 Compute Nodes (online)\n` +
      `• 1 Central Coordinator Hub\n` +
      `• 500+ jobs/second throughput\n` +
      `• 98.5% average success rate\n` +
      `• 2.3s average response time\n\n` +
      `💰 Network Economics:\n` +
      `• Total Earnings: 12.5 ETH\n` +
      `• Jobs Processed: 1,247\n` +
      `• Payment Distribution: Automated\n\n` +
      `🔐 Security Features:\n` +
      `• End-to-end encryption\n` +
      `• PKP-based authentication\n` +
      `• Distributed consensus\n` +
      `• Smart contract automation\n\n` +
      `🚀 Connected Applications:\n` +
      `• Y8 App (Dashboard & UI)\n` +
      `• The Beach (NestJS Backend)\n` +
      `• Redis (Pub/Sub Messaging)\n` +
      `• WebSocket (Real-time Updates)`
    );
  }

  /**
   * Celebrate user interactions
   */
  public onUserInteraction(interactionType: 'click' | 'hover' | 'zoom'): string {
    const responses = {
      click: [
        "Great! You're exploring the network. Each node has unique characteristics!",
        "Excellent choice! This node is processing jobs right now.",
        "You found an interesting node! Check out its statistics.",
      ],
      hover: [
        "Nice! Watch how the node responds to your attention.",
        "The glow intensifies when you hover - showing active processing power.",
        "Beautiful, isn't it? The holographic effect shows node vitality.",
      ],
      zoom: [
        "Good perspective change! Different angles reveal different insights.",
        "Zooming helps you see the intricate details of the network topology.",
        "From here you can see how all the pieces work together!",
      ],
    };

    const options = responses[interactionType];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Technical deep dive
   */
  public getTechnicalDetails(): string {
    return (
      `🔧 Technical Implementation Details\n\n` +
      `Scene Rendering:\n` +
      `• Engine: Babylon.js 8.34.0\n` +
      `• Renderer: WebGL 2.0\n` +
      `• Particles: 4,000+ (active)\n` +
      `• Materials: PBR (Physically Based Rendering)\n` +
      `• Lighting: HDR + Glow Layer\n\n` +
      `Backend Architecture:\n` +
      `• Framework: NestJS 11.0\n` +
      `• WebSockets: Socket.IO\n` +
      `• Database: Redis (pub/sub)\n` +
      `• Protocol: Lit Protocol PKP\n\n` +
      `Frontend (Y8 App):\n` +
      `• Framework: Next.js 15.5.6\n` +
      `• React: 19.1.0\n` +
      `• Real-time: WebSocket hooks\n` +
      `• Auth: Lit Protocol integration\n\n` +
      `Network Features:\n` +
      `• Distributed job processing\n` +
      `• Automated load balancing\n` +
      `• Real-time health monitoring\n` +
      `• Cryptographic security\n` +
      `• Smart contract automation`
    );
  }
}
