import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { InputModule } from './modules/input/input.module';
import { TransformModule } from './modules/transform/transform.module';
import { OutputModule } from './modules/output/output.module';
import { PipeModule } from './modules/pipe/pipe.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    InputModule,
    TransformModule,
    OutputModule,
    PipeModule,
  ],
})
export class AppModule {} 