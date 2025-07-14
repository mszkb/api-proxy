import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsBoolean, IsObject, IsNumber } from 'class-validator';

export class OutputConfigDto {
  @ApiProperty({
    description: 'Unique identifier for the output',
    example: 'slack-notification'
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Human readable name for the output',
    example: 'Slack Notification'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'URL to send data to',
    example: 'https://hooks.slack.com/services/YOUR_WEBHOOK'
  })
  @IsString()
  url: string;

  @ApiProperty({
    description: 'HTTP method to use',
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    example: 'POST'
  })
  @IsEnum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

  @ApiProperty({
    description: 'HTTP headers to send',
    required: false,
    example: { 'Content-Type': 'application/json' }
  })
  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;

  @ApiProperty({
    description: 'Template for request body with variable substitution',
    required: false,
    example: '{"text": "Temperature: ${temp_c}°C, Condition: ${condition}"}'
  })
  @IsOptional()
  @IsString()
  template?: string;

  @ApiProperty({
    description: 'Whether this output is enabled',
    example: true
  })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({
    description: 'Number of retry attempts on failure',
    required: false,
    example: 3
  })
  @IsOptional()
  @IsNumber()
  retryCount?: number;

  @ApiProperty({
    description: 'Delay between retry attempts in milliseconds',
    required: false,
    example: 1000
  })
  @IsOptional()
  @IsNumber()
  retryDelay?: number;
}

export class OutputDataDto {
  @ApiProperty({
    description: 'Unique identifier for the output data entry'
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Timestamp when data was sent'
  })
  timestamp: Date;

  @ApiProperty({
    description: 'Data that was sent'
  })
  requestData: any;

  @ApiProperty({
    description: 'Response data from the target API',
    required: false
  })
  responseData?: any;

  @ApiProperty({
    description: 'Status of the request',
    enum: ['success', 'error']
  })
  status: 'success' | 'error';

  @ApiProperty({
    description: 'Error message if request failed',
    required: false
  })
  error?: string;

  @ApiProperty({
    description: 'ID of the output that was used'
  })
  @IsString()
  outputId: string;
}

export class OutputTestDto {
  @ApiProperty({
    description: 'Test data to send',
    example: { temp_c: 25, condition: 'sunny' }
  })
  data: any;
} 