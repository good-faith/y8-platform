import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { GeoZone, CreateZoneDto, NearbyQuery, GeoCoord } from './geo.types';

/** Haversine distance between two lat/lng points in km */
function haversineKm(a: GeoCoord, b: GeoCoord): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinLng *
      sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Point-in-polygon ray casting */
function pointInPolygon(point: GeoCoord, polygon: GeoCoord[]): boolean {
  let inside = false;
  const { lat: px, lng: py } = point;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat, yi = polygon[i].lng;
    const xj = polygon[j].lat, yj = polygon[j].lng;
    const intersect =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

@Injectable()
export class GeoService {
  private readonly logger = new Logger(GeoService.name);
  private readonly zones = new Map<string, GeoZone>();

  constructor() {
    this.seed();
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  create(dto: CreateZoneDto, walletAddress: string): GeoZone {
    if (dto.shape === 'circle' && (!dto.center || !dto.radiusMeters)) {
      throw new BadRequestException('Circle zones require center + radiusMeters');
    }
    if (dto.shape === 'polygon' && (!dto.points || dto.points.length < 3)) {
      throw new BadRequestException('Polygon zones require at least 3 points');
    }

    const zone: GeoZone = {
      id: randomUUID(),
      name: dto.name,
      description: dto.description,
      shape: dto.shape,
      center: dto.center,
      radiusMeters: dto.radiusMeters,
      points: dto.points,
      safetyScore: 50,
      safetyRating: 'unrated',
      categories: dto.categories,
      createdBy: walletAddress.toLowerCase(),
      countryCode: dto.countryCode,
      region: dto.region,
      verified: false,
      active: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.zones.set(zone.id, zone);
    this.logger.log(`📍 Zone created: "${zone.name}" by ${walletAddress}`);
    return zone;
  }

  findAll(activeOnly = true): GeoZone[] {
    const all = Array.from(this.zones.values());
    return activeOnly ? all.filter((z) => z.active) : all;
  }

  findById(id: string): GeoZone {
    const zone = this.zones.get(id);
    if (!zone) throw new NotFoundException(`Zone ${id} not found`);
    return zone;
  }

  findByCountry(countryCode: string): GeoZone[] {
    return this.findAll().filter(
      (z) => z.countryCode?.toUpperCase() === countryCode.toUpperCase(),
    );
  }

  /** Find all zones whose center is within radiusKm of the query point (circle zones only for now) */
  findNearby(query: NearbyQuery): GeoZone[] {
    const origin: GeoCoord = { lat: query.lat, lng: query.lng };
    return this.findAll().filter((zone) => {
      if (query.category && !zone.categories.includes(query.category as any)) return false;

      if (zone.shape === 'circle' && zone.center) {
        return haversineKm(origin, zone.center) <= query.radiusKm;
      }
      if (zone.shape === 'polygon' && zone.points) {
        // Check if query point is inside polygon
        return pointInPolygon(origin, zone.points);
      }
      return false;
    });
  }

  /** Check whether a coordinate falls inside a specific zone */
  contains(id: string, point: GeoCoord): boolean {
    const zone = this.findById(id);
    if (zone.shape === 'circle' && zone.center && zone.radiusMeters) {
      return haversineKm(point, zone.center) * 1000 <= zone.radiusMeters;
    }
    if (zone.shape === 'polygon' && zone.points) {
      return pointInPolygon(point, zone.points);
    }
    return false;
  }

  verify(id: string, txHash: string): GeoZone {
    const zone = this.findById(id);
    zone.verified = true;
    zone.safetyRating = 'verified';
    zone.safetyScore = Math.max(zone.safetyScore, 75);
    zone.txHash = txHash;
    zone.updatedAt = Date.now();
    this.logger.log(`✅ Zone verified on-chain: ${id} (tx: ${txHash})`);
    return zone;
  }

  deactivate(id: string): GeoZone {
    const zone = this.findById(id);
    zone.active = false;
    zone.updatedAt = Date.now();
    return zone;
  }

  updateSafetyScore(id: string, score: number): GeoZone {
    const zone = this.findById(id);
    zone.safetyScore = Math.min(100, Math.max(0, score));
    zone.safetyRating = score >= 80 ? 'verified' : score >= 50 ? 'community' : score > 0 ? 'unrated' : 'flagged';
    zone.updatedAt = Date.now();
    return zone;
  }

  stats() {
    const all = this.findAll();
    return {
      total: all.length,
      verified: all.filter((z) => z.verified).length,
      byCategory: {
        geo:    all.filter((z) => z.categories.includes('geo')).length,
        labor:  all.filter((z) => z.categories.includes('labor')).length,
        rides:  all.filter((z) => z.categories.includes('rides')).length,
        rooms:  all.filter((z) => z.categories.includes('rooms')).length,
        market: all.filter((z) => z.categories.includes('market')).length,
      },
      byCountry: all.reduce<Record<string, number>>((acc, z) => {
        if (z.countryCode) acc[z.countryCode] = (acc[z.countryCode] ?? 0) + 1;
        return acc;
      }, {}),
    };
  }

  // ── Seed data — representative global safe zones ──────────────────────────
  private seed() {
    const seeds: Array<Omit<GeoZone, 'id' | 'createdAt' | 'updatedAt'>> = [
      { name: 'Downtown Manhattan', shape: 'circle', center: { lat: 40.7580, lng: -73.9855 }, radiusMeters: 2000, safetyScore: 88, safetyRating: 'verified', categories: ['geo','labor','rides','rooms','market'], createdBy: '0xseed', verified: true, active: true, countryCode: 'US', region: 'New York' },
      { name: 'Shoreditch Tech Hub', shape: 'circle', center: { lat: 51.5227, lng: -0.0731 }, radiusMeters: 1500, safetyScore: 91, safetyRating: 'verified', categories: ['geo','labor','market'], createdBy: '0xseed', verified: true, active: true, countryCode: 'GB', region: 'London' },
      { name: 'Shinjuku District', shape: 'circle', center: { lat: 35.6896, lng: 139.6917 }, radiusMeters: 1800, safetyScore: 95, safetyRating: 'verified', categories: ['geo','labor','rides','rooms','market'], createdBy: '0xseed', verified: true, active: true, countryCode: 'JP', region: 'Tokyo' },
      { name: 'Lekki Phase 1', shape: 'circle', center: { lat: 6.4281, lng: 3.4219 }, radiusMeters: 3000, safetyScore: 72, safetyRating: 'community', categories: ['geo','labor','market'], createdBy: '0xseed', verified: false, active: true, countryCode: 'NG', region: 'Lagos' },
      { name: 'Miraflores District', shape: 'circle', center: { lat: -18.1205, lng: -70.9306 }, radiusMeters: 2500, safetyScore: 79, safetyRating: 'community', categories: ['geo','rides','rooms','market'], createdBy: '0xseed', verified: false, active: true, countryCode: 'PE', region: 'Lima' },
      { name: 'Gangnam District', shape: 'circle', center: { lat: 37.4979, lng: 127.0276 }, radiusMeters: 2200, safetyScore: 93, safetyRating: 'verified', categories: ['geo','labor','rides','rooms','market'], createdBy: '0xseed', verified: true, active: true, countryCode: 'KR', region: 'Seoul' },
      { name: 'Kreuzberg', shape: 'circle', center: { lat: 52.4975, lng: 13.3876 }, radiusMeters: 1600, safetyScore: 86, safetyRating: 'verified', categories: ['geo','labor','rooms','market'], createdBy: '0xseed', verified: true, active: true, countryCode: 'DE', region: 'Berlin' },
      { name: 'Bandra West', shape: 'circle', center: { lat: 19.0596, lng: 72.8295 }, radiusMeters: 2800, safetyScore: 78, safetyRating: 'community', categories: ['geo','labor','rides','market'], createdBy: '0xseed', verified: false, active: true, countryCode: 'IN', region: 'Mumbai' },
      { name: 'Palermo Soho', shape: 'circle', center: { lat: -34.5882, lng: -58.4317 }, radiusMeters: 2000, safetyScore: 82, safetyRating: 'community', categories: ['geo','labor','rooms','market'], createdBy: '0xseed', verified: false, active: true, countryCode: 'AR', region: 'Buenos Aires' },
      { name: 'Mission District', shape: 'circle', center: { lat: 37.7599, lng: -122.4148 }, radiusMeters: 1800, safetyScore: 80, safetyRating: 'community', categories: ['geo','labor','rides','rooms','market'], createdBy: '0xseed', verified: false, active: true, countryCode: 'US', region: 'San Francisco' },
      { name: 'Sandton CBD', shape: 'circle', center: { lat: -26.1074, lng: 28.0568 }, radiusMeters: 2500, safetyScore: 74, safetyRating: 'community', categories: ['geo','labor','market'], createdBy: '0xseed', verified: false, active: true, countryCode: 'ZA', region: 'Johannesburg' },
      { name: 'Sultanahmet', shape: 'circle', center: { lat: 41.0054, lng: 28.9768 }, radiusMeters: 1500, safetyScore: 85, safetyRating: 'verified', categories: ['geo','rides','rooms','market'], createdBy: '0xseed', verified: true, active: true, countryCode: 'TR', region: 'Istanbul' },
    ];

    for (const s of seeds) {
      const zone: GeoZone = { id: randomUUID(), ...s, createdAt: Date.now(), updatedAt: Date.now() };
      this.zones.set(zone.id, zone);
    }
    this.logger.log(`🌍 GeoService seeded with ${seeds.length} global safe zones`);
  }
}
