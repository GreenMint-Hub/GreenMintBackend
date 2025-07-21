import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NFT, NFTSchema } from './nft.schema';
import { NftController } from './nft.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: NFT.name, schema: NFTSchema }])],
  controllers: [NftController],
  exports: [MongooseModule],
})
export class NftModule {} 