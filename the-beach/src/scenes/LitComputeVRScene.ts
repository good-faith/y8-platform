import {
  Scene,
  Engine,
  ArcRotateCamera,
  HemisphericLight,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Color4,
  Texture,
  CubeTexture,
  PBRMaterial,
  PointLight,
  SpotLight,
  Animation,
  GlowLayer,
  ParticleSystem,
  ShadowGenerator,
  DirectionalLight,
  ActionManager,
  ExecuteCodeAction,
} from '@babylonjs/core';
import { AdvancedDynamicTexture, TextBlock, Rectangle, Control } from '@babylonjs/gui';

/**
 * VR Scene: "The Lit Compute Network Visualization"
 * 
 * An immersive 3D environment showcasing the Lit Compute Network
 * with interactive nodes, data flows, and a VR agent guide.
 */
export class LitComputeVRScene {
  private scene: Scene;
  private engine: Engine;
  private camera: ArcRotateCamera;
  private glowLayer: GlowLayer;
  private agentMesh: any;
  private nodes: any[] = [];
  private dataParticles: ParticleSystem[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0.02, 0.02, 0.1, 1.0);

    this.setupCamera();
    this.setupLighting();
    this.glowLayer = new GlowLayer('glow', this.scene);
    this.glowLayer.intensity = 0.5;

    this.createEnvironment();
    this.createNetworkNodes();
    this.createDataFlows();
    this.createVRAgent();
    this.createInfoPanels();
    this.setupAnimations();
    this.setupInteractions();

    // Start render loop
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  /**
   * Setup camera for VR exploration
   */
  private setupCamera() {
    this.camera = new ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 3,
      30,
      new Vector3(0, 5, 0),
      this.scene
    );
    this.camera.attachControl(true);
    this.camera.lowerRadiusLimit = 10;
    this.camera.upperRadiusLimit = 100;
    this.camera.wheelPrecision = 50;
  }

  /**
   * Setup atmospheric lighting
   */
  private setupLighting() {
    // Ambient light
    const ambient = new HemisphericLight(
      'ambient',
      new Vector3(0, 1, 0),
      this.scene
    );
    ambient.intensity = 0.3;
    ambient.groundColor = new Color3(0.1, 0.05, 0.2);

    // Main directional light
    const mainLight = new DirectionalLight(
      'mainLight',
      new Vector3(-1, -2, -1),
      this.scene
    );
    mainLight.intensity = 0.5;
    mainLight.position = new Vector3(20, 40, 20);

    // Dramatic spotlight for VR agent
    const spotlight = new SpotLight(
      'agentSpotlight',
      new Vector3(0, 15, 0),
      new Vector3(0, -1, 0),
      Math.PI / 3,
      2,
      this.scene
    );
    spotlight.intensity = 2;
    spotlight.diffuse = new Color3(0.3, 0.5, 1.0);

    // Shadows
    const shadowGenerator = new ShadowGenerator(1024, mainLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
  }

  /**
   * Create the virtual environment
   */
  private createEnvironment() {
    // Floor with grid pattern
    const ground = MeshBuilder.CreateGround(
      'ground',
      { width: 100, height: 100, subdivisions: 20 },
      this.scene
    );
    
    const groundMaterial = new PBRMaterial('groundMat', this.scene);
    groundMaterial.albedoColor = new Color3(0.05, 0.05, 0.15);
    groundMaterial.metallic = 0.2;
    groundMaterial.roughness = 0.8;
    ground.material = groundMaterial;
    ground.receiveShadows = true;

    // Add grid lines
    this.createGridPattern(ground);

    // Skybox with stars
    const skybox = MeshBuilder.CreateBox('skybox', { size: 500 }, this.scene);
    const skyMaterial = new StandardMaterial('skyMat', this.scene);
    skyMaterial.backFaceCulling = false;
    skyMaterial.emissiveColor = new Color3(0.02, 0.02, 0.1);
    skybox.material = skyMaterial;

    // Add stars
    this.createStarfield();
  }

  /**
   * Create grid pattern on floor
   */
  private createGridPattern(ground: any) {
    for (let i = -50; i <= 50; i += 5) {
      // X-axis lines
      const lineX = MeshBuilder.CreateLines(
        `gridX${i}`,
        {
          points: [
            new Vector3(i, 0.1, -50),
            new Vector3(i, 0.1, 50),
          ],
        },
        this.scene
      );
      lineX.color = new Color3(0.2, 0.3, 0.5);
      lineX.alpha = 0.3;

      // Z-axis lines
      const lineZ = MeshBuilder.CreateLines(
        `gridZ${i}`,
        {
          points: [
            new Vector3(-50, 0.1, i),
            new Vector3(50, 0.1, i),
          ],
        },
        this.scene
      );
      lineZ.color = new Color3(0.2, 0.3, 0.5);
      lineZ.alpha = 0.3;
    }
  }

  /**
   * Create starfield effect
   */
  private createStarfield() {
    for (let i = 0; i < 200; i++) {
      const star = MeshBuilder.CreateSphere(
        `star${i}`,
        { diameter: 0.5 },
        this.scene
      );
      star.position = new Vector3(
        (Math.random() - 0.5) * 200,
        Math.random() * 100 + 50,
        (Math.random() - 0.5) * 200
      );

      const starMat = new StandardMaterial(`starMat${i}`, this.scene);
      starMat.emissiveColor = new Color3(1, 1, 1);
      star.material = starMat;

      // Add to glow layer
      this.glowLayer.addIncludedOnlyMesh(star);
    }
  }

  /**
   * Create network nodes representing compute nodes
   */
  private createNetworkNodes() {
    const nodeCount = 8;
    const radius = 15;

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(i * 0.5) * 3 + 5;

      this.createComputeNode(i, new Vector3(x, y, z));
    }

    // Central hub
    this.createCentralHub();
  }

  /**
   * Create individual compute node
   */
  private createComputeNode(id: number, position: Vector3) {
    // Main node sphere
    const node = MeshBuilder.CreateSphere(
      `node${id}`,
      { diameter: 2 },
      this.scene
    );
    node.position = position;

    const nodeMaterial = new PBRMaterial(`nodeMat${id}`, this.scene);
    nodeMaterial.albedoColor = new Color3(0.3, 0.7, 1.0);
    nodeMaterial.metallic = 0.9;
    nodeMaterial.roughness = 0.2;
    nodeMaterial.emissiveColor = new Color3(0.1, 0.3, 0.5);
    node.material = nodeMaterial;

    // Glow effect
    this.glowLayer.addIncludedOnlyMesh(node);

    // Orbital rings
    for (let ring = 0; ring < 3; ring++) {
      const torus = MeshBuilder.CreateTorus(
        `ring${id}_${ring}`,
        {
          diameter: 3 + ring * 0.5,
          thickness: 0.05,
          tessellation: 32,
        },
        this.scene
      );
      torus.position = position;
      torus.rotation.x = Math.PI / 2;

      const ringMat = new StandardMaterial(`ringMat${id}_${ring}`, this.scene);
      ringMat.emissiveColor = new Color3(0.2, 0.5, 1.0);
      ringMat.alpha = 0.5;
      torus.material = ringMat;
    }

    // Info label
    this.createNodeLabel(node, `Node ${id + 1}`, `Active • ${Math.floor(Math.random() * 50 + 50)} Jobs`);

    // Pulsing animation
    this.createPulseAnimation(node);

    this.nodes.push({ mesh: node, id, position });
  }

  /**
   * Create central hub
   */
  private createCentralHub() {
    const hub = MeshBuilder.CreateSphere(
      'centralHub',
      { diameter: 4 },
      this.scene
    );
    hub.position = new Vector3(0, 5, 0);

    const hubMaterial = new PBRMaterial('hubMat', this.scene);
    hubMaterial.albedoColor = new Color3(1.0, 0.4, 0.2);
    hubMaterial.metallic = 1.0;
    hubMaterial.roughness = 0.1;
    hubMaterial.emissiveColor = new Color3(0.5, 0.2, 0.1);
    hub.material = hubMaterial;

    this.glowLayer.addIncludedOnlyMesh(hub);
    this.glowLayer.referenceMeshToUseItsOwnMaterial(hub);

    // Create energy field
    const field = MeshBuilder.CreateSphere(
      'energyField',
      { diameter: 6 },
      this.scene
    );
    field.position = hub.position;
    
    const fieldMat = new StandardMaterial('fieldMat', this.scene);
    fieldMat.emissiveColor = new Color3(1.0, 0.5, 0.2);
    fieldMat.alpha = 0.2;
    fieldMat.wireframe = true;
    field.material = fieldMat;

    this.createNodeLabel(hub, 'Lit Compute Network', 'Central Coordinator');
  }

  /**
   * Create data flow particles between nodes
   */
  private createDataFlows() {
    this.nodes.forEach((node, index) => {
      const nextNode = this.nodes[(index + 1) % this.nodes.length];
      this.createParticleFlow(node.position, nextNode.position, index);
    });

    // Flows to central hub
    this.nodes.forEach((node, index) => {
      this.createParticleFlow(node.position, new Vector3(0, 5, 0), index + 100);
    });
  }

  /**
   * Create particle flow between two points
   */
  private createParticleFlow(start: Vector3, end: Vector3, id: number) {
    const particles = new ParticleSystem(
      `particles${id}`,
      500,
      this.scene
    );

    particles.particleTexture = new Texture(
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiMwMGZmZmYiLz48L3N2Zz4=',
      this.scene
    );

    particles.emitter = start;
    particles.minSize = 0.1;
    particles.maxSize = 0.3;
    particles.minLifeTime = 2;
    particles.maxLifeTime = 4;
    particles.emitRate = 20;
    particles.blendMode = ParticleSystem.BLENDMODE_ADD;
    particles.direction1 = end.subtract(start).normalize();
    particles.direction2 = end.subtract(start).normalize();
    particles.minEmitPower = 2;
    particles.maxEmitPower = 4;
    particles.updateSpeed = 0.01;
    particles.color1 = new Color4(0.3, 0.7, 1.0, 1.0);
    particles.color2 = new Color4(0.1, 0.4, 0.8, 1.0);
    particles.colorDead = new Color4(0, 0, 0.5, 0.0);

    particles.start();
    this.dataParticles.push(particles);
  }

  /**
   * Create VR Agent (holographic guide)
   */
  private createVRAgent() {
    // Agent body (holographic humanoid)
    const body = MeshBuilder.CreateCylinder(
      'agentBody',
      { height: 2, diameter: 0.8 },
      this.scene
    );
    body.position = new Vector3(-5, 6, -5);

    // Head
    const head = MeshBuilder.CreateSphere(
      'agentHead',
      { diameter: 0.8 },
      this.scene
    );
    head.position = body.position.add(new Vector3(0, 1.5, 0));

    // Holographic material
    const agentMat = new PBRMaterial('agentMat', this.scene);
    agentMat.albedoColor = new Color3(0.5, 1.0, 0.8);
    agentMat.emissiveColor = new Color3(0.2, 0.5, 0.4);
    agentMat.alpha = 0.7;
    agentMat.metallic = 0.5;
    agentMat.roughness = 0.3;

    body.material = agentMat;
    head.material = agentMat;

    this.glowLayer.addIncludedOnlyMesh(body);
    this.glowLayer.addIncludedOnlyMesh(head);

    // Agent ring (data indicator)
    const ring = MeshBuilder.CreateTorus(
      'agentRing',
      { diameter: 1.5, thickness: 0.1, tessellation: 32 },
      this.scene
    );
    ring.position = head.position;
    ring.rotation.x = Math.PI / 2;

    const ringMat = new StandardMaterial('agentRingMat', this.scene);
    ringMat.emissiveColor = new Color3(0.5, 1.0, 0.8);
    ringMat.alpha = 0.8;
    ring.material = ringMat;

    this.agentMesh = { body, head, ring };

    // Floating animation
    this.createFloatingAnimation(body);
    this.createFloatingAnimation(head);
    this.createRotationAnimation(ring);

    // Speech bubble
    this.createAgentSpeechBubble(head.position);
  }

  /**
   * Create speech bubble for VR agent
   */
  private createAgentSpeechBubble(position: Vector3) {
    const plane = MeshBuilder.CreatePlane(
      'speechBubble',
      { width: 6, height: 3 },
      this.scene
    );
    plane.position = position.add(new Vector3(0, 2, 0));
    plane.billboardMode = 7; // Face camera

    const advancedTexture = AdvancedDynamicTexture.CreateForMesh(plane);

    const rect = new Rectangle();
    rect.width = 1;
    rect.height = 1;
    rect.cornerRadius = 20;
    rect.color = '#00ffcc';
    rect.thickness = 4;
    rect.background = 'rgba(0, 20, 40, 0.9)';
    advancedTexture.addControl(rect);

    const text = new TextBlock();
    text.text = `Welcome to the Lit Compute Network!\n\nI'm your VR Guide. Let me show you around...\n\n🌐 8 Active Compute Nodes\n⚡ Real-time Data Processing\n🔐 Decentralized & Secure`;
    text.color = '#00ffcc';
    text.fontSize = 48;
    text.textWrapping = true;
    text.fontFamily = 'monospace';
    rect.addControl(text);

    // Animate text changes
    setTimeout(() => {
      text.text = `Each glowing sphere is a Compute Node:\n\n✓ Processing PKP authentication\n✓ Running Lit Actions\n✓ Handling distributed jobs\n\nClick any node to learn more!`;
    }, 5000);

    setTimeout(() => {
      text.text = `The central hub coordinates:\n\n📊 Job distribution\n🔄 Load balancing  \n💰 Payment processing\n📡 Network health monitoring\n\nData flows shown as particles!`;
    }, 10000);

    setTimeout(() => {
      text.text = `This is Y8 App's backend:\n\n🎮 Powers the dashboard you built\n📈 Provides real-time analytics\n🌊 The Beach (NestJS + WebSockets)\n\nExplore freely! 🚀`;
    }, 15000);
  }

  /**
   * Create info panels for scene elements
   */
  private createInfoPanels() {
    const stats = MeshBuilder.CreatePlane(
      'statsPanel',
      { width: 8, height: 4 },
      this.scene
    );
    stats.position = new Vector3(15, 8, 0);
    stats.rotation.y = -Math.PI / 4;

    const statsTexture = AdvancedDynamicTexture.CreateForMesh(stats);

    const statsRect = new Rectangle();
    statsRect.width = 1;
    statsRect.height = 1;
    statsRect.cornerRadius = 10;
    statsRect.color = '#ff6600';
    statsRect.thickness = 3;
    statsRect.background = 'rgba(20, 10, 0, 0.8)';
    statsTexture.addControl(statsRect);

    const statsText = new TextBlock();
    statsText.text = `📊 NETWORK STATISTICS\n\n` +
      `Active Nodes: 8\n` +
      `Total Jobs: 1,247\n` +
      `Success Rate: 98.5%\n` +
      `Avg Response: 2.3s\n` +
      `Total Earnings: 12.5 ETH\n\n` +
      `🔥 Status: ONLINE`;
    statsText.color = '#ff9944';
    statsText.fontSize = 42;
    statsText.textWrapping = true;
    statsText.fontFamily = 'monospace';
    statsText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    statsText.paddingLeft = '40px';
    statsRect.addControl(statsText);
  }

  /**
   * Create label above mesh
   */
  private createNodeLabel(mesh: any, title: string, subtitle: string) {
    const plane = MeshBuilder.CreatePlane(
      `label_${mesh.name}`,
      { width: 3, height: 1 },
      this.scene
    );
    plane.position = mesh.position.add(new Vector3(0, 2, 0));
    plane.billboardMode = 7;

    const texture = AdvancedDynamicTexture.CreateForMesh(plane);

    const titleText = new TextBlock();
    titleText.text = title;
    titleText.color = '#ffffff';
    titleText.fontSize = 72;
    titleText.fontWeight = 'bold';
    titleText.top = '-25%';
    texture.addControl(titleText);

    const subtitleText = new TextBlock();
    subtitleText.text = subtitle;
    subtitleText.color = '#aaccff';
    subtitleText.fontSize = 48;
    subtitleText.top = '25%';
    texture.addControl(subtitleText);
  }

  /**
   * Setup animations
   */
  private setupAnimations() {
    // Rotate central hub
    this.scene.registerBeforeRender(() => {
      const hub = this.scene.getMeshByName('centralHub');
      if (hub) {
        hub.rotation.y += 0.01;
      }

      // Rotate node rings
      this.nodes.forEach((node) => {
        for (let i = 0; i < 3; i++) {
          const ring = this.scene.getMeshByName(`ring${node.id}_${i}`);
          if (ring) {
            ring.rotation.z += 0.005 * (i + 1);
          }
        }
      });
    });
  }

  /**
   * Create pulse animation for nodes
   */
  private createPulseAnimation(mesh: any) {
    const animation = new Animation(
      `pulse_${mesh.name}`,
      'scaling',
      30,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    const keys = [
      { frame: 0, value: new Vector3(1, 1, 1) },
      { frame: 30, value: new Vector3(1.1, 1.1, 1.1) },
      { frame: 60, value: new Vector3(1, 1, 1) },
    ];

    animation.setKeys(keys);
    mesh.animations.push(animation);
    this.scene.beginAnimation(mesh, 0, 60, true);
  }

  /**
   * Create floating animation
   */
  private createFloatingAnimation(mesh: any) {
    const animation = new Animation(
      `float_${mesh.name}`,
      'position.y',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    const startY = mesh.position.y;
    const keys = [
      { frame: 0, value: startY },
      { frame: 60, value: startY + 0.5 },
      { frame: 120, value: startY },
    ];

    animation.setKeys(keys);
    mesh.animations.push(animation);
    this.scene.beginAnimation(mesh, 0, 120, true);
  }

  /**
   * Create rotation animation
   */
  private createRotationAnimation(mesh: any) {
    const animation = new Animation(
      `rotate_${mesh.name}`,
      'rotation.y',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    const keys = [
      { frame: 0, value: 0 },
      { frame: 120, value: Math.PI * 2 },
    ];

    animation.setKeys(keys);
    mesh.animations.push(animation);
    this.scene.beginAnimation(mesh, 0, 120, true);
  }

  /**
   * Setup interactive elements
   */
  private setupInteractions() {
    this.nodes.forEach((node) => {
      node.mesh.actionManager = new ActionManager(this.scene);
      
      // On hover
      node.mesh.actionManager.registerAction(
        new ExecuteCodeAction(
          ActionManager.OnPointerOverTrigger,
          () => {
            node.mesh.scaling = new Vector3(1.2, 1.2, 1.2);
            const mat = node.mesh.material as PBRMaterial;
            mat.emissiveColor = new Color3(0.3, 0.6, 1.0);
          }
        )
      );

      // On hover out
      node.mesh.actionManager.registerAction(
        new ExecuteCodeAction(
          ActionManager.OnPointerOutTrigger,
          () => {
            node.mesh.scaling = new Vector3(1, 1, 1);
            const mat = node.mesh.material as PBRMaterial;
            mat.emissiveColor = new Color3(0.1, 0.3, 0.5);
          }
        )
      );

      // On click
      node.mesh.actionManager.registerAction(
        new ExecuteCodeAction(
          ActionManager.OnPickTrigger,
          () => {
            console.log(`Clicked Node ${node.id + 1}`);
            this.showNodeDetails(node);
          }
        )
      );
    });
  }

  /**
   * Show detailed info when clicking node
   */
  private showNodeDetails(node: any) {
    const details = `Node ${node.id + 1} Details:\n\n` +
      `Status: Active ✓\n` +
      `Jobs Processed: ${Math.floor(Math.random() * 500 + 100)}\n` +
      `Uptime: ${Math.floor(Math.random() * 30 + 70)}%\n` +
      `Earnings: ${(Math.random() * 5 + 1).toFixed(2)} ETH\n` +
      `Response Time: ${(Math.random() * 2 + 1).toFixed(1)}s\n` +
      `Success Rate: ${(Math.random() * 5 + 95).toFixed(1)}%`;
    
    alert(details);
  }

  /**
   * Get the scene
   */
  public getScene(): Scene {
    return this.scene;
  }

  /**
   * Dispose resources
   */
  public dispose() {
    this.dataParticles.forEach(p => p.dispose());
    this.scene.dispose();
    this.engine.dispose();
  }
}
