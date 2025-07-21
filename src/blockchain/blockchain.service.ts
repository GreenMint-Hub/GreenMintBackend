import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class BlockchainService {
  private logger = new Logger(BlockchainService.name);

  async mintNFT(to: string, metadataUri: string): Promise<string> {
    this.logger.log(`[MOCK] Minting NFT for ${to} with metadata ${metadataUri}`);
    // Simulate a blockchain tx hash
    return '0xMOCKED_NFT_TX_HASH';
  }

  async sendTokens(to: string, amount: string): Promise<string> {
    this.logger.log(`[MOCK] Sending tokens to ${to} amount ${amount}`);
    return '0xMOCKED_TOKEN_TX_HASH';
  }
}
