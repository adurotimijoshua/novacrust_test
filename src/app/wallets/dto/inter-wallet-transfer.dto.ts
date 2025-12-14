import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class InterWalletTransferDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  senderWalletId: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  receiverWalletId: string;

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
