import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('nft')
export class NftController {
  constructor() {}

  @Post('mint')
  @UseGuards(JwtAuthGuard)
  async mintNFT(@Body() nftData: any, @Request() req) {
    const userId = req.user.userId || req.user.sub;
    
    // For now, just return success. In a real app, this would mint an NFT on the blockchain
    return {
      message: 'NFT minted successfully',
      nft: {
        id: Date.now().toString(),
        ...nftData,
        userId,
        mintedAt: new Date().toISOString(),
      },
    };
  }
} 