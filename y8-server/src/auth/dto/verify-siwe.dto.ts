import { IsString, IsNotEmpty } from 'class-validator';

export class VerifySiweDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  signature: string;
}
