import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class InputConfigDto {
  @ApiProperty({
    description: 'Unique identifier for the input',
    example: 'weather-api'
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'URL to poll',
    example: 'https://api.weatherapi.com/v1/current.json'
  })
  @IsString()
  url: string;

  @ApiProperty({
    description: 'HTTP method to use',
    enum: ['GET', 'POST', 'PUT', 'DELETE'],
    example: 'GET'
  })
  @IsEnum(['GET', 'POST', 'PUT', 'DELETE'])
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';

  @ApiProperty({
    description: 'HTTP headers to send',
    required: false,
    example: { 'Authorization': 'Bearer YOUR_API_KEY' }
  })
  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;

  @ApiProperty({
    description: 'Request body for POST/PUT requests',
    required: false,
    example: { 'param': 'value' }
  })
  @IsOptional()
  body?: any;

  @ApiProperty({
    description: 'Cron expression for polling interval',
    example: '*/30 * * * * *'
  })
  @IsString()
  interval: string;

  @ApiProperty({
    description: 'Whether this input is enabled',
    example: true
  })
  @IsBoolean()
  enabled: boolean;
}

export class InputDataDto {
  @ApiProperty({
    description: 'Unique identifier for the data entry'
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Timestamp when data was fetched'
  })
  timestamp: Date;

  @ApiProperty({
    description: 'The fetched data'
  })
  data: any;

  @ApiProperty({
    description: 'Source URL of the data'
  })
  @IsString()
  source: string;
} 