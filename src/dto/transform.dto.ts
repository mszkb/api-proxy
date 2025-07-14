import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class TransformConfigDto {
  @ApiProperty({
    description: 'Unique identifier for the transform',
    example: 'filter-temp'
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Human readable name for the transform',
    example: 'Temperature Filter'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Type of transformation',
    enum: ['map', 'filter', 'reduce', 'custom'],
    example: 'filter'
  })
  @IsEnum(['map', 'filter', 'reduce', 'custom'])
  type: 'map' | 'filter' | 'reduce' | 'custom';

  @ApiProperty({
    description: 'Configuration for the transform',
    example: {
      condition: {
        field: 'temp_c',
        operator: 'greater',
        value: 20
      }
    }
  })
  @IsObject()
  config: any;

  @ApiProperty({
    description: 'Whether this transform is enabled',
    example: true
  })
  @IsBoolean()
  enabled: boolean;
}

export class TransformDataDto {
  @ApiProperty({
    description: 'Unique identifier for the transform data entry'
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Timestamp when transform was applied'
  })
  timestamp: Date;

  @ApiProperty({
    description: 'Input data before transformation'
  })
  inputData: any;

  @ApiProperty({
    description: 'Output data after transformation'
  })
  outputData: any;

  @ApiProperty({
    description: 'ID of the transform that was applied'
  })
  @IsString()
  transformId: string;
}

export class TransformApplyDto {
  @ApiProperty({
    description: 'Data to transform',
    example: { temp_c: 25, condition: 'sunny' }
  })
  data: any;
} 