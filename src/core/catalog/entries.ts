import { ApiEntry } from './types';
import { logicEntries } from './logic';

export const mathEntries: ApiEntry[] = [
  {
    id: 'math.add',
    displayName: 'Add (Float)',
    category: 'Math',
    inputs: [{name: 'A', type: 'Float'}, {name: 'B', type: 'Float'}],
    outputs: [{name: 'Result', type: 'Float'}],
    pure: true,
    handler: (args) => ({ Result: (args.A || 0) + (args.B || 0) })
  },
  {
    id: 'math.multiply',
    displayName: 'Multiply (Float)',
    category: 'Math',
    inputs: [{name: 'A', type: 'Float'}, {name: 'B', type: 'Float'}],
    outputs: [{name: 'Result', type: 'Float'}],
    pure: true,
    handler: (args) => ({ Result: (args.A || 0) * (args.B || 0) })
  }
];

export const debugEntries: ApiEntry[] = [
  {
    id: 'debug.print',
    displayName: 'Print String',
    category: 'Debug',
    inputs: [{name: 'String', type: 'String', default: 'Hello'}],
    outputs: [],
    pure: false,
    handler: (args, ctx) => { 
      if (ctx.services.logger) {
        ctx.services.logger.log(args.String);
      } else {
        console.log(args.String); 
      }
    }
  }
];

export const allEntries = [...mathEntries, ...debugEntries, ...logicEntries];
