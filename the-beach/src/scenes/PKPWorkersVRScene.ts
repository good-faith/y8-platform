import {
  Scene,
  Engine,
  Vector3,
  Color3,
  Color4,
  MeshBuilder,
  StandardMaterial,
  PBRMaterial,
  UniversalCamera,
  HemisphericLight,
  PointLight,
  ActionManager,
  ExecuteCodeAction,
  TransformNode,
  Mesh,
  Animation,
  ParticleSystem,
  Texture,
  DynamicTexture,
  SphereParticleEmitter,
} from '@babylonjs/core';
import { AdvancedDynamicTexture, TextBlock, Rectangle } from '@babylonjs/gui';

/**
 * PKP Worker Task Visualization Types
 */
export enum WorkerTaskType {
  REDIS_ENCRYPTOR = 'redis_encryptor',
  TEST_RUNNER = 'test_runner',
  CODE_REVIEWER = 'code_reviewer',
  METRICS_COLLECTOR = 'metrics_collector',
  SECURITY_AUDITOR = 'security_auditor',
  DEPLOYER = 'deployer',
}

/**
 * Worker State
 */
interface WorkerState {
  id: string;
  type: WorkerTaskType;
  name: string;
  position: Vector3;
  status: 'idle' | 'working' | 'completed' | 'error';
  currentTask?: string;
  progress: number;
  mesh?: TransformNode;
  particles?: ParticleSystem;
}

/**
 * PKP Workers VR Scene
 * 
 * Visualizes sub-PKP agents performing their assigned tasks in VR
 */
export class PKPWorkersVRScene {
  private scene: Scene;
  private engine: Engine;
  private workers: Map<string, WorkerState> = new Map();
  private workStations: Map<string, TransformNode> = new Map();
  
  private readonly API_BASE = window.location.origin;
  private mainPKP: string;

  constructor(engine: Engine, mainPKP: string) {
    this.engine = engine;
    this.mainPKP = mainPKP;
    this.scene = this.createScene();
  }

  /**
   * Create the main VR scene
   */
  private createScene(): Scene {
    const scene = new Scene(this.engine);
    scene.clearColor = new Color4(0.02, 0.02, 0.1, 1);

    // Camera
    const camera = new UniversalCamera('camera', new Vector3(0, 2, -10), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(this.engine.getRenderingCanvas()!, true);

    // Lighting
    const ambient = new HemisphericLight('ambient', new Vector3(0, 1, 0), scene);
    ambient.intensity = 0.5;

    const mainLight = new PointLight('mainLight', new Vector3(0, 5, 0), scene);
    mainLight.intensity = 0.8;
    mainLight.diffuse = new Color3(1, 1, 1);

    // Environment
    this.createEnvironment();

    // Initialize worker stations
    this.initializeWorkerStations();

    // Start animation loop
    this.startWorkerAnimations();

    return scene;
  }

  /**
   * Create environment
   */
  private createEnvironment(): void {
    // Floor
    const floor = MeshBuilder.CreateGround('floor', { width: 30, height: 30 }, this.scene);
    const floorMat = new PBRMaterial('floorMat', this.scene);
    floorMat.albedoColor = new Color3(0.1, 0.1, 0.15);
    floorMat.metallic = 0.2;
    floorMat.roughness = 0.8;
    floor.material = floorMat;

    // Grid lines
    const gridSize = 30;
    const gridSpacing = 2;
    for (let i = -gridSize / 2; i <= gridSize / 2; i += gridSpacing) {
      // X lines
      const lineX = MeshBuilder.CreateLines(
        `gridX${i}`,
        {
          points: [new Vector3(i, 0.01, -gridSize / 2), new Vector3(i, 0.01, gridSize / 2)],
        },
        this.scene
      );
      lineX.color = new Color3(0.2, 0.3, 0.5);

      // Z lines
      const lineZ = MeshBuilder.CreateLines(
        `gridZ${i}`,
        {
          points: [new Vector3(-gridSize / 2, 0.01, i), new Vector3(gridSize / 2, 0.01, i)],
        },
        this.scene
      );
      lineZ.color = new Color3(0.2, 0.3, 0.5);
    }

    // Central platform
    const platform = MeshBuilder.CreateCylinder(
      'platform',
      { diameter: 8, height: 0.2 },
      this.scene
    );
    platform.position.y = 0.1;
    const platformMat = new PBRMaterial('platformMat', this.scene);
    platformMat.albedoColor = new Color3(0.15, 0.15, 0.25);
    platformMat.metallic = 0.5;
    platformMat.roughness = 0.5;
    platform.material = platformMat;

    // Title hologram above platform
    this.createTitleHologram();
  }

  /**
   * Create title hologram
   */
  private createTitleHologram(): void {
    const titlePlane = MeshBuilder.CreatePlane('titlePlane', { width: 6, height: 1 }, this.scene);
    titlePlane.position = new Vector3(0, 3.5, 0);

    const titleMat = new StandardMaterial('titleMat', this.scene);
    titleMat.emissiveColor = new Color3(0.3, 0.5, 1);
    titleMat.alpha = 0.9;
    titlePlane.material = titleMat;

    const texture = AdvancedDynamicTexture.CreateForMesh(titlePlane);
    const title = new TextBlock();
    title.text = '🤖 PKP Workers - Task Visualization';
    title.color = 'white';
    title.fontSize = 60;
    title.fontWeight = 'bold';
    texture.addControl(title);

    // Rotate to face camera
    const rotateAnimation = new Animation(
      'titleRotate',
      'rotation.y',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );
    rotateAnimation.setKeys([
      { frame: 0, value: 0 },
      { frame: 100, value: Math.PI * 2 },
    ]);
    titlePlane.animations = [rotateAnimation];
    this.scene.beginAnimation(titlePlane, 0, 100, true);
  }

  /**
   * Initialize worker stations
   */
  private initializeWorkerStations(): void {
    const workerConfigs: Array<{
      type: WorkerTaskType;
      name: string;
      position: Vector3;
      color: Color3;
    }> = [
      {
        type: WorkerTaskType.REDIS_ENCRYPTOR,
        name: 'Redis Encryptor',
        position: new Vector3(-6, 0, 4),
        color: new Color3(1, 0.2, 0.2), // Red
      },
      {
        type: WorkerTaskType.TEST_RUNNER,
        name: 'Test Runner',
        position: new Vector3(-6, 0, -4),
        color: new Color3(0.2, 1, 0.2), // Green
      },
      {
        type: WorkerTaskType.CODE_REVIEWER,
        name: 'Code Reviewer',
        position: new Vector3(0, 0, 6),
        color: new Color3(0.2, 0.5, 1), // Blue
      },
      {
        type: WorkerTaskType.METRICS_COLLECTOR,
        name: 'Metrics Collector',
        position: new Vector3(0, 0, -6),
        color: new Color3(1, 0.8, 0.2), // Yellow
      },
      {
        type: WorkerTaskType.SECURITY_AUDITOR,
        name: 'Security Auditor',
        position: new Vector3(6, 0, 4),
        color: new Color3(1, 0.4, 0), // Orange
      },
      {
        type: WorkerTaskType.DEPLOYER,
        name: 'Deployer',
        position: new Vector3(6, 0, -4),
        color: new Color3(0.6, 0.2, 1), // Purple
      },
    ];

    workerConfigs.forEach((config) => {
      this.createWorkerStation(config);
    });
  }

  /**
   * Create individual worker station
   */
  private createWorkerStation(config: {
    type: WorkerTaskType;
    name: string;
    position: Vector3;
    color: Color3;
  }): void {
    const station = new TransformNode(`station_${config.type}`, this.scene);
    station.position = config.position;

    // Base platform
    const base = MeshBuilder.CreateBox(
      `base_${config.type}`,
      { width: 3, height: 0.2, depth: 3 },
      this.scene
    );
    base.position.y = 0.1;
    base.parent = station;

    const baseMat = new PBRMaterial(`baseMat_${config.type}`, this.scene);
    baseMat.albedoColor = config.color;
    baseMat.metallic = 0.7;
    baseMat.roughness = 0.3;
    baseMat.emissiveColor = config.color.scale(0.2);
    base.material = baseMat;

    // Worker visualization based on type
    this.createWorkerVisualization(config, station);

    // Name label
    this.createWorkerLabel(config.name, station, config.color);

    // Status display
    this.createStatusDisplay(config.type, station);

    // Initialize worker state
    const worker: WorkerState = {
      id: `worker_${config.type}`,
      type: config.type,
      name: config.name,
      position: config.position,
      status: 'idle',
      progress: 0,
      mesh: station,
    };

    this.workers.set(config.type, worker);
    this.workStations.set(config.type, station);
  }

  /**
   * Create worker visualization based on task type
   */
  private createWorkerVisualization(
    config: { type: WorkerTaskType; color: Color3 },
    parent: TransformNode
  ): void {
    switch (config.type) {
      case WorkerTaskType.REDIS_ENCRYPTOR:
        this.createEncryptorVisualization(parent, config.color);
        break;
      case WorkerTaskType.TEST_RUNNER:
        this.createTestRunnerVisualization(parent, config.color);
        break;
      case WorkerTaskType.CODE_REVIEWER:
        this.createCodeReviewerVisualization(parent, config.color);
        break;
      case WorkerTaskType.METRICS_COLLECTOR:
        this.createMetricsCollectorVisualization(parent, config.color);
        break;
      case WorkerTaskType.SECURITY_AUDITOR:
        this.createSecurityAuditorVisualization(parent, config.color);
        break;
      case WorkerTaskType.DEPLOYER:
        this.createDeployerVisualization(parent, config.color);
        break;
    }
  }

  /**
   * Redis Encryptor: Lock/key animation with data packets
   */
  private createEncryptorVisualization(parent: TransformNode, color: Color3): void {
    // Lock icon
    const lockBody = MeshBuilder.CreateBox('lockBody', { width: 0.6, height: 0.8, depth: 0.3 }, this.scene);
    lockBody.position = new Vector3(0, 1.5, 0);
    lockBody.parent = parent;

    const lockShackle = MeshBuilder.CreateTorus(
      'lockShackle',
      { diameter: 0.6, thickness: 0.1 },
      this.scene
    );
    lockShackle.position = new Vector3(0, 2.1, 0);
    lockShackle.rotation.x = Math.PI / 2;
    lockShackle.parent = parent;

    const lockMat = new PBRMaterial('lockMat', this.scene);
    lockMat.albedoColor = color;
    lockMat.metallic = 0.9;
    lockMat.roughness = 0.2;
    lockMat.emissiveColor = color.scale(0.3);
    lockBody.material = lockMat;
    lockShackle.material = lockMat;

    // Data packets flowing
    this.createDataPackets(parent, color);

    // Pulsing animation
    const pulseAnim = new Animation('lockPulse', 'scaling', 30, Animation.ANIMATIONTYPE_VECTOR3);
    pulseAnim.setKeys([
      { frame: 0, value: new Vector3(1, 1, 1) },
      { frame: 15, value: new Vector3(1.1, 1.1, 1.1) },
      { frame: 30, value: new Vector3(1, 1, 1) },
    ]);
    lockBody.animations = [pulseAnim];
    this.scene.beginAnimation(lockBody, 0, 30, true);
  }

  /**
   * Test Runner: Checklist with animated checks
   */
  private createTestRunnerVisualization(parent: TransformNode, color: Color3): void {
    // Clipboard/checklist
    const clipboard = MeshBuilder.CreateBox(
      'clipboard',
      { width: 1, height: 1.4, depth: 0.1 },
      this.scene
    );
    clipboard.position = new Vector3(0, 1.5, 0);
    clipboard.parent = parent;

    const clipMat = new PBRMaterial('clipMat', this.scene);
    clipMat.albedoColor = new Color3(0.9, 0.9, 0.9);
    clipMat.metallic = 0.1;
    clipMat.roughness = 0.8;
    clipboard.material = clipMat;

    // Checkmarks appearing
    for (let i = 0; i < 5; i++) {
      const check = MeshBuilder.CreateBox(
        `check_${i}`,
        { width: 0.15, height: 0.15, depth: 0.05 },
        this.scene
      );
      check.position = new Vector3(-0.3, 1.9 - i * 0.25, 0.1);
      check.parent = parent;

      const checkMat = new StandardMaterial(`checkMat_${i}`, this.scene);
      checkMat.emissiveColor = color;
      check.material = checkMat;

      // Animated appearance
      const delay = i * 20;
      const appearAnim = new Animation('checkAppear', 'scaling', 30, Animation.ANIMATIONTYPE_VECTOR3);
      appearAnim.setKeys([
        { frame: delay, value: new Vector3(0, 0, 0) },
        { frame: delay + 10, value: new Vector3(1, 1, 1) },
        { frame: 100, value: new Vector3(1, 1, 1) },
      ]);
      check.animations = [appearAnim];
      this.scene.beginAnimation(check, 0, 100, true);
    }
  }

  /**
   * Code Reviewer: Code lines scrolling with highlights
   */
  private createCodeReviewerVisualization(parent: TransformNode, color: Color3): void {
    // Monitor screen
    const screen = MeshBuilder.CreateBox('screen', { width: 1.5, height: 1.2, depth: 0.05 }, this.scene);
    screen.position = new Vector3(0, 1.5, 0);
    screen.parent = parent;

    const screenMat = new PBRMaterial('screenMat', this.scene);
    screenMat.albedoColor = new Color3(0.05, 0.05, 0.1);
    screenMat.emissiveColor = color.scale(0.5);
    screenMat.metallic = 0.9;
    screen.material = screenMat;

    // Code lines
    for (let i = 0; i < 8; i++) {
      const line = MeshBuilder.CreateBox(
        `codeLine_${i}`,
        { width: 1.2, height: 0.08, depth: 0.02 },
        this.scene
      );
      line.position = new Vector3(0, 1.9 - i * 0.15, 0.05);
      line.parent = parent;

      const lineMat = new StandardMaterial(`lineMat_${i}`, this.scene);
      lineMat.emissiveColor = i % 3 === 0 ? new Color3(1, 0.3, 0.3) : color; // Highlight errors
      lineMat.alpha = 0.8;
      line.material = lineMat;

      // Scrolling animation
      const scrollAnim = new Animation('codeScroll', 'position.y', 30, Animation.ANIMATIONTYPE_FLOAT);
      scrollAnim.setKeys([
        { frame: 0, value: line.position.y },
        { frame: 100, value: line.position.y + 1.2 },
      ]);
      line.animations = [scrollAnim];
      this.scene.beginAnimation(line, 0, 100, true);
    }
  }

  /**
   * Metrics Collector: Graphs and charts
   */
  private createMetricsCollectorVisualization(parent: TransformNode, color: Color3): void {
    // Chart background
    const chartBg = MeshBuilder.CreateBox('chartBg', { width: 1.5, height: 1.2, depth: 0.05 }, this.scene);
    chartBg.position = new Vector3(0, 1.5, 0);
    chartBg.parent = parent;

    const bgMat = new PBRMaterial('chartBgMat', this.scene);
    bgMat.albedoColor = new Color3(0.1, 0.1, 0.15);
    bgMat.emissiveColor = color.scale(0.2);
    chartBg.material = bgMat;

    // Bar chart
    for (let i = 0; i < 6; i++) {
      const height = 0.3 + Math.random() * 0.6;
      const bar = MeshBuilder.CreateBox(
        `bar_${i}`,
        { width: 0.15, height, depth: 0.05 },
        this.scene
      );
      bar.position = new Vector3(-0.6 + i * 0.25, 1.2 + height / 2, 0.05);
      bar.parent = parent;

      const barMat = new StandardMaterial(`barMat_${i}`, this.scene);
      barMat.emissiveColor = color;
      bar.material = barMat;

      // Growing animation
      const growAnim = new Animation('barGrow', 'scaling.y', 30, Animation.ANIMATIONTYPE_FLOAT);
      growAnim.setKeys([
        { frame: 0, value: 0 },
        { frame: 30 + i * 5, value: 1 },
        { frame: 100, value: 1 },
      ]);
      bar.animations = [growAnim];
      this.scene.beginAnimation(bar, 0, 100, true);
    }
  }

  /**
   * Security Auditor: Shield with scanning rays
   */
  private createSecurityAuditorVisualization(parent: TransformNode, color: Color3): void {
    // Shield
    const shield = MeshBuilder.CreateCylinder(
      'shield',
      { diameterTop: 0, diameterBottom: 1.2, height: 1.5 },
      this.scene
    );
    shield.position = new Vector3(0, 1.5, 0);
    shield.rotation.z = Math.PI;
    shield.parent = parent;

    const shieldMat = new PBRMaterial('shieldMat', this.scene);
    shieldMat.albedoColor = color;
    shieldMat.metallic = 0.8;
    shieldMat.roughness = 0.2;
    shieldMat.emissiveColor = color.scale(0.4);
    shieldMat.alpha = 0.7;
    shield.material = shieldMat;

    // Scanning rings
    for (let i = 0; i < 3; i++) {
      const ring = MeshBuilder.CreateTorus(
        `scanRing_${i}`,
        { diameter: 1 + i * 0.3, thickness: 0.05 },
        this.scene
      );
      ring.position = new Vector3(0, 1.5, 0);
      ring.rotation.x = Math.PI / 2;
      ring.parent = parent;

      const ringMat = new StandardMaterial(`ringMat_${i}`, this.scene);
      ringMat.emissiveColor = color;
      ringMat.alpha = 0.6;
      ring.material = ringMat;

      // Pulsing animation
      const pulseAnim = new Animation('ringPulse', 'scaling', 30, Animation.ANIMATIONTYPE_VECTOR3);
      pulseAnim.setKeys([
        { frame: i * 10, value: new Vector3(0.8, 0.8, 0.8) },
        { frame: i * 10 + 30, value: new Vector3(1.2, 1.2, 1.2) },
        { frame: 60, value: new Vector3(0.8, 0.8, 0.8) },
      ]);
      ring.animations = [pulseAnim];
      this.scene.beginAnimation(ring, 0, 60, true);
    }
  }

  /**
   * Deployer: Rocket with deployment stages
   */
  private createDeployerVisualization(parent: TransformNode, color: Color3): void {
    // Rocket body
    const rocketBody = MeshBuilder.CreateCylinder(
      'rocketBody',
      { diameter: 0.4, height: 1.5 },
      this.scene
    );
    rocketBody.position = new Vector3(0, 1.5, 0);
    rocketBody.parent = parent;

    // Rocket nose cone
    const nose = MeshBuilder.CreateCylinder(
      'rocketNose',
      { diameterTop: 0, diameterBottom: 0.4, height: 0.5 },
      this.scene
    );
    nose.position = new Vector3(0, 2.5, 0);
    nose.parent = parent;

    const rocketMat = new PBRMaterial('rocketMat', this.scene);
    rocketMat.albedoColor = color;
    rocketMat.metallic = 0.9;
    rocketMat.roughness = 0.1;
    rocketMat.emissiveColor = color.scale(0.3);
    rocketBody.material = rocketMat;
    nose.material = rocketMat;

    // Flame particles
    const flameParticles = new ParticleSystem('rocketFlame', 100, this.scene);
    flameParticles.particleTexture = new Texture('textures/flare.png', this.scene);
    flameParticles.emitter = new Vector3(0, 0.8, 0);
    flameParticles.minEmitBox = new Vector3(-0.1, 0, -0.1);
    flameParticles.maxEmitBox = new Vector3(0.1, 0, 0.1);
    flameParticles.color1 = new Color4(1, 0.5, 0, 1);
    flameParticles.color2 = new Color4(1, 0.8, 0, 1);
    flameParticles.colorDead = new Color4(0.5, 0, 0, 0);
    flameParticles.minSize = 0.1;
    flameParticles.maxSize = 0.3;
    flameParticles.minLifeTime = 0.2;
    flameParticles.maxLifeTime = 0.4;
    flameParticles.emitRate = 50;
    flameParticles.direction1 = new Vector3(0, -1, 0);
    flameParticles.direction2 = new Vector3(0, -1, 0);
    flameParticles.minEmitPower = 1;
    flameParticles.maxEmitPower = 2;
    flameParticles.updateSpeed = 0.01;
    flameParticles.start();

    // Bobbing animation
    const bobAnim = new Animation('rocketBob', 'position.y', 30, Animation.ANIMATIONTYPE_FLOAT);
    bobAnim.setKeys([
      { frame: 0, value: 1.5 },
      { frame: 30, value: 1.7 },
      { frame: 60, value: 1.5 },
    ]);
    rocketBody.animations = [bobAnim];
    this.scene.beginAnimation(rocketBody, 0, 60, true);
  }

  /**
   * Create data packets flowing
   */
  private createDataPackets(parent: TransformNode, color: Color3): void {
    for (let i = 0; i < 5; i++) {
      const packet = MeshBuilder.CreateBox(
        `packet_${i}`,
        { size: 0.2 },
        this.scene
      );
      packet.position = new Vector3(
        -1 + Math.random() * 2,
        0.5 + Math.random(),
        -1 + Math.random() * 2
      );
      packet.parent = parent;

      const packetMat = new StandardMaterial(`packetMat_${i}`, this.scene);
      packetMat.emissiveColor = color;
      packetMat.alpha = 0.6;
      packet.material = packetMat;

      // Floating animation
      const floatAnim = new Animation('packetFloat', 'position.y', 30, Animation.ANIMATIONTYPE_FLOAT);
      floatAnim.setKeys([
        { frame: 0, value: packet.position.y },
        { frame: 50, value: packet.position.y + 0.5 },
        { frame: 100, value: packet.position.y },
      ]);

      const rotateAnim = new Animation('packetRotate', 'rotation.y', 30, Animation.ANIMATIONTYPE_FLOAT);
      rotateAnim.setKeys([
        { frame: 0, value: 0 },
        { frame: 100, value: Math.PI * 2 },
      ]);

      packet.animations = [floatAnim, rotateAnim];
      this.scene.beginAnimation(packet, 0, 100, true);
    }
  }

  /**
   * Create worker label
   */
  private createWorkerLabel(name: string, parent: TransformNode, color: Color3): void {
    const label = MeshBuilder.CreatePlane('label', { width: 2.5, height: 0.4 }, this.scene);
    label.position = new Vector3(0, 3, 0);
    label.parent = parent;

    const labelMat = new StandardMaterial('labelMat', this.scene);
    labelMat.emissiveColor = color.scale(0.5);
    labelMat.alpha = 0.8;
    label.material = labelMat;

    const texture = AdvancedDynamicTexture.CreateForMesh(label);
    const text = new TextBlock();
    text.text = name;
    text.color = 'white';
    text.fontSize = 40;
    text.fontWeight = 'bold';
    texture.addControl(text);

    // Billboard mode (always face camera)
    label.billboardMode = Mesh.BILLBOARDMODE_ALL;
  }

  /**
   * Create status display
   */
  private createStatusDisplay(type: WorkerTaskType, parent: TransformNode): void {
    const statusPanel = MeshBuilder.CreatePlane('statusPanel', { width: 2.5, height: 0.6 }, this.scene);
    statusPanel.position = new Vector3(0, 0.5, 0);
    statusPanel.parent = parent;

    const statusMat = new StandardMaterial('statusMat', this.scene);
    statusMat.emissiveColor = new Color3(0.1, 0.1, 0.2);
    statusMat.alpha = 0.9;
    statusPanel.material = statusMat;

    const texture = AdvancedDynamicTexture.CreateForMesh(statusPanel, 512, 256);

    const statusText = new TextBlock(`status_${type}`);
    statusText.text = '⏸️ Idle';
    statusText.color = 'white';
    statusText.fontSize = 32;
    statusText.top = -40;
    texture.addControl(statusText);

    const progressText = new TextBlock(`progress_${type}`);
    progressText.text = '0%';
    progressText.color = '#60a5fa';
    progressText.fontSize = 24;
    progressText.top = 10;
    texture.addControl(progressText);

    const taskText = new TextBlock(`task_${type}`);
    taskText.text = '';
    taskText.color = 'rgba(255,255,255,0.7)';
    taskText.fontSize = 18;
    taskText.top = 40;
    taskText.textWrapping = true;
    texture.addControl(taskText);

    // Billboard mode
    statusPanel.billboardMode = Mesh.BILLBOARDMODE_ALL;
  }

  /**
   * Start worker animations
   */
  private startWorkerAnimations(): void {
    // Simulate workers receiving and processing tasks
    setInterval(() => {
      this.workers.forEach((worker) => {
        // Randomly assign tasks
        if (worker.status === 'idle' && Math.random() > 0.7) {
          this.assignTaskToWorker(worker);
        }

        // Update progress
        if (worker.status === 'working') {
          worker.progress += 5 + Math.random() * 10;
          if (worker.progress >= 100) {
            this.completeTask(worker);
          }
        }

        this.updateWorkerDisplay(worker);
      });
    }, 1000);
  }

  /**
   * Assign task to worker
   */
  private assignTaskToWorker(worker: WorkerState): void {
    const tasks = this.getTasksForWorkerType(worker.type);
    worker.currentTask = tasks[Math.floor(Math.random() * tasks.length)];
    worker.status = 'working';
    worker.progress = 0;
  }

  /**
   * Complete task
   */
  private completeTask(worker: WorkerState): void {
    worker.status = 'completed';
    worker.progress = 100;

    setTimeout(() => {
      worker.status = 'idle';
      worker.progress = 0;
      worker.currentTask = undefined;
    }, 2000);
  }

  /**
   * Get tasks for worker type
   */
  private getTasksForWorkerType(type: WorkerTaskType): string[] {
    const taskMap = {
      [WorkerTaskType.REDIS_ENCRYPTOR]: [
        'Encrypting user data...',
        'Securing Redis keys...',
        'PKP session encryption...',
      ],
      [WorkerTaskType.TEST_RUNNER]: [
        'Running Playwright tests...',
        'E2E test execution...',
        'UI component testing...',
      ],
      [WorkerTaskType.CODE_REVIEWER]: [
        'Reviewing PR #123...',
        'Security code audit...',
        'Style check analysis...',
      ],
      [WorkerTaskType.METRICS_COLLECTOR]: [
        'Collecting performance metrics...',
        'Analyzing user engagement...',
        'System health check...',
      ],
      [WorkerTaskType.SECURITY_AUDITOR]: [
        'Scanning for vulnerabilities...',
        'Dependency audit...',
        'Access control review...',
      ],
      [WorkerTaskType.DEPLOYER]: [
        'Deploying to production...',
        'Building Docker images...',
        'Verifying deployment...',
      ],
    };

    return taskMap[type] || ['Processing...'];
  }

  /**
   * Update worker display
   */
  private updateWorkerDisplay(worker: WorkerState): void {
    const statusEmojis = {
      idle: '⏸️',
      working: '⚙️',
      completed: '✅',
      error: '❌',
    };

    const statusColors = {
      idle: 'rgba(200,200,200,0.8)',
      working: '#60a5fa',
      completed: '#10b981',
      error: '#ef4444',
    };

    // Update status text via GUI
    const statusPanel = this.scene.getMeshByName(`statusPanel`) as Mesh;
    if (statusPanel) {
      const texture = AdvancedDynamicTexture.CreateForMesh(statusPanel);
      const controls = texture.getChildren();
      
      // This is simplified - in production you'd store references to the GUI controls
      console.log(`${worker.name}: ${worker.status} - ${worker.progress}%`);
    }
  }

  /**
   * Get scene
   */
  public getScene(): Scene {
    return this.scene;
  }

  /**
   * Dispose scene
   */
  public dispose(): void {
    this.scene.dispose();
  }
}
