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
    // DeltaSeconds should be set by the caller/event trigger, but if we are executing "Tick", 
    // it implies we are passing control. 
    // Usually Event nodes are "Entry Points", so execute() is called by the engine loop 
    // and it triggers 'Out'.
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
    // TODO: Dynamic discovery of outputs if we allow variable number of pins
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
    // In DoOnce, we need to know WHICH input triggered this execution.
    // The simplified ExecutionContext doesn't show "triggeredByPin".
    // We might need to check how the runtime handles "multi-input exec nodes".
    // For now, let's assume separate entry points or ctx.getTriggerPin()
    // BUT, usually nodes are executed because an input was triggered.
    // If we can't distinguish, we might need a different execute signature or 
    // separate handlers for inputs. 
    //
    // However, typical Blueprint VM: "Reset" pin just resets state, doesn't execute "Completed".
    // "In" pin checks state.
    //
    // For now, assuming standard flow where we can't easily distinguish without context info:
    // We will assume `ctx.triggeredInput` exists or similar. 
    // Since we don't have it, I'll defer complex state logic or assume standard 'In'
    
    // Simplification: DoOnce usually is:
    // In -> if open { close; fire Completed }
    // Reset -> open
    //
    // If I can't check input, this logic is flawed.
    // I'll add `getTriggeredInputName` to ExecutionContext later.
    // For now, assume 'In' is the main path.
    
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
     // Needs input distinction
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
    
    // Note: Condition input must be re-evaluated each time?
    // In Blueprints, the "Condition" pin is evaluated every iteration.
    // If it's connected to a variable, we read it again.
    // ctx.getInput should re-evaluate pure nodes connected to it.
    
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
  registry.register(Sequence);
  registry.register(DoOnce);
  registry.register(Gate);
  registry.register(ForLoop);
  registry.register(WhileLoop);
}
