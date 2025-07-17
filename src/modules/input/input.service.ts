import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { PipeService } from '../pipe/pipe.service';

export interface InputConfig {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  interval: string; // Cron expression
  enabled: boolean;
}

export interface InputData {
  id: string;
  timestamp: Date;
  data: any;
  source: string;
}

@Injectable()
export class InputService {
  private readonly logger = new Logger(InputService.name);
  private inputs: Map<string, InputConfig> = new Map();
  private dataHistory: Map<string, InputData[]> = new Map();

  constructor(
    @Inject(forwardRef(() => PipeService))
    private readonly pipeService: PipeService,
  ) {}

  async addInput(config: InputConfig): Promise<void> {
    this.inputs.set(config.id, config);
    this.dataHistory.set(config.id, []);
    this.logger.log(`Added input: ${config.id} -> ${config.url}`);
  }

  async removeInput(id: string): Promise<void> {
    this.inputs.delete(id);
    this.dataHistory.delete(id);
    this.logger.log(`Removed input: ${id}`);
  }

  async getInputs(): Promise<InputConfig[]> {
    return Array.from(this.inputs.values());
  }

  async getInputData(id: string): Promise<InputData[]> {
    return this.dataHistory.get(id) || [];
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async pollInputs() {
    for (const [id, config] of this.inputs) {
      if (!config.enabled) continue;
      
      try {
        const response = await axios({
          method: config.method,
          url: config.url,
          headers: config.headers,
          data: config.body,
        });

        const inputData: InputData = {
          id,
          timestamp: new Date(),
          data: response.data,
          source: config.url,
        };

        const history = this.dataHistory.get(id) || [];
        history.push(inputData);
        
        // Keep only last 100 entries
        if (history.length > 100) {
          history.splice(0, history.length - 100);
        }
        
        this.dataHistory.set(id, history);
        
        this.logger.log(`Polled ${id}: ${JSON.stringify(response.data).substring(0, 100)}...`);
        
        // Trigger pipes that start with this input
        await this.pipeService.triggerPipeFromInput(id);
        
      } catch (error) {
        this.logger.error(`Error polling ${id}: ${error.message}`);
      }
    }
  }

  async getLatestData(id: string): Promise<InputData | null> {
    const history = this.dataHistory.get(id);
    return history && history.length > 0 ? history[history.length - 1] : null;
  }
} 