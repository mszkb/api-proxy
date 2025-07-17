import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PipeService } from './pipe.service';
import { PipeConfigDto, PipeExecutionDto } from '../../dto/pipe.dto';

@ApiTags('pipe')
@Controller('pipe')
export class PipeController {
  constructor(private readonly pipeService: PipeService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new pipe configuration' })
  @ApiResponse({ status: 201, description: 'Pipe added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request or validation errors' })
  async addPipe(@Body() config: PipeConfigDto): Promise<{ message: string; validation?: { valid: boolean; errors: string[] } }> {
    // Validate pipe configuration
    const validation = await this.pipeService.validatePipe(config);
    if (!validation.valid) {
      return { 
        message: 'Pipe validation failed', 
        validation 
      };
    }

    await this.pipeService.addPipe(config);
    return { message: `Pipe ${config.id} added successfully` };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a pipe configuration' })
  @ApiParam({ name: 'id', description: 'Pipe ID' })
  @ApiResponse({ status: 200, description: 'Pipe removed successfully' })
  async removePipe(@Param('id') id: string): Promise<{ message: string }> {
    await this.pipeService.removePipe(id);
    return { message: `Pipe ${id} removed successfully` };
  }

  @Get()
  @ApiOperation({ summary: 'Get all pipe configurations' })
  @ApiResponse({ status: 200, description: 'List of pipe configurations', type: [PipeConfigDto] })
  async getPipes(): Promise<PipeConfigDto[]> {
    return this.pipeService.getPipes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific pipe configuration' })
  @ApiParam({ name: 'id', description: 'Pipe ID' })
  @ApiResponse({ status: 200, description: 'Pipe configuration', type: PipeConfigDto })
  async getPipe(@Param('id') id: string): Promise<PipeConfigDto | null> {
    return this.pipeService.getPipe(id);
  }

  @Get(':id/executions')
  @ApiOperation({ summary: 'Get pipe execution history' })
  @ApiParam({ name: 'id', description: 'Pipe ID' })
  @ApiResponse({ status: 200, description: 'Pipe execution history', type: [PipeExecutionDto] })
  async getPipeExecutions(@Param('id') id: string): Promise<PipeExecutionDto[]> {
    return this.pipeService.getPipeExecutions(id);
  }

  @Get(':id/executions/latest')
  @ApiOperation({ summary: 'Get latest pipe execution' })
  @ApiParam({ name: 'id', description: 'Pipe ID' })
  @ApiResponse({ status: 200, description: 'Latest pipe execution', type: PipeExecutionDto })
  async getLatestExecution(@Param('id') id: string): Promise<PipeExecutionDto | null> {
    return this.pipeService.getLatestExecution(id);
  }

  @Post(':id/execute')
  @ApiOperation({ summary: 'Manually execute a pipe' })
  @ApiParam({ name: 'id', description: 'Pipe ID' })
  @ApiResponse({ status: 200, description: 'Pipe execution result', type: PipeExecutionDto })
  async executePipe(@Param('id') id: string, @Body() data?: any): Promise<PipeExecutionDto> {
    return this.pipeService.executePipe(id, data);
  }

  @Post(':id/validate')
  @ApiOperation({ summary: 'Validate a pipe configuration' })
  @ApiParam({ name: 'id', description: 'Pipe ID' })
  @ApiResponse({ status: 200, description: 'Validation result' })
  async validatePipe(@Param('id') id: string): Promise<{ valid: boolean; errors: string[] }> {
    const pipe = await this.pipeService.getPipe(id);
    if (!pipe) {
      return { valid: false, errors: ['Pipe not found'] };
    }
    return this.pipeService.validatePipe(pipe);
  }
} 