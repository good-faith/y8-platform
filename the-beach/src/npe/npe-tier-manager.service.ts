import { Injectable, Logger, BadRequestException } from '@nestjs/common';

/**
 * NPE Tier Manager Service
 * 
 * Manages tiered NPE deployments following The Beach's business model:
 * - Freemium: 3 NPEs, 5 custom fields, 1 location, 1km radius
 * - Base ($10/month): 25 NPEs, 25 custom fields, 5 locations, 10km radius  
 * - Premium ($50/month): Unlimited NPEs, unlimited fields, unlimited locations, global radius
 * 
 * Based on Y8's NPE Manager tiered approach.
 */

export enum NPETier {
  FREEMIUM = 'freemium',
  BASE = 'base',
  PREMIUM = 'premium',
}

export interface TierLimits {
  maxNPEs: number;
  maxSchemaFields: number;
  maxLocations: number;
  serviceRadius: number; // meters
  litActions: 'basic' | 'full' | 'full-priority';
  support: 'community' | 'email' | 'dedicated';
  apiAccess?: boolean;
  analytics?: 'basic' | 'advanced';
  xrNetworking?: boolean;
}

export interface NPESchema {
  // Core Identity (read-only)
  pkpAddress: string;
  publicKey: string;
  
  // Metadata
  name: string;
  type: string; // 'service-provider', 'development', 'custom'
  category: string; // 'hospitality', 'technical', 'sales', etc.
  
  // Capabilities (extensible)
  capabilities: {
    languages?: string[];
    services?: string[];
    paymentMethods?: string[];
    operatingHours?: string;
    maxConcurrentSessions?: number;
  };
  
  // Geographic Configuration
  location?: {
    lat: number;
    lng: number;
    timezone?: string;
    serviceRadius?: number;
  };
  
  // Business Logic
  pricing?: {
    model: 'per-transaction' | 'subscription' | 'custom';
    baseRate?: number;
    commission?: number;
  };
  
  // Performance Metrics
  analytics?: {
    totalSessions: number;
    successRate: number;
    avgResponseTime: number;
    customerSatisfaction: number;
    revenue: {
      total: number;
      thisMonth: number;
    };
  };
  
  // Lit Actions Configuration
  litActions?: {
    onCustomerRequest?: string; // IPFS CID
    onPaymentReceived?: string;
    onEmergency?: string;
  };
  
  // Custom Fields (user-defined, tier-limited)
  customFields: Record<string, any>;
  
  // Tier Information
  tierInfo: {
    tier: NPETier;
    maxNPEs: number;
    maxSchemaFields: number;
  };
}

export interface TierInfo {
  tier: NPETier;
  price: number;
  limits: TierLimits;
  features: string[];
}

@Injectable()
export class NPETierManagerService {
  private readonly logger = new Logger(NPETierManagerService.name);
  
  // User tier storage (in production, this would be in a database)
  private userTiers = new Map<string, NPETier>();
  private userNPEs = new Map<string, string[]>(); // userId -> npeIds[]
  
  constructor() {
    this.logger.log('🎭 NPE Tier Manager initialized');
  }

  /**
   * Get tier limits for a specific tier
   */
  getTierLimits(tier: NPETier): TierLimits {
    const limits: Record<NPETier, TierLimits> = {
      [NPETier.FREEMIUM]: {
        maxNPEs: 3,
        maxSchemaFields: 5,
        maxLocations: 1,
        serviceRadius: 1000, // 1km
        litActions: 'basic',
        support: 'community',
        apiAccess: false,
        analytics: 'basic',
        xrNetworking: false,
      },
      [NPETier.BASE]: {
        maxNPEs: 25,
        maxSchemaFields: 25,
        maxLocations: 5,
        serviceRadius: 10000, // 10km
        litActions: 'full',
        support: 'email',
        apiAccess: true,
        analytics: 'basic',
        xrNetworking: false,
      },
      [NPETier.PREMIUM]: {
        maxNPEs: Infinity,
        maxSchemaFields: Infinity,
        maxLocations: Infinity,
        serviceRadius: Infinity, // Global
        litActions: 'full-priority',
        support: 'dedicated',
        apiAccess: true,
        analytics: 'advanced',
        xrNetworking: true,
      },
    };

    return limits[tier];
  }

  /**
   * Get tier information including price and features
   */
  getTierInfo(tier: NPETier): TierInfo {
    const tierInfo: Record<NPETier, TierInfo> = {
      [NPETier.FREEMIUM]: {
        tier: NPETier.FREEMIUM,
        price: 0,
        limits: this.getTierLimits(NPETier.FREEMIUM),
        features: [
          '3 NPE agents (ai-build#0, ai-build#1, session#0)',
          'Up to 5 custom fields per NPE',
          'Basic Lit Actions',
          '1 XR environment location',
          '1km service radius',
          'Community support',
          'Perfect for experimentation and prototyping',
        ],
      },
      [NPETier.BASE]: {
        tier: NPETier.BASE,
        price: 10,
        limits: this.getTierLimits(NPETier.BASE),
        features: [
          '25 NPE agents',
          'Up to 25 custom fields per NPE',
          'Full Lit Actions access',
          '5 XR environment locations',
          '10km service radius',
          'Email support',
          'REST/GraphQL API access',
          'Basic analytics',
          'Perfect for small to medium businesses',
        ],
      },
      [NPETier.PREMIUM]: {
        tier: NPETier.PREMIUM,
        price: 50,
        limits: this.getTierLimits(NPETier.PREMIUM),
        features: [
          'Unlimited NPE agents',
          'Unlimited custom schema fields',
          'Priority Lit Actions execution',
          'Unlimited XR locations',
          'Global service radius',
          'Dedicated support',
          'Full REST/GraphQL API',
          'Advanced analytics + AI insights',
          'Immersive XR networking',
          'Perfect for enterprise-scale applications',
        ],
      },
    };

    return tierInfo[tier];
  }

  /**
   * Get user's current tier
   */
  getUserTier(userId: string): NPETier {
    return this.userTiers.get(userId) || NPETier.FREEMIUM;
  }

  /**
   * Set user's tier
   */
  async setUserTier(userId: string, tier: NPETier): Promise<void> {
    this.userTiers.set(userId, tier);
    this.logger.log(`👤 User ${userId} tier set to: ${tier}`);
  }

  /**
   * Check if user can create a new NPE
   */
  canCreateNPE(userId: string): boolean {
    const tier = this.getUserTier(userId);
    const limits = this.getTierLimits(tier);
    const currentCount = this.getCurrentNPECount(userId);
    
    return currentCount < limits.maxNPEs;
  }

  /**
   * Get current NPE count for user
   */
  getCurrentNPECount(userId: string): number {
    return this.userNPEs.get(userId)?.length || 0;
  }

  /**
   * Create a new NPE (with tier validation)
   */
  async createNPE(userId: string, npeConfig: Partial<NPESchema>): Promise<NPESchema> {
    const tier = this.getUserTier(userId);
    const limits = this.getTierLimits(tier);

    // Check NPE limit
    const currentNPECount = this.getCurrentNPECount(userId);
    if (currentNPECount >= limits.maxNPEs) {
      throw new BadRequestException(
        `NPE limit reached for ${tier} tier. Upgrade to create more agents. (${currentNPECount}/${limits.maxNPEs})`,
      );
    }

    // Validate schema fields
    const fieldCount = Object.keys(npeConfig.customFields || {}).length;
    if (fieldCount > limits.maxSchemaFields) {
      throw new BadRequestException(
        `Schema field limit (${limits.maxSchemaFields}) exceeded. Upgrade to add more fields.`,
      );
    }

    // Validate location count
    if (npeConfig.location && limits.maxLocations === 1) {
      const existingNPEs = this.userNPEs.get(userId) || [];
      // In production, check if any existing NPEs have locations
      // For now, just validate
    }

    // Validate service radius
    if (npeConfig.location?.serviceRadius && npeConfig.location.serviceRadius > limits.serviceRadius) {
      throw new BadRequestException(
        `Service radius (${npeConfig.location.serviceRadius}m) exceeds tier limit (${limits.serviceRadius}m). Upgrade for larger coverage.`,
      );
    }

    // Create NPE with tier information
    const npe: NPESchema = {
      pkpAddress: npeConfig.pkpAddress || this.generatePKPAddress(),
      publicKey: npeConfig.publicKey || this.generatePublicKey(),
      name: npeConfig.name || 'Unnamed NPE',
      type: npeConfig.type || 'service-provider',
      category: npeConfig.category || 'general',
      capabilities: npeConfig.capabilities || {},
      location: npeConfig.location,
      pricing: npeConfig.pricing,
      analytics: npeConfig.analytics || {
        totalSessions: 0,
        successRate: 0,
        avgResponseTime: 0,
        customerSatisfaction: 0,
        revenue: { total: 0, thisMonth: 0 },
      },
      litActions: npeConfig.litActions,
      customFields: npeConfig.customFields || {},
      tierInfo: {
        tier,
        maxNPEs: limits.maxNPEs,
        maxSchemaFields: limits.maxSchemaFields,
      },
    };

    // Register NPE to user
    if (!this.userNPEs.has(userId)) {
      this.userNPEs.set(userId, []);
    }
    this.userNPEs.get(userId)!.push(npe.pkpAddress);

    this.logger.log(`✅ NPE created: ${npe.name} (${tier} tier) for user ${userId}`);

    return npe;
  }

  /**
   * Update NPE schema (with tier validation)
   */
  async updateNPESchema(
    userId: string,
    npeId: string,
    updates: Partial<NPESchema>,
  ): Promise<NPESchema> {
    const tier = this.getUserTier(userId);
    const limits = this.getTierLimits(tier);

    // Validate custom fields count
    if (updates.customFields) {
      const fieldCount = Object.keys(updates.customFields).length;
      if (fieldCount > limits.maxSchemaFields) {
        throw new BadRequestException(
          `Schema field limit (${limits.maxSchemaFields}) exceeded. Current: ${fieldCount}. Upgrade to add more fields.`,
        );
      }
    }

    // Validate service radius
    if (updates.location?.serviceRadius && updates.location.serviceRadius > limits.serviceRadius) {
      throw new BadRequestException(
        `Service radius (${updates.location.serviceRadius}m) exceeds tier limit (${limits.serviceRadius}m).`,
      );
    }

    // In production, fetch existing NPE from database and update
    this.logger.log(`📝 NPE schema updated: ${npeId}`);

    // Return updated schema (placeholder)
    return updates as NPESchema;
  }

  /**
   * Upgrade user's tier
   */
  async upgradeTier(userId: string, newTier: NPETier): Promise<void> {
    const currentTier = this.getUserTier(userId);
    
    if (currentTier === newTier) {
      this.logger.warn(`User ${userId} already on ${newTier} tier`);
      return;
    }

    this.logger.log(`⬆️ Upgrading user ${userId} from ${currentTier} to ${newTier}`);
    
    await this.setUserTier(userId, newTier);
    
    // Unlock tier features
    await this.unlockTierFeatures(userId, newTier);
  }

  /**
   * Unlock features for a specific tier
   */
  private async unlockTierFeatures(userId: string, tier: NPETier): Promise<void> {
    const limits = this.getTierLimits(tier);
    
    this.logger.log(`🔓 Unlocking ${tier} tier features for user ${userId}:`);
    this.logger.log(`   - Max NPEs: ${limits.maxNPEs}`);
    this.logger.log(`   - Max Schema Fields: ${limits.maxSchemaFields}`);
    this.logger.log(`   - Max Locations: ${limits.maxLocations}`);
    this.logger.log(`   - Service Radius: ${limits.serviceRadius}m`);
    this.logger.log(`   - Lit Actions: ${limits.litActions}`);
    this.logger.log(`   - Support: ${limits.support}`);
    
    if (limits.apiAccess) {
      this.logger.log(`   - API Access: Enabled ✅`);
    }
    
    if (limits.analytics === 'advanced') {
      this.logger.log(`   - Advanced Analytics: Enabled ✅`);
    }
    
    if (limits.xrNetworking) {
      this.logger.log(`   - XR Networking: Enabled ✅`);
    }
  }

  /**
   * Get next tier for upgrade path
   */
  getNextTier(currentTier: NPETier): NPETier | null {
    const tiers = [NPETier.FREEMIUM, NPETier.BASE, NPETier.PREMIUM];
    const currentIndex = tiers.indexOf(currentTier);
    
    if (currentIndex === -1 || currentIndex === tiers.length - 1) {
      return null;
    }
    
    return tiers[currentIndex + 1];
  }

  /**
   * Get tier comparison
   */
  getTierComparison(): TierInfo[] {
    return [
      this.getTierInfo(NPETier.FREEMIUM),
      this.getTierInfo(NPETier.BASE),
      this.getTierInfo(NPETier.PREMIUM),
    ];
  }

  /**
   * Check if user needs to upgrade for a feature
   */
  requiresUpgrade(userId: string, feature: keyof TierLimits): boolean {
    const tier = this.getUserTier(userId);
    const limits = this.getTierLimits(tier);
    
    // Check specific feature requirements
    switch (feature) {
      case 'apiAccess':
        return !limits.apiAccess;
      case 'xrNetworking':
        return !limits.xrNetworking;
      default:
        return false;
    }
  }

  /**
   * Generate placeholder PKP address
   */
  private generatePKPAddress(): string {
    return `0x${Math.random().toString(16).slice(2, 42).padStart(40, '0')}`;
  }

  /**
   * Generate placeholder public key
   */
  private generatePublicKey(): string {
    return `0x04${Math.random().toString(16).slice(2, 130).padStart(128, '0')}`;
  }

  /**
   * Delete NPE
   */
  async deleteNPE(userId: string, npeId: string): Promise<void> {
    const userNPEs = this.userNPEs.get(userId) || [];
    const index = userNPEs.indexOf(npeId);
    
    if (index !== -1) {
      userNPEs.splice(index, 1);
      this.logger.log(`🗑️ NPE deleted: ${npeId} for user ${userId}`);
    }
  }

  /**
   * Get user's NPEs
   */
  getUserNPEs(userId: string): string[] {
    return this.userNPEs.get(userId) || [];
  }

  /**
   * Get NPE by ID (simplified - would query database in production)
   */
  async getNPE(npeId: string): Promise<NPESchema | null> {
    // In production, query from database
    // For now, return a placeholder if npeId exists in any user's NPE list
    for (const [userId, npeIds] of this.userNPEs.entries()) {
      if (npeIds.includes(npeId)) {
        // Return a mock NPE for demonstration
        return {
          pkpAddress: this.generatePKPAddress(),
          publicKey: this.generatePublicKey(),
          name: `NPE ${npeId}`,
          type: 'service-provider',
          category: 'general',
          capabilities: {},
          customFields: {},
          tierInfo: {
            tier: this.getUserTier(userId),
            maxNPEs: this.getTierLimits(this.getUserTier(userId)).maxNPEs,
            maxSchemaFields: this.getTierLimits(this.getUserTier(userId)).maxSchemaFields,
          },
          userId, // Store userId for later use
        } as any;
      }
    }
    return null;
  }

  /**
   * Update NPE (simplified - would update database in production)
   */
  async updateNPE(npeId: string, updates: Partial<NPESchema>): Promise<NPESchema> {
    const npe = await this.getNPE(npeId);
    if (!npe) {
      throw new BadRequestException('NPE not found');
    }

    // In production, update database
    // For now, return merged object
    const updated = {
      ...npe,
      ...updates,
    };

    this.logger.log(`✅ NPE updated: ${npeId}`);
    return updated;
  }
}
