import { Module } from '@nestjs/common';
import { OutputService } from './output.service';
import { OutputController } from './output.controller';

@Module({
  controllers: [OutputController],
  providers: [OutputService],
  exports: [OutputService],
})
export class OutputModule {} 