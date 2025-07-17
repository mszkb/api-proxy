import { Module, forwardRef } from '@nestjs/common';
import { PipeService } from './pipe.service';
import { PipeController } from './pipe.controller';
import { InputModule } from '../input/input.module';
import { TransformModule } from '../transform/transform.module';
import { OutputModule } from '../output/output.module';

@Module({
  imports: [
    forwardRef(() => InputModule),
    forwardRef(() => TransformModule),
    forwardRef(() => OutputModule),
  ],
  controllers: [PipeController],
  providers: [PipeService],
  exports: [PipeService],
})
export class PipeModule {} 