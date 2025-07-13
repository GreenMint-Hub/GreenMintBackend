import { Module } from '@nestjs/common';
import { NftController } from './nft.controller';

@Module({
  controllers: [NftController],
})
export class NftModule {} 