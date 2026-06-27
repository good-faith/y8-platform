import { IsObject, IsOptional } from 'class-validator';
import { ServiceRequest, RoutingStrategy } from '../agents.types';

export class ServiceRequestDto {
  @IsObject() request: ServiceRequest;
  @IsOptional() @IsObject() strategy?: RoutingStrategy;
}
