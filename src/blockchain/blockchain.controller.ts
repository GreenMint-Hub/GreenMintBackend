import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  BadRequestException,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  BlockchainService,
  ActivityLogData,
  NFTMintData,
} from './blockchain.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

export interface LogActivityDto {
  userAddress: string;
  activityType: string;
  carbonSaved: number;
  points: number;
  metadata: string;
}

export interface MintNFTDto {
  toAddress: string;
  tokenURI: string;
  carbonSaved: number;
}

@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Post('log-activity')
  async logActivity(@Body() logActivityDto: LogActivityDto) {
    const activityData: ActivityLogData = {
      userAddress: logActivityDto.userAddress,
      activityType: logActivityDto.activityType,
      carbonSaved: logActivityDto.carbonSaved,
      points: logActivityDto.points,
      metadata: logActivityDto.metadata,
    };

    return this.blockchainService.logActivity(activityData);
  }

  @Post('claim-reward')
  @UseGuards(JwtAuthGuard)
  async claimReward(@Body() body: any, @Request() req) {
    // Placeholder for blockchain reward claiming
    return {
      success: true,
      message: 'Blockchain integration coming soon',
      transactionHash: '0x1234567890abcdef...',
      reward: body.reward || 100,
    };
  }

  @Post('mint-nft')
  @UseGuards(JwtAuthGuard)
  async mintNFT(@Body() body: any, @Request() req) {
    // Placeholder for NFT minting
    return {
      success: true,
      message: 'NFT minting coming soon',
      tokenId: '12345',
      tokenURI: 'ipfs://QmExampleNFT',
      transactionHash: '0xabcdef1234567890...',
    };
  }

  @Get('wallet-status')
  @UseGuards(JwtAuthGuard)
  async getWalletStatus(@Request() req) {
    // Placeholder for wallet connection status
    return {
      connected: false,
      address: null,
      network: 'polygon',
      message: 'Wallet connection coming soon',
    };
  }

  @Post('connect-wallet')
  @UseGuards(JwtAuthGuard)
  async connectWallet(@Body() body: any, @Request() req) {
    // Placeholder for wallet connection
    return {
      success: true,
      message: 'Wallet connection coming soon',
      address: body.address || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    };
  }

  @Get('user-rewards')
  @UseGuards(JwtAuthGuard)
  async getUserRewards(@Request() req) {
    // Placeholder for user rewards
    return {
      availableRewards: 500,
      claimedRewards: 250,
      pendingRewards: 100,
      message: 'Rewards system coming soon',
    };
  }

  @Get('user/:address/stats')
  async getUserStats(@Param('address') address: string) {
    const stats = await this.blockchainService.getUserStats(address);

    // Convert bigint values to strings for JSON serialization
    return {
      totalCarbonSaved: stats.totalCarbonSaved.toString(),
      totalPoints: stats.totalPoints.toString(),
      activityCount: stats.activityCount.toString(),
      nftCount: stats.nftCount.toString(),
    };
  }

  @Get('activity/:id')
  async getActivity(@Param('id') id: string) {
    const activityId = BigInt(id);
    const activity = await this.blockchainService.getActivity(activityId);

    // Convert bigint values to strings for JSON serialization
    return {
      user: activity.user,
      activityType: activity.activityType,
      carbonSaved: activity.carbonSaved.toString(),
      points: activity.points.toString(),
      timestamp: activity.timestamp.toString(),
      metadata: activity.metadata,
    };
  }

  @Get('user/:address/nft-balance')
  async getNFTBalance(@Param('address') address: string) {
    const balance = await this.blockchainService.getNFTBalance(address);
    return { balance: balance.toString() };
  }

  @Get('nft/:tokenId/uri')
  async getNFTTokenURI(@Param('tokenId') tokenId: string) {
    const id = BigInt(tokenId);
    const tokenURI = await this.blockchainService.getNFTTokenURI(id);
    return { tokenURI };
  }

  @Get('status')
  async getBlockchainStatus() {
    const isConnected = this.blockchainService.isConnected();
    const network = this.blockchainService.getCurrentNetwork();
    const walletAddress = this.blockchainService.getWalletAddress();

    let walletBalance: string | null = null;
    if (walletAddress) {
      try {
        walletBalance = await this.blockchainService.getWalletBalance();
      } catch (error) {
        // Ignore balance errors for status check
      }
    }

    return {
      connected: isConnected,
      network: {
        name: network.name,
        chainId: network.chainId,
        explorerUrl: network.explorerUrl,
      },
      wallet: {
        address: walletAddress,
        balance: walletBalance,
      },
    };
  }

  @Post('test-log-activity')
  async testLogActivity() {
    // Test activity logging with sample data
    const testActivity: ActivityLogData = {
      userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      activityType: 'biking',
      carbonSaved: 2.5,
      points: 15,
      metadata: JSON.stringify({
        distance: 10.5,
        duration: 45,
        route: 'Seoul Metro Line 2',
        verificationMethod: 'sensor',
      }),
    };

    return this.blockchainService.logActivity(testActivity);
  }

  @Post('test-mint-nft')
  async testMintNFT() {
    // Test NFT minting with sample data
    const testNFT: NFTMintData = {
      toAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      tokenURI: 'ipfs://QmTestCarbonNFT123',
      carbonSaved: 5.0,
    };

    return this.blockchainService.mintCarbonNFT(testNFT);
  }
}
