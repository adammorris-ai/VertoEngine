import { LatentAction } from './Scheduler';

export interface ExecutionContext {
  getInput: (name: string) => any;
  setOutput: (name: string, value: any) => void;
  trigger: (name: string) => void; 
  state: any;
  registerLatent: (action: LatentAction) => void;
  services: any;
}
