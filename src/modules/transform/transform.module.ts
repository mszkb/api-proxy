import { Module, forwardRef } from '@nestjs/common';
import { TransformService } from './transform.service';
import { TransformController } from './transform.controller';
import { PipeModule } from '../pipe/pipe.module';

@Module({
  imports: [forwardRef(() => PipeModule)],
  controllers: [TransformController],
  providers: [TransformService],
  exports: [TransformService],
})
export class TransformModule {} 