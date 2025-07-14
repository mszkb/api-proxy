import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface OutputConfig {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  template?: string; // Template for request body
  enabled: boolean;
  retryCount?: number;
  retryDelay?: number;
}

export interface OutputData {
  id: string;
  timestamp: Date;
  requestData: any;
  responseData?: any;
  status: 'success' | 'error';
  error?: string;
  outputId: string;
}

@Injectable()
export class OutputService {
  private readonly logger = new Logger(OutputService.name);
  private outputs: Map<string, OutputConfig> = new Map();
  private outputHistory: Map<string, OutputData[]> = new Map();

  async addOutput(config: OutputConfig): Promise<void> {
    this.outputs.set(config.id, config);
    this.outputHistory.set(config.id, []);
    this.logger.log(`Added output: ${config.id} (${config.name}) -> ${config.url}`);
  }

  async removeOutput(id: string): Promise<void> {
    this.outputs.delete(id);
    this.outputHistory.delete(id);
    this.logger.log(`Removed output: ${id}`);
  }

  async getOutputs(): Promise<OutputConfig[]> {
    return Array.from(this.outputs.values());
  }

  async getOutputData(id: string): Promise<OutputData[]> {
    return this.outputHistory.get(id) || [];
  }

  async sendData(outputId: string, data: any): Promise<OutputData> {
    const output = this.outputs.get(outputId);
    if (!output || !output.enabled) {
      throw new Error(`Output ${outputId} not found or disabled`);
    }

    let requestData = data;
    
    // Apply template if provided
    if (output.template) {
      requestData = this.applyTemplate(output.template, data);
    }

    const outputData: OutputData = {
      id: `${outputId}_${Date.now()}`,
      timestamp: new Date(),
      requestData,
      outputId,
      status: 'success',
    };

    try {
      const response = await axios({
        method: output.method,
        url: output.url,
        headers: output.headers,
        data: requestData,
        timeout: 10000,
      });

      outputData.responseData = response.data;
      outputData.status = 'success';

      this.logger.log(`Sent data to ${outputId}: ${JSON.stringify(response.data).substring(0, 100)}...`);

    } catch (error) {
      outputData.status = 'error';
      outputData.error = error.message;

      this.logger.error(`Error sending data to ${outputId}: ${error.message}`);

      // Retry logic
      if (output.retryCount && output.retryCount > 0) {
        await this.retrySendData(output, requestData, outputData, output.retryCount);
      }
    }

    // Store in history
    const history = this.outputHistory.get(outputId) || [];
    history.push(outputData);
    
    // Keep only last 100 entries
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    this.outputHistory.set(outputId, history);

    return outputData;
  }

  private async retrySendData(
    output: OutputConfig, 
    requestData: any, 
    outputData: OutputData, 
    retryCount: number
  ): Promise<void> {
    const delay = output.retryDelay || 1000;
    
    for (let i = 0; i < retryCount; i++) {
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      
      try {
        const response = await axios({
          method: output.method,
          url: output.url,
          headers: output.headers,
          data: requestData,
          timeout: 10000,
        });

        outputData.responseData = response.data;
        outputData.status = 'success';
        outputData.error = undefined;

        this.logger.log(`Retry successful for ${output.id} after ${i + 1} attempts`);
        return;

      } catch (error) {
        outputData.error = error.message;
        this.logger.warn(`Retry ${i + 1} failed for ${output.id}: ${error.message}`);
      }
    }
  }

  private applyTemplate(template: string, data: any): any {
    try {
      // Simple template replacement
      let result = template;
      
      if (typeof data === 'object') {
        Object.keys(data).forEach(key => {
          const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
          result = result.replace(regex, JSON.stringify(data[key]));
        });
      }
      
      // Try to parse as JSON if it looks like JSON
      if (result.trim().startsWith('{') || result.trim().startsWith('[')) {
        return JSON.parse(result);
      }
      
      return result;
    } catch (error) {
      this.logger.error(`Error applying template: ${error.message}`);
      return data;
    }
  }

  async getLatestOutputData(outputId: string): Promise<OutputData | null> {
    const history = this.outputHistory.get(outputId);
    return history && history.length > 0 ? history[history.length - 1] : null;
  }

  async testOutput(outputId: string, testData: any): Promise<OutputData> {
    return this.sendData(outputId, testData);
  }
} 