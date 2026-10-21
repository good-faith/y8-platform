/**
 * agent-avatar.js
 *
 * Fetches agents from y8-server and places 3D avatar meshes in the Babylon.js
 * scene at their geo-coordinates (if they have a location), or arranges them
 * in a default formation near the island center if no location is set.
 *
 * Each agent becomes:
 *   - A glowing orb mesh (tier color, size = performance score)
 *   - A halo torus that rotates
 *   - A point light (active agents only)
 *   - A floating nameplate GUI above the orb
 *   - Pointer-over shows a full detail panel
 *   - Active agents slowly drift toward the nearest zone
 *
 * Usage:
 *   const avatars = new AgentAvatarManager(scene, mapper, Y8_SERVER_URL);
 *   await avatars.loadAndPlace();
 *   avatars.startLiveSync(15000);
 */

const AGENT_TIER_COLOR = {
    alpha:    { hex: '#f5c518', rgb: new BABYLON.Color3(0.96, 0.77, 0.09) },
    beta:     { hex: '#7de8e8', rgb: new BABYLON.Color3(0.49, 0.91, 0.91) },
    standard: { hex: '#6366f1', rgb: new BABYLON.Color3(0.39, 0.40, 0.95) },
};

const AGENT_STATUS_EMISSIVE = {
    active:         new BABYLON.Color3(0.23, 0.51, 0.96),
    idle:           new BABYLON.Color3(0.39, 0.40, 0.95),
    paused:         new BABYLON.Color3(0.28, 0.34, 0.42),
    decommissioned: new BABYLON.Color3(0.12, 0.16, 0.20),
};

class AgentAvatarManager {
    /**
     * @param {BABYLON.Scene} scene
     * @param {CoordinateMapper} mapper
     * @param {string} y8ServerUrl
     * @param {string|null} jwtToken
     */
    constructor(scene, mapper, y8ServerUrl, jwtToken = null) {
        this.scene       = scene;
        this.mapper      = mapper;
        this.y8ServerUrl = y8ServerUrl;
        this.jwtToken    = jwtToken;

        this._avatarGroups = new Map();  // agentId → { orb, halo, light, panel }
        this._syncTimer    = null;

        // Default formation center (island center)
        this._formationCenter = new BABYLON.Vector3(0, 0, 0);
    }

    // ── Public API ────────────────────────────────────────────────────────────

    async loadAndPlace() {
        try {
            const agents = await this._fetchAgents();
            console.log(`[AgentAvatarManager] Placing ${agents.length} agents`);

            // Remove stale agents
            const freshIds = new Set(agents.map(a => a.id));
            for (const [id] of this._avatarGroups) {
                if (!freshIds.has(id)) this._removeAvatar(id);
            }

            agents.forEach((agent, i) => {
                if (!this._avatarGroups.has(agent.id)) {
                    this._placeAvatar(agent, i, agents.length);
                } else {
                    this._updateAvatar(agent);
                }
            });
        } catch (err) {
            console.warn('[AgentAvatarManager] Failed to load agents:', err.message);
        }
    }

    startLiveSync(intervalMs = 15000) {
        this._syncTimer = setInterval(() => this.loadAndPlace(), intervalMs);
    }

    stopLiveSync() {
        if (this._syncTimer) { clearInterval(this._syncTimer); this._syncTimer = null; }
    }

    setToken(token) { this.jwtToken = token; }

    // ── Private ───────────────────────────────────────────────────────────────

    async _fetchAgents() {
        const headers = this.jwtToken
            ? { Authorization: `Bearer ${this.jwtToken}` }
            : {};
        const res = await fetch(`${this.y8ServerUrl}/agents`, { headers });
        if (!res.ok) throw new Error(`y8-server agents: ${res.status}`);
        return res.json();
    }

    _placeAvatar(agent, index, total) {
        const tier    = agent.tier ?? 'standard';
        const color   = AGENT_TIER_COLOR[tier] ?? AGENT_TIER_COLOR.standard;
        const emissive = AGENT_STATUS_EMISSIVE[agent.status] ?? AGENT_STATUS_EMISSIVE.idle;
        const score   = (agent.performanceScore ?? 50) / 100;
        const orbSize = 0.18 + score * 0.12;
        const alive   = agent.status === 'active';

        // ── Position ───────────────────────────────────────────────────────────
        // If agent has a geo location, use it; otherwise use circular formation
        let pos;
        if (agent.location?.lat != null) {
            pos = this.mapper.toVector3(agent.location.lat, agent.location.lng, 0);
            pos.y = orbSize + 0.1; // float just above ground
        } else {
            const angle  = (index / Math.max(total, 1)) * Math.PI * 2;
            const radius = 3 + Math.floor(index / 8);
            pos = new BABYLON.Vector3(
                this._formationCenter.x + Math.cos(angle) * radius,
                orbSize + 0.1,
                this._formationCenter.z + Math.sin(angle) * radius,
            );
        }

        // ── Orb mesh ──────────────────────────────────────────────────────────
        const orb = BABYLON.MeshBuilder.CreateSphere(`agent-orb-${agent.id}`, {
            diameter: orbSize * 2,
            segments: 16,
        }, this.scene);
        orb.position  = pos.clone();
        orb.isPickable = true;

        const orbMat              = new BABYLON.StandardMaterial(`agent-mat-${agent.id}`, this.scene);
        orbMat.diffuseColor       = color.rgb;
        orbMat.emissiveColor      = emissive;
        orbMat.specularColor      = new BABYLON.Color3(1, 1, 1);
        orbMat.specularPower      = 32;
        if (agent.status === 'decommissioned') orbMat.alpha = 0.3;
        orb.material              = orbMat;

        // ── Halo torus ────────────────────────────────────────────────────────
        const halo = BABYLON.MeshBuilder.CreateTorus(`agent-halo-${agent.id}`, {
            diameter:    orbSize * 3.2,
            thickness:   0.018,
            tessellation: 32,
        }, this.scene);
        halo.position = pos.clone();
        const haloMat = new BABYLON.StandardMaterial(`agent-halo-mat-${agent.id}`, this.scene);
        haloMat.emissiveColor = color.rgb;
        haloMat.alpha = alive ? 0.75 : 0.25;
        halo.material = haloMat;

        // ── Point light ───────────────────────────────────────────────────────
        let light = null;
        if (alive) {
            light = new BABYLON.PointLight(`agent-light-${agent.id}`,
                pos.clone(), this.scene);
            light.diffuse    = color.rgb;
            light.intensity  = 0.35;
            light.range      = 3;
        }

        // ── Animate ───────────────────────────────────────────────────────────
        let t = Math.random() * Math.PI * 2; // random phase offset
        this.scene.registerBeforeRender(() => {
            if (orb.isDisposed()) return;
            t += 0.022;
            // Breathing float
            if (alive) orb.position.y = pos.y + 0.06 * Math.sin(t * 2.1);
            // Halo spin
            halo.rotation.x = t * 0.55;
            halo.rotation.y = t * 0.82;
            if (light) light.intensity = 0.2 + 0.15 * Math.sin(t * 2.1);
        });

        // ── Nameplate + detail panel ──────────────────────────────────────────
        const panel = this._createAgentPanel(agent, pos, orbSize, color);

        orb.actionManager = new BABYLON.ActionManager(this.scene);
        orb.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPointerOverTrigger,
            () => {
                panel.isVisible = true;
                orb.scaling.setAll(1.2);
            }
        ));
        orb.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPointerOutTrigger,
            () => {
                panel.isVisible = false;
                orb.scaling.setAll(1.0);
            }
        ));

        this._avatarGroups.set(agent.id, { orb, halo, light, panel });
    }

    _createAgentPanel(agent, pos, orbSize, color) {
        const plane = BABYLON.MeshBuilder.CreatePlane(`agent-panel-${agent.id}`, {
            width: 1.2, height: 0.75,
        }, this.scene);
        plane.position      = new BABYLON.Vector3(pos.x, pos.y + orbSize + 0.6, pos.z);
        plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        plane.isVisible     = false;

        const adt = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane, 512, 256);

        const bg = new BABYLON.GUI.Rectangle();
        bg.background    = 'rgba(5,5,20,0.92)';
        bg.color         = color.hex;
        bg.thickness     = 2;
        bg.cornerRadius  = 12;
        adt.addControl(bg);

        const stack = new BABYLON.GUI.StackPanel();
        stack.paddingLeft = stack.paddingRight = '14px';
        stack.paddingTop  = '8px';
        bg.addControl(stack);

        const addText = (text, size, clr) => {
            const t = new BABYLON.GUI.TextBlock();
            t.text       = text;
            t.fontSize   = size;
            t.color      = clr;
            t.fontFamily = 'Inter, monospace';
            t.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            t.height     = `${size + 6}px`;
            stack.addControl(t);
        };

        const addr = agent.walletAddress;
        const shortAddr = addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : 'unknown';

        addText(`${agent.tier?.toUpperCase()} · ${agent.status}`, 13, color.hex);
        addText(shortAddr,                                          11, '#94a3b8');
        addText(`${agent.purpose ?? 'general'}`,                   11, '#e2e8f0');
        addText(`Load: ${agent.currentLoad}/${agent.maxLoad} · Score: ${agent.performanceScore}`, 10, '#64748b');

        return plane;
    }

    _updateAvatar(agent) {
        // For now just leave existing mesh — future: lerp to new position
    }

    _removeAvatar(agentId) {
        const group = this._avatarGroups.get(agentId);
        if (!group) return;
        Object.values(group).forEach(obj => obj?.dispose?.());
        this._avatarGroups.delete(agentId);
    }
}

window.AgentAvatarManager = AgentAvatarManager;
