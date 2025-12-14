import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class GetWalletDetailsParamDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  walletId: string;
}
