import { Module } from '@nestjs/common';
import { InputService } from './input.service';
import { InputController } from './input.controller';

@Module({
  controllers: [InputController],
  providers: [InputService],
  exports: [InputService],
})
export class InputModule {} 