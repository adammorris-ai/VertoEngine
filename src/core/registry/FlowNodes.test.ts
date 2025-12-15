import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Branch, ForLoop, Sequence, WhileLoop } from './nodes/flow';
import { ExecutionContext } from '../execution/types';
import { LatentAction } from '../execution/Scheduler';

class MockContext implements ExecutionContext {
  inputs: Record<string, any> = {};
  outputs: Record<string, any> = {};
  triggered: string[] = [];
  state: any = {};
  services: any = {};

  // For dynamic inputs (WhileLoop condition)
  inputOverrides: Record<string, () => any> = {};

  getInput(name: string) {
    if (this.inputOverrides[name]) return this.inputOverrides[name]();
    return this.inputs[name];
  }

  setOutput(name: string, value: any) {
    this.outputs[name] = value;
  }

  trigger(name: string) {
    this.triggered.push(name);
  }

  registerLatent(_action: LatentAction) {
    // Mock
  }
}

describe('Flow Nodes', () => {
  let ctx: MockContext;

  beforeEach(() => {
    ctx = new MockContext();
  });

  it('Branch should trigger True when Condition is true', () => {
    ctx.inputs['Condition'] = true;
    Branch.execute!(ctx);
    expect(ctx.triggered).toEqual(['True']);
  });

  it('Branch should trigger False when Condition is false', () => {
    ctx.inputs['Condition'] = false;
    Branch.execute!(ctx);
    expect(ctx.triggered).toEqual(['False']);
  });

  it('Sequence should trigger outputs in order', () => {
    Sequence.execute!(ctx);
    expect(ctx.triggered).toEqual(['Then 0', 'Then 1']);
  });

  it('ForLoop should loop correct number of times', () => {
    ctx.inputs['FirstIndex'] = 1;
    ctx.inputs['LastIndex'] = 3;
    
    // We want to capture Index value at each trigger
    const indices: number[] = [];
    ctx.trigger = (name: string) => {
      if (name === 'LoopBody') {
        indices.push(ctx.outputs['Index']);
      }
      ctx.triggered.push(name);
    };

    ForLoop.execute!(ctx);
    
    expect(indices).toEqual([1, 2, 3]);
    expect(ctx.triggered).toEqual(['LoopBody', 'LoopBody', 'LoopBody', 'Completed']);
  });

  it('WhileLoop should loop until condition false', () => {
    let count = 0;
    ctx.inputOverrides['Condition'] = () => {
      return count++ < 3;
    };

    WhileLoop.execute!(ctx);
    
    expect(ctx.triggered).toEqual(['LoopBody', 'LoopBody', 'LoopBody', 'Completed']);
  });

  it('WhileLoop should cap infinite loops', () => {
    ctx.inputOverrides['Condition'] = () => true;
    
    // Capture warning
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    WhileLoop.execute!(ctx);
    
    expect(ctx.triggered.filter(t => t === 'LoopBody').length).toBe(10001); // 0 to 10000 = 10001 iterations
    expect(warnSpy).toHaveBeenCalledWith('Infinite loop detected');
    expect(ctx.triggered).toContain('Completed'); 
    
    warnSpy.mockRestore();
  });
});
