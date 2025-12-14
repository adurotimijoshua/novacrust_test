import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class FundWalletDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  walletId: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(255)
  idempotencyKey: string;
}
