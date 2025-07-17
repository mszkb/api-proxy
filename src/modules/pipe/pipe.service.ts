import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InputService } from '../input/input.service';
import { TransformService } from '../transform/transform.service';
import { OutputService } from '../output/output.service';
import { PipeConfigDto, PipeExecutionDto, PipeStepDto } from '../../dto/pipe.dto';

@Injectable()
export class PipeService {
  private readonly logger = new Logger(PipeService.name);
  private pipes: Map<string, PipeConfigDto> = new Map();
  private executions: Map<string, PipeExecutionDto[]> = new Map();

  constructor(
    @Inject(forwardRef(() => InputService))
    private readonly inputService: InputService,
    @Inject(forwardRef(() => TransformService))
    private readonly transformService: TransformService,
    @Inject(forwardRef(() => OutputService))
    private readonly outputService: OutputService,
  ) {}

  async addPipe(config: PipeConfigDto): Promise<void> {
    this.pipes.set(config.id, config);
    this.executions.set(config.id, []);
    this.logger.log(`Added pipe: ${config.id} (${config.name})`);
  }

  async removePipe(id: string): Promise<void> {
    this.pipes.delete(id);
    this.executions.delete(id);
    this.logger.log(`Removed pipe: ${id}`);
  }

  async getPipes(): Promise<PipeConfigDto[]> {
    return Array.from(this.pipes.values());
  }

  async getPipe(id: string): Promise<PipeConfigDto | null> {
    return this.pipes.get(id) || null;
  }

  async getPipeExecutions(pipeId: string): Promise<PipeExecutionDto[]> {
    return this.executions.get(pipeId) || [];
  }

  async executePipe(pipeId: string, triggerData?: any): Promise<PipeExecutionDto> {
    const pipe = this.pipes.get(pipeId);
    if (!pipe || !pipe.enabled) {
      throw new Error(`Pipe ${pipeId} not found or disabled`);
    }

    const executionId = `${pipeId}_${Date.now()}`;
    const execution: PipeExecutionDto = {
      id: executionId,
      pipeId,
      startTime: new Date(),
      status: 'running',
      stepData: {},
    };

    // Store execution
    const pipeExecutions = this.executions.get(pipeId) || [];
    pipeExecutions.push(execution);
    this.executions.set(pipeId, pipeExecutions);

    this.logger.log(`Starting pipe execution: ${pipeId}`);

    try {
      let currentData = triggerData;

      // Execute each step in the pipeline
      for (const step of pipe.steps) {
        if (!step.enabled) {
          this.logger.log(`Skipping disabled step: ${step.id}`);
          continue;
        }

        // Apply delay if specified
        if (step.delay && step.delay > 0) {
          this.logger.log(`Waiting ${step.delay}ms before step: ${step.id}`);
          await new Promise(resolve => setTimeout(resolve, step.delay));
        }

        // Execute step based on type
        switch (step.type) {
          case 'input':
            currentData = await this.executeInputStep(step, currentData);
            break;
          case 'transform':
            currentData = await this.executeTransformStep(step, currentData);
            break;
          case 'output':
            await this.executeOutputStep(step, currentData);
            break;
        }

        // Store step data
        execution.stepData[step.id] = currentData;
      }

      execution.status = 'completed';
      execution.endTime = new Date();
      this.logger.log(`Pipe execution completed: ${pipeId}`);

    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.error = error.message;
      this.logger.error(`Pipe execution failed: ${pipeId} - ${error.message}`);
    }

    return execution;
  }

  private async executeInputStep(step: PipeStepDto, currentData: any): Promise<any> {
    this.logger.log(`Executing input step: ${step.id}`);
    
    // Get latest data from input
    const inputData = await this.inputService.getLatestData(step.id);
    if (!inputData) {
      throw new Error(`No data available for input: ${step.id}`);
    }

    return inputData.data;
  }

  private async executeTransformStep(step: PipeStepDto, currentData: any): Promise<any> {
    this.logger.log(`Executing transform step: ${step.id}`);
    
    // Apply transformation
    const transformedData = await this.transformService.applyTransform(step.id, currentData);
    return transformedData;
  }

  private async executeOutputStep(step: PipeStepDto, currentData: any): Promise<void> {
    this.logger.log(`Executing output step: ${step.id}`);
    
    // Send data to output
    await this.outputService.sendData(step.id, currentData);
  }

  async triggerPipeFromInput(inputId: string): Promise<void> {
    // Find all pipes that start with this input
    for (const [pipeId, pipe] of this.pipes) {
      if (!pipe.enabled) continue;

      const firstStep = pipe.steps[0];
      if (firstStep && firstStep.type === 'input' && firstStep.id === inputId && firstStep.enabled) {
        this.logger.log(`Triggering pipe ${pipeId} from input ${inputId}`);
        await this.executePipe(pipeId);
      }
    }
  }

  async getLatestExecution(pipeId: string): Promise<PipeExecutionDto | null> {
    const executions = this.executions.get(pipeId);
    return executions && executions.length > 0 ? executions[executions.length - 1] : null;
  }

  async validatePipe(config: PipeConfigDto): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check if pipe has at least one step
    if (!config.steps || config.steps.length === 0) {
      errors.push('Pipe must have at least one step');
    }

    // Validate each step
    for (let i = 0; i < config.steps.length; i++) {
      const step = config.steps[i];
      
      // Check if step references exist
      switch (step.type) {
        case 'input':
          const inputs = await this.inputService.getInputs();
          if (!inputs.find(input => input.id === step.id)) {
            errors.push(`Step ${i + 1}: Input '${step.id}' not found`);
          }
          break;
        case 'transform':
          const transforms = await this.transformService.getTransforms();
          if (!transforms.find(transform => transform.id === step.id)) {
            errors.push(`Step ${i + 1}: Transform '${step.id}' not found`);
          }
          break;
        case 'output':
          const outputs = await this.outputService.getOutputs();
          if (!outputs.find(output => output.id === step.id)) {
            errors.push(`Step ${i + 1}: Output '${step.id}' not found`);
          }
          break;
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
} 