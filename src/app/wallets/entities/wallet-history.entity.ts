import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Wallet } from '@app/wallets/entities/wallet.entity';

@Entity('wallet_histories')
export class WalletHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'USD' })
  currency: string;

  @Column()
  oldBalance: string;

  @Column()
  newBalance: string;

  @Column()
  changeAmount: string;

  @Column()
  type: 'credit' | 'debit';

  @Column()
  status: 'pending' | 'succeeded' | 'failed';

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @ManyToOne(() => Wallet, (wallet) => wallet.histories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'walletId' })
  wallet: Wallet;
}
