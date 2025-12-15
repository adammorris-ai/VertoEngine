import { DataType } from '../graph/types';
import { ExecutionContext } from '../execution/types';

export interface PinDefinition {
  name: string;
  dataType: DataType;
  defaultValue?: any;
}

export type ExecutionCallback = (ctx: ExecutionContext) => Promise<void> | void;

export interface NodeDefinition {
  type: string;
  category: string;
  label: string;
  keywords?: string[];
  description?: string;
  version?: string;
  
  // Factory for initial inputs/outputs/data definitions
  create: () => {
    inputs: PinDefinition[]; 
    outputs: PinDefinition[];
    data?: any;
  };

  execute?: ExecutionCallback;
}

export class NodeRegistry {
  private definitions: Map<string, NodeDefinition> = new Map();

  register(def: NodeDefinition) {
    if (this.definitions.has(def.type)) {
      console.warn(`Overwriting node definition for ${def.type}`);
    }
    this.definitions.set(def.type, def);
  }

  get(type: string): NodeDefinition | undefined {
    return this.definitions.get(type);
  }

  getAll(): NodeDefinition[] {
    return Array.from(this.definitions.values());
  }

  search(query: string): NodeDefinition[] {
    const q = query.toLowerCase();
    return this.getAll().filter(def => 
      def.label.toLowerCase().includes(q) || 
      def.category.toLowerCase().includes(q) ||
      def.keywords?.some(k => k.toLowerCase().includes(q))
    );
  }
}

export const registry = new NodeRegistry();
