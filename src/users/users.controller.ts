import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Activity } from '../activity/schemas/activity.schema';
import { NFT } from '../nft/nft.schema';
import { Challenge } from '../challenge/challenge.schema';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @InjectModel(Activity.name) private activityModel: Model<Activity>,
    @InjectModel(NFT.name) private nftModel: Model<NFT>,
    @InjectModel(Challenge.name) private challengeModel: Model<Challenge>,
  ) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getUserStats(@Request() req) {
    const userId = req.user.userId || req.user.sub;
    const activities = await this.activityModel.find({ userId: new Types.ObjectId(userId) });
    const nfts = await this.nftModel.find({ userId: new Types.ObjectId(userId) });
    const userChallenges = await this.challengeModel.find({ userId: new Types.ObjectId(userId) });
    const points = activities.reduce((sum, a) => sum + (a.points || 0), 0);
    return {
      points,
      totalActions: activities.length,
      nfts: nfts.length,
      completedChallenges: userChallenges.filter(c => c.status === 'completed').length,
    };
  }

  @Get('actions')
  @UseGuards(JwtAuthGuard)
  async getUserActions(@Request() req) {
    const userId = req.user.userId || req.user.sub;
    return this.activityModel.find({ userId: new Types.ObjectId(userId) });
  }

  @Get('nfts')
  @UseGuards(JwtAuthGuard)
  async getUserNFTs(@Request() req) {
    const userId = req.user.userId || req.user.sub;
    return this.nftModel.find({ userId: new Types.ObjectId(userId) });
  }

  @Get('rewards')
  @UseGuards(JwtAuthGuard)
  async getUserRewards(@Request() req) {
    const userId = req.user.userId || req.user.sub;
    // For now, rewards = completed challenges + NFTs
    const nfts = await this.nftModel.find({ userId: new Types.ObjectId(userId) });
    const userChallenges = await this.challengeModel.find({ userId: new Types.ObjectId(userId) });
    return {
      nfts,
      completedChallenges: userChallenges.filter(c => c.status === 'completed'),
    };
  }
}
