import { WalletsService } from './wallets.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('WalletsService (simple)', () => {
  let service: WalletsService;

  const walletRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
  };

  const entityManager = {
    transaction: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
    remove: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(() => {
    service = new WalletsService(
      walletRepo as any,
      entityManager as any,
    );

    // mock idempotency helpers
    jest
      .spyOn(service as any, '_checkIdempotency')
      .mockResolvedValue({ existing: false, idempotency: {} });

    jest
      .spyOn(service as any, '_updateIdempotency')
      .mockResolvedValue(undefined);

    jest
      .spyOn(service as any, '_deleteIdempotency')
      .mockResolvedValue(undefined);

    // simple transaction mock
    entityManager.transaction.mockImplementation(async (cb) => cb(entityManager));
  });

  afterEach(() => jest.clearAllMocks());

  it('creates a wallet', async () => {
    const wallet = { id: '1', balance: '0' };

    walletRepo.create.mockReturnValue(wallet);
    walletRepo.save.mockResolvedValue(wallet);

    const result = await service.create();

    expect(result).toEqual(wallet);
  });


  it('funds a wallet', async () => {
    const wallet = { id: '1', balance: '100' };

    walletRepo.findOneBy.mockResolvedValue(wallet);
    walletRepo.save.mockImplementation(async (w) => w);

    const result = await service.fund({
      walletId: '1',
      amount: 50,
      idempotencyKey: 'key',
    });

    expect(result.balance).toBe('150');
  });


  it('throws if wallet not found', async () => {
    walletRepo.findOneBy.mockResolvedValue(null);

    await expect(
      service.fund({
        walletId: '1',
        amount: 50,
        idempotencyKey: 'key',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('transfers funds between wallets', async () => {
    const sender = { id: '1', balance: '200' };
    const receiver = { id: '2', balance: '50' };

    walletRepo.findOneBy
      .mockResolvedValueOnce(sender)
      .mockResolvedValueOnce(receiver);

    entityManager.create.mockImplementation((_, data) => data);
    entityManager.save.mockResolvedValue(undefined);

    const result = await service.transfer({
      senderWalletId: '1',
      receiverWalletId: '2',
      amount: 100,
      idempotencyKey: 'key',
    });

    expect(result.senderWallet.balance).toBe('100');
    expect(result.receiverWallet.balance).toBe('150');
  });

  it('throws if sender and receiver are the same', async () => {
    await expect(
      service.transfer({
        senderWalletId: '1',
        receiverWalletId: '1',
        amount: 10,
        idempotencyKey: 'key',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('throws if insufficient funds', async () => {
    walletRepo.findOneBy
      .mockResolvedValueOnce({ id: '1', balance: '10' })
      .mockResolvedValueOnce({ id: '2', balance: '0' });

    await expect(
      service.transfer({
        senderWalletId: '1',
        receiverWalletId: '2',
        amount: 50,
        idempotencyKey: 'key',
      }),
    ).rejects.toThrow(NotFoundException);
  });


  it('finds a wallet', async () => {
    const wallet = { id: '1', balance: '0' };
    walletRepo.findOneBy.mockResolvedValue(wallet);

    const result = await service.findOne('1');

    expect(result).toEqual(wallet);
  });

  it('returns wallet history query', () => {
    const qb = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
    };

    entityManager.createQueryBuilder.mockReturnValue(qb);

    const result = service.getWalletHistory('1');

    expect(result).toBe(qb);
  });
});

