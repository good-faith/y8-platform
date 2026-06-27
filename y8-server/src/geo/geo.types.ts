export type ZoneShape = 'circle' | 'polygon';

export type SafetyRating = 'verified' | 'community' | 'unrated' | 'flagged';

export interface GeoCoord {
  lat: number;
  lng: number;
}

export interface GeoZone {
  id: string;
  name: string;
  description?: string;
  shape: ZoneShape;
  /** Center point — required for circle zones */
  center?: GeoCoord;
  /** Radius in meters — required for circle zones */
  radiusMeters?: number;
  /** Polygon vertices — required for polygon zones */
  points?: GeoCoord[];
  /** 0-100 safety score */
  safetyScore: number;
  safetyRating: SafetyRating;
  /** Which service categories are active in this zone */
  categories: Array<'geo' | 'labor' | 'rides' | 'rooms' | 'market'>;
  /** Wallet address of creator */
  createdBy: string;
  /** Base chain tx hash if the zone is on-chain verified */
  txHash?: string;
  /** ISO country code e.g. 'US', 'MX', 'NG' */
  countryCode?: string;
  /** Human-readable city/region */
  region?: string;
  verified: boolean;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CreateZoneDto {
  name: string;
  description?: string;
  shape: ZoneShape;
  center?: GeoCoord;
  radiusMeters?: number;
  points?: GeoCoord[];
  categories: GeoZone['categories'];
  countryCode?: string;
  region?: string;
}

export interface NearbyQuery {
  lat: number;
  lng: number;
  radiusKm: number;
  category?: string;
}
