import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { NonceService } from './nonce.service';
import { SiweMessage } from 'siwe';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let nonceService: NonceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
        {
          provide: NonceService,
          useValue: {
            generate: jest.fn().mockReturnValue('mocknonce'),
            consume: jest.fn().mockReturnValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    nonceService = module.get<NonceService>(NonceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateNonce', () => {
    it('should generate a nonce and return it with expiresAt', () => {
      const res = service.generateNonce();
      expect(res.nonce).toBe('mocknonce');
      expect(res.expiresAt).toBeGreaterThan(Date.now());
      expect(nonceService.generate).toHaveBeenCalled();
    });
  });

  describe('verifySiwe', () => {
    const address = '0x1234567890123456789012345678901234567890';

    const createMessage = (overrides?: Partial<any>) => {
      const msg = new SiweMessage({
        domain: 'localhost',
        address,
        statement: 'Sign in to Y8',
        uri: 'http://localhost',
        version: '1',
        chainId: 8453,
        nonce: 'mocknonce',
        issuedAt: new Date().toISOString(),
        ...overrides,
      });
      return msg.prepareMessage();
    };

    it('should verify SIWE and return accessToken + user', async () => {
      const validMessageString = createMessage();
      const mockFields = {
        address,
        chainId: 8453,
        nonce: 'mocknonce',
      };

      const spyVerify = jest.spyOn(SiweMessage.prototype, 'verify').mockResolvedValue({
        success: true,
        data: mockFields as any,
      });

      const res = await service.verifySiwe(validMessageString, 'dummy-signature');
      expect(res.accessToken).toBe('mock-jwt-token');
      expect(res.user.walletAddress).toBe(address.toLowerCase());
      expect(nonceService.consume).toHaveBeenCalledWith('mocknonce');
      expect(jwtService.sign).toHaveBeenCalled();

      spyVerify.mockRestore();
    });

    it('should throw UnauthorizedException if SIWE verification fails', async () => {
      const validMessageString = createMessage();
      const spyVerify = jest.spyOn(SiweMessage.prototype, 'verify').mockResolvedValue({
        success: false,
        error: new Error('Invalid signature') as any,
      } as any);

      await expect(service.verifySiwe(validMessageString, 'dummy-signature')).rejects.toThrow(
        UnauthorizedException,
      );

      spyVerify.mockRestore();
    });

    it('should throw UnauthorizedException if chainId is not supported', async () => {
      const invalidMessageString = createMessage({ chainId: 1 }); // Mainnet (not supported)
      const mockFields = {
        address,
        chainId: 1,
        nonce: 'mocknonce',
      };

      const spyVerify = jest.spyOn(SiweMessage.prototype, 'verify').mockResolvedValue({
        success: true,
        data: mockFields as any,
      });

      await expect(service.verifySiwe(invalidMessageString, 'dummy-signature')).rejects.toThrow(
        UnauthorizedException,
      );

      spyVerify.mockRestore();
    });

    it('should throw UnauthorizedException if nonce already consumed', async () => {
      const validMessageString = createMessage();
      const mockFields = {
        address,
        chainId: 8453,
        nonce: 'mocknonce',
      };

      const spyVerify = jest.spyOn(SiweMessage.prototype, 'verify').mockResolvedValue({
        success: true,
        data: mockFields as any,
      });

      jest.spyOn(nonceService, 'consume').mockReturnValue(false);

      await expect(service.verifySiwe(validMessageString, 'dummy-signature')).rejects.toThrow(
        UnauthorizedException,
      );

      spyVerify.mockRestore();
    });
  });
});
