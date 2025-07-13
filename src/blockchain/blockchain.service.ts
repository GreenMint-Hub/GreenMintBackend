import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ethers } from 'ethers';
import { blockchainConfig, NetworkConfig } from '../config/blockchain.config';
import { GreenMintABI } from './contracts/greenmint.abi';

export interface ActivityLogData {
  userAddress: string;
  activityType: string;
  carbonSaved: number;
  points: number;
  metadata: string;
}

export interface NFTMintData {
  toAddress: string;
  tokenURI: string;
  carbonSaved: number;
}

export interface UserStats {
  totalCarbonSaved: bigint;
  totalPoints: bigint;
  activityCount: bigint;
  nftCount: bigint;
}

export interface BlockchainActivity {
  user: string;
  activityType: string;
  carbonSaved: bigint;
  points: bigint;
  timestamp: bigint;
  metadata: string;
}

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;
  private currentNetwork: NetworkConfig;

  constructor() {
    this.initializeBlockchain();
  }

  /**
   * Initialize blockchain connection
   */
  private initializeBlockchain() {
    try {
      const networkKey = blockchainConfig.default;
      this.currentNetwork = blockchainConfig[networkKey];

      // Initialize provider
      this.provider = new ethers.JsonRpcProvider(this.currentNetwork.rpcUrl);

      // Initialize wallet
      if (!blockchainConfig.wallet.privateKey) {
        this.logger.warn('No private key provided, using read-only mode');
        return;
      }

      this.wallet = new ethers.Wallet(
        blockchainConfig.wallet.privateKey,
        this.provider,
      );

      // Initialize contract
      if (this.currentNetwork.contractAddress) {
        this.contract = new ethers.Contract(
          this.currentNetwork.contractAddress,
          GreenMintABI,
          this.wallet,
        );
      }

      this.logger.log(`Connected to ${this.currentNetwork.name}`);
    } catch (error) {
      this.logger.error('Failed to initialize blockchain connection', error);
    }
  }

  /**
   * Log activity to blockchain
   */
  async logActivity(activityData: ActivityLogData): Promise<{
    transactionHash: string;
    activityId: bigint;
    gasUsed: bigint;
  }> {
    if (!this.contract || !this.wallet) {
      throw new BadRequestException('Blockchain not properly initialized');
    }

    try {
      const { userAddress, activityType, carbonSaved, points, metadata } =
        activityData;

      // Convert values to appropriate units
      const carbonSavedWei = ethers.parseUnits(carbonSaved.toString(), 18); // Convert to wei
      const pointsWei = ethers.parseUnits(points.toString(), 18);

      // Prepare transaction
      const tx = await this.contract.logActivity.populateTransaction(
        userAddress,
        activityType,
        carbonSavedWei,
        pointsWei,
        metadata,
      );

      // Set gas limit and price
      tx.gasLimit = BigInt(blockchainConfig.wallet.gasLimit);
      if (blockchainConfig.wallet.gasPrice !== 'auto') {
        tx.gasPrice = BigInt(blockchainConfig.wallet.gasPrice);
      }

      // Send transaction
      const transaction = await this.wallet.sendTransaction(tx);
      const receipt = await transaction.wait();

      // Get activity ID from event
      const event = receipt?.logs.find((log) => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed?.name === 'ActivityLogged';
        } catch {
          return false;
        }
      });

      let activityId = BigInt(0);
      if (event) {
        const parsed = this.contract.interface.parseLog(event);
        activityId = parsed?.args[1] || BigInt(0);
      }

      this.logger.log(
        `Activity logged: ${activityId} (Tx: ${transaction.hash})`,
      );

      return {
        transactionHash: transaction.hash,
        activityId,
        gasUsed: receipt?.gasUsed || BigInt(0),
      };
    } catch (error) {
      this.logger.error('Failed to log activity to blockchain', error);
      throw new BadRequestException(
        `Blockchain transaction failed: ${error.message}`,
      );
    }
  }

  /**
   * Mint Carbon NFT
   */
  async mintCarbonNFT(nftData: NFTMintData): Promise<{
    transactionHash: string;
    tokenId: bigint;
    gasUsed: bigint;
  }> {
    if (!this.contract || !this.wallet) {
      throw new BadRequestException('Blockchain not properly initialized');
    }

    try {
      const { toAddress, tokenURI, carbonSaved } = nftData;

      // Convert carbon saved to wei
      const carbonSavedWei = ethers.parseUnits(carbonSaved.toString(), 18);

      // Prepare transaction
      const tx = await this.contract.mintCarbonNFT.populateTransaction(
        toAddress,
        tokenURI,
        carbonSavedWei,
      );

      // Set gas limit and price
      tx.gasLimit = BigInt(blockchainConfig.wallet.gasLimit);
      if (blockchainConfig.wallet.gasPrice !== 'auto') {
        tx.gasPrice = BigInt(blockchainConfig.wallet.gasPrice);
      }

      // Send transaction
      const transaction = await this.wallet.sendTransaction(tx);
      const receipt = await transaction.wait();

      // Get token ID from event
      const event = receipt?.logs.find((log) => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed?.name === 'CarbonNFTMinted';
        } catch {
          return false;
        }
      });

      let tokenId = BigInt(0);
      if (event) {
        const parsed = this.contract.interface.parseLog(event);
        tokenId = parsed?.args[1] || BigInt(0);
      }

      this.logger.log(`NFT minted: ${tokenId} (Tx: ${transaction.hash})`);

      return {
        transactionHash: transaction.hash,
        tokenId,
        gasUsed: receipt?.gasUsed || BigInt(0),
      };
    } catch (error) {
      this.logger.error('Failed to mint NFT', error);
      throw new BadRequestException(`NFT minting failed: ${error.message}`);
    }
  }

  /**
   * Get user stats from blockchain
   */
  async getUserStats(userAddress: string): Promise<UserStats> {
    if (!this.contract) {
      throw new BadRequestException('Blockchain not properly initialized');
    }

    try {
      const stats = await this.contract.getUserStats(userAddress);
      return {
        totalCarbonSaved: stats[0],
        totalPoints: stats[1],
        activityCount: stats[2],
        nftCount: stats[3],
      };
    } catch (error) {
      this.logger.error('Failed to get user stats', error);
      throw new BadRequestException(
        `Failed to get user stats: ${error.message}`,
      );
    }
  }

  /**
   * Get activity from blockchain
   */
  async getActivity(activityId: bigint): Promise<BlockchainActivity> {
    if (!this.contract) {
      throw new BadRequestException('Blockchain not properly initialized');
    }

    try {
      const activity = await this.contract.getActivity(activityId);
      return {
        user: activity[0],
        activityType: activity[1],
        carbonSaved: activity[2],
        points: activity[3],
        timestamp: activity[4],
        metadata: activity[5],
      };
    } catch (error) {
      this.logger.error('Failed to get activity', error);
      throw new BadRequestException(`Failed to get activity: ${error.message}`);
    }
  }

  /**
   * Get NFT balance for user
   */
  async getNFTBalance(userAddress: string): Promise<bigint> {
    if (!this.contract) {
      throw new BadRequestException('Blockchain not properly initialized');
    }

    try {
      return await this.contract.balanceOf(userAddress);
    } catch (error) {
      this.logger.error('Failed to get NFT balance', error);
      throw new BadRequestException(
        `Failed to get NFT balance: ${error.message}`,
      );
    }
  }

  /**
   * Get NFT token URI
   */
  async getNFTTokenURI(tokenId: bigint): Promise<string> {
    if (!this.contract) {
      throw new BadRequestException('Blockchain not properly initialized');
    }

    try {
      return await this.contract.tokenURI(tokenId);
    } catch (error) {
      this.logger.error('Failed to get NFT token URI', error);
      throw new BadRequestException(
        `Failed to get NFT token URI: ${error.message}`,
      );
    }
  }

  /**
   * Get current network info
   */
  getCurrentNetwork(): NetworkConfig {
    return this.currentNetwork;
  }

  /**
   * Check if blockchain is connected
   */
  isConnected(): boolean {
    return !!(this.provider && this.wallet && this.contract);
  }

  /**
   * Get wallet address
   */
  getWalletAddress(): string | null {
    return this.wallet?.address || null;
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(): Promise<string> {
    if (!this.wallet) {
      throw new BadRequestException('Wallet not initialized');
    }

    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      return ethers.formatEther(balance);
    } catch (error) {
      this.logger.error('Failed to get wallet balance', error);
      throw new BadRequestException(
        `Failed to get wallet balance: ${error.message}`,
      );
    }
  }
}
