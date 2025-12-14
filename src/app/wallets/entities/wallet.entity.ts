import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { WalletHistory } from '@app/wallets/entities/wallet-history.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ default: '0.00' })
  balance: string;

  @OneToMany(() => WalletHistory, (history) => history.wallet, {
    cascade: true,
  })
  histories?: WalletHistory[];
}
