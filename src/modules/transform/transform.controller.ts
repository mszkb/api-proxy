import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TransformService, TransformConfig, TransformData } from './transform.service';
import { TransformConfigDto, TransformDataDto, TransformApplyDto } from '../../dto/transform.dto';

@ApiTags('transform')
@Controller('transform')
export class TransformController {
  constructor(private readonly transformService: TransformService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new transform configuration' })
  @ApiResponse({ status: 201, description: 'Transform added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async addTransform(@Body() config: TransformConfigDto): Promise<{ message: string }> {
    await this.transformService.addTransform(config);
    return { message: `Transform ${config.id} added successfully` };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a transform configuration' })
  @ApiParam({ name: 'id', description: 'Transform ID' })
  @ApiResponse({ status: 200, description: 'Transform removed successfully' })
  async removeTransform(@Param('id') id: string): Promise<{ message: string }> {
    await this.transformService.removeTransform(id);
    return { message: `Transform ${id} removed successfully` };
  }

  @Get()
  @ApiOperation({ summary: 'Get all transform configurations' })
  @ApiResponse({ status: 200, description: 'List of transform configurations', type: [TransformConfigDto] })
  async getTransforms(): Promise<TransformConfig[]> {
    return this.transformService.getTransforms();
  }

  @Get(':id/data')
  @ApiOperation({ summary: 'Get transform data history' })
  @ApiParam({ name: 'id', description: 'Transform ID' })
  @ApiResponse({ status: 200, description: 'Transform data history', type: [TransformDataDto] })
  async getTransformData(@Param('id') id: string): Promise<TransformData[]> {
    return this.transformService.getTransformData(id);
  }

  @Get(':id/latest')
  @ApiOperation({ summary: 'Get latest transform data' })
  @ApiParam({ name: 'id', description: 'Transform ID' })
  @ApiResponse({ status: 200, description: 'Latest transform data', type: TransformDataDto })
  async getLatestTransformData(@Param('id') id: string): Promise<TransformData | null> {
    return this.transformService.getLatestTransformData(id);
  }

  @Post(':id/apply')
  @ApiOperation({ summary: 'Apply a transform to data' })
  @ApiParam({ name: 'id', description: 'Transform ID' })
  @ApiResponse({ status: 200, description: 'Transformed data' })
  async applyTransform(@Param('id') id: string, @Body() data: TransformApplyDto): Promise<any> {
    return this.transformService.applyTransform(id, data.data);
  }
} 