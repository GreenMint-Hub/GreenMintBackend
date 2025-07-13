import { Module } from '@nestjs/common';
import { BlockchainController } from './blockchain.controller';
import { BlockchainService } from './blockchain.service';
import { SolanaService } from './solana.service';

@Module({
  controllers: [BlockchainController],
  providers: [BlockchainService, SolanaService],
  exports: [BlockchainService, SolanaService],
})
export class BlockchainModule {}
