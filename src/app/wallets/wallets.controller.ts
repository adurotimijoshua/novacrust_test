import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { InterWalletTransferDto } from '@app/wallets/dto/inter-wallet-transfer.dto';
import { GetWalletDetailsParamDto } from '@app/wallets/dto/get-wallet-details-param.dto';
import AppResponse from '@libs/helpers/AppResponse';
import express from 'express';

@Controller('wallets')
export class WalletsController extends AppResponse {
  constructor(private readonly walletsService: WalletsService) {
    super();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create() {
    const response = await this.walletsService.create();
    return this.data(response);
  }

  @Post('fund')
  @HttpCode(HttpStatus.OK)
  async fund(@Body() body: FundWalletDto) {
    const response = await this.walletsService.fund(body);
    return this.data(response);
  }

  @Post('transfer')
  @HttpCode(HttpStatus.OK)
  async transfer(@Body() body: InterWalletTransferDto) {
    const response = await this.walletsService.transfer(body);
    return this.data(response);
  }

  @Get(':walletId')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param() { walletId }: GetWalletDetailsParamDto) {
    const response = await this.walletsService.findOne(walletId);
    return this.data(response);
  }

  @Get(':walletId/history')
  @HttpCode(HttpStatus.OK)
  history(
    @Req() req: express.Request,
    @Param() { walletId }: GetWalletDetailsParamDto,
  ) {
    const data = this.walletsService.getWalletHistory(walletId);
    return this.applyHTEAOS(req, data);
  }
}
