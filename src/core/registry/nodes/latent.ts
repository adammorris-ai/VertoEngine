import { NodeDefinition, registry } from '../NodeRegistry';
import { DataType } from '../../graph/types';

const Exec: DataType = { type: 'Exec' };
const Float: DataType = { type: 'Float' };

export const Delay: NodeDefinition = {
  type: 'flow.delay',
  category: 'Flow Control',
  label: 'Delay',
  create: () => ({
    inputs: [
      { name: 'In', dataType: Exec },
      { name: 'Duration', dataType: Float, defaultValue: 0.2 },
    ],
    outputs: [
      { name: 'Completed', dataType: Exec }
    ]
  }),
  execute: (ctx) => {
    const duration = ctx.getInput('Duration') || 0;
    let elapsed = 0;
    
    ctx.registerLatent({
      id: 'delay-' + Math.random(),
      update: (dt) => {
        elapsed += dt;
        return elapsed >= duration;
      },
      complete: () => {
        ctx.trigger('Completed');
      }
    });
  }
};

export function registerLatentNodes() {
  registry.register(Delay);
}
