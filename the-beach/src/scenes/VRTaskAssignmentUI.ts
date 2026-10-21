import { 
  Scene, 
  Vector3, 
  Color3, 
  Color4,
  MeshBuilder,
  StandardMaterial,
  DynamicTexture,
  ActionManager,
  ExecuteCodeAction,
  TransformNode,
  Mesh,
} from '@babylonjs/core';
import { 
  GUI3DManager,
  HolographicButton,
  StackPanel3D,
} from '@babylonjs/gui';
import {
  AdvancedDynamicTexture,
  TextBlock,
} from '@babylonjs/gui';
import '@babylonjs/loaders';

/**
 * VR Task Assignment UI
 * 
 * Immersive 3D interface for approving task assignments in VR
 */
export class VRTaskAssignmentUI {
  private scene: Scene;
  private gui3DManager: GUI3DManager;
  private assignmentPanels: Map<string, TransformNode> = new Map();
  private mainPanel: TransformNode | null = null;
  
  private readonly API_BASE = window.location.origin;
  private mainPKP: string;
  
  private pendingAssignments: any[] = [];
  private stats: any = null;

  constructor(scene: Scene, mainPKP: string) {
    this.scene = scene;
    this.mainPKP = mainPKP;
    this.gui3DManager = new GUI3DManager(scene);
    
    this.initialize();
  }

  /**
   * Initialize VR UI
   */
  private async initialize(): Promise<void> {
    // Create main dashboard panel
    this.createMainDashboard();
    
    // Load data
    await this.loadPendingAssignments();
    await this.loadUserStats();
    
    // Render assignments
    this.renderAssignments();
    
    // Auto-refresh
    setInterval(async () => {
      await this.loadPendingAssignments();
      this.renderAssignments();
    }, 5000);
  }

  /**
   * Create main dashboard panel
   */
  private createMainDashboard(): void {
    this.mainPanel = new TransformNode('taskDashboard', this.scene);
    this.mainPanel.position = new Vector3(0, 1.6, 3); // At eye level, 3m in front
    
    // Background panel
    const background = MeshBuilder.CreatePlane('dashboardBG', { 
      width: 4, 
      height: 2.5 
    }, this.scene);
    background.parent = this.mainPanel;
    
    const bgMat = new StandardMaterial('dashboardBGMat', this.scene);
    bgMat.emissiveColor = new Color3(0.05, 0.05, 0.1);
    bgMat.alpha = 0.9;
    background.material = bgMat;
    
    // Title
    this.createTextPanel('📋 Task Assignments', new Vector3(0, 1, 0.01), 0.3, this.mainPanel);
    
    // Stats bar
    this.createStatsBar();
  }

  /**
   * Create stats bar
   */
  private createStatsBar(): void {
    if (!this.mainPanel) return;
    
    const statsContainer = new TransformNode('statsBar', this.scene);
    statsContainer.parent = this.mainPanel;
    statsContainer.position = new Vector3(0, 0.7, 0.01);
    
    // Create stat cards
    const stats = [
      { label: 'Pending', value: '0', x: -1.2 },
      { label: 'Active', value: '0', x: -0.4 },
      { label: 'Sub-PKPs', value: '0', x: 0.4 },
      { label: 'Tier', value: 'Loading', x: 1.2 },
    ];
    
    stats.forEach(stat => {
      this.createStatCard(stat.label, stat.value, new Vector3(stat.x, 0, 0), statsContainer);
    });
  }

  /**
   * Create stat card
   */
  private createStatCard(label: string, value: string, position: Vector3, parent: TransformNode): void {
    const card = MeshBuilder.CreatePlane(`stat_${label}`, { 
      width: 0.6, 
      height: 0.3 
    }, this.scene);
    card.parent = parent;
    card.position = position;
    
    const mat = new StandardMaterial(`statMat_${label}`, this.scene);
    mat.emissiveColor = new Color3(0.1, 0.1, 0.2);
    card.material = mat;
    
    // Add text
    const texture = AdvancedDynamicTexture.CreateForMesh(card);
    
    const panel = new StackPanel3D();
    
    const labelText = new TextBlock();
    labelText.text = label;
    labelText.color = 'rgba(255, 255, 255, 0.6)';
    labelText.fontSize = 20;
    labelText.height = '40px';
    
    const valueText = new TextBlock();
    valueText.text = value;
    valueText.color = 'white';
    valueText.fontSize = 40;
    valueText.fontWeight = 'bold';
    valueText.height = '60px';
    
    texture.addControl(labelText);
    texture.addControl(valueText);
  }

  /**
   * Create text panel
   */
  private createTextPanel(
    text: string, 
    position: Vector3, 
    fontSize: number, 
    parent: TransformNode
  ): Mesh {
    const panel = MeshBuilder.CreatePlane('textPanel', { 
      width: 3.5, 
      height: 0.4 
    }, this.scene);
    panel.parent = parent;
    panel.position = position;
    
    const texture = AdvancedDynamicTexture.CreateForMesh(panel);
    
    const textBlock = new TextBlock();
    textBlock.text = text;
    textBlock.color = 'white';
    textBlock.fontSize = fontSize * 100;
    textBlock.fontWeight = 'bold';
    
    texture.addControl(textBlock);
    
    return panel;
  }

  /**
   * Load pending assignments
   */
  private async loadPendingAssignments(): Promise<void> {
    try {
      const response = await fetch(
        `${this.API_BASE}/npe/tasks/assignments/pending?mainPKP=${this.mainPKP}`
      );
      this.pendingAssignments = await response.json();
    } catch (error) {
      console.error('Failed to load pending assignments:', error);
    }
  }

  /**
   * Load user stats
   */
  private async loadUserStats(): Promise<void> {
    try {
      const response = await fetch(
        `${this.API_BASE}/npe/tasks/assignments/stats/${this.mainPKP}`
      );
      this.stats = await response.json();
      this.updateStatsDisplay();
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  }

  /**
   * Update stats display
   */
  private updateStatsDisplay(): void {
    if (!this.stats) return;
    
    const { tier, usage, quota } = this.stats;
    
    // Update stat cards (would need refs to update dynamically)
    console.log('Stats updated:', {
      pending: usage.pendingTasks,
      active: usage.activeTasks,
      subPKPs: usage.subPKPCount,
      tier,
    });
  }

  /**
   * Render assignment cards
   */
  private renderAssignments(): void {
    // Clear existing panels
    this.assignmentPanels.forEach(panel => panel.dispose());
    this.assignmentPanels.clear();
    
    if (this.pendingAssignments.length === 0) {
      this.showEmptyState();
      return;
    }
    
    // Create assignment cards in a grid
    const cardsPerRow = 2;
    const cardWidth = 1.6;
    const cardHeight = 1.2;
    const spacing = 0.2;
    
    this.pendingAssignments.forEach((assignment, index) => {
      const row = Math.floor(index / cardsPerRow);
      const col = index % cardsPerRow;
      
      const x = (col - (cardsPerRow - 1) / 2) * (cardWidth + spacing);
      const y = -0.3 - row * (cardHeight + spacing);
      
      this.createAssignmentCard(assignment, new Vector3(x, y, 0.01));
    });
  }

  /**
   * Create assignment card
   */
  private createAssignmentCard(assignment: any, position: Vector3): void {
    if (!this.mainPanel) return;
    
    const cardContainer = new TransformNode(`assignment_${assignment.id}`, this.scene);
    cardContainer.parent = this.mainPanel;
    cardContainer.position = position;
    
    // Card background
    const card = MeshBuilder.CreatePlane('card', { 
      width: 1.5, 
      height: 1.1 
    }, this.scene);
    card.parent = cardContainer;
    
    const cardMat = new StandardMaterial('cardMat', this.scene);
    cardMat.emissiveColor = new Color3(0.15, 0.1, 0.05); // Warm pending color
    cardMat.alpha = 0.95;
    card.material = cardMat;
    
    // Task info texture
    const texture = AdvancedDynamicTexture.CreateForMesh(card, 512, 512);
    texture.background = 'rgba(0,0,0,0)';
    
    // Task title
    const titleText = new TextBlock();
    titleText.text = assignment.metadata.taskTitle;
    titleText.color = 'white';
    titleText.fontSize = 24;
    titleText.fontWeight = 'bold';
    titleText.textWrapping = true;
    titleText.top = -180;
    titleText.height = '60px';
    texture.addControl(titleText);
    
    // Task ID
    const idText = new TextBlock();
    idText.text = `Task #${assignment.taskId}`;
    idText.color = 'rgba(255,255,255,0.6)';
    idText.fontSize = 16;
    idText.top = -130;
    idText.height = '30px';
    texture.addControl(idText);
    
    // Priority badge
    const priorityText = new TextBlock();
    priorityText.text = `Priority: ${assignment.metadata.taskPriority.toUpperCase()}`;
    priorityText.color = this.getPriorityColor(assignment.metadata.taskPriority);
    priorityText.fontSize = 18;
    priorityText.fontWeight = 'bold';
    priorityText.top = -90;
    priorityText.height = '30px';
    texture.addControl(priorityText);
    
    // Agent type
    const agentText = new TextBlock();
    agentText.text = `🤖 ${assignment.metadata.agentType}`;
    agentText.color = 'rgba(255,255,255,0.8)';
    agentText.fontSize = 16;
    agentText.top = -50;
    agentText.height = '30px';
    texture.addControl(agentText);
    
    // Estimated hours
    const hoursText = new TextBlock();
    hoursText.text = `⏱️ ${assignment.metadata.estimatedHours}h estimated`;
    hoursText.color = 'rgba(255,255,255,0.8)';
    hoursText.fontSize = 16;
    hoursText.top = -20;
    hoursText.height = '30px';
    texture.addControl(hoursText);
    
    // Create approve button
    this.createButton(
      '✅ Approve',
      new Vector3(0, -0.4, 0.02),
      new Color3(0.1, 0.7, 0.3),
      () => this.approveAssignment(assignment.id),
      cardContainer
    );
    
    // Create reject button
    this.createButton(
      '❌ Reject',
      new Vector3(0, -0.5, 0.02),
      new Color3(0.9, 0.2, 0.2),
      () => this.rejectAssignment(assignment.id),
      cardContainer
    );
    
    this.assignmentPanels.set(assignment.id, cardContainer);
  }

  /**
   * Create interactive button
   */
  private createButton(
    label: string,
    position: Vector3,
    color: Color3,
    onClick: () => void,
    parent: TransformNode
  ): Mesh {
    const button = MeshBuilder.CreatePlane('button', { 
      width: 1.3, 
      height: 0.15 
    }, this.scene);
    button.parent = parent;
    button.position = position;
    
    const buttonMat = new StandardMaterial('buttonMat', this.scene);
    buttonMat.emissiveColor = color;
    button.material = buttonMat;
    
    // Add text
    const texture = AdvancedDynamicTexture.CreateForMesh(button);
    const text = new TextBlock();
    text.text = label;
    text.color = 'white';
    text.fontSize = 32;
    text.fontWeight = 'bold';
    texture.addControl(text);
    
    // Add interaction
    button.actionManager = new ActionManager(this.scene);
    button.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickTrigger, onClick)
    );
    
    // Hover effect
    button.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
        buttonMat.emissiveColor = color.scale(1.3);
      })
    );
    button.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
        buttonMat.emissiveColor = color;
      })
    );
    
    return button;
  }

  /**
   * Show empty state
   */
  private showEmptyState(): void {
    if (!this.mainPanel) return;
    
    this.createTextPanel(
      '✅ No pending assignments',
      new Vector3(0, -0.5, 0.01),
      0.15,
      this.mainPanel
    );
  }

  /**
   * Get priority color
   */
  private getPriorityColor(priority: string): string {
    const colors = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#3b82f6',
    };
    return colors[priority.toLowerCase()] || 'white';
  }

  /**
   * Approve assignment
   */
  private async approveAssignment(requestId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.API_BASE}/npe/tasks/assignments/${requestId}/approve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mainPKP: this.mainPKP }),
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to approve assignment');
      }
      
      // Reload assignments
      await this.loadPendingAssignments();
      await this.loadUserStats();
      this.renderAssignments();
      
      // Show success feedback
      this.showNotification('✅ Task approved!', new Color3(0.1, 0.7, 0.3));
    } catch (error) {
      console.error('Approval error:', error);
      this.showNotification('❌ Approval failed', new Color3(0.9, 0.2, 0.2));
    }
  }

  /**
   * Reject assignment
   */
  private async rejectAssignment(requestId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.API_BASE}/npe/tasks/assignments/${requestId}/reject`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mainPKP: this.mainPKP }),
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to reject assignment');
      }
      
      // Reload assignments
      await this.loadPendingAssignments();
      await this.loadUserStats();
      this.renderAssignments();
      
      // Show success feedback
      this.showNotification('❌ Task rejected', new Color3(0.9, 0.2, 0.2));
    } catch (error) {
      console.error('Rejection error:', error);
      this.showNotification('Failed to reject', new Color3(0.9, 0.2, 0.2));
    }
  }

  /**
   * Show notification
   */
  private showNotification(message: string, color: Color3): void {
    const notification = MeshBuilder.CreatePlane('notification', { 
      width: 2, 
      height: 0.3 
    }, this.scene);
    notification.position = new Vector3(0, 2.5, 2);
    
    const mat = new StandardMaterial('notifMat', this.scene);
    mat.emissiveColor = color;
    notification.material = mat;
    
    const texture = AdvancedDynamicTexture.CreateForMesh(notification);
    const text = new TextBlock();
    text.text = message;
    text.color = 'white';
    text.fontSize = 40;
    text.fontWeight = 'bold';
    texture.addControl(text);
    
    // Fade out and dispose
    setTimeout(() => {
      notification.dispose();
    }, 3000);
  }

  /**
   * Dispose VR UI
   */
  public dispose(): void {
    this.assignmentPanels.forEach(panel => panel.dispose());
    this.assignmentPanels.clear();
    
    if (this.mainPanel) {
      this.mainPanel.dispose();
    }
    
    this.gui3DManager.dispose();
  }
}
