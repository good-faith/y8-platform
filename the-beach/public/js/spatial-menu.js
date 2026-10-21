/**
 * spatial-menu.js
 *
 * The ServiceDock — but in 3D VR space.
 *
 * Creates a floating arc of service category buttons that hovers at the
 * player's wrist level in XR (or in front of the camera on desktop).
 * Selecting a category expands a 3D panel of options. Selecting an option
 * calls y8-server POST /agents/route and shows the routed agent's avatar.
 *
 * Works in both flat-screen (mouse click) and WebXR (controller trigger).
 *
 * Usage:
 *   const menu = new SpatialServiceMenu(scene, camera, Y8_SERVER_URL);
 *   menu.setToken(jwtToken);
 *   menu.show();   // anchor menu to camera forward
 *   menu.hide();
 */

const SPATIAL_SERVICES = [
    {
        id: 'geo',    icon: '🗺️', label: 'Geo-Tag',   color: '#10b981',
        options: [
            { id: 'geo-pin',    label: 'Drop a Pin',      action: 'geo-tag'   },
            { id: 'geo-zone',   label: 'Create Zone',     action: 'geo-zone'  },
            { id: 'geo-report', label: 'Location Report', action: 'geo-report'},
            { id: 'geo-track',  label: 'Asset Tracking',  action: 'geo-track' },
        ],
    },
    {
        id: 'labor',  icon: '👷', label: 'Labor',     color: '#f59e0b',
        options: [
            { id: 'labor-post',   label: 'Post a Job',   action: 'labor-post'   },
            { id: 'labor-find',   label: 'Find Labor',   action: 'labor-match'  },
            { id: 'labor-escrow', label: 'Pay Escrow',   action: 'labor-escrow' },
            { id: 'labor-rate',   label: 'Rate & Review',action: 'labor-review' },
        ],
    },
    {
        id: 'rides',  icon: '🚗', label: 'Ride-Share', color: '#3b82f6',
        options: [
            { id: 'ride-request', label: 'Request Ride', action: 'ride-request' },
            { id: 'ride-offer',   label: 'Offer Ride',   action: 'ride-offer'   },
            { id: 'ride-pool',    label: 'Carpool',      action: 'ride-pool'    },
            { id: 'ride-pay',     label: 'Pay on Base',  action: 'ride-pay'     },
        ],
    },
    {
        id: 'rooms',  icon: '🏠', label: 'Rooms',     color: '#8b5cf6',
        options: [
            { id: 'room-list',  label: 'List a Space', action: 'room-list'  },
            { id: 'room-find',  label: 'Find a Room',  action: 'room-find'  },
            { id: 'room-book',  label: 'Book & Pay',   action: 'room-book'  },
            { id: 'room-review',label: 'Review',       action: 'room-review'},
        ],
    },
    {
        id: 'market', icon: '🛍️', label: 'Market',    color: '#ec4899',
        options: [
            { id: 'mkt-sell',   label: 'List for Sale', action: 'market-sell'   },
            { id: 'mkt-rent',   label: 'List for Rent', action: 'market-rent'   },
            { id: 'mkt-browse', label: 'Browse',        action: 'market-browse' },
            { id: 'mkt-offer',  label: 'Make Offer',    action: 'market-offer'  },
        ],
    },
];

class SpatialServiceMenu {
    /**
     * @param {BABYLON.Scene} scene
     * @param {BABYLON.Camera} camera
     * @param {string} y8ServerUrl
     */
    constructor(scene, camera, y8ServerUrl) {
        this.scene        = scene;
        this.camera       = camera;
        this.y8ServerUrl  = y8ServerUrl;
        this.jwtToken     = null;

        this._visible        = false;
        this._rootNode       = null;       // parent TransformNode for whole menu
        this._categoryButtons = [];
        this._optionPanel    = null;       // currently open option panel
        this._activeCategory = null;

        // Callback when a service option is selected
        this.onServiceSelect = null;       // (category, option, routedAgent) => void
    }

    // ── Public API ─────────────────────────────────────────────────────────────

    setToken(token) { this.jwtToken = token; }

    show() {
        if (this._rootNode) { this._rootNode.setEnabled(true); this._visible = true; return; }
        this._build();
        this._visible = true;
    }

    hide() {
        if (this._rootNode) this._rootNode.setEnabled(false);
        this._visible = false;
    }

    toggle() { this._visible ? this.hide() : this.show(); }

    /** Call this each frame or after XR position update to anchor menu to camera */
    anchorToCamera(distanceForward = 2.5, heightOffset = -0.5) {
        if (!this._rootNode || !this._visible) return;
        const forward = this.camera.getForwardRay(1).direction;
        const pos = this.camera.position.add(forward.scale(distanceForward));
        pos.y += heightOffset;
        this._rootNode.position = pos;
        // Always face the camera
        this._rootNode.lookAt(this.camera.position);
    }

    // ── Build ──────────────────────────────────────────────────────────────────

    _build() {
        this._rootNode = new BABYLON.TransformNode('spatial-menu-root', this.scene);

        const count  = SPATIAL_SERVICES.length;
        const arcDeg = 90;  // total arc spread in degrees
        const radius = 1.2;

        SPATIAL_SERVICES.forEach((cat, i) => {
            const angleDeg = -arcDeg / 2 + (arcDeg / (count - 1)) * i;
            const angleRad = angleDeg * (Math.PI / 180);

            const x = Math.sin(angleRad) * radius;
            const y = 0;
            const z = Math.cos(angleRad) * radius - radius; // offset so center is at z=0

            const btn = this._createCategoryButton(cat, new BABYLON.Vector3(x, y, z));
            this._categoryButtons.push(btn);
        });

        this.anchorToCamera();
    }

    _createCategoryButton(cat, localPos) {
        // Backing plane
        const plane = BABYLON.MeshBuilder.CreatePlane(`smenu-cat-${cat.id}`, {
            width: 0.28, height: 0.32,
        }, this.scene);
        plane.parent   = this._rootNode;
        plane.position = localPos;
        plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

        const adt = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane, 256, 320);

        const bg = new BABYLON.GUI.Rectangle();
        bg.background   = 'rgba(5,5,20,0.88)';
        bg.color        = cat.color;
        bg.thickness    = 3;
        bg.cornerRadius = 16;
        adt.addControl(bg);

        const stack = new BABYLON.GUI.StackPanel();
        stack.paddingTop = '16px';
        bg.addControl(stack);

        const iconTxt = new BABYLON.GUI.TextBlock();
        iconTxt.text     = cat.icon;
        iconTxt.fontSize = 36;
        iconTxt.height   = '50px';
        iconTxt.color    = '#ffffff';
        stack.addControl(iconTxt);

        const labelTxt = new BABYLON.GUI.TextBlock();
        labelTxt.text     = cat.label;
        labelTxt.fontSize = 16;
        labelTxt.color    = cat.color;
        labelTxt.fontFamily = 'Inter, monospace';
        labelTxt.height   = '28px';
        stack.addControl(labelTxt);

        // Click / pointer interaction
        plane.isPickable = true;
        plane.actionManager = new BABYLON.ActionManager(this.scene);

        plane.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            () => this._openCategory(cat, plane)
        ));

        // Hover glow
        plane.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPointerOverTrigger,
            () => { bg.background = `${cat.color}33`; plane.scaling.setAll(1.08); }
        ));
        plane.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPointerOutTrigger,
            () => { bg.background = 'rgba(5,5,20,0.88)'; plane.scaling.setAll(1.0); }
        ));

        return plane;
    }

    _openCategory(cat, catPlane) {
        // Close previous panel
        if (this._optionPanel) {
            this._optionPanel.dispose();
            this._optionPanel = null;
        }
        if (this._activeCategory === cat.id) {
            this._activeCategory = null;
            return;
        }
        this._activeCategory = cat.id;

        // Create options panel to the right of the category arc
        const panelPos = catPlane.position.add(new BABYLON.Vector3(0.6, 0, 0));

        const panel = BABYLON.MeshBuilder.CreatePlane(`smenu-opts-${cat.id}`, {
            width: 0.55, height: cat.options.length * 0.11 + 0.12,
        }, this.scene);
        panel.parent   = this._rootNode;
        panel.position = panelPos;
        panel.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        this._optionPanel = panel;

        const adt = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(panel, 512, cat.options.length * 96 + 48);

        const bg = new BABYLON.GUI.Rectangle();
        bg.background   = 'rgba(5,5,20,0.94)';
        bg.color        = cat.color;
        bg.thickness    = 2;
        bg.cornerRadius = 12;
        adt.addControl(bg);

        const stack = new BABYLON.GUI.StackPanel();
        stack.paddingLeft = stack.paddingRight = '12px';
        stack.paddingTop = '8px';
        stack.spacing = 4;
        bg.addControl(stack);

        cat.options.forEach(opt => {
            const btn = new BABYLON.GUI.Button.CreateSimpleButton(`opt-btn-${opt.id}`, opt.label);
            btn.height          = '60px';
            btn.color           = cat.color;
            btn.cornerRadius    = 8;
            btn.background      = `${cat.color}18`;
            btn.fontSize        = 18;
            btn.fontFamily      = 'Inter, monospace';
            btn.paddingBottom   = '4px';
            stack.addControl(btn);

            // Register hover event handlers
            btn.onPointerEnterObservable.add(() => {
                btn.background = `${cat.color}44`;
                btn.color      = '#ffffff';
            });
            btn.onPointerOutObservable.add(() => {
                btn.background = `${cat.color}18`;
                btn.color      = cat.color;
            });

            btn.onPointerClickObservable.add(() => {
                this._dispatchService(cat, opt);
            });
        });
    }

    async _dispatchService(cat, opt) {
        console.log(`[SpatialMenu] Dispatching: ${cat.label} → ${opt.label}`);

        if (!this.jwtToken) {
            console.warn('[SpatialMenu] No y8 JWT token — sign in via y8-app first');
            return;
        }

        try {
            const res = await fetch(`${this.y8ServerUrl}/agents/route`, {
                method: 'POST',
                headers: {
                    'Content-Type':  'application/json',
                    'Authorization': `Bearer ${this.jwtToken}`,
                },
                body: JSON.stringify({
                    request:  { service: opt.action, priority: 'normal' },
                    strategy: { strategy: 'least-load' },
                }),
            });

            if (!res.ok) throw new Error(`Route failed: ${res.status}`);
            const agent = await res.json();
            console.log(`[SpatialMenu] ✅ Agent assigned: ${agent.id} (${agent.purpose})`);

            if (this.onServiceSelect) this.onServiceSelect(cat, opt, agent);

        } catch (err) {
            console.error('[SpatialMenu] Dispatch error:', err.message);
        }
    }
}

window.SpatialServiceMenu = SpatialServiceMenu;
