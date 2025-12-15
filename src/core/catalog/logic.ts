import { ApiEntry } from './types';

export const logicEntries: ApiEntry[] = [
  {
    id: 'logic.and',
    displayName: 'AND',
    category: 'Logic',
    inputs: [{name: 'A', type: 'Bool'}, {name: 'B', type: 'Bool'}],
    outputs: [{name: 'Result', type: 'Bool'}],
    pure: true,
    handler: (args) => ({ Result: !!(args.A && args.B) })
  },
  {
    id: 'logic.or',
    displayName: 'OR',
    category: 'Logic',
    inputs: [{name: 'A', type: 'Bool'}, {name: 'B', type: 'Bool'}],
    outputs: [{name: 'Result', type: 'Bool'}],
    pure: true,
    handler: (args) => ({ Result: !!(args.A || args.B) })
  },
  {
    id: 'logic.not',
    displayName: 'NOT',
    category: 'Logic',
    inputs: [{name: 'In', type: 'Bool'}],
    outputs: [{name: 'Result', type: 'Bool'}],
    pure: true,
    handler: (args) => ({ Result: !args.In })
  }
];
