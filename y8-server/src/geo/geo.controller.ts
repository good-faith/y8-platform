import {
  Controller, Get, Post, Delete, Body, Param, Query,
  UseGuards, ParseFloatPipe, DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GeoService } from './geo.service';
import { CreateZoneDto, NearbyQuery } from './geo.types';

@Controller('geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  /** Platform-wide zone stats */
  @Get('stats')
  stats() {
    return this.geoService.stats();
  }

  /** List all active zones */
  @Get('zones')
  listZones() {
    return this.geoService.findAll();
  }

  /** Find zones near a coordinate */
  @Get('zones/nearby')
  nearby(
    @Query('lat',      ParseFloatPipe) lat: number,
    @Query('lng',      ParseFloatPipe) lng: number,
    @Query('radiusKm', new DefaultValuePipe(10), ParseFloatPipe) radiusKm: number,
    @Query('category') category?: string,
  ) {
    const query: NearbyQuery = { lat, lng, radiusKm, category };
    return this.geoService.findNearby(query);
  }

  /** Zones by country code */
  @Get('zones/country/:code')
  byCountry(@Param('code') code: string) {
    return this.geoService.findByCountry(code);
  }

  /** Single zone detail */
  @Get('zones/:id')
  getZone(@Param('id') id: string) {
    return this.geoService.findById(id);
  }

  /** Check if a point is inside a zone */
  @Get('zones/:id/contains')
  contains(
    @Param('id') id: string,
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lng', ParseFloatPipe) lng: number,
  ) {
    return { inside: this.geoService.contains(id, { lat, lng }) };
  }

  /** Create a new zone (auth required) */
  @Post('zones')
  @UseGuards(JwtAuthGuard)
  createZone(@Body() dto: CreateZoneDto, @CurrentUser() user: any) {
    return this.geoService.create(dto, user.walletAddress);
  }

  /** On-chain verify a zone (auth required) */
  @Post('zones/:id/verify')
  @UseGuards(JwtAuthGuard)
  verifyZone(@Param('id') id: string, @Body('txHash') txHash: string) {
    return this.geoService.verify(id, txHash);
  }

  /** Deactivate a zone (auth required) */
  @Delete('zones/:id')
  @UseGuards(JwtAuthGuard)
  deactivate(@Param('id') id: string) {
    return this.geoService.deactivate(id);
  }
}
