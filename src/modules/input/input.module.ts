import { Module, forwardRef } from '@nestjs/common';
import { InputService } from './input.service';
import { InputController } from './input.controller';
import { PipeModule } from '../pipe/pipe.module';

@Module({
  imports: [forwardRef(() => PipeModule)],
  controllers: [InputController],
  providers: [InputService],
  exports: [InputService],
})
export class InputModule {} 