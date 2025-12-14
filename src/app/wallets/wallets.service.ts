import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Wallet } from '@app/wallets/entities/wallet.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FundWalletDto } from '@app/wallets/dto/fund-wallet.dto';
import { InterWalletTransferDto } from '@app/wallets/dto/inter-wallet-transfer.dto';
import { WalletHistory } from '@app/wallets/entities/wallet-history.entity';
import { WalletIdempotentTransfer } from './entities/wallet-idempotent-transfer.entity';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly _repo: Repository<Wallet>,
    private readonly _entityManager: EntityManager,
  ) {}

  create() {
    const wallet = this._repo.create({});
    return this._repo.save(wallet);
  }

  async fund({ walletId, amount, idempotencyKey }: FundWalletDto) {
    let checkIdempotency = await this._checkIdempotency(idempotencyKey);
    if (checkIdempotency.existing) return checkIdempotency.idempotency.result;

    const wallet = await this._repo.findOneBy({ id: walletId });
    if (!wallet) {
      await this._deleteIdempotency(checkIdempotency.idempotency);
      throw new NotFoundException('Wallet not found');
    }

    wallet.balance = (Number(wallet.balance) + amount).toString();
    const result = await this._repo.save(wallet);

    await this._updateIdempotency(checkIdempotency.idempotency, result);

    return result;
  }

  async transfer({
    senderWalletId,
    receiverWalletId,
    amount,
    idempotencyKey,
  }: InterWalletTransferDto) {
    let checkIdempotency = await this._checkIdempotency(idempotencyKey);
    if (checkIdempotency.existing) return checkIdempotency.idempotency.result;

    if (senderWalletId === receiverWalletId) {
      await this._deleteIdempotency(checkIdempotency.idempotency);
      throw new ConflictException(
        'Sender and receiver wallets must be different',
      );
    }

    const [fromWallet, toWallet] = await Promise.all([
      this._repo.findOneBy({ id: senderWalletId }),
      this._repo.findOneBy({ id: receiverWalletId }),
    ]);

    if (!fromWallet) {
      await this._deleteIdempotency(checkIdempotency.idempotency);
      throw new NotFoundException('Sender wallet not found');
    }

    if (!toWallet) {
      await this._deleteIdempotency(checkIdempotency.idempotency);
      throw new NotFoundException('Receiver wallet not found');
    }

    if (Number(fromWallet.balance) < amount) {
      await this._deleteIdempotency(checkIdempotency.idempotency);
      throw new NotFoundException('Insufficient funds in the sender wallet');
    }

    return this._entityManager.transaction(async (em) => {
      fromWallet.balance = (Number(fromWallet.balance) - amount).toString();
      toWallet.balance = (Number(toWallet.balance) + amount).toString();

      const senderWalletHistory = em.create(WalletHistory, {
        wallet: fromWallet,
        type: 'debit',
        oldBalance: (Number(fromWallet.balance) + amount).toString(),
        newBalance: fromWallet.balance,
        changeAmount: amount.toString(),
        status: 'succeeded',
      });

      const receiverWalletHistory = em.create(WalletHistory, {
        wallet: toWallet,
        type: 'credit',
        oldBalance: (Number(toWallet.balance) - amount).toString(),
        newBalance: toWallet.balance,
        changeAmount: amount.toString(),
        status: 'succeeded',
      });

      await Promise.all([
        em.save(Wallet, fromWallet),
        em.save(Wallet, toWallet),
        em.save(WalletHistory, senderWalletHistory),
        em.save(WalletHistory, receiverWalletHistory),
      ]);

      const result = { senderWallet: fromWallet, receiverWallet: toWallet };

      await this._updateIdempotency(checkIdempotency.idempotency, result);

      return result;
    });
  }

  async findOne(walletId: string) {
    const wallet = await this._repo.findOneBy({ id: walletId });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  getWalletHistory(walletId: string) {
    return this._entityManager
      .createQueryBuilder(WalletHistory, 'history')
      .where('history.walletId = :walletId', { walletId })
      .orderBy('history.createdAt', 'DESC');
  }

  private async _checkIdempotency(
    idempotencyKey: string,
  ): Promise<{ existing: boolean; idempotency: WalletIdempotentTransfer }> {
    let idempotency = await this._entityManager.findOne(
      WalletIdempotentTransfer,
      {
        where: { key: idempotencyKey },
      },
    );

    if (idempotency && idempotency.status === 'succeeded')
      return { existing: true, idempotency };
    if (idempotency && idempotency.status === 'pending')
      throw new ConflictException('Transaction is already being processed');

    if (!idempotency) {
      idempotency = this._entityManager.create(WalletIdempotentTransfer, {
        key: idempotencyKey,
        status: 'pending',
      });

      await this._entityManager.save(idempotency);
    }

    return { existing: false, idempotency };
  }

  private async _updateIdempotency(
    idempotency: WalletIdempotentTransfer,
    result: any,
  ) {
    idempotency.status = 'succeeded';
    idempotency.result = result;
    await this._entityManager.save(idempotency);
  }

  private async _deleteIdempotency(idempotency: WalletIdempotentTransfer) {
    await this._entityManager.remove(idempotency);
  }
}
