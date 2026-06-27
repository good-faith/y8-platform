import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { VerifySiweDto } from './dto/verify-siwe.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Step 1: frontend requests a nonce to include in the SIWE message */
  @Get('nonce')
  getNonce() {
    return this.authService.generateNonce();
  }

  /** Step 2: frontend submits signed SIWE message */
  @Post('siwe/verify')
  @HttpCode(200)
  verifySiwe(@Body() dto: VerifySiweDto) {
    return this.authService.verifySiwe(dto.message, dto.signature);
  }

  /** Get current authenticated user profile */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: Request & { user: any }) {
    return req.user;
  }
}
