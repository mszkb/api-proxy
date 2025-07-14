import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { InputService, InputConfig, InputData } from './input.service';
import { InputConfigDto, InputDataDto } from '../../dto/input.dto';

@ApiTags('input')
@Controller('input')
export class InputController {
  constructor(private readonly inputService: InputService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new input configuration' })
  @ApiResponse({ status: 201, description: 'Input added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async addInput(@Body() config: InputConfigDto): Promise<{ message: string }> {
    await this.inputService.addInput(config);
    return { message: `Input ${config.id} added successfully` };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove an input configuration' })
  @ApiParam({ name: 'id', description: 'Input ID' })
  @ApiResponse({ status: 200, description: 'Input removed successfully' })
  async removeInput(@Param('id') id: string): Promise<{ message: string }> {
    await this.inputService.removeInput(id);
    return { message: `Input ${id} removed successfully` };
  }

  @Get()
  @ApiOperation({ summary: 'Get all input configurations' })
  @ApiResponse({ status: 200, description: 'List of input configurations', type: [InputConfigDto] })
  async getInputs(): Promise<InputConfig[]> {
    return this.inputService.getInputs();
  }

  @Get(':id/data')
  @ApiOperation({ summary: 'Get input data history' })
  @ApiParam({ name: 'id', description: 'Input ID' })
  @ApiResponse({ status: 200, description: 'Input data history', type: [InputDataDto] })
  async getInputData(@Param('id') id: string): Promise<InputData[]> {
    return this.inputService.getInputData(id);
  }

  @Get(':id/latest')
  @ApiOperation({ summary: 'Get latest input data' })
  @ApiParam({ name: 'id', description: 'Input ID' })
  @ApiResponse({ status: 200, description: 'Latest input data', type: InputDataDto })
  async getLatestData(@Param('id') id: string): Promise<InputData | null> {
    return this.inputService.getLatestData(id);
  }
} 