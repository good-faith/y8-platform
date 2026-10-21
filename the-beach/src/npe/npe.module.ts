/**
 * NPE Module
 * 
 * This module provides NPE (Non-Person Entity) team management
 * for the Lit Compute Network development project.
 */

import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { NPEController } from './npe.controller';
import { PKPController } from './pkp.controller';
import { AIController } from './ai.controller';
import { PKPAuthController } from './pkp-auth.controller';
import { TierProductsController } from './tier-products.controller';
import { TaskAssignmentController } from './task-assignment.controller';
import { LitComputeTeamService } from './lit-compute-team.service';
import { GameManagerService } from './game-manager.service';
import { NPETierManagerService } from './npe-tier-manager.service';
import { GeoDeploymentService } from './geo-deployment.service';
import { PKPTaskManagerService } from './pkp-task-manager.service';
import { AIAgentService } from './services/ai-agent.service';
import { PKPAuthService } from './services/pkp-auth.service';
import { TierProductsService } from './tier-products.service';
import { TaskAuthorizationService } from './services/task-authorization.service';
import { AIVRSceneAgent } from './agents/AIVRSceneAgent';
import { PKPLiveGateway } from './pkp-live.gateway';

@Module({
  imports: [EventEmitterModule.forRoot(), ScheduleModule.forRoot()],
  controllers: [NPEController, PKPController, AIController, PKPAuthController, TierProductsController, TaskAssignmentController],
  providers: [
    LitComputeTeamService,
    GameManagerService,
    NPETierManagerService,
    GeoDeploymentService,
    PKPTaskManagerService,
    AIAgentService,
    PKPAuthService,
    TierProductsService,
    TaskAuthorizationService,
    AIVRSceneAgent,
    PKPLiveGateway,
  ],
  exports: [
    LitComputeTeamService,
    GameManagerService,
    NPETierManagerService,
    GeoDeploymentService,
    PKPTaskManagerService,
    AIAgentService,
    PKPAuthService,
    TierProductsService,
    TaskAuthorizationService,
    AIVRSceneAgent,
  ],
})
export class NPEModule {}
