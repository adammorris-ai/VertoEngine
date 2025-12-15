import { ExecutionContext } from '../execution/types';

export interface ApiParam {
  name: string;
  type: string; // DataType string key
  default?: any;
}

export interface ApiEntry {
  id: string;
  displayName: string;
  category: string;
  inputs: ApiParam[];
  outputs: ApiParam[];
  pure: boolean;
  // Handler receives resolved inputs map and context
  // Returns outputs map (if pure) or void (if impure, handles output setting/triggering manually? or returns outputs to be set?)
  // For Impure, we might return outputs AND trigger 'Out'.
  // Let's assume standard Impure nodes have 'In' and 'Out' Exec pins added automatically.
  handler: (inputs: Record<string, any>, ctx: ExecutionContext) => Record<string, any> | void;
}
