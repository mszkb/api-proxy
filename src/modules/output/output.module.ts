import { Module, forwardRef } from '@nestjs/common';
import { OutputService } from './output.service';
import { OutputController } from './output.controller';
import { PipeModule } from '../pipe/pipe.module';

@Module({
  imports: [forwardRef(() => PipeModule)],
  controllers: [OutputController],
  providers: [OutputService],
  exports: [OutputService],
})
export class OutputModule {} 