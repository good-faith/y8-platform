import { Injectable, Logger } from '@nestjs/common';
import { GameManagerService, Agent } from './game-manager.service';

/**
 * Geo-Fenced Deployment Service
 * 
 * Manages location-based NPE services with geospatial indexing,
 * service discovery, and proximity-based routing.
 * 
 * Based on The Beach's geo-fenced service deployment pattern.
 */

export interface ServiceListing {
  id: string;
  npeId: string;
  name: string;
  category: string; // 'food-delivery', 'equipment-rental', 'wellness', etc.
  location: {
    lat: number;
    lng: number;
  };
  serviceRadius: number; // meters
  geofence: GeoPoint[];
  agentPKP: {
    address: string;
    publicKey: string;
  };
  pricing: Record<string, any>;
  availability: string; // '24/7', '9am-5pm', etc.
  estimatedResponse: number; // seconds
  status: 'active' | 'paused' | 'offline';
  metadata?: Record<string, any>;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface NearbyService extends ServiceListing {
  distance: number; // meters
  eta: number; // minutes
}

@Injectable()
export class GeoDeploymentService {
  private readonly logger = new Logger(GeoDeploymentService.name);
  
  // Service database (in production, use PostGIS or MongoDB with geospatial indexing)
  private serviceDatabase = new Map<string, ServiceListing>();
  private geoIndex = new Map<string, ServiceListing[]>(); // Grid-based index for fast lookups

  constructor(
    private readonly gameManager: GameManagerService,
  ) {
    this.logger.log('🌍 Geo-Deployment Service initialized');
  }

  /**
   * Post a new geo-fenced service
   */
  async postService(config: Omit<ServiceListing, 'id' | 'geofence' | 'status'>): Promise<ServiceListing> {
    const listing: ServiceListing = {
      id: this.generateServiceId(),
      ...config,
      geofence: this.createCircularGeofence(config.location, config.serviceRadius),
      status: 'active',
    };

    // Store in database
    this.serviceDatabase.set(listing.id, listing);

    // Index for geospatial queries
    this.insertIntoGeoIndex(listing);

    // Register agent with Game Manager
    await this.gameManager.registerAgent(
      listing.agentPKP,
      `geo-service-${listing.category}`,
      [listing.category, 'location-based'],
      {
        location: listing.location,
        serviceArea: {
          type: 'circle',
          center: listing.location,
          radius: listing.serviceRadius,
        },
        metadata: {
          serviceId: listing.id,
          pricing: listing.pricing,
          availability: listing.availability,
        },
      },
    );

    this.logger.log(`📍 Service posted: ${listing.name} at (${listing.location.lat}, ${listing.location.lng})`);
    this.logger.log(`   Category: ${listing.category}`);
    this.logger.log(`   Radius: ${listing.serviceRadius}m`);
    this.logger.log(`   ETA: ${listing.estimatedResponse / 60}min`);

    return listing;
  }

  /**
   * Find nearest service provider
   */
  async findNearestProvider(
    customerLocation: GeoPoint,
    serviceType: string,
    searchRadius: number = 10000, // 10km default
  ): Promise<NearbyService | null> {
    // Query geospatial index for nearby services
    const nearbyServices = this.queryRadius(customerLocation, searchRadius).filter(
      s => s.category === serviceType && s.status === 'active',
    );

    if (nearbyServices.length === 0) {
      this.logger.warn(`No providers found for ${serviceType} in ${searchRadius}m radius`);
      return null;
    }

    // Calculate distances and sort by proximity
    const servicesWithDistance: NearbyService[] = nearbyServices.map(service => ({
      ...service,
      distance: this.calculateDistance(customerLocation, service.location),
      eta: this.estimateArrival(
        customerLocation,
        service.location,
        service.estimatedResponse,
      ),
    }));

    // Sort by distance
    servicesWithDistance.sort((a, b) => a.distance - b.distance);

    const nearest = servicesWithDistance[0];

    this.logger.log(`🎯 Nearest ${serviceType}: ${nearest.name}`);
    this.logger.log(`   Distance: ${Math.round(nearest.distance)}m`);
    this.logger.log(`   ETA: ${nearest.eta}min`);

    return nearest;
  }

  /**
   * Find all nearby services
   */
  async findNearbyServices(
    customerLocation: GeoPoint,
    searchRadius: number = 10000,
    category?: string,
  ): Promise<NearbyService[]> {
    const nearbyServices = this.queryRadius(customerLocation, searchRadius).filter(
      s => s.status === 'active' && (!category || s.category === category),
    );

    const servicesWithDistance: NearbyService[] = nearbyServices.map(service => ({
      ...service,
      distance: this.calculateDistance(customerLocation, service.location),
      eta: this.estimateArrival(
        customerLocation,
        service.location,
        service.estimatedResponse,
      ),
    }));

    servicesWithDistance.sort((a, b) => a.distance - b.distance);

    this.logger.log(`📍 Found ${servicesWithDistance.length} services within ${searchRadius}m`);

    return servicesWithDistance;
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  private calculateDistance(point1: GeoPoint, point2: GeoPoint): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (point1.lat * Math.PI) / 180;
    const φ2 = (point2.lat * Math.PI) / 180;
    const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
    const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Estimate arrival time
   */
  private estimateArrival(
    from: GeoPoint,
    to: GeoPoint,
    baseResponseTime: number,
  ): number {
    const distance = this.calculateDistance(from, to);
    const travelSpeed = 8.33; // meters per second (~30 km/h average)
    const travelTime = distance / travelSpeed; // seconds

    const totalTime = baseResponseTime + travelTime;
    return Math.ceil(totalTime / 60); // Convert to minutes
  }

  /**
   * Create circular geofence polygon
   */
  private createCircularGeofence(center: GeoPoint, radius: number): GeoPoint[] {
    const points: GeoPoint[] = [];
    const steps = 32; // 32-sided polygon approximation

    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * 2 * Math.PI;
      const latOffset = (radius / 111320) * Math.cos(angle);
      const lngOffset =
        (radius / (111320 * Math.cos((center.lat * Math.PI) / 180))) *
        Math.sin(angle);

      points.push({
        lat: center.lat + latOffset,
        lng: center.lng + lngOffset,
      });
    }

    return points;
  }

  /**
   * Query services within radius (simple grid-based index)
   */
  private queryRadius(center: GeoPoint, radius: number): ServiceListing[] {
    // In production, use proper geospatial database (PostGIS, MongoDB geospatial)
    // For now, brute-force search all services
    const results: ServiceListing[] = [];

    for (const service of this.serviceDatabase.values()) {
      const distance = this.calculateDistance(center, service.location);
      if (distance <= radius) {
        results.push(service);
      }
    }

    return results;
  }

  /**
   * Insert service into geospatial index
   */
  private insertIntoGeoIndex(service: ServiceListing): void {
    // Simple grid-based indexing
    // Divide world into 0.01° grid cells (~1km)
    const gridLat = Math.floor(service.location.lat * 100);
    const gridLng = Math.floor(service.location.lng * 100);
    const gridKey = `${gridLat},${gridLng}`;

    if (!this.geoIndex.has(gridKey)) {
      this.geoIndex.set(gridKey, []);
    }

    this.geoIndex.get(gridKey)!.push(service);
  }

  /**
   * Update service status
   */
  async updateServiceStatus(serviceId: string, status: 'active' | 'paused' | 'offline'): Promise<void> {
    const service = this.serviceDatabase.get(serviceId);
    
    if (service) {
      service.status = status;
      this.logger.log(`🔄 Service ${serviceId} status updated: ${status}`);
    }
  }

  /**
   * Remove service
   */
  async removeService(serviceId: string): Promise<void> {
    const service = this.serviceDatabase.get(serviceId);
    
    if (service) {
      this.serviceDatabase.delete(serviceId);
      // Also decommission agent
      await this.gameManager.decommissionAgent(service.agentPKP.address);
      this.logger.log(`🗑️ Service removed: ${serviceId}`);
    }
  }

  /**
   * Get all services
   */
  getAllServices(): ServiceListing[] {
    return Array.from(this.serviceDatabase.values());
  }

  /**
   * Get services by category
   */
  getServicesByCategory(category: string): ServiceListing[] {
    return Array.from(this.serviceDatabase.values()).filter(
      s => s.category === category,
    );
  }

  /**
   * Update service configuration
   */
  async updateService(
    serviceId: string,
    updates: Partial<ServiceListing>,
  ): Promise<ServiceListing | null> {
    const service = this.serviceDatabase.get(serviceId);
    
    if (!service) {
      return null;
    }

    // Update service
    Object.assign(service, updates);

    // Regenerate geofence if location/radius changed
    if (updates.location || updates.serviceRadius) {
      service.geofence = this.createCircularGeofence(
        service.location,
        service.serviceRadius,
      );
    }

    this.logger.log(`✏️ Service updated: ${serviceId}`);

    return service;
  }

  /**
   * Generate unique service ID
   */
  private generateServiceId(): string {
    return `service-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
   * Get service statistics
   */
  getServiceStats(): any {
    const services = this.getAllServices();
    const categories = new Map<string, number>();

    services.forEach(s => {
      categories.set(s.category, (categories.get(s.category) || 0) + 1);
    });

    return {
      totalServices: services.length,
      activeServices: services.filter(s => s.status === 'active').length,
      pausedServices: services.filter(s => s.status === 'paused').length,
      offlineServices: services.filter(s => s.status === 'offline').length,
      categoriesServed: categories.size,
      categoryBreakdown: Object.fromEntries(categories),
    };
  }

  /**
   * Check if point is within service area
   */
  isWithinServiceArea(point: GeoPoint, service: ServiceListing): boolean {
    const distance = this.calculateDistance(point, service.location);
    return distance <= service.serviceRadius;
  }

  /**
   * Get service coverage map
   */
  getServiceCoverageMap(): any {
    const services = this.getAllServices();
    
    return services.map(service => ({
      id: service.id,
      name: service.name,
      category: service.category,
      center: service.location,
      radius: service.serviceRadius,
      status: service.status,
    }));
  }

  /**
   * Get service by ID
   */
  async getService(serviceId: string): Promise<ServiceListing | null> {
    return this.serviceDatabase.get(serviceId) || null;
  }
}
