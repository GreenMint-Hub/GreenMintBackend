import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import {
  LeaderboardType,
  LeaderboardPeriod,
} from './schemas/leaderboard.schema';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class LeaderboardGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(LeaderboardGateway.name);
  private connectedClients = new Map<string, Set<string>>();

  constructor(private readonly leaderboardService: LeaderboardService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Remove client from all subscribed leaderboards
    for (const [leaderboardKey, clients] of this.connectedClients.entries()) {
      clients.delete(client.id);
      if (clients.size === 0) {
        this.connectedClients.delete(leaderboardKey);
      }
    }
  }

  @SubscribeMessage('subscribeLeaderboard')
  async handleSubscribeLeaderboard(
    client: Socket,
    payload: { type: LeaderboardType; period: LeaderboardPeriod },
  ) {
    const { type, period } = payload;
    const leaderboardKey = `${type}_${period}`;

    // Add client to subscription
    if (!this.connectedClients.has(leaderboardKey)) {
      this.connectedClients.set(leaderboardKey, new Set());
    }
    this.connectedClients.get(leaderboardKey)!.add(client.id);

    // Send initial leaderboard data
    const leaderboard = await this.leaderboardService.getLeaderboard({
      type,
      period,
      page: 1,
      limit: 20,
    });

    client.emit('leaderboardUpdate', {
      type,
      period,
      data: leaderboard,
    });

    this.logger.log(`Client ${client.id} subscribed to ${leaderboardKey}`);
  }

  @SubscribeMessage('unsubscribeLeaderboard')
  handleUnsubscribeLeaderboard(
    client: Socket,
    payload: { type: LeaderboardType; period: LeaderboardPeriod },
  ) {
    const { type, period } = payload;
    const leaderboardKey = `${type}_${period}`;

    const clients = this.connectedClients.get(leaderboardKey);
    if (clients) {
      clients.delete(client.id);
      if (clients.size === 0) {
        this.connectedClients.delete(leaderboardKey);
      }
    }

    this.logger.log(`Client ${client.id} unsubscribed from ${leaderboardKey}`);
  }

  @SubscribeMessage('getUserRankings')
  async handleGetUserRankings(client: Socket, payload: { userId: string }) {
    const { userId } = payload;
    const rankings = await this.leaderboardService.getUserRankings(userId);

    client.emit('userRankings', {
      userId,
      rankings,
    });
  }

  /**
   * Broadcast leaderboard updates to all subscribed clients
   */
  async broadcastLeaderboardUpdate(
    type: LeaderboardType,
    period: LeaderboardPeriod,
  ) {
    const leaderboardKey = `${type}_${period}`;
    const clients = this.connectedClients.get(leaderboardKey);

    if (clients && clients.size > 0) {
      const leaderboard = await this.leaderboardService.getLeaderboard({
        type,
        period,
        page: 1,
        limit: 20,
      });

      const updateData = {
        type,
        period,
        data: leaderboard,
        timestamp: new Date(),
      };

      // Broadcast to all subscribed clients
      for (const clientId of clients) {
        const client = this.server.sockets.sockets.get(clientId);
        if (client) {
          client.emit('leaderboardUpdate', updateData);
        }
      }

      this.logger.log(
        `Broadcasted ${leaderboardKey} update to ${clients.size} clients`,
      );
    }
  }

  /**
   * Broadcast top performers update
   */
  async broadcastTopPerformersUpdate() {
    const topPerformers = await this.leaderboardService.getTopPerformers(10);

    this.server.emit('topPerformersUpdate', {
      data: topPerformers,
      timestamp: new Date(),
    });

    this.logger.log('Broadcasted top performers update');
  }

  /**
   * Get connected clients count
   */
  getConnectedClientsCount(): number {
    return this.server.sockets.sockets.size;
  }

  /**
   * Get subscription statistics
   */
  getSubscriptionStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const [leaderboardKey, clients] of this.connectedClients.entries()) {
      stats[leaderboardKey] = clients.size;
    }
    return stats;
  }
}
