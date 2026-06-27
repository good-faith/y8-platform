import { IsString, IsArray, IsNotEmpty, IsOptional, IsNumber, Min, Max, IsObject } from 'class-validator';

export class RegisterAgentDto {
  @IsString() @IsNotEmpty() walletAddress: string;
  @IsString() @IsNotEmpty() purpose: string;
  @IsArray() @IsString({ each: true }) capabilities: string[];
  @IsOptional() @IsString() role?: string;
  @IsOptional() @IsNumber() @Min(1) @Max(100) maxLoad?: number;
  @IsOptional() @IsString() baseWalletId?: string;
  @IsOptional() tier?: 'alpha' | 'beta' | 'standard';
  @IsOptional() @IsNumber() currentLoad?: number;
  @IsOptional() @IsNumber() performanceScore?: number;
  @IsOptional() @IsObject() location?: { lat: number; lng: number };
}
