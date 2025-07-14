import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { OutputService, OutputConfig, OutputData } from './output.service';
import { OutputConfigDto, OutputDataDto, OutputTestDto } from '../../dto/output.dto';

@ApiTags('output')
@Controller('output')
export class OutputController {
  constructor(private readonly outputService: OutputService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new output configuration' })
  @ApiResponse({ status: 201, description: 'Output added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async addOutput(@Body() config: OutputConfigDto): Promise<{ message: string }> {
    await this.outputService.addOutput(config);
    return { message: `Output ${config.id} added successfully` };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove an output configuration' })
  @ApiParam({ name: 'id', description: 'Output ID' })
  @ApiResponse({ status: 200, description: 'Output removed successfully' })
  async removeOutput(@Param('id') id: string): Promise<{ message: string }> {
    await this.outputService.removeOutput(id);
    return { message: `Output ${id} removed successfully` };
  }

  @Get()
  @ApiOperation({ summary: 'Get all output configurations' })
  @ApiResponse({ status: 200, description: 'List of output configurations', type: [OutputConfigDto] })
  async getOutputs(): Promise<OutputConfig[]> {
    return this.outputService.getOutputs();
  }

  @Get(':id/data')
  @ApiOperation({ summary: 'Get output data history' })
  @ApiParam({ name: 'id', description: 'Output ID' })
  @ApiResponse({ status: 200, description: 'Output data history', type: [OutputDataDto] })
  async getOutputData(@Param('id') id: string): Promise<OutputData[]> {
    return this.outputService.getOutputData(id);
  }

  @Get(':id/latest')
  @ApiOperation({ summary: 'Get latest output data' })
  @ApiParam({ name: 'id', description: 'Output ID' })
  @ApiResponse({ status: 200, description: 'Latest output data', type: OutputDataDto })
  async getLatestOutputData(@Param('id') id: string): Promise<OutputData | null> {
    return this.outputService.getLatestOutputData(id);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Send data to an output' })
  @ApiParam({ name: 'id', description: 'Output ID' })
  @ApiResponse({ status: 200, description: 'Data sent successfully', type: OutputDataDto })
  async sendData(@Param('id') id: string, @Body() data: any): Promise<OutputData> {
    return this.outputService.sendData(id, data);
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Test an output with sample data' })
  @ApiParam({ name: 'id', description: 'Output ID' })
  @ApiResponse({ status: 200, description: 'Test result', type: OutputDataDto })
  async testOutput(@Param('id') id: string, @Body() testData: OutputTestDto): Promise<OutputData> {
    return this.outputService.testOutput(id, testData.data);
  }
} 