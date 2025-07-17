import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class PipeStepDto {
  @ApiProperty({
    description: 'Type of step in the pipeline',
    enum: ['input', 'transform', 'output'],
    example: 'transform'
  })
  @IsString()
  type: 'input' | 'transform' | 'output';

  @ApiProperty({
    description: 'ID of the input/transform/output to use',
    example: 'filter-temp'
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Delay in milliseconds before executing this step',
    required: false,
    example: 1000
  })
  @IsOptional()
  @IsNumber()
  delay?: number;

  @ApiProperty({
    description: 'Whether this step is enabled',
    example: true
  })
  @IsBoolean()
  enabled: boolean;
}

export class PipeConfigDto {
  @ApiProperty({
    description: 'Unique identifier for the pipe',
    example: 'weather-alert-pipe'
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Human readable name for the pipe',
    example: 'Weather Alert Pipeline'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of what this pipe does',
    example: 'Monitors weather and sends alerts when temperature is high'
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Steps in the pipeline (input -> transform -> output)',
    type: [PipeStepDto],
    example: [
      { type: 'input', id: 'weather-input', enabled: true },
      { type: 'transform', id: 'filter-temp', delay: 1000, enabled: true },
      { type: 'output', id: 'slack-alert', enabled: true }
    ]
  })
  @IsArray()
  steps: PipeStepDto[];

  @ApiProperty({
    description: 'Whether this pipe is enabled',
    example: true
  })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({
    description: 'Maximum execution time in milliseconds',
    required: false,
    example: 30000
  })
  @IsOptional()
  @IsNumber()
  timeout?: number;
}

export class PipeExecutionDto {
  @ApiProperty({
    description: 'Unique identifier for the execution'
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'ID of the pipe that was executed'
  })
  @IsString()
  pipeId: string;

  @ApiProperty({
    description: 'Timestamp when execution started'
  })
  startTime: Date;

  @ApiProperty({
    description: 'Timestamp when execution ended',
    required: false
  })
  endTime?: Date;

  @ApiProperty({
    description: 'Status of the execution',
    enum: ['running', 'completed', 'failed', 'timeout']
  })
  status: 'running' | 'completed' | 'failed' | 'timeout';

  @ApiProperty({
    description: 'Data at each step of the pipeline'
  })
  stepData: Record<string, any>;

  @ApiProperty({
    description: 'Error message if execution failed',
    required: false
  })
  error?: string;
} 