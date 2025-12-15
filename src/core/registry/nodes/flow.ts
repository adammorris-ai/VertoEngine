import { NodeDefinition, registry } from '../NodeRegistry';
import { DataType } from '../../graph/types';

const Exec: DataType = { type: 'Exec' };
const Bool: DataType = { type: 'Bool' };
const Int: DataType = { type: 'Int' };
const Float: DataType = { type: 'Float' };

export const BeginPlay: NodeDefinition = {
  type: 'flow.begin_play',
  category: 'Events',
  label: 'Event BeginPlay',
  create: () => ({
    inputs: [],
    outputs: [{ name: 'Out', dataType: Exec }],
  }),
  execute: (ctx) => {
    ctx.trigger('Out');
  }
};

export const Tick: NodeDefinition = {
  type: 'flow.tick',
  category: 'Events',
  label: 'Event Tick',
  create: () => ({
    inputs: [],
    outputs: [
      { name: 'Out', dataType: Exec },
      { name: 'DeltaSeconds', dataType: Float },
    ],
  }),
  execute: (ctx) => {
    ctx.trigger('Out');
  }
};

export const Branch: NodeDefinition = {
  type: 'flow.branch',
  category: 'Flow Control',
  label: 'Branch',
  create: () => ({
    inputs: [
      { name: 'In', dataType: Exec },
      { name: 'Condition', dataType: Bool },
    ],
    outputs: [
      { name: 'True', dataType: Exec },
      { name: 'False', dataType: Exec },
    ],
  }),
  execute: (ctx) => {
    const condition = ctx.getInput('Condition');
    if (condition) {
      ctx.trigger('True');
    } else {
      ctx.trigger('False');
    }
  }
};

export const FlipFlop: NodeDefinition = {
  type: 'flow.flipflop',
  category: 'Flow Control',
  label: 'Flip Flop',
  create: () => ({
    inputs: [{ name: 'In', dataType: Exec }],
    outputs: [
      { name: 'A', dataType: Exec },
      { name: 'B', dataType: Exec },
      { name: 'IsA', dataType: Bool },
    ],
    data: { isA: true },
  }),
  execute: (ctx) => {
    const isA = ctx.state.isA;
    ctx.setOutput('IsA', isA);
    
    if (isA) {
      ctx.trigger('A');
    } else {
      ctx.trigger('B');
    }
    
    // Toggle for next time
    ctx.state.isA = !isA;
  }
};

export const Sequence: NodeDefinition = {
  type: 'flow.sequence',
  category: 'Flow Control',
  label: 'Sequence',
  create: () => ({
    inputs: [{ name: 'In', dataType: Exec }],
    outputs: [
      { name: 'Then 0', dataType: Exec },
      { name: 'Then 1', dataType: Exec },
    ],
  }),
  execute: (ctx) => {
    ctx.trigger('Then 0');
    ctx.trigger('Then 1');
  }
};

export const DoOnce: NodeDefinition = {
  type: 'flow.do_once',
  category: 'Flow Control',
  label: 'Do Once',
  create: () => ({
    inputs: [
      { name: 'In', dataType: Exec },
      { name: 'Reset', dataType: Exec },
    ],
    outputs: [{ name: 'Completed', dataType: Exec }],
    data: { isClosed: false },
  }),
  execute: (ctx) => {
    if (ctx.state.isClosed) return;
    ctx.state.isClosed = true;
    ctx.trigger('Completed');
  }
};

export const Gate: NodeDefinition = {
  type: 'flow.gate',
  category: 'Flow Control',
  label: 'Gate',
  create: () => ({
    inputs: [
      { name: 'Enter', dataType: Exec },
      { name: 'Open', dataType: Exec },
      { name: 'Close', dataType: Exec },
      { name: 'Toggle', dataType: Exec },
    ],
    outputs: [{ name: 'Exit', dataType: Exec }],
    data: { isOpen: true },
  }),
  execute: (ctx) => {
     if (ctx.state.isOpen) {
       ctx.trigger('Exit');
     }
  }
};

export const ForLoop: NodeDefinition = {
  type: 'flow.for_loop',
  category: 'Flow Control',
  label: 'For Loop',
  create: () => ({
    inputs: [
      { name: 'In', dataType: Exec },
      { name: 'FirstIndex', dataType: Int, defaultValue: 0 },
      { name: 'LastIndex', dataType: Int, defaultValue: 10 },
    ],
    outputs: [
      { name: 'LoopBody', dataType: Exec },
      { name: 'Completed', dataType: Exec },
      { name: 'Index', dataType: Int },
    ],
  }),
  execute: (ctx) => {
    const first = ctx.getInput('FirstIndex');
    const last = ctx.getInput('LastIndex');
    
    for (let i = first; i <= last; i++) {
      ctx.setOutput('Index', i);
      ctx.trigger('LoopBody');
    }
    ctx.trigger('Completed');
  }
};

export const WhileLoop: NodeDefinition = {
  type: 'flow.while_loop',
  category: 'Flow Control',
  label: 'While Loop',
  create: () => ({
    inputs: [
      { name: 'In', dataType: Exec },
      { name: 'Condition', dataType: Bool },
    ],
    outputs: [
      { name: 'LoopBody', dataType: Exec },
      { name: 'Completed', dataType: Exec },
    ],
  }),
  execute: (ctx) => {
    let iteration = 0;
    const MAX_ITERATIONS = 10000; // Cap
    
    while (ctx.getInput('Condition')) {
      if (iteration++ > MAX_ITERATIONS) {
        console.warn("Infinite loop detected");
        break;
      }
      ctx.trigger('LoopBody');
    }
    ctx.trigger('Completed');
  }
};

export function registerFlowNodes() {
  registry.register(BeginPlay);
  registry.register(Tick);
  registry.register(Branch);
  registry.register(FlipFlop);
  registry.register(Sequence);
  registry.register(DoOnce);
  registry.register(Gate);
  registry.register(ForLoop);
  registry.register(WhileLoop);
}
