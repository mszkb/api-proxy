import { Injectable, Logger } from '@nestjs/common';

export interface TransformConfig {
  id: string;
  name: string;
  type: 'map' | 'filter' | 'reduce' | 'custom';
  config: any;
  enabled: boolean;
}

export interface TransformData {
  id: string;
  timestamp: Date;
  inputData: any;
  outputData: any;
  transformId: string;
}

@Injectable()
export class TransformService {
  private readonly logger = new Logger(TransformService.name);
  private transforms: Map<string, TransformConfig> = new Map();
  private transformHistory: Map<string, TransformData[]> = new Map();

  async addTransform(config: TransformConfig): Promise<void> {
    this.transforms.set(config.id, config);
    this.transformHistory.set(config.id, []);
    this.logger.log(`Added transform: ${config.id} (${config.name})`);
  }

  async removeTransform(id: string): Promise<void> {
    this.transforms.delete(id);
    this.transformHistory.delete(id);
    this.logger.log(`Removed transform: ${id}`);
  }

  async getTransforms(): Promise<TransformConfig[]> {
    return Array.from(this.transforms.values());
  }

  async getTransformData(id: string): Promise<TransformData[]> {
    return this.transformHistory.get(id) || [];
  }

  async applyTransform(transformId: string, inputData: any): Promise<any> {
    const transform = this.transforms.get(transformId);
    if (!transform || !transform.enabled) {
      return inputData;
    }

    let outputData: any;

    try {
      switch (transform.type) {
        case 'map':
          outputData = this.applyMapTransform(inputData, transform.config);
          break;
        case 'filter':
          outputData = this.applyFilterTransform(inputData, transform.config);
          break;
        case 'reduce':
          outputData = this.applyReduceTransform(inputData, transform.config);
          break;
        case 'custom':
          outputData = this.applyCustomTransform(inputData, transform.config);
          break;
        default:
          outputData = inputData;
      }

      const transformData: TransformData = {
        id: `${transformId}_${Date.now()}`,
        timestamp: new Date(),
        inputData,
        outputData,
        transformId,
      };

      const history = this.transformHistory.get(transformId) || [];
      history.push(transformData);
      
      // Keep only last 100 entries
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }
      
      this.transformHistory.set(transformId, history);

      this.logger.log(`Applied transform ${transformId}: ${JSON.stringify(outputData).substring(0, 100)}...`);
      
      return outputData;
    } catch (error) {
      this.logger.error(`Error applying transform ${transformId}: ${error.message}`);
      return inputData;
    }
  }

  private applyMapTransform(data: any, config: any): any {
    if (Array.isArray(data)) {
      return data.map(item => {
        if (config.field) {
          return { [config.field]: item };
        }
        return item;
      });
    }
    return data;
  }

  private applyFilterTransform(data: any, config: any): any {
    if (Array.isArray(data)) {
      return data.filter(item => {
        if (config.condition) {
          // Simple condition evaluation
          const field = config.condition.field;
          const operator = config.condition.operator;
          const value = config.condition.value;
          
          switch (operator) {
            case 'equals':
              return item[field] === value;
            case 'contains':
              return String(item[field]).includes(String(value));
            case 'greater':
              return item[field] > value;
            case 'less':
              return item[field] < value;
            default:
              return true;
          }
        }
        return true;
      });
    }
    return data;
  }

  private applyReduceTransform(data: any, config: any): any {
    if (Array.isArray(data)) {
      return data.reduce((acc, item) => {
        if (config.operation === 'sum' && config.field) {
          return acc + (item[config.field] || 0);
        }
        if (config.operation === 'count') {
          return acc + 1;
        }
        return acc;
      }, config.initialValue || 0);
    }
    return data;
  }

  private applyCustomTransform(data: any, config: any): any {
    // For custom transformations, we can evaluate JavaScript expressions
    // This is a simple implementation - in production you'd want more security
    if (config.expression) {
      try {
        // Simple template evaluation
        let result = config.expression;
        if (typeof data === 'object') {
          Object.keys(data).forEach(key => {
            result = result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), data[key]);
          });
        }
        return result;
      } catch (error) {
        this.logger.error(`Error in custom transform: ${error.message}`);
        return data;
      }
    }
    return data;
  }

  async getLatestTransformData(transformId: string): Promise<TransformData | null> {
    const history = this.transformHistory.get(transformId);
    return history && history.length > 0 ? history[history.length - 1] : null;
  }
} 