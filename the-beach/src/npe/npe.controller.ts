/**
 * NPE Controller - The Beach Multi-Agent Platform
 * 
 * REST API endpoints for NPE management, geo-services, tier management, and agent orchestration.
 * This is a simplified, working version compatible with current service interfaces.
 */

import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { LitComputeTeamService } from './lit-compute-team.service';
import { GameManagerService } from './game-manager.service';
import { NPETierManagerService, NPETier } from './npe-tier-manager.service';
import { GeoDeploymentService } from './geo-deployment.service';
import {
  NPETeam,
  Goal,
  DailyReport,
  WeeklyReport,
  MonthlyReport,
  GoodFaithMetrics,
  DashboardData,
} from './npe-team.types';

@Controller('npe')
export class NPEController {
  constructor(
    private readonly teamService: LitComputeTeamService,
    private readonly gameManager: GameManagerService,
    private readonly tierManager: NPETierManagerService,
    private readonly geoDeployment: GeoDeploymentService,
  ) {}

  // ====================================================================
  // EXISTING ENDPOINTS (Team Management)
  // ====================================================================

  /**
   * Get team information
   * GET /npe/team
   */
  @Get('team')
  getTeam(): NPETeam {
    return this.teamService.getTeam();
  }

  /**
   * Get all goals
   * GET /npe/goals
   */
  @Get('goals')
  getGoals(): Goal[] {
    return this.teamService.getGoals();
  }

  /**
   * Get daily report
   * GET /npe/reports/daily
   */
  @Get('reports/daily')
  async getDailyReport(): Promise<DailyReport> {
    return this.teamService.generateDailyReport();
  }

  /**
   * Get weekly report
   * GET /npe/reports/weekly
   */
  @Get('reports/weekly')
  async getWeeklyReport(): Promise<WeeklyReport> {
    return this.teamService.generateWeeklyReport();
  }

  /**
   * Get monthly report
   * GET /npe/reports/monthly
   */
  @Get('reports/monthly')
  async getMonthlyReport(): Promise<MonthlyReport> {
    return this.teamService.generateMonthlyReport();
  }

  /**
   * Get Good Faith metrics
   * GET /npe/metrics/goodfaith
   */
  @Get('metrics/goodfaith')
  getGoodFaithMetrics(): GoodFaithMetrics {
    return this.teamService.calculateGoodFaithMetrics();
  }

  /**
   * Get dashboard data
   * GET /npe/dashboard
   */
  @Get('dashboard')
  async getDashboard(): Promise<DashboardData> {
    return this.teamService.getDashboardData();
  }

  // ====================================================================
  // THE BEACH - NPE MULTI-AGENT PLATFORM API ENDPOINTS
  // ====================================================================

  // --------------------------------------------------------------------
  // NPE Management (Generate, List, Get, Update, Delete)
  // --------------------------------------------------------------------

  /**
   * Generate new NPE with tier validation
   * POST /npe/generate
   * Body: { userId, name, type, category, location?, customFields? }
   */
  @Post('generate')
  async generateNPE(@Body() config: any) {
    const npe = await this.tierManager.createNPE(config.userId, {
      name: config.name,
      type: config.type,
      category: config.category,
      location: config.location,
      customFields: config.customFields || {},
    });

    // Register default agent with Game Manager (using PKP from schema)
    const pkp = {
      address: npe.pkpAddress,
      publicKey: npe.publicKey,
    };

    await this.gameManager.registerAgent(
      pkp,
      config.type,
      config.capabilities || []
    );

    return {
      success: true,
      npe,
      message: `NPE '${npe.name}' created successfully`,
    };
  }

  /**
   * List all NPEs for a user
   * GET /npe/list?userId=xxx
   */
  @Get('list')
  async listNPEs(@Query('userId') userId: string) {
    const npeIds = this.tierManager.getUserNPEs(userId);
    const currentTier = this.tierManager.getUserTier(userId);
    const tierLimits = this.tierManager.getTierLimits(currentTier);

    return {
      success: true,
      count: npeIds.length,
      maxNPEs: tierLimits.maxNPEs,
      tier: currentTier,
      npeIds,
    };
  }

  // --------------------------------------------------------------------
  // Tier Management
  // --------------------------------------------------------------------

  /**
   * Get tier information
   * GET /tier/info?tier=base
   */
  @Get('tier/info')
  getTierInfo(@Query('tier') tier?: string) {
    if (tier) {
      const tierEnum = tier.toUpperCase() as NPETier;
      const info = this.tierManager.getTierInfo(tierEnum);
      return {
        success: true,
        ...info,
      };
    }

    // Return all tiers
    const allTiers = [NPETier.FREEMIUM, NPETier.BASE, NPETier.PREMIUM].map(t => this.tierManager.getTierInfo(t));

    return {
      success: true,
      tiers: allTiers,
    };
  }

  /**
   * Get user's current tier
   * GET /tier/current?userId=xxx
   */
  @Get('tier/current')
  getCurrentTier(@Query('userId') userId: string) {
    const tier = this.tierManager.getUserTier(userId);
    const info = this.tierManager.getTierInfo(tier);
    const npeCount = this.tierManager.getCurrentNPECount(userId);

    return {
      success: true,
      userId,
      currentTier: tier,
      ...info,
      usage: {
        npes: npeCount,
        maxNPEs: info.limits.maxNPEs,
        percentUsed: info.limits.maxNPEs === -1 ? 0 : (npeCount / info.limits.maxNPEs) * 100,
      },
    };
  }

  /**
   * Upgrade user tier
   * POST /tier/upgrade
   * Body: { userId, newTier }
   */
  @Post('tier/upgrade')
  async upgradeTier(@Body() upgrade: { userId: string; newTier: string }) {
    const newTier = upgrade.newTier.toUpperCase() as NPETier;
    await this.tierManager.upgradeTier(upgrade.userId, newTier);

    const info = this.tierManager.getTierInfo(newTier);

    return {
      success: true,
      userId: upgrade.userId,
      upgradedTo: newTier,
      ...info,
      message: `Successfully upgraded to ${newTier} tier`,
    };
  }

  // --------------------------------------------------------------------
  // Geo-Fenced Services
  // --------------------------------------------------------------------

  /**
   * Post geo-fenced service
   * POST /service/post
   * Body: { npeId, name, category, location, serviceRadius, agentPKP, pricing, availability, estimatedResponse }
   */
  @Post('service/post')
  async postService(@Body() config: any) {
    const service = await this.geoDeployment.postService({
      npeId: config.npeId,
      name: config.name,
      category: config.category,
      location: config.location,
      serviceRadius: config.serviceRadius,
      agentPKP: config.agentPKP,
      pricing: config.pricing,
      availability: config.availability,
      estimatedResponse: config.estimatedResponse,
    });

    return {
      success: true,
      service,
      message: `Service '${service.name}' posted successfully`,
    };
  }

  /**
   * Find nearby services
   * GET /service/nearby?lat=xx&lng=xx&radius=5000&category=food
   */
  @Get('service/nearby')
  async findNearbyServices(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius: string = '5000',
    @Query('category') category?: string
  ) {
    const location = {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    };

    const services = await this.geoDeployment.findNearbyServices(
      location,
      parseInt(radius, 10),
      category
    );

    return {
      success: true,
      location,
      radiusMeters: parseInt(radius, 10),
      category,
      count: services.length,
      services,
    };
  }

  /**
   * Get service details
   * GET /service/:id
   */
  @Get('service/:id')
  async getService(@Param('id') serviceId: string) {
    const service = await this.geoDeployment.getService(serviceId);

    if (!service) {
      return {
        success: false,
        error: 'Service not found',
      };
    }

    return {
      success: true,
      service,
    };
  }

  /**
   * Update service
   * PUT /service/:id
   * Body: updates
   */
  @Put('service/:id')
  async updateService(@Param('id') serviceId: string, @Body() updates: any) {
    const service = await this.geoDeployment.updateService(serviceId, updates);

    return {
      success: true,
      service,
      message: 'Service updated successfully',
    };
  }

  /**
   * Delete service
   * DELETE /service/:id
   */
  @Delete('service/:id')
  async deleteService(@Param('id') serviceId: string) {
    await this.geoDeployment.removeService(serviceId);

    return {
      success: true,
      message: 'Service deleted successfully',
    };
  }

  // --------------------------------------------------------------------
  // Game Manager & Agent Orchestration
  // --------------------------------------------------------------------

  /**
   * Get all agents
   * GET /agents?purpose=sales-agent
   */
  @Get('agents')
  async getAgents(@Query('purpose') purpose?: string) {
    let agents;
    
    if (purpose) {
      agents = await this.gameManager.getAgentsByPurpose(purpose);
    } else {
      const stats = this.gameManager.getNetworkStats();
      agents = []; // Would return all agents in production
    }

    return {
      success: true,
      count: agents.length,
      purpose,
      agents,
    };
  }

  /**
   * Get agent details
   * GET /agents/:id
   */
  @Get('agents/:id')
  async getAgent(@Param('id') agentId: string) {
    const agent = await this.gameManager.getAgent(agentId);

    if (!agent) {
      return {
        success: false,
        error: 'Agent not found',
      };
    }

    return {
      success: true,
      agent,
    };
  }

  /**
   * Get network statistics
   * GET /network/stats
   */
  @Get('network/stats')
  getNetworkStats() {
    const stats = this.gameManager.getNetworkStats();

    return {
      success: true,
      stats,
    };
  }

  /**
   * Get active sessions
   * GET /sessions/active
   */
  @Get('sessions/active')
  async getActiveSessions() {
    const stats = this.gameManager.getNetworkStats();

    return {
      success: true,
      activeSessions: stats.activeSessions,
      totalSessions: stats.totalSessions,
    };
  }

  /**
   * Get service coverage map
   * GET /map/coverage
   */
  @Get('map/coverage')
  getServiceCoverageMap() {
    const coverage = this.geoDeployment.getServiceCoverageMap();

    return {
      success: true,
      services: coverage,
    };
  }

  /**
   * Get service statistics
   * GET /service/stats
   */
  @Get('service/stats')
  getServiceStats() {
    const stats = this.geoDeployment.getServiceStats();

    return {
      success: true,
      ...stats,
    };
  }
}
