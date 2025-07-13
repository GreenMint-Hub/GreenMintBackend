import { Injectable, BadRequestException } from '@nestjs/common';
import { TransportProvider } from '../schemas/verification.schema';

export interface TransportTransaction {
  transactionId: string;
  amount: number;
  currency: string;
  route: string;
  timestamp: Date;
  provider: TransportProvider;
  cardNumber?: string; // Masked card number
  stationFrom?: string;
  stationTo?: string;
}

export interface ApiVerificationResult {
  isValid: boolean;
  transaction?: TransportTransaction;
  error?: string;
}

@Injectable()
export class TransportApiService {
  /**
   * Verify transport transaction via API
   */
  async verifyTransportTransaction(
    provider: TransportProvider,
    transactionId: string,
    cardNumber?: string,
  ): Promise<ApiVerificationResult> {
    try {
      switch (provider) {
        case TransportProvider.T_MONEY:
          return await this.verifyTmoneyTransaction(transactionId, cardNumber);
        case TransportProvider.CASHBEE:
          return await this.verifyCashbeeTransaction(transactionId, cardNumber);
        case TransportProvider.SEOUL_METRO:
          return await this.verifySeoulMetroTransaction(transactionId);
        case TransportProvider.BUSAN_METRO:
          return await this.verifyBusanMetroTransaction(transactionId);
        case TransportProvider.KORAIL:
          return await this.verifyKorailTransaction(transactionId);
        default:
          throw new BadRequestException(
            `Unsupported transport provider: ${provider}`,
          );
      }
    } catch (error) {
      return {
        isValid: false,
        error: error.message,
      };
    }
  }

  /**
   * Verify T-Money transaction
   * In production, this would integrate with actual T-Money API
   */
  private async verifyTmoneyTransaction(
    transactionId: string,
    cardNumber?: string,
  ): Promise<ApiVerificationResult> {
    // Simulate API call to T-Money
    // In production, this would be a real API integration
    const mockTransaction: TransportTransaction = {
      transactionId,
      amount: 1250, // KRW
      currency: 'KRW',
      route: 'Seoul Metro Line 2: Gangnam → Hongdae',
      timestamp: new Date(),
      provider: TransportProvider.T_MONEY,
      cardNumber: cardNumber ? this.maskCardNumber(cardNumber) : undefined,
      stationFrom: 'Gangnam',
      stationTo: 'Hongdae',
    };

    // Simulate API response delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      isValid: true,
      transaction: mockTransaction,
    };
  }

  /**
   * Verify Cashbee transaction
   */
  private async verifyCashbeeTransaction(
    transactionId: string,
    cardNumber?: string,
  ): Promise<ApiVerificationResult> {
    const mockTransaction: TransportTransaction = {
      transactionId,
      amount: 1300, // KRW
      currency: 'KRW',
      route: 'Seoul Metro Line 1: Seoul Station → City Hall',
      timestamp: new Date(),
      provider: TransportProvider.CASHBEE,
      cardNumber: cardNumber ? this.maskCardNumber(cardNumber) : undefined,
      stationFrom: 'Seoul Station',
      stationTo: 'City Hall',
    };

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      isValid: true,
      transaction: mockTransaction,
    };
  }

  /**
   * Verify Seoul Metro transaction
   */
  private async verifySeoulMetroTransaction(
    transactionId: string,
  ): Promise<ApiVerificationResult> {
    const mockTransaction: TransportTransaction = {
      transactionId,
      amount: 1200, // KRW
      currency: 'KRW',
      route: 'Seoul Metro Line 3: Apgujeong → Sinsa',
      timestamp: new Date(),
      provider: TransportProvider.SEOUL_METRO,
      stationFrom: 'Apgujeong',
      stationTo: 'Sinsa',
    };

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      isValid: true,
      transaction: mockTransaction,
    };
  }

  /**
   * Verify Busan Metro transaction
   */
  private async verifyBusanMetroTransaction(
    transactionId: string,
  ): Promise<ApiVerificationResult> {
    const mockTransaction: TransportTransaction = {
      transactionId,
      amount: 1300, // KRW
      currency: 'KRW',
      route: 'Busan Metro Line 1: Nampo-dong → Seomyeon',
      timestamp: new Date(),
      provider: TransportProvider.BUSAN_METRO,
      stationFrom: 'Nampo-dong',
      stationTo: 'Seomyeon',
    };

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      isValid: true,
      transaction: mockTransaction,
    };
  }

  /**
   * Verify KORAIL transaction
   */
  private async verifyKorailTransaction(
    transactionId: string,
  ): Promise<ApiVerificationResult> {
    const mockTransaction: TransportTransaction = {
      transactionId,
      amount: 2500, // KRW
      currency: 'KRW',
      route: 'KORAIL: Seoul → Suwon',
      timestamp: new Date(),
      provider: TransportProvider.KORAIL,
      stationFrom: 'Seoul',
      stationTo: 'Suwon',
    };

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      isValid: true,
      transaction: mockTransaction,
    };
  }

  /**
   * Mask card number for security
   */
  private maskCardNumber(cardNumber: string): string {
    if (cardNumber.length < 8) return cardNumber;
    return `${cardNumber.substring(0, 4)}****${cardNumber.substring(cardNumber.length - 4)}`;
  }

  /**
   * Calculate carbon savings for transport
   */
  calculateCarbonSavings(route: string, amount: number): number {
    // Simplified carbon calculation based on route and fare
    // In production, this would use more sophisticated algorithms

    const baseCarbonPerKm = 0.15; // kg CO2 saved per km vs driving
    const avgDistancePerFare = 10; // km per average fare

    return baseCarbonPerKm * avgDistancePerFare;
  }

  /**
   * Calculate points for transport usage
   */
  calculatePoints(amount: number, provider: TransportProvider): number {
    // Points system: more points for higher fares (longer distances)
    const basePoints = Math.floor(amount / 100); // 1 point per 100 KRW

    // Bonus points for certain providers
    const providerBonus = {
      [TransportProvider.T_MONEY]: 1,
      [TransportProvider.CASHBEE]: 1,
      [TransportProvider.SEOUL_METRO]: 2,
      [TransportProvider.BUSAN_METRO]: 2,
      [TransportProvider.KORAIL]: 3,
    };

    return basePoints + (providerBonus[provider] || 0);
  }
}
