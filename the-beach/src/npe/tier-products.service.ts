import { Injectable, Logger } from '@nestjs/common';
import { NPETier, TierLimits } from './npe-tier-manager.service';

/**
 * Product Feature Categories
 */
export enum FeatureCategory {
  AGENTS = 'agents',
  CUSTOMIZATION = 'customization',
  GEOGRAPHY = 'geography',
  AUTOMATION = 'automation',
  SUPPORT = 'support',
  INTEGRATION = 'integration',
  ANALYTICS = 'analytics',
  NETWORKING = 'networking',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
}

/**
 * Individual Product Feature
 */
export interface ProductFeature {
  category: FeatureCategory;
  name: string;
  description: string;
  value: string | number | boolean;
  highlighted?: boolean; // Show in feature comparison table
  icon?: string; // Emoji or icon identifier
}

/**
 * Usage Quota
 */
export interface UsageQuota {
  name: string;
  limit: number | 'unlimited';
  unit: string;
  resetPeriod?: 'daily' | 'monthly' | 'yearly' | 'never';
  overage?: {
    allowed: boolean;
    pricePerUnit?: number;
  };
}

/**
 * Add-on Product
 */
export interface AddonProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  billingPeriod: 'monthly' | 'one-time';
  applicableTiers: NPETier[];
  quotaIncrease?: {
    quota: string;
    amount: number;
  };
}

/**
 * Complete Tier Product
 */
export interface TierProduct {
  // Basic Info
  tier: NPETier;
  name: string;
  tagline: string;
  description: string;
  
  // Pricing
  pricing: {
    monthly: number;
    yearly?: number; // Annual discount
    currency: 'USD';
    billingCycle: 'monthly' | 'yearly';
  };
  
  // Limits
  limits: TierLimits;
  
  // Usage Quotas
  quotas: UsageQuota[];
  
  // Features (organized by category)
  features: ProductFeature[];
  
  // Marketing
  marketing: {
    popularBadge?: boolean;
    bestValue?: boolean;
    targetAudience: string[];
    useCases: string[];
    testimonial?: {
      quote: string;
      author: string;
      company: string;
    };
  };
  
  // Call to Action
  cta: {
    primary: string; // "Start Free", "Subscribe Now", "Contact Sales"
    secondary?: string;
  };
  
  // Available Add-ons
  availableAddons: string[]; // addon IDs
  
  // Trial Information
  trial?: {
    enabled: boolean;
    durationDays: number;
    requiresCreditCard: boolean;
  };
}

/**
 * Tier Products Service
 * 
 * Manages product definitions, pricing, and feature sets for all tiers
 */
@Injectable()
export class TierProductsService {
  private readonly logger = new Logger(TierProductsService.name);
  
  // Available add-ons
  private readonly addons: Map<string, AddonProduct> = new Map([
    ['extra-npes-10', {
      id: 'extra-npes-10',
      name: '+10 NPE Agents',
      description: 'Add 10 additional NPE agents to your plan',
      price: 5,
      billingPeriod: 'monthly',
      applicableTiers: [NPETier.FREEMIUM, NPETier.BASE],
      quotaIncrease: { quota: 'maxNPEs', amount: 10 },
    }],
    ['extra-locations-5', {
      id: 'extra-locations-5',
      name: '+5 Locations',
      description: 'Add 5 additional XR environment locations',
      price: 3,
      billingPeriod: 'monthly',
      applicableTiers: [NPETier.FREEMIUM, NPETier.BASE],
      quotaIncrease: { quota: 'maxLocations', amount: 5 },
    }],
    ['priority-support', {
      id: 'priority-support',
      name: 'Priority Support',
      description: '24/7 priority email and chat support',
      price: 15,
      billingPeriod: 'monthly',
      applicableTiers: [NPETier.FREEMIUM, NPETier.BASE],
    }],
    ['advanced-analytics', {
      id: 'advanced-analytics',
      name: 'Advanced Analytics',
      description: 'Deep insights, custom reports, and data export',
      price: 10,
      billingPeriod: 'monthly',
      applicableTiers: [NPETier.FREEMIUM, NPETier.BASE],
    }],
    ['white-label', {
      id: 'white-label',
      name: 'White Label',
      description: 'Remove The Beach branding and use your own',
      price: 25,
      billingPeriod: 'monthly',
      applicableTiers: [NPETier.BASE, NPETier.PREMIUM],
    }],
    ['custom-domain', {
      id: 'custom-domain',
      name: 'Custom Domain',
      description: 'Host your XR environments on your own domain',
      price: 5,
      billingPeriod: 'monthly',
      applicableTiers: [NPETier.BASE, NPETier.PREMIUM],
    }],
    ['sla-guarantee', {
      id: 'sla-guarantee',
      name: '99.9% SLA Guarantee',
      description: 'Service level agreement with uptime guarantee',
      price: 50,
      billingPeriod: 'monthly',
      applicableTiers: [NPETier.PREMIUM],
    }],
  ]);

  constructor() {
    this.logger.log('💳 Tier Products Service initialized');
  }

  /**
   * Get complete product definition for a tier
   */
  getTierProduct(tier: NPETier): TierProduct {
    const products: Record<NPETier, TierProduct> = {
      [NPETier.FREEMIUM]: this.getFreemiumProduct(),
      [NPETier.BASE]: this.getBasicProduct(),
      [NPETier.PREMIUM]: this.getProfessionalProduct(),
    };

    return products[tier];
  }

  /**
   * Get all tier products
   */
  getAllTierProducts(): TierProduct[] {
    return [
      this.getFreemiumProduct(),
      this.getBasicProduct(),
      this.getProfessionalProduct(),
    ];
  }

  /**
   * Get available add-ons for a tier
   */
  getAvailableAddons(tier: NPETier): AddonProduct[] {
    return Array.from(this.addons.values()).filter(addon =>
      addon.applicableTiers.includes(tier)
    );
  }

  /**
   * Get specific add-on by ID
   */
  getAddon(addonId: string): AddonProduct | undefined {
    return this.addons.get(addonId);
  }

  /**
   * Calculate total price with add-ons
   */
  calculateTotalPrice(tier: NPETier, addonIds: string[] = []): number {
    const product = this.getTierProduct(tier);
    const addonsPrice = addonIds.reduce((sum, id) => {
      const addon = this.addons.get(id);
      return sum + (addon ? addon.price : 0);
    }, 0);
    
    return product.pricing.monthly + addonsPrice;
  }

  /**
   * FREEMIUM PRODUCT
   */
  private getFreemiumProduct(): TierProduct {
    return {
      tier: NPETier.FREEMIUM,
      name: 'Freemium',
      tagline: 'Start building AI agents for free',
      description: 'Perfect for experimenting with AI agents, building prototypes, and learning The Beach platform. No credit card required.',
      
      pricing: {
        monthly: 0,
        currency: 'USD',
        billingCycle: 'monthly',
      },
      
      limits: {
        maxNPEs: 3,
        maxSchemaFields: 5,
        maxLocations: 1,
        serviceRadius: 1000,
        litActions: 'basic',
        support: 'community',
        apiAccess: false,
        analytics: 'basic',
        xrNetworking: false,
      },
      
      quotas: [
        {
          name: 'NPE Agents',
          limit: 3,
          unit: 'agents',
          resetPeriod: 'never',
        },
        {
          name: 'Custom Schema Fields',
          limit: 5,
          unit: 'fields per NPE',
          resetPeriod: 'never',
        },
        {
          name: 'XR Locations',
          limit: 1,
          unit: 'locations',
          resetPeriod: 'never',
        },
        {
          name: 'Service Radius',
          limit: 1,
          unit: 'km',
          resetPeriod: 'never',
        },
        {
          name: 'AI Interactions',
          limit: 100,
          unit: 'requests',
          resetPeriod: 'monthly',
        },
        {
          name: 'Storage',
          limit: 100,
          unit: 'MB',
          resetPeriod: 'never',
        },
        {
          name: 'Concurrent Sessions',
          limit: 5,
          unit: 'sessions',
          resetPeriod: 'never',
        },
      ],
      
      features: [
        // Agents
        {
          category: FeatureCategory.AGENTS,
          name: 'NPE Agents',
          description: 'Deploy up to 3 AI-powered NPE agents',
          value: 3,
          highlighted: true,
          icon: '🤖',
        },
        {
          category: FeatureCategory.AGENTS,
          name: 'Pre-built Templates',
          description: 'Access starter agent templates',
          value: true,
          icon: '📋',
        },
        {
          category: FeatureCategory.AGENTS,
          name: 'Default Agent Types',
          description: 'ai-build#0, ai-build#1, session#0',
          value: 'Standard',
          highlighted: true,
        },
        
        // Customization
        {
          category: FeatureCategory.CUSTOMIZATION,
          name: 'Custom Fields',
          description: 'Up to 5 custom schema fields per NPE',
          value: 5,
          highlighted: true,
          icon: '⚙️',
        },
        {
          category: FeatureCategory.CUSTOMIZATION,
          name: 'Agent Personalities',
          description: 'Basic personality customization',
          value: 'Basic',
        },
        {
          category: FeatureCategory.CUSTOMIZATION,
          name: 'Branding',
          description: 'The Beach branding included',
          value: 'Standard',
        },
        
        // Geography
        {
          category: FeatureCategory.GEOGRAPHY,
          name: 'XR Locations',
          description: 'Deploy to 1 XR environment location',
          value: 1,
          highlighted: true,
          icon: '📍',
        },
        {
          category: FeatureCategory.GEOGRAPHY,
          name: 'Service Radius',
          description: 'Agents serve 1km radius',
          value: '1 km',
          highlighted: true,
        },
        {
          category: FeatureCategory.GEOGRAPHY,
          name: 'Geo-routing',
          description: 'Basic geographic routing',
          value: 'Basic',
        },
        
        // Automation
        {
          category: FeatureCategory.AUTOMATION,
          name: 'Lit Actions',
          description: 'Basic Lit Protocol actions',
          value: 'Basic',
          highlighted: true,
          icon: '⚡',
        },
        {
          category: FeatureCategory.AUTOMATION,
          name: 'Scheduled Tasks',
          description: 'Run automated tasks',
          value: false,
        },
        {
          category: FeatureCategory.AUTOMATION,
          name: 'Webhooks',
          description: 'HTTP webhooks for events',
          value: false,
        },
        
        // Support
        {
          category: FeatureCategory.SUPPORT,
          name: 'Support Type',
          description: 'Community forum support',
          value: 'Community',
          highlighted: true,
          icon: '💬',
        },
        {
          category: FeatureCategory.SUPPORT,
          name: 'Response Time',
          description: 'Best effort community response',
          value: 'Best effort',
        },
        {
          category: FeatureCategory.SUPPORT,
          name: 'Documentation',
          description: 'Full access to documentation',
          value: true,
          icon: '📚',
        },
        
        // Integration
        {
          category: FeatureCategory.INTEGRATION,
          name: 'REST API',
          description: 'API access for integrations',
          value: false,
          highlighted: true,
        },
        {
          category: FeatureCategory.INTEGRATION,
          name: 'Webhooks',
          description: 'Event-driven integrations',
          value: false,
        },
        {
          category: FeatureCategory.INTEGRATION,
          name: 'SDK Access',
          description: 'Client SDKs for development',
          value: 'Read-only',
        },
        
        // Analytics
        {
          category: FeatureCategory.ANALYTICS,
          name: 'Analytics',
          description: 'Basic usage analytics',
          value: 'Basic',
          highlighted: true,
          icon: '📊',
        },
        {
          category: FeatureCategory.ANALYTICS,
          name: 'Dashboard',
          description: 'Standard analytics dashboard',
          value: true,
        },
        {
          category: FeatureCategory.ANALYTICS,
          name: 'Data Export',
          description: 'Export analytics data',
          value: false,
        },
        
        // Networking
        {
          category: FeatureCategory.NETWORKING,
          name: 'XR Networking',
          description: 'Advanced XR networking features',
          value: false,
          highlighted: true,
        },
        {
          category: FeatureCategory.NETWORKING,
          name: 'Multi-user Sessions',
          description: 'Concurrent users per session',
          value: 5,
        },
        
        // Security
        {
          category: FeatureCategory.SECURITY,
          name: 'PKP Authentication',
          description: 'Lit Protocol PKP security',
          value: true,
          icon: '🔐',
        },
        {
          category: FeatureCategory.SECURITY,
          name: 'SSL/TLS',
          description: 'Encrypted connections',
          value: true,
        },
        {
          category: FeatureCategory.SECURITY,
          name: 'Audit Logs',
          description: 'Security audit logging',
          value: '7 days',
        },
        
        // Performance
        {
          category: FeatureCategory.PERFORMANCE,
          name: 'Uptime SLA',
          description: 'Service level agreement',
          value: 'Best effort',
        },
        {
          category: FeatureCategory.PERFORMANCE,
          name: 'Response Priority',
          description: 'Request processing priority',
          value: 'Standard',
        },
        {
          category: FeatureCategory.PERFORMANCE,
          name: 'Rate Limiting',
          description: 'API requests per minute',
          value: '10/min',
        },
      ],
      
      marketing: {
        targetAudience: [
          'Developers exploring AI agents',
          'Students and researchers',
          'Hobbyists and makers',
          'Proof-of-concept builders',
          'Learning and experimentation',
        ],
        useCases: [
          'Build your first AI agent',
          'Test The Beach platform',
          'Create simple prototypes',
          'Learn XR development',
          'Experiment with PKP authentication',
        ],
        testimonial: {
          quote: "The freemium tier let me build and test my first AI agent in minutes. It's perfect for learning!",
          author: 'Alex Chen',
          company: 'Indie Developer',
        },
      },
      
      cta: {
        primary: 'Start Free',
        secondary: 'No credit card required',
      },
      
      availableAddons: [
        'extra-npes-10',
        'extra-locations-5',
        'priority-support',
        'advanced-analytics',
      ],
      
      trial: {
        enabled: false,
        durationDays: 0,
        requiresCreditCard: false,
      },
    };
  }

  /**
   * BASIC PRODUCT (Previously "BASE")
   */
  private getBasicProduct(): TierProduct {
    return {
      tier: NPETier.BASE,
      name: 'Basic',
      tagline: 'Scale your AI agent fleet',
      description: 'Perfect for small to medium businesses deploying production AI agents. Full API access, multiple locations, and email support.',
      
      pricing: {
        monthly: 10,
        yearly: 100, // 2 months free
        currency: 'USD',
        billingCycle: 'monthly',
      },
      
      limits: {
        maxNPEs: 25,
        maxSchemaFields: 25,
        maxLocations: 5,
        serviceRadius: 10000,
        litActions: 'full',
        support: 'email',
        apiAccess: true,
        analytics: 'basic',
        xrNetworking: false,
      },
      
      quotas: [
        {
          name: 'NPE Agents',
          limit: 25,
          unit: 'agents',
          resetPeriod: 'never',
          overage: {
            allowed: true,
            pricePerUnit: 0.5,
          },
        },
        {
          name: 'Custom Schema Fields',
          limit: 25,
          unit: 'fields per NPE',
          resetPeriod: 'never',
        },
        {
          name: 'XR Locations',
          limit: 5,
          unit: 'locations',
          resetPeriod: 'never',
          overage: {
            allowed: true,
            pricePerUnit: 0.6,
          },
        },
        {
          name: 'Service Radius',
          limit: 10,
          unit: 'km',
          resetPeriod: 'never',
        },
        {
          name: 'AI Interactions',
          limit: 10000,
          unit: 'requests',
          resetPeriod: 'monthly',
          overage: {
            allowed: true,
            pricePerUnit: 0.001,
          },
        },
        {
          name: 'Storage',
          limit: 10,
          unit: 'GB',
          resetPeriod: 'never',
          overage: {
            allowed: true,
            pricePerUnit: 0.1,
          },
        },
        {
          name: 'Concurrent Sessions',
          limit: 100,
          unit: 'sessions',
          resetPeriod: 'never',
        },
        {
          name: 'API Requests',
          limit: 100000,
          unit: 'requests',
          resetPeriod: 'monthly',
          overage: {
            allowed: true,
            pricePerUnit: 0.0001,
          },
        },
      ],
      
      features: [
        // Agents
        {
          category: FeatureCategory.AGENTS,
          name: 'NPE Agents',
          description: 'Deploy up to 25 AI-powered NPE agents',
          value: 25,
          highlighted: true,
          icon: '🤖',
        },
        {
          category: FeatureCategory.AGENTS,
          name: 'Pre-built Templates',
          description: 'Access all agent templates',
          value: true,
          icon: '📋',
        },
        {
          category: FeatureCategory.AGENTS,
          name: 'Custom Agent Types',
          description: 'Create custom agent types',
          value: true,
          highlighted: true,
        },
        {
          category: FeatureCategory.AGENTS,
          name: 'Agent Collaboration',
          description: 'Agents can work together',
          value: true,
        },
        
        // Customization
        {
          category: FeatureCategory.CUSTOMIZATION,
          name: 'Custom Fields',
          description: 'Up to 25 custom schema fields per NPE',
          value: 25,
          highlighted: true,
          icon: '⚙️',
        },
        {
          category: FeatureCategory.CUSTOMIZATION,
          name: 'Agent Personalities',
          description: 'Advanced personality customization',
          value: 'Advanced',
        },
        {
          category: FeatureCategory.CUSTOMIZATION,
          name: 'Branding',
          description: 'Basic branding customization',
          value: 'Customizable',
        },
        {
          category: FeatureCategory.CUSTOMIZATION,
          name: 'Custom Workflows',
          description: 'Build custom agent workflows',
          value: true,
        },
        
        // Geography
        {
          category: FeatureCategory.GEOGRAPHY,
          name: 'XR Locations',
          description: 'Deploy to 5 XR environment locations',
          value: 5,
          highlighted: true,
          icon: '📍',
        },
        {
          category: FeatureCategory.GEOGRAPHY,
          name: 'Service Radius',
          description: 'Agents serve 10km radius',
          value: '10 km',
          highlighted: true,
        },
        {
          category: FeatureCategory.GEOGRAPHY,
          name: 'Geo-routing',
          description: 'Advanced geographic routing',
          value: 'Advanced',
        },
        {
          category: FeatureCategory.GEOGRAPHY,
          name: 'Multi-region Support',
          description: 'Deploy across multiple regions',
          value: true,
        },
        
        // Automation
        {
          category: FeatureCategory.AUTOMATION,
          name: 'Lit Actions',
          description: 'Full Lit Protocol actions',
          value: 'Full',
          highlighted: true,
          icon: '⚡',
        },
        {
          category: FeatureCategory.AUTOMATION,
          name: 'Scheduled Tasks',
          description: 'Run automated tasks on schedule',
          value: true,
        },
        {
          category: FeatureCategory.AUTOMATION,
          name: 'Webhooks',
          description: 'HTTP webhooks for events',
          value: 10,
        },
        {
          category: FeatureCategory.AUTOMATION,
          name: 'Event Triggers',
          description: 'Custom event-based automation',
          value: true,
        },
        
        // Support
        {
          category: FeatureCategory.SUPPORT,
          name: 'Support Type',
          description: 'Email support with SLA',
          value: 'Email',
          highlighted: true,
          icon: '💬',
        },
        {
          category: FeatureCategory.SUPPORT,
          name: 'Response Time',
          description: 'Business day response time',
          value: '24 hours',
        },
        {
          category: FeatureCategory.SUPPORT,
          name: 'Documentation',
          description: 'Full access to documentation',
          value: true,
          icon: '📚',
        },
        {
          category: FeatureCategory.SUPPORT,
          name: 'Onboarding',
          description: 'Guided onboarding session',
          value: true,
        },
        
        // Integration
        {
          category: FeatureCategory.INTEGRATION,
          name: 'REST API',
          description: 'Full REST API access',
          value: true,
          highlighted: true,
          icon: '🔌',
        },
        {
          category: FeatureCategory.INTEGRATION,
          name: 'GraphQL API',
          description: 'GraphQL query interface',
          value: true,
        },
        {
          category: FeatureCategory.INTEGRATION,
          name: 'Webhooks',
          description: 'Event-driven integrations',
          value: true,
        },
        {
          category: FeatureCategory.INTEGRATION,
          name: 'SDK Access',
          description: 'Full SDK access (JS, Python, Go)',
          value: 'Full',
        },
        
        // Analytics
        {
          category: FeatureCategory.ANALYTICS,
          name: 'Analytics',
          description: 'Basic usage analytics with trends',
          value: 'Basic',
          highlighted: true,
          icon: '📊',
        },
        {
          category: FeatureCategory.ANALYTICS,
          name: 'Dashboard',
          description: 'Interactive analytics dashboard',
          value: true,
        },
        {
          category: FeatureCategory.ANALYTICS,
          name: 'Data Export',
          description: 'Export analytics data (CSV)',
          value: 'CSV',
        },
        {
          category: FeatureCategory.ANALYTICS,
          name: 'Custom Reports',
          description: 'Build custom reports',
          value: false,
        },
        
        // Networking
        {
          category: FeatureCategory.NETWORKING,
          name: 'XR Networking',
          description: 'Advanced XR networking features',
          value: false,
          highlighted: true,
        },
        {
          category: FeatureCategory.NETWORKING,
          name: 'Multi-user Sessions',
          description: 'Concurrent users per session',
          value: 50,
        },
        {
          category: FeatureCategory.NETWORKING,
          name: 'WebSocket Support',
          description: 'Real-time bidirectional communication',
          value: true,
        },
        
        // Security
        {
          category: FeatureCategory.SECURITY,
          name: 'PKP Authentication',
          description: 'Lit Protocol PKP security',
          value: true,
          icon: '🔐',
        },
        {
          category: FeatureCategory.SECURITY,
          name: 'SSL/TLS',
          description: 'Encrypted connections',
          value: true,
        },
        {
          category: FeatureCategory.SECURITY,
          name: 'Audit Logs',
          description: 'Security audit logging',
          value: '30 days',
        },
        {
          category: FeatureCategory.SECURITY,
          name: 'IP Whitelisting',
          description: 'Restrict access by IP',
          value: true,
        },
        
        // Performance
        {
          category: FeatureCategory.PERFORMANCE,
          name: 'Uptime SLA',
          description: 'Service level agreement',
          value: '99.5%',
        },
        {
          category: FeatureCategory.PERFORMANCE,
          name: 'Response Priority',
          description: 'Request processing priority',
          value: 'Normal',
        },
        {
          category: FeatureCategory.PERFORMANCE,
          name: 'Rate Limiting',
          description: 'API requests per minute',
          value: '100/min',
        },
        {
          category: FeatureCategory.PERFORMANCE,
          name: 'CDN',
          description: 'Content delivery network',
          value: true,
        },
      ],
      
      marketing: {
        popularBadge: true,
        targetAudience: [
          'Small to medium businesses',
          'SaaS companies',
          'Digital agencies',
          'E-commerce platforms',
          'Professional developers',
        ],
        useCases: [
          'Customer service automation',
          'Sales agent deployment',
          'Multi-location businesses',
          'API-first applications',
          'Production deployments',
        ],
        testimonial: {
          quote: "The Basic tier gave us everything we needed to deploy 20 customer service agents across our locations. API access was crucial!",
          author: 'Sarah Johnson',
          company: 'Retail Chain Manager',
        },
      },
      
      cta: {
        primary: 'Start 14-Day Trial',
        secondary: 'Cancel anytime',
      },
      
      availableAddons: [
        'extra-npes-10',
        'extra-locations-5',
        'priority-support',
        'advanced-analytics',
        'white-label',
        'custom-domain',
      ],
      
      trial: {
        enabled: true,
        durationDays: 14,
        requiresCreditCard: true,
      },
    };
  }

  /**
   * PROFESSIONAL PRODUCT (Previously "PREMIUM")
   */
  private getProfessionalProduct(): TierProduct {
    return {
      tier: NPETier.PREMIUM,
      name: 'Professional',
      tagline: 'Enterprise-grade AI agent infrastructure',
      description: 'For large businesses and enterprises requiring unlimited agents, global reach, priority support, and advanced features.',
      
      pricing: {
        monthly: 50,
        yearly: 500, // 2 months free
        currency: 'USD',
        billingCycle: 'monthly',
      },
      
      limits: {
        maxNPEs: Infinity,
        maxSchemaFields: Infinity,
        maxLocations: Infinity,
        serviceRadius: Infinity,
        litActions: 'full-priority',
        support: 'dedicated',
        apiAccess: true,
        analytics: 'advanced',
        xrNetworking: true,
      },
      
      quotas: [
        {
          name: 'NPE Agents',
          limit: 'unlimited',
          unit: 'agents',
          resetPeriod: 'never',
        },
        {
          name: 'Custom Schema Fields',
          limit: 'unlimited',
          unit: 'fields per NPE',
          resetPeriod: 'never',
        },
        {
          name: 'XR Locations',
          limit: 'unlimited',
          unit: 'locations',
          resetPeriod: 'never',
        },
        {
          name: 'Service Radius',
          limit: 'unlimited',
          unit: 'global',
          resetPeriod: 'never',
        },
        {
          name: 'AI Interactions',
          limit: 'unlimited',
          unit: 'requests',
          resetPeriod: 'monthly',
        },
        {
          name: 'Storage',
          limit: 100,
          unit: 'GB',
          resetPeriod: 'never',
          overage: {
            allowed: true,
            pricePerUnit: 0.05,
          },
        },
        {
          name: 'Concurrent Sessions',
          limit: 'unlimited',
          unit: 'sessions',
          resetPeriod: 'never',
        },
        {
          name: 'API Requests',
          limit: 'unlimited',
          unit: 'requests',
          resetPeriod: 'monthly',
        },
      ],
      
      features: [
        // Agents
        {
          category: FeatureCategory.AGENTS,
          name: 'NPE Agents',
          description: 'Unlimited AI-powered NPE agents',
          value: 'Unlimited',
          highlighted: true,
          icon: '🤖',
        },
        {
          category: FeatureCategory.AGENTS,
          name: 'Pre-built Templates',
          description: 'Access all agent templates + custom templates',
          value: true,
          icon: '📋',
        },
        {
          category: FeatureCategory.AGENTS,
          name: 'Custom Agent Types',
          description: 'Unlimited custom agent types',
          value: 'Unlimited',
          highlighted: true,
        },
        {
          category: FeatureCategory.AGENTS,
          name: 'Agent Collaboration',
          description: 'Advanced multi-agent orchestration',
          value: 'Advanced',
        },
        {
          category: FeatureCategory.AGENTS,
          name: 'Agent Marketplace',
          description: 'Sell your agents on marketplace',
          value: true,
        },
        
        // Customization
        {
          category: FeatureCategory.CUSTOMIZATION,
          name: 'Custom Fields',
          description: 'Unlimited custom schema fields',
          value: 'Unlimited',
          highlighted: true,
          icon: '⚙️',
        },
        {
          category: FeatureCategory.CUSTOMIZATION,
          name: 'Agent Personalities',
          description: 'Full personality customization + AI training',
          value: 'Full + AI Training',
        },
        {
          category: FeatureCategory.CUSTOMIZATION,
          name: 'Branding',
          description: 'Complete white-label capabilities',
          value: 'White-label',
        },
        {
          category: FeatureCategory.CUSTOMIZATION,
          name: 'Custom Workflows',
          description: 'Visual workflow builder',
          value: 'Visual Builder',
        },
        {
          category: FeatureCategory.CUSTOMIZATION,
          name: 'Custom UI',
          description: 'Fully customizable interface',
          value: true,
        },
        
        // Geography
        {
          category: FeatureCategory.GEOGRAPHY,
          name: 'XR Locations',
          description: 'Unlimited XR environment locations',
          value: 'Unlimited',
          highlighted: true,
          icon: '📍',
        },
        {
          category: FeatureCategory.GEOGRAPHY,
          name: 'Service Radius',
          description: 'Global service coverage',
          value: 'Global',
          highlighted: true,
        },
        {
          category: FeatureCategory.GEOGRAPHY,
          name: 'Geo-routing',
          description: 'AI-powered geographic routing',
          value: 'AI-powered',
        },
        {
          category: FeatureCategory.GEOGRAPHY,
          name: 'Multi-region Support',
          description: 'Global multi-region deployment',
          value: 'Global',
        },
        {
          category: FeatureCategory.GEOGRAPHY,
          name: 'Edge Computing',
          description: 'Deploy to edge locations',
          value: true,
        },
        
        // Automation
        {
          category: FeatureCategory.AUTOMATION,
          name: 'Lit Actions',
          description: 'Priority Lit Protocol actions',
          value: 'Priority',
          highlighted: true,
          icon: '⚡',
        },
        {
          category: FeatureCategory.AUTOMATION,
          name: 'Scheduled Tasks',
          description: 'Unlimited scheduled automation',
          value: 'Unlimited',
        },
        {
          category: FeatureCategory.AUTOMATION,
          name: 'Webhooks',
          description: 'Unlimited HTTP webhooks',
          value: 'Unlimited',
        },
        {
          category: FeatureCategory.AUTOMATION,
          name: 'Event Triggers',
          description: 'Advanced event-based automation',
          value: 'Advanced',
        },
        {
          category: FeatureCategory.AUTOMATION,
          name: 'Custom Functions',
          description: 'Deploy custom serverless functions',
          value: true,
        },
        
        // Support
        {
          category: FeatureCategory.SUPPORT,
          name: 'Support Type',
          description: 'Dedicated account manager',
          value: 'Dedicated',
          highlighted: true,
          icon: '💬',
        },
        {
          category: FeatureCategory.SUPPORT,
          name: 'Response Time',
          description: '2-hour response guarantee',
          value: '2 hours',
        },
        {
          category: FeatureCategory.SUPPORT,
          name: 'Documentation',
          description: 'Full docs + custom documentation',
          value: true,
          icon: '📚',
        },
        {
          category: FeatureCategory.SUPPORT,
          name: 'Onboarding',
          description: 'Dedicated onboarding team',
          value: 'Team',
        },
        {
          category: FeatureCategory.SUPPORT,
          name: 'Training',
          description: 'Quarterly training sessions',
          value: true,
        },
        {
          category: FeatureCategory.SUPPORT,
          name: 'Slack Channel',
          description: 'Private Slack support channel',
          value: true,
        },
        
        // Integration
        {
          category: FeatureCategory.INTEGRATION,
          name: 'REST API',
          description: 'Full REST API with priority rate limits',
          value: true,
          highlighted: true,
          icon: '🔌',
        },
        {
          category: FeatureCategory.INTEGRATION,
          name: 'GraphQL API',
          description: 'Advanced GraphQL with subscriptions',
          value: 'Advanced',
        },
        {
          category: FeatureCategory.INTEGRATION,
          name: 'Webhooks',
          description: 'Unlimited event-driven integrations',
          value: 'Unlimited',
        },
        {
          category: FeatureCategory.INTEGRATION,
          name: 'SDK Access',
          description: 'All SDKs + custom SDK generation',
          value: 'All + Custom',
        },
        {
          category: FeatureCategory.INTEGRATION,
          name: 'Enterprise Connectors',
          description: 'Salesforce, SAP, Oracle, etc.',
          value: true,
        },
        
        // Analytics
        {
          category: FeatureCategory.ANALYTICS,
          name: 'Analytics',
          description: 'Advanced analytics with AI insights',
          value: 'Advanced',
          highlighted: true,
          icon: '📊',
        },
        {
          category: FeatureCategory.ANALYTICS,
          name: 'Dashboard',
          description: 'Customizable analytics dashboards',
          value: 'Customizable',
        },
        {
          category: FeatureCategory.ANALYTICS,
          name: 'Data Export',
          description: 'Export in all formats (CSV, JSON, Parquet)',
          value: 'All formats',
        },
        {
          category: FeatureCategory.ANALYTICS,
          name: 'Custom Reports',
          description: 'Unlimited custom reports',
          value: 'Unlimited',
        },
        {
          category: FeatureCategory.ANALYTICS,
          name: 'Real-time Analytics',
          description: 'Live streaming analytics',
          value: true,
        },
        {
          category: FeatureCategory.ANALYTICS,
          name: 'Predictive Analytics',
          description: 'AI-powered predictions',
          value: true,
        },
        
        // Networking
        {
          category: FeatureCategory.NETWORKING,
          name: 'XR Networking',
          description: 'Advanced XR networking + spatial computing',
          value: true,
          highlighted: true,
          icon: '🌐',
        },
        {
          category: FeatureCategory.NETWORKING,
          name: 'Multi-user Sessions',
          description: 'Unlimited concurrent users',
          value: 'Unlimited',
        },
        {
          category: FeatureCategory.NETWORKING,
          name: 'WebSocket Support',
          description: 'Priority WebSocket connections',
          value: 'Priority',
        },
        {
          category: FeatureCategory.NETWORKING,
          name: 'WebRTC Support',
          description: 'Peer-to-peer connections',
          value: true,
        },
        {
          category: FeatureCategory.NETWORKING,
          name: 'Load Balancing',
          description: 'Advanced load balancing',
          value: 'Advanced',
        },
        
        // Security
        {
          category: FeatureCategory.SECURITY,
          name: 'PKP Authentication',
          description: 'Enterprise PKP security',
          value: 'Enterprise',
          icon: '🔐',
        },
        {
          category: FeatureCategory.SECURITY,
          name: 'SSL/TLS',
          description: 'Custom SSL certificates',
          value: 'Custom',
        },
        {
          category: FeatureCategory.SECURITY,
          name: 'Audit Logs',
          description: 'Unlimited audit log retention',
          value: 'Unlimited',
        },
        {
          category: FeatureCategory.SECURITY,
          name: 'IP Whitelisting',
          description: 'Advanced IP management',
          value: 'Advanced',
        },
        {
          category: FeatureCategory.SECURITY,
          name: 'SSO',
          description: 'Single sign-on (SAML, OAuth)',
          value: true,
        },
        {
          category: FeatureCategory.SECURITY,
          name: 'Compliance',
          description: 'SOC 2, GDPR, HIPAA',
          value: true,
        },
        
        // Performance
        {
          category: FeatureCategory.PERFORMANCE,
          name: 'Uptime SLA',
          description: '99.9% uptime guarantee',
          value: '99.9%',
          highlighted: true,
        },
        {
          category: FeatureCategory.PERFORMANCE,
          name: 'Response Priority',
          description: 'Highest priority processing',
          value: 'Highest',
        },
        {
          category: FeatureCategory.PERFORMANCE,
          name: 'Rate Limiting',
          description: 'Custom rate limits',
          value: 'Custom',
        },
        {
          category: FeatureCategory.PERFORMANCE,
          name: 'CDN',
          description: 'Premium global CDN',
          value: 'Premium',
        },
        {
          category: FeatureCategory.PERFORMANCE,
          name: 'Dedicated Resources',
          description: 'Dedicated compute resources',
          value: true,
        },
      ],
      
      marketing: {
        bestValue: true,
        targetAudience: [
          'Enterprise companies',
          'Global brands',
          'Large e-commerce platforms',
          'Fortune 500 companies',
          'Government agencies',
        ],
        useCases: [
          'Enterprise-wide AI agent deployment',
          'Global customer service networks',
          'Multi-brand agent management',
          'High-volume production workloads',
          'Mission-critical applications',
        ],
        testimonial: {
          quote: "Professional tier powers our global network of 500+ AI agents across 50 countries. The dedicated support and 99.9% SLA are critical for our business.",
          author: 'Michael Rodriguez',
          company: 'Global Retail Corp',
        },
      },
      
      cta: {
        primary: 'Start 30-Day Trial',
        secondary: 'Talk to sales',
      },
      
      availableAddons: [
        'white-label',
        'custom-domain',
        'sla-guarantee',
      ],
      
      trial: {
        enabled: true,
        durationDays: 30,
        requiresCreditCard: true,
      },
    };
  }

  /**
   * Compare features across tiers
   */
  compareFeatures(category?: FeatureCategory): Map<string, { freemium: any; basic: any; professional: any }> {
    const freemium = this.getFreemiumProduct();
    const basic = this.getBasicProduct();
    const professional = this.getProfessionalProduct();
    
    const comparison = new Map<string, { freemium: any; basic: any; professional: any }>();
    
    // Filter by category if specified
    const freemiumFeatures = category 
      ? freemium.features.filter(f => f.category === category)
      : freemium.features;
    
    freemiumFeatures.forEach(feature => {
      const basicFeature = basic.features.find(f => f.name === feature.name);
      const professionalFeature = professional.features.find(f => f.name === feature.name);
      
      comparison.set(feature.name, {
        freemium: feature.value,
        basic: basicFeature?.value ?? false,
        professional: professionalFeature?.value ?? false,
      });
    });
    
    return comparison;
  }

  /**
   * Get pricing comparison
   */
  getPricingComparison(): {
    freemium: number;
    basic: { monthly: number; yearly: number; yearlySavings: number };
    professional: { monthly: number; yearly: number; yearlySavings: number };
  } {
    const freemium = this.getFreemiumProduct();
    const basic = this.getBasicProduct();
    const professional = this.getProfessionalProduct();
    
    return {
      freemium: freemium.pricing.monthly,
      basic: {
        monthly: basic.pricing.monthly,
        yearly: basic.pricing.yearly! / 12,
        yearlySavings: (basic.pricing.monthly * 12) - basic.pricing.yearly!,
      },
      professional: {
        monthly: professional.pricing.monthly,
        yearly: professional.pricing.yearly! / 12,
        yearlySavings: (professional.pricing.monthly * 12) - professional.pricing.yearly!,
      },
    };
  }
}
