import { ApiEntry } from './types';
import { NodeDefinition, PinDefinition } from '../registry/NodeRegistry';
import { DataType } from '../graph/types';

export function generateNode(entry: ApiEntry): NodeDefinition {
  return {
    type: entry.id,
    category: entry.category,
    label: entry.displayName,
    create: () => {
      const inputs: PinDefinition[] = entry.inputs.map(p => ({
        name: p.name,
        dataType: { type: p.type as any } as DataType, 
        defaultValue: p.default
      }));
      const outputs: PinDefinition[] = entry.outputs.map(p => ({
        name: p.name,
        dataType: { type: p.type as any } as DataType,
        defaultValue: undefined
      }));

      if (!entry.pure) {
        inputs.unshift({ name: 'In', dataType: { type: 'Exec' }, defaultValue: undefined });
        outputs.unshift({ name: 'Out', dataType: { type: 'Exec' }, defaultValue: undefined });
      }

      return { inputs, outputs };
    },
    execute: (ctx) => {
      // Resolve inputs
      const args: Record<string, any> = {};
      for (const p of entry.inputs) {
        args[p.name] = ctx.getInput(p.name);
      }

      const result = entry.handler(args, ctx);

      if (result) {
        for (const [key, val] of Object.entries(result)) {
          ctx.setOutput(key, val);
        }
      }

      if (!entry.pure) {
        ctx.trigger('Out');
      }
    }
  };
}
