/**
 * PKP VR Workspace Scene
 * 
 * Full Babylon.js VR implementation for PKP agents to work in immersive environments.
 * Follows the BabylonXRScene pattern from dev branch with WebXR support.
 * 
 * Scene Types:
 * - code-city: Files as buildings in a 3D city
 * - architecture-space: Services as space stations
 * - git-forest: Branches as tree structures
 * - data-ocean: Data flows as ocean currents
 * - test-arena: Tests as battle arena
 */

class PKPVRWorkspace {
    constructor(canvas, workspaceData) {
        this.canvas = canvas;
        this.workspaceData = workspaceData || {
            id: 'default',
            name: 'PKP Development Workspace',
            sceneType: 'code-city',
            agents: []
        };
        
        this.engine = null;
        this.scene = null;
        this.camera = null;
        this.xr = null;
        this.agentAvatars = new Map();
        this.codeObjects = new Map();
        this.currentSceneType = this.workspaceData.sceneType;
        
        // Stats
        this.fps = 0;
        this.objectCount = 0;
    }
    
    /**
     * Initialize the VR workspace - main entry point
     */
    async init() {
        try {
            console.log('🚀 Initializing PKP VR Workspace...');
            this.updateLoadingText('Creating Babylon.js engine...');
            
            // Create engine with WebXR support
            this.engine = new BABYLON.Engine(this.canvas, true, {
                preserveDrawingBuffer: true,
                stencil: true,
                disableWebGL2Support: false,
                antialias: true
            });
            
            // Create scene
            this.updateLoadingText('Building immersive scene...');
            this.scene = new BABYLON.Scene(this.engine);
            this.scene.clearColor = new BABYLON.Color4(0.05, 0.05, 0.15, 1.0);
            
            // Enable physics (for interactions)
            this.updateLoadingText('Enabling physics...');
            this.scene.enablePhysics(
                new BABYLON.Vector3(0, -9.81, 0),
                new BABYLON.CannonJSPlugin()
            );
            
            // Create camera
            this.updateLoadingText('Setting up camera...');
            this.createCamera();
            
            // Create environment based on scene type
            this.updateLoadingText(`Creating ${this.currentSceneType} environment...`);
            await this.createEnvironment();
            
            // Setup lighting
            this.updateLoadingText('Configuring lighting...');
            this.setupLighting();
            
            // Initialize WebXR
            this.updateLoadingText('Initializing WebXR for VR headsets...');
            await this.initializeXR();
            
            // Create PKP agent avatars
            this.updateLoadingText('Spawning PKP agent avatars...');
            this.createAgentAvatars();
            
            // Setup GUI overlays
            this.updateLoadingText('Creating UI overlays...');
            this.setupGUI();
            
            // Start render loop
            this.updateLoadingText('Starting render loop...');
            this.engine.runRenderLoop(() => {
                this.scene.render();
                this.updateStats();
            });
            
            // Handle window resize
            window.addEventListener('resize', () => {
                this.engine.resize();
            });
            
            // Hide loading screen
            this.hideLoading();
            
            console.log('✅ PKP VR Workspace initialized successfully!');
            
        } catch (error) {
            console.error('❌ Error initializing VR workspace:', error);
            this.updateLoadingText('Error: ' + error.message);
        }
    }
    
    /**
     * Create camera (following BabylonXRScene pattern)
     */
    createCamera() {
        this.camera = new BABYLON.UniversalCamera(
            'camera',
            new BABYLON.Vector3(0, 1.6, -10),
            this.scene
        );
        
        this.camera.setTarget(BABYLON.Vector3.Zero());
        this.camera.attachControl(this.canvas, true);
        
        // Camera settings for VR comfort
        this.camera.speed = 0.5;
        this.camera.angularSensibility = 1000;
        this.camera.minZ = 0.1;
        this.camera.maxZ = 1000;
        
        console.log('📷 Camera created');
    }
    
    /**
     * Setup lighting (following LitComputeVRScene pattern)
     */
    setupLighting() {
        // Hemispheric light (ambient)
        const hemispheric = new BABYLON.HemisphericLight(
            'hemispheric',
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        hemispheric.intensity = 0.6;
        hemispheric.diffuse = new BABYLON.Color3(0.8, 0.9, 1.0);
        hemispheric.groundColor = new BABYLON.Color3(0.2, 0.3, 0.5);
        
        // Directional light (sun)
        const directional = new BABYLON.DirectionalLight(
            'sun',
            new BABYLON.Vector3(-1, -2, -1),
            this.scene
        );
        directional.intensity = 0.8;
        directional.diffuse = new BABYLON.Color3(1.0, 0.95, 0.8);
        
        // Enable shadows
        const shadowGenerator = new BABYLON.ShadowGenerator(1024, directional);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.blurKernel = 32;
        this.shadowGenerator = shadowGenerator;
        
        console.log('💡 Lighting configured');
    }
    
    /**
     * Create environment based on scene type
     */
    async createEnvironment() {
        switch (this.currentSceneType) {
            case 'code-city':
                await this.createCodeCityEnvironment();
                break;
            case 'architecture-space':
                await this.createArchitectureSpaceEnvironment();
                break;
            case 'git-forest':
                await this.createGitForestEnvironment();
                break;
            case 'data-ocean':
                await this.createDataOceanEnvironment();
                break;
            case 'test-arena':
                await this.createTestArenaEnvironment();
                break;
            default:
                await this.createCodeCityEnvironment();
        }
    }
    
    /**
     * CODE CITY: Visualize code as a 3D city where files are buildings
     */
    async createCodeCityEnvironment() {
        console.log('🏙️ Creating Code City environment...');
        
        // Ground (file system root)
        const ground = BABYLON.MeshBuilder.CreateGround('filesystem', {
            width: 100,
            height: 100,
            subdivisions: 4
        }, this.scene);
        
        const groundMaterial = new BABYLON.StandardMaterial('groundMat', this.scene);
        groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.3, 0.2);
        groundMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        ground.material = groundMaterial;
        ground.receiveShadows = true;
        ground.checkCollisions = true;
        
        // Grid overlay
        const gridMaterial = new BABYLON.GridMaterial('gridMat', this.scene);
        gridMaterial.gridRatio = 2;
        gridMaterial.majorUnitFrequency = 5;
        gridMaterial.minorUnitVisibility = 0.3;
        gridMaterial.mainColor = new BABYLON.Color3(0.4, 0.6, 0.4);
        gridMaterial.lineColor = new BABYLON.Color3(0.2, 0.4, 0.2);
        
        // Create sample code files as buildings
        const sampleFiles = [
            { path: 'src/main.ts', lines: 150, complexity: 'low', type: 'typescript' },
            { path: 'src/app.module.ts', lines: 80, complexity: 'medium', type: 'typescript' },
            { path: 'src/app.controller.ts', lines: 200, complexity: 'high', type: 'typescript' },
            { path: 'src/app.service.ts', lines: 120, complexity: 'medium', type: 'typescript' },
            { path: 'src/npe/npe.module.ts', lines: 60, complexity: 'low', type: 'typescript' },
            { path: 'src/npe/pkp.controller.ts', lines: 300, complexity: 'high', type: 'typescript' },
            { path: 'src/lit-compute/coordinator.ts', lines: 250, complexity: 'high', type: 'typescript' },
            { path: 'package.json', lines: 50, complexity: 'low', type: 'json' }
        ];
        
        sampleFiles.forEach((file, index) => {
            this.createFileBuilding(file, index);
        });
        
        // Add skybox
        this.createSkybox();
        
        // Store ground for XR floor detection
        this.ground = ground;
        
        this.objectCount = sampleFiles.length + 2; // files + ground + skybox
    }
    
    /**
     * Create a building representing a code file
     */
    createFileBuilding(file, index) {
        const height = Math.max(1, file.lines / 50); // Height based on lines of code
        const width = 2;
        const depth = 2;
        
        // Create building mesh
        const building = BABYLON.MeshBuilder.CreateBox(file.path, {
            height: height,
            width: width,
            depth: depth
        }, this.scene);
        
        // Position in grid
        const row = Math.floor(index / 4);
        const col = index % 4;
        building.position = new BABYLON.Vector3(
            col * 6 - 9,
            height / 2,
            row * 6 - 9
        );
        
        // Material based on complexity
        const material = new BABYLON.StandardMaterial(file.path + '_mat', this.scene);
        
        switch (file.complexity) {
            case 'low':
                material.diffuseColor = new BABYLON.Color3(0.2, 0.8, 0.2); // Green
                material.emissiveColor = new BABYLON.Color3(0.05, 0.2, 0.05);
                break;
            case 'medium':
                material.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.2); // Yellow
                material.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.05);
                break;
            case 'high':
                material.diffuseColor = new BABYLON.Color3(0.8, 0.2, 0.2); // Red
                material.emissiveColor = new BABYLON.Color3(0.2, 0.05, 0.05);
                break;
        }
        
        material.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        building.material = material;
        
        // Enable shadows
        this.shadowGenerator.addShadowCaster(building);
        building.receiveShadows = true;
        
        // Add glow effect
        const glowLayer = this.scene.glowLayer || new BABYLON.GlowLayer('glow', this.scene);
        glowLayer.addIncludedOnlyMesh(building);
        this.scene.glowLayer = glowLayer;
        
        // Add label above building
        this.createFloatingLabel(file.path, building.position.add(new BABYLON.Vector3(0, height / 2 + 1, 0)));
        
        // Make interactive
        building.actionManager = new BABYLON.ActionManager(this.scene);
        building.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPickTrigger,
                () => {
                    console.log(`📄 Selected file: ${file.path}`);
                    this.highlightObject(building);
                    this.showFileDetails(file);
                }
            )
        );
        
        // Store reference
        this.codeObjects.set(file.path, building);
    }
    
    /**
     * ARCHITECTURE SPACE: Visualize services as space stations
     */
    async createArchitectureSpaceEnvironment() {
        console.log('🚀 Creating Architecture Space environment...');
        
        // Starfield background
        const starfield = BABYLON.MeshBuilder.CreateSphere('starfield', {
            diameter: 500,
            sideOrientation: BABYLON.Mesh.BACKSIDE
        }, this.scene);
        
        const starfieldMat = new BABYLON.StandardMaterial('starfieldMat', this.scene);
        starfieldMat.diffuseTexture = new BABYLON.Texture('https://www.babylonjs-playground.com/textures/stars.jpg', this.scene);
        starfieldMat.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.3);
        starfield.material = starfieldMat;
        
        // Platform
        const platform = BABYLON.MeshBuilder.CreateDisc('platform', {
            radius: 30,
            tessellation: 64
        }, this.scene);
        platform.rotation.x = Math.PI / 2;
        platform.position.y = -1;
        
        const platformMat = new BABYLON.StandardMaterial('platformMat', this.scene);
        platformMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.2);
        platformMat.emissiveColor = new BABYLON.Color3(0.05, 0.05, 0.1);
        platformMat.alpha = 0.7;
        platform.material = platformMat;
        
        // Create sample services as space stations
        const sampleServices = [
            { name: 'API Gateway', status: 'healthy', connections: 5 },
            { name: 'Auth Service', status: 'healthy', connections: 3 },
            { name: 'Database', status: 'warning', connections: 8 },
            { name: 'Cache (Redis)', status: 'healthy', connections: 4 },
            { name: 'Queue Service', status: 'healthy', connections: 2 }
        ];
        
        sampleServices.forEach((service, index) => {
            this.createServiceStation(service, index, sampleServices.length);
        });
        
        // Central hub
        this.createCentralHub();
        
        this.ground = platform;
        this.objectCount = sampleServices.length + 3; // services + platform + hub + starfield
    }
    
    /**
     * Create a space station representing a service
     */
    createServiceStation(service, index, total) {
        const angle = (index / total) * Math.PI * 2;
        const radius = 12;
        
        // Main sphere
        const station = BABYLON.MeshBuilder.CreateSphere(service.name, {
            diameter: 3,
            segments: 32
        }, this.scene);
        
        station.position = new BABYLON.Vector3(
            Math.cos(angle) * radius,
            2,
            Math.sin(angle) * radius
        );
        
        // Material based on health status
        const material = new BABYLON.PBRMetallicRoughnessMaterial(service.name + '_mat', this.scene);
        
        switch (service.status) {
            case 'healthy':
                material.baseColor = new BABYLON.Color3(0.2, 0.8, 0.2);
                material.emissiveColor = new BABYLON.Color3(0.1, 0.4, 0.1);
                break;
            case 'warning':
                material.baseColor = new BABYLON.Color3(0.8, 0.6, 0.2);
                material.emissiveColor = new BABYLON.Color3(0.4, 0.3, 0.1);
                break;
            case 'error':
                material.baseColor = new BABYLON.Color3(0.8, 0.2, 0.2);
                material.emissiveColor = new BABYLON.Color3(0.4, 0.1, 0.1);
                break;
        }
        
        material.metallic = 0.8;
        material.roughness = 0.2;
        station.material = material;
        
        // Rotating ring around station
        const ring = BABYLON.MeshBuilder.CreateTorus(service.name + '_ring', {
            diameter: 4,
            thickness: 0.2,
            tessellation: 32
        }, this.scene);
        ring.parent = station;
        ring.rotation.x = Math.PI / 2;
        
        const ringMat = new BABYLON.StandardMaterial(service.name + '_ringMat', this.scene);
        ringMat.diffuseColor = new BABYLON.Color3(0.5, 0.7, 1.0);
        ringMat.emissiveColor = new BABYLON.Color3(0.2, 0.3, 0.5);
        ring.material = ringMat;
        
        // Animate rotation
        this.scene.registerBeforeRender(() => {
            ring.rotation.z += 0.01;
        });
        
        // Add label
        this.createFloatingLabel(service.name, station.position.add(new BABYLON.Vector3(0, 2.5, 0)));
        
        // Make interactive
        station.actionManager = new BABYLON.ActionManager(this.scene);
        station.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPickTrigger,
                () => {
                    console.log(`🚀 Selected service: ${service.name}`);
                    this.highlightObject(station);
                }
            )
        );
        
        this.codeObjects.set(service.name, station);
    }
    
    /**
     * Create central hub for architecture space
     */
    createCentralHub() {
        const hub = BABYLON.MeshBuilder.CreateSphere('centralHub', {
            diameter: 4,
            segments: 32
        }, this.scene);
        hub.position = new BABYLON.Vector3(0, 2, 0);
        
        const hubMat = new BABYLON.PBRMetallicRoughnessMaterial('hubMat', this.scene);
        hubMat.baseColor = new BABYLON.Color3(0.3, 0.5, 1.0);
        hubMat.emissiveColor = new BABYLON.Color3(0.1, 0.2, 0.4);
        hubMat.metallic = 1.0;
        hubMat.roughness = 0.1;
        hub.material = hubMat;
        
        // Pulsing animation
        let scale = 1.0;
        let growing = true;
        this.scene.registerBeforeRender(() => {
            if (growing) {
                scale += 0.005;
                if (scale >= 1.1) growing = false;
            } else {
                scale -= 0.005;
                if (scale <= 0.9) growing = true;
            }
            hub.scaling = new BABYLON.Vector3(scale, scale, scale);
        });
        
        this.createFloatingLabel('Central Hub', hub.position.add(new BABYLON.Vector3(0, 3, 0)));
    }
    
    /**
     * GIT FOREST: Visualize branches as trees
     */
    async createGitForestEnvironment() {
        console.log('🌳 Creating Git Forest environment...');
        
        // Forest ground
        const ground = BABYLON.MeshBuilder.CreateGround('ground', {
            width: 100,
            height: 100
        }, this.scene);
        
        const groundMat = new BABYLON.StandardMaterial('groundMat', this.scene);
        groundMat.diffuseColor = new BABYLON.Color3(0.3, 0.5, 0.2);
        ground.material = groundMat;
        ground.receiveShadows = true;
        
        // Sample Git branches as trees
        const sampleBranches = [
            { name: 'main', commits: 150, active: true },
            { name: 'dev', commits: 85, active: true },
            { name: 'feature/vr-tools', commits: 12, active: true },
            { name: 'feature/pkp-agents', commits: 8, active: true },
            { name: 'hotfix/auth-bug', commits: 3, active: false }
        ];
        
        sampleBranches.forEach((branch, index) => {
            this.createBranchTree(branch, index);
        });
        
        this.createSkybox();
        this.ground = ground;
        this.objectCount = sampleBranches.length + 2;
    }
    
    /**
     * Create tree representing a Git branch
     */
    createBranchTree(branch, index) {
        const height = Math.max(3, branch.commits / 20);
        
        // Trunk (branch history)
        const trunk = BABYLON.MeshBuilder.CreateCylinder(branch.name + '_trunk', {
            height: height,
            diameterTop: 0.5,
            diameterBottom: 0.8,
            tessellation: 16
        }, this.scene);
        
        trunk.position = new BABYLON.Vector3(
            (index - 2) * 8,
            height / 2,
            0
        );
        
        const trunkMat = new BABYLON.StandardMaterial(branch.name + '_trunkMat', this.scene);
        trunkMat.diffuseColor = new BABYLON.Color3(0.4, 0.3, 0.2);
        trunk.material = trunkMat;
        this.shadowGenerator.addShadowCaster(trunk);
        
        // Foliage (current state)
        const foliage = BABYLON.MeshBuilder.CreateSphere(branch.name + '_foliage', {
            diameter: height * 0.6,
            segments: 16
        }, this.scene);
        
        foliage.position = trunk.position.add(new BABYLON.Vector3(0, height / 2 + 1, 0));
        
        const foliageMat = new BABYLON.StandardMaterial(branch.name + '_foliageMat', this.scene);
        foliageMat.diffuseColor = branch.active 
            ? new BABYLON.Color3(0.2, 0.8, 0.2) 
            : new BABYLON.Color3(0.6, 0.6, 0.6);
        foliageMat.emissiveColor = branch.active 
            ? new BABYLON.Color3(0.05, 0.2, 0.05) 
            : new BABYLON.Color3(0, 0, 0);
        foliage.material = foliageMat;
        this.shadowGenerator.addShadowCaster(foliage);
        
        // Label
        this.createFloatingLabel(branch.name, foliage.position.add(new BABYLON.Vector3(0, 2, 0)));
        
        // Make interactive
        foliage.actionManager = new BABYLON.ActionManager(this.scene);
        foliage.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPickTrigger,
                () => {
                    console.log(`🌳 Selected branch: ${branch.name}`);
                    this.highlightObject(foliage);
                }
            )
        );
        
        this.codeObjects.set(branch.name, { trunk, foliage });
    }
    
    /**
     * DATA OCEAN: Visualize data flows as ocean
     */
    async createDataOceanEnvironment() {
        console.log('🌊 Creating Data Ocean environment...');
        
        // Ocean surface
        const ocean = BABYLON.MeshBuilder.CreateGround('ocean', {
            width: 100,
            height: 100,
            subdivisions: 32
        }, this.scene);
        
        const oceanMat = new BABYLON.StandardMaterial('oceanMat', this.scene);
        oceanMat.diffuseColor = new BABYLON.Color3(0.1, 0.3, 0.6);
        oceanMat.specularColor = new BABYLON.Color3(0.5, 0.7, 1.0);
        oceanMat.emissiveColor = new BABYLON.Color3(0.05, 0.1, 0.2);
        oceanMat.alpha = 0.8;
        ocean.material = oceanMat;
        
        // Animate waves
        const time = { value: 0 };
        this.scene.registerBeforeRender(() => {
            time.value += 0.01;
            const positions = ocean.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] = Math.sin(positions[i] * 0.2 + time.value) * 0.5 + 
                                   Math.cos(positions[i + 2] * 0.2 + time.value) * 0.5;
            }
            ocean.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
        });
        
        // Data flow particles
        this.createDataFlowParticles();
        
        this.createSkybox();
        this.ground = ocean;
        this.objectCount = 3; // ocean + particles + skybox
    }
    
    /**
     * Create particle system for data flows
     */
    createDataFlowParticles() {
        const particleSystem = new BABYLON.ParticleSystem('dataFlow', 2000, this.scene);
        
        particleSystem.particleTexture = new BABYLON.Texture(
            'https://www.babylonjs-playground.com/textures/flare.png',
            this.scene
        );
        
        particleSystem.emitter = new BABYLON.Vector3(0, 0, 0);
        particleSystem.minEmitBox = new BABYLON.Vector3(-30, 0, -30);
        particleSystem.maxEmitBox = new BABYLON.Vector3(30, 0, 30);
        
        particleSystem.color1 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
        particleSystem.color2 = new BABYLON.Color4(0.5, 0.8, 1.0, 1.0);
        particleSystem.colorDead = new BABYLON.Color4(0.1, 0.2, 0.5, 0.0);
        
        particleSystem.minSize = 0.3;
        particleSystem.maxSize = 1.0;
        
        particleSystem.minLifeTime = 2;
        particleSystem.maxLifeTime = 5;
        
        particleSystem.emitRate = 100;
        
        particleSystem.direction1 = new BABYLON.Vector3(-1, 1, -1);
        particleSystem.direction2 = new BABYLON.Vector3(1, 1, 1);
        
        particleSystem.minEmitPower = 1;
        particleSystem.maxEmitPower = 3;
        particleSystem.updateSpeed = 0.01;
        
        particleSystem.start();
    }
    
    /**
     * TEST ARENA: Visualize tests as battle arena
     */
    async createTestArenaEnvironment() {
        console.log('⚔️ Creating Test Arena environment...');
        
        // Arena floor
        const arena = BABYLON.MeshBuilder.CreateDisc('arena', {
            radius: 30,
            tessellation: 64
        }, this.scene);
        arena.rotation.x = Math.PI / 2;
        
        const arenaMat = new BABYLON.StandardMaterial('arenaMat', this.scene);
        arenaMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.4);
        arenaMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        arena.material = arenaMat;
        arena.receiveShadows = true;
        
        // Arena walls
        const wall = BABYLON.MeshBuilder.CreateTorus('wall', {
            diameter: 60,
            thickness: 2,
            tessellation: 32
        }, this.scene);
        wall.rotation.x = Math.PI / 2;
        wall.position.y = 1;
        
        const wallMat = new BABYLON.StandardMaterial('wallMat', this.scene);
        wallMat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.6);
        wallMat.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.2);
        wall.material = wallMat;
        
        // Sample tests
        const sampleTests = [
            { name: 'Unit Tests', passed: 45, failed: 2, status: 'warning' },
            { name: 'Integration Tests', passed: 23, failed: 0, status: 'passed' },
            { name: 'E2E Tests', passed: 12, failed: 3, status: 'failed' }
        ];
        
        sampleTests.forEach((test, index) => {
            this.createTestTarget(test, index, sampleTests.length);
        });
        
        this.createSkybox();
        this.ground = arena;
        this.objectCount = sampleTests.length + 3;
    }
    
    /**
     * Create test target
     */
    createTestTarget(test, index, total) {
        const angle = (index / total) * Math.PI * 2;
        const radius = 12;
        
        const target = BABYLON.MeshBuilder.CreateCylinder(test.name, {
            height: test.passed / 5,
            diameter: 2,
            tessellation: 32
        }, this.scene);
        
        target.position = new BABYLON.Vector3(
            Math.cos(angle) * radius,
            (test.passed / 5) / 2,
            Math.sin(angle) * radius
        );
        
        const mat = new BABYLON.StandardMaterial(test.name + '_mat', this.scene);
        
        switch (test.status) {
            case 'passed':
                mat.diffuseColor = new BABYLON.Color3(0.2, 0.8, 0.2);
                mat.emissiveColor = new BABYLON.Color3(0.05, 0.2, 0.05);
                break;
            case 'warning':
                mat.diffuseColor = new BABYLON.Color3(0.8, 0.6, 0.2);
                mat.emissiveColor = new BABYLON.Color3(0.2, 0.15, 0.05);
                break;
            case 'failed':
                mat.diffuseColor = new BABYLON.Color3(0.8, 0.2, 0.2);
                mat.emissiveColor = new BABYLON.Color3(0.2, 0.05, 0.05);
                break;
        }
        
        target.material = mat;
        this.shadowGenerator.addShadowCaster(target);
        
        this.createFloatingLabel(test.name, target.position.add(new BABYLON.Vector3(0, (test.passed / 5) / 2 + 2, 0)));
        
        target.actionManager = new BABYLON.ActionManager(this.scene);
        target.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPickTrigger,
                () => {
                    console.log(`⚔️ Selected test: ${test.name}`);
                    this.highlightObject(target);
                }
            )
        );
        
        this.codeObjects.set(test.name, target);
    }
    
    /**
     * Create skybox (following BabylonXRScene pattern)
     */
    createSkybox() {
        const skybox = BABYLON.MeshBuilder.CreateBox('skybox', {
            size: 500
        }, this.scene);
        
        const skyboxMat = new BABYLON.StandardMaterial('skyboxMat', this.scene);
        skyboxMat.backFaceCulling = false;
        skyboxMat.disableLighting = true;
        
        // Gradient skybox
        skyboxMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMat.emissiveColor = new BABYLON.Color3(0.05, 0.1, 0.2);
        
        skybox.material = skyboxMat;
        skybox.infiniteDistance = true;
    }
    
    /**
     * Initialize WebXR for VR headset support (following BabylonXRScene pattern)
     */
    async initializeXR() {
        try {
            // Check WebXR support
            const supported = await BABYLON.WebXRSessionManager.IsSessionSupportedAsync('immersive-vr');
            
            if (!supported) {
                console.warn('⚠️ WebXR not supported on this device');
                return;
            }
            
            // Create default XR experience
            this.xr = await this.scene.createDefaultXRExperienceAsync({
                floorMeshes: [this.ground],
                disableTeleportation: false,
                disablePointerSelection: false,
                disableDefaultUI: false,
                inputOptions: {
                    doNotLoadControllerMeshes: false
                }
            });
            
            console.log('✅ WebXR initialized - VR headset support enabled');
            
            // XR session events
            this.xr.baseExperience.onStateChangedObservable.add((state) => {
                console.log('🥽 XR State:', state);
                if (state === BABYLON.WebXRState.IN_XR) {
                    console.log('🎮 Entered VR mode');
                    this.onEnterVR();
                } else if (state === BABYLON.WebXRState.NOT_IN_XR) {
                    console.log('🖥️ Exited VR mode');
                    this.onExitVR();
                }
            });
            
        } catch (error) {
            console.error('❌ Error initializing WebXR:', error);
        }
    }
    
    /**
     * Create PKP agent avatars in VR space
     */
    createAgentAvatars() {
        const agents = this.workspaceData.agents || [
            { id: 'pkp-1', name: 'PKP Lead', role: 'lead', status: 'working' },
            { id: 'pkp-2', name: 'PKP Developer', role: 'developer', status: 'idle' }
        ];
        
        agents.forEach((agent, index) => {
            this.createAgentAvatar(agent, index);
        });
        
        console.log(`🤖 Created ${agents.length} PKP agent avatars`);
    }
    
    /**
     * Create individual agent avatar
     */
    createAgentAvatar(agent, index) {
        // Avatar body (sphere)
        const avatar = BABYLON.MeshBuilder.CreateSphere(agent.id, {
            diameter: 1,
            segments: 16
        }, this.scene);
        
        avatar.position = new BABYLON.Vector3(
            -15 + (index * 5),
            1,
            -15
        );
        
        // Material based on status
        const material = new BABYLON.StandardMaterial(agent.id + '_mat', this.scene);
        
        if (agent.status === 'working') {
            material.diffuseColor = new BABYLON.Color3(0.2, 0.6, 1.0);
            material.emissiveColor = new BABYLON.Color3(0.1, 0.3, 0.5);
        } else {
            material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
            material.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        }
        
        avatar.material = material;
        
        // Floating animation
        let height = 1;
        let rising = true;
        this.scene.registerBeforeRender(() => {
            if (rising) {
                height += 0.01;
                if (height >= 1.5) rising = false;
            } else {
                height -= 0.01;
                if (height <= 1) rising = true;
            }
            avatar.position.y = height;
        });
        
        // Label
        this.createFloatingLabel(agent.name, avatar.position.add(new BABYLON.Vector3(0, 1.5, 0)), true);
        
        this.agentAvatars.set(agent.id, avatar);
    }
    
    /**
     * Create floating 3D text label
     */
    createFloatingLabel(text, position, followParent = false) {
        const plane = BABYLON.MeshBuilder.CreatePlane('label_' + text, {
            width: 4,
            height: 1
        }, this.scene);
        
        plane.position = position;
        plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane);
        
        const textBlock = new BABYLON.GUI.TextBlock();
        textBlock.text = text;
        textBlock.color = 'white';
        textBlock.fontSize = 48;
        textBlock.fontWeight = 'bold';
        textBlock.outlineWidth = 4;
        textBlock.outlineColor = 'black';
        
        advancedTexture.addControl(textBlock);
        
        return plane;
    }
    
    /**
     * Setup GUI overlays
     */
    setupGUI() {
        // This could be expanded with more interactive UI elements
        console.log('🎨 GUI overlays ready');
    }
    
    /**
     * Highlight selected object
     */
    highlightObject(mesh) {
        // Remove previous highlight
        if (this.highlightedMesh && this.highlightLayer) {
            this.highlightLayer.removeMesh(this.highlightedMesh);
        }
        
        // Create highlight layer if needed
        if (!this.highlightLayer) {
            this.highlightLayer = new BABYLON.HighlightLayer('highlight', this.scene);
        }
        
        // Add highlight
        this.highlightLayer.addMesh(mesh, BABYLON.Color3.White());
        this.highlightedMesh = mesh;
    }
    
    /**
     * Show file details (placeholder)
     */
    showFileDetails(file) {
        console.log('📊 File Details:', file);
        // Could open a GUI panel with details
    }
    
    /**
     * Enter VR mode
     */
    async enterVRMode() {
        if (this.xr && this.xr.baseExperience) {
            try {
                await this.xr.baseExperience.enterXRAsync('immersive-vr', 'local-floor');
            } catch (error) {
                console.error('❌ Could not enter VR mode:', error);
                alert('VR headset not detected or WebXR not supported');
            }
        } else {
            alert('WebXR not initialized');
        }
    }
    
    /**
     * VR mode entered
     */
    onEnterVR() {
        console.log('🎮 Welcome to VR!');
        // Could add VR-specific UI or interactions
    }
    
    /**
     * VR mode exited
     */
    onExitVR() {
        console.log('🖥️ Back to desktop mode');
    }
    
    /**
     * Switch scene type
     */
    async switchSceneType(newType) {
        console.log(`🔄 Switching to ${newType} scene...`);
        
        // Clear existing objects
        this.codeObjects.forEach((obj) => {
            if (obj.dispose) {
                obj.dispose();
            } else if (obj.trunk) {
                obj.trunk.dispose();
                obj.foliage.dispose();
            }
        });
        this.codeObjects.clear();
        
        // Update scene type
        this.currentSceneType = newType;
        
        // Recreate environment
        await this.createEnvironment();
        
        // Update UI
        document.getElementById('scene-type').textContent = newType;
        
        console.log('✅ Scene switched successfully');
    }
    
    /**
     * Update stats display
     */
    updateStats() {
        this.fps = Math.round(this.engine.getFps());
        
        if (document.getElementById('fps')) {
            document.getElementById('fps').textContent = this.fps;
            document.getElementById('object-count').textContent = this.objectCount;
            document.getElementById('agent-count').textContent = this.agentAvatars.size;
        }
    }
    
    /**
     * Update loading text
     */
    updateLoadingText(text) {
        const loadingText = document.getElementById('loading-text');
        if (loadingText) {
            loadingText.textContent = text;
        }
    }
    
    /**
     * Hide loading screen
     */
    hideLoading() {
        const loading = document.getElementById('loading');
        const uiPanel = document.getElementById('ui-panel');
        const stats = document.getElementById('stats');
        
        if (loading) loading.classList.add('hidden');
        if (uiPanel) uiPanel.classList.remove('hidden');
        if (stats) stats.classList.remove('hidden');
    }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.getElementById('renderCanvas');
    
    // Sample workspace data
    const workspaceData = {
        id: 'workspace-1',
        name: 'The Beach - XR Development',
        sceneType: 'code-city',
        agents: [
            { id: 'pkp-lead', name: 'PKP Lead', role: 'lead', status: 'working' },
            { id: 'pkp-dev', name: 'PKP Developer', role: 'developer', status: 'working' }
        ]
    };
    
    const workspace = new PKPVRWorkspace(canvas, workspaceData);
    await workspace.init();
    
    // Setup UI controls
    document.getElementById('enterVR').addEventListener('click', async () => {
        await workspace.enterVRMode();
    });
    
    const sceneTypes = ['code-city', 'architecture-space', 'git-forest', 'data-ocean', 'test-arena'];
    let currentSceneIndex = 0;
    
    document.getElementById('switchScene').addEventListener('click', async () => {
        currentSceneIndex = (currentSceneIndex + 1) % sceneTypes.length;
        await workspace.switchSceneType(sceneTypes[currentSceneIndex]);
    });
    
    document.getElementById('toggleAgents').addEventListener('click', () => {
        workspace.agentAvatars.forEach((avatar) => {
            avatar.isVisible = !avatar.isVisible;
        });
    });
    
    // Update workspace name in UI
    document.getElementById('workspace-name').textContent = workspaceData.name;
    
    // Expose workspace globally for debugging
    window.pkpWorkspace = workspace;
    
    console.log('🎮 PKP VR Workspace ready! Use window.pkpWorkspace to access scene.');
});

export { PKPVRWorkspace };
