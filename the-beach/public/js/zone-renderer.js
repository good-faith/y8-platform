/**
 * zone-renderer.js
 *
 * Fetches safe purchase zones from y8-server and renders them in the
 * Babylon.js scene as glowing ground circles with floating info panels.
 *
 * Each zone becomes:
 *   - A disc mesh on the ground (colour-coded by safety rating)
 *   - A pulsing cylinder border / dome outline
 *   - A floating BabylonJS GUI plane (rises on pointer-enter / gaze)
 *   - A point light source tinted by rating
 *
 * Usage:
 *   const renderer = new ZoneRenderer(scene, mapper, Y8_SERVER_URL);
 *   await renderer.loadAndRender();          // fetches + renders all zones
 *   renderer.startLiveSync(30000);           // refresh every 30 s
 */

const ZONE_COLORS = {
    verified:  { hex: '#22c55e', rgb: new BABYLON.Color3(0.13, 0.77, 0.37) },
    community: { hex: '#f59e0b', rgb: new BABYLON.Color3(0.96, 0.62, 0.04) },
    unrated:   { hex: '#6366f1', rgb: new BABYLON.Color3(0.39, 0.40, 0.95) },
    flagged:   { hex: '#ef4444', rgb: new BABYLON.Color3(0.94, 0.27, 0.27) },
};

class ZoneRenderer {
    /**
     * @param {BABYLON.Scene} scene
     * @param {CoordinateMapper} mapper
     * @param {string} y8ServerUrl  e.g. 'http://localhost:3001/api/v1'
     * @param {string|null} jwtToken  Bearer token for authenticated requests
     */
    constructor(scene, mapper, y8ServerUrl, jwtToken = null) {
        this.scene        = scene;
        this.mapper       = mapper;
        this.y8ServerUrl  = y8ServerUrl;
        this.jwtToken     = jwtToken;

        // Tracks rendered zone meshes by zone id
        this._meshGroups  = new Map();   // zoneId → { disc, border, light, guiPlane }
        this._syncTimer   = null;
        this._advTex      = null;        // shared AdvancedDynamicTexture for GUI
    }

    // ── Public API ────────────────────────────────────────────────────────────

    async loadAndRender() {
        try {
            const zones = await this._fetchZones();
            console.log(`[ZoneRenderer] Rendering ${zones.length} safe zones`);
            zones.forEach(z => this._renderZone(z));
        } catch (err) {
            console.warn('[ZoneRenderer] Failed to load zones:', err.message);
        }
    }

    startLiveSync(intervalMs = 30000) {
        this._syncTimer = setInterval(() => this.loadAndRender(), intervalMs);
    }

    stopLiveSync() {
        if (this._syncTimer) { clearInterval(this._syncTimer); this._syncTimer = null; }
    }

    setToken(token) { this.jwtToken = token; }

    // ── Private ───────────────────────────────────────────────────────────────

    async _fetchZones() {
        const headers = this.jwtToken
            ? { Authorization: `Bearer ${this.jwtToken}` }
            : {};
        const res = await fetch(`${this.y8ServerUrl}/geo/zones`, { headers });
        if (!res.ok) throw new Error(`y8-server geo/zones: ${res.status}`);
        return res.json();
    }

    _renderZone(zone) {
        if (!zone.center && !zone.points) return;
        if (this._meshGroups.has(zone.id)) this._removeZone(zone.id);

        const color    = ZONE_COLORS[zone.safetyRating] ?? ZONE_COLORS.unrated;
        const center   = zone.center ?? this._polygonCentroid(zone.points);
        const pos      = this.mapper.toVector3(center.lat, center.lng, 0);
        const radius   = zone.radiusMeters
            ? this.mapper.radiusToUnits(zone.radiusMeters)
            : this.mapper.radiusToUnits(500);   // default 500m for polygons

        // ── Ground disc ──────────────────────────────────────────────────────
        const disc = BABYLON.MeshBuilder.CreateDisc(`zone-disc-${zone.id}`, {
            radius,
            tessellation: 48,
        }, this.scene);
        disc.rotation.x    = Math.PI / 2;
        disc.position      = new BABYLON.Vector3(pos.x, 0.05, pos.z); // just above ground
        disc.isPickable    = true;

        const discMat             = new BABYLON.StandardMaterial(`zone-mat-${zone.id}`, this.scene);
        discMat.diffuseColor      = color.rgb;
        discMat.emissiveColor     = color.rgb.scale(0.25);
        discMat.alpha             = 0.30;
        discMat.backFaceCulling   = false;
        disc.material             = discMat;

        // ── Border ring ──────────────────────────────────────────────────────
        const border = BABYLON.MeshBuilder.CreateTorus(`zone-border-${zone.id}`, {
            diameter:  radius * 2,
            thickness: 0.04,
            tessellation: 48,
        }, this.scene);
        border.position        = new BABYLON.Vector3(pos.x, 0.06, pos.z);
        const borderMat        = new BABYLON.StandardMaterial(`zone-border-mat-${zone.id}`, this.scene);
        borderMat.emissiveColor = color.rgb;
        border.material        = borderMat;

        // ── Point light ──────────────────────────────────────────────────────
        const light = new BABYLON.PointLight(`zone-light-${zone.id}`,
            new BABYLON.Vector3(pos.x, 1.0, pos.z), this.scene);
        light.diffuse  = color.rgb;
        light.specular = color.rgb;
        light.intensity = 0.4;
        light.range     = radius * 3;

        // ── Pulse animation on border ─────────────────────────────────────────
        let t = 0;
        this.scene.registerBeforeRender(() => {
            if (!border || border.isDisposed()) return;
            t += 0.025;
            borderMat.alpha = 0.5 + 0.35 * Math.sin(t);
            light.intensity = 0.25 + 0.2 * Math.sin(t * 1.3);
        });

        // ── Floating GUI panel (on pointer-over) ──────────────────────────────
        const guiPlane = this._createZonePanel(zone, pos, radius, color);

        // Pointer-over show/hide
        disc.actionManager = new BABYLON.ActionManager(this.scene);
        disc.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPointerOverTrigger,
            () => { guiPlane.isVisible = true; }
        ));
        disc.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPointerOutTrigger,
            () => { guiPlane.isVisible = false; }
        ));

        this._meshGroups.set(zone.id, { disc, border, light, guiPlane });
    }

    _createZonePanel(zone, pos, radius, color) {
        const plane = BABYLON.MeshBuilder.CreatePlane(`zone-panel-${zone.id}`, {
            width: 1.4, height: 0.8,
        }, this.scene);
        plane.position   = new BABYLON.Vector3(pos.x, 2.0, pos.z);
        plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        plane.isVisible  = false;

        const adt = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane, 512, 256);

        const bg = new BABYLON.GUI.Rectangle();
        bg.background      = 'rgba(5,5,20,0.88)';
        bg.color           = color.hex;
        bg.thickness       = 2;
        bg.cornerRadius    = 12;
        adt.addControl(bg);

        const stack = new BABYLON.GUI.StackPanel();
        stack.paddingLeft = stack.paddingRight = '16px';
        stack.paddingTop  = '10px';
        bg.addControl(stack);

        const addText = (text, size, clr) => {
            const t = new BABYLON.GUI.TextBlock();
            t.text          = text;
            t.fontSize      = size;
            t.color         = clr;
            t.fontFamily    = 'Inter, monospace';
            t.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            t.height        = `${size + 8}px`;
            t.resizeToFit   = false;
            stack.addControl(t);
        };

        addText(zone.name,                                    18, '#ffffff');
        addText(`${zone.region ?? ''} · ${zone.countryCode ?? ''}`, 12, color.hex);
        addText(`Safety: ${zone.safetyScore}/100`,            12, '#94a3b8');
        addText(zone.categories.join(' · ').toUpperCase(),    10, '#64748b');
        if (zone.verified) addText('✅ On-chain verified',   11, '#22c55e');

        return plane;
    }

    _removeZone(zoneId) {
        const group = this._meshGroups.get(zoneId);
        if (!group) return;
        Object.values(group).forEach(obj => obj?.dispose?.());
        this._meshGroups.delete(zoneId);
    }

    _polygonCentroid(points) {
        const lat = points.reduce((s, p) => s + p.lat, 0) / points.length;
        const lng = points.reduce((s, p) => s + p.lng, 0) / points.length;
        return { lat, lng };
    }
}

window.ZoneRenderer = ZoneRenderer;
