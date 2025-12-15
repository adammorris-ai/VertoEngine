import { ApiEntry } from './types';

// --- MATH ---
export const advancedMathEntries: ApiEntry[] = [
  {
    id: 'math.abs', displayName: 'Abs', category: 'Math',
    inputs: [{name: 'A', type: 'Float'}], outputs: [{name: 'Result', type: 'Float'}], pure: true,
    handler: (args) => ({ Result: Math.abs(args.A || 0) })
  },
  {
    id: 'math.min', displayName: 'Min', category: 'Math',
    inputs: [{name: 'A', type: 'Float'}, {name: 'B', type: 'Float'}], outputs: [{name: 'Result', type: 'Float'}], pure: true,
    handler: (args) => ({ Result: Math.min(args.A || 0, args.B || 0) })
  },
  {
    id: 'math.max', displayName: 'Max', category: 'Math',
    inputs: [{name: 'A', type: 'Float'}, {name: 'B', type: 'Float'}], outputs: [{name: 'Result', type: 'Float'}], pure: true,
    handler: (args) => ({ Result: Math.max(args.A || 0, args.B || 0) })
  },
  {
    id: 'math.clamp', displayName: 'Clamp', category: 'Math',
    inputs: [{name: 'Value', type: 'Float'}, {name: 'Min', type: 'Float'}, {name: 'Max', type: 'Float'}], outputs: [{name: 'Result', type: 'Float'}], pure: true,
    handler: (args) => ({ Result: Math.max(args.Min || 0, Math.min(args.Value || 0, args.Max || 1)) })
  },
  {
    id: 'math.lerp', displayName: 'Lerp', category: 'Math',
    inputs: [{name: 'A', type: 'Float'}, {name: 'B', type: 'Float'}, {name: 'Alpha', type: 'Float'}], outputs: [{name: 'Result', type: 'Float'}], pure: true,
    handler: (args) => { const a = args.A||0; return { Result: a + ((args.B||0) - a) * (args.Alpha||0) }; }
  }
];

// --- STRING ---
export const stringEntries: ApiEntry[] = [
  {
    id: 'string.append', displayName: 'Append', category: 'String',
    inputs: [{name: 'A', type: 'String'}, {name: 'B', type: 'String'}], outputs: [{name: 'Result', type: 'String'}], pure: true,
    handler: (args) => ({ Result: (args.A || '') + (args.B || '') })
  },
  {
    id: 'string.length', displayName: 'Length', category: 'String',
    inputs: [{name: 'String', type: 'String'}], outputs: [{name: 'Result', type: 'Int'}], pure: true,
    handler: (args) => ({ Result: (args.String || '').length })
  },
  {
    id: 'string.contains', displayName: 'Contains', category: 'String',
    inputs: [{name: 'SearchIn', type: 'String'}, {name: 'Substring', type: 'String'}], outputs: [{name: 'Result', type: 'Bool'}], pure: true,
    handler: (args) => ({ Result: (args.SearchIn || '').includes(args.Substring || '') })
  }
];

// --- VECTOR ---
// Assuming Vec2 is {x,y}
export const vectorEntries: ApiEntry[] = [
  {
    id: 'vector.make', displayName: 'Make Vector', category: 'Vector',
    inputs: [{name: 'X', type: 'Float'}, {name: 'Y', type: 'Float'}], outputs: [{name: 'Result', type: 'Vec2'}], pure: true,
    handler: (args) => ({ Result: { x: args.X||0, y: args.Y||0 } })
  },
  {
    id: 'vector.break', displayName: 'Break Vector', category: 'Vector',
    inputs: [{name: 'Vec', type: 'Vec2'}], outputs: [{name: 'X', type: 'Float'}, {name: 'Y', type: 'Float'}], pure: true,
    handler: (args) => { const v = args.Vec || {x:0,y:0}; return { X: v.x, Y: v.y }; }
  },
  {
    id: 'vector.add', displayName: 'Vector + Vector', category: 'Vector',
    inputs: [{name: 'A', type: 'Vec2'}, {name: 'B', type: 'Vec2'}], outputs: [{name: 'Result', type: 'Vec2'}], pure: true,
    handler: (args) => { const a=args.A||{x:0,y:0}; const b=args.B||{x:0,y:0}; return { Result: {x: a.x+b.x, y: a.y+b.y} }; }
  }
];

// --- ACTOR ---
// Stubs as we don't have full entity system exposed in ctx.services.world yet (only in tests)
export const actorEntries: ApiEntry[] = [
  {
    id: 'actor.destroy', displayName: 'Destroy Actor', category: 'Actor',
    inputs: [{name: 'Target', type: 'EntityRef', default: 'Self'}], outputs: [], pure: false,
    handler: (args, ctx) => {
       if (ctx.services.logger) ctx.services.logger.log(`Destroy Actor: ${args.Target}`);
       // Logic: ctx.services.world.destroyEntity(args.Target)
    }
  },
  {
    id: 'actor.set_location', displayName: 'Set Actor Location', category: 'Actor',
    inputs: [{name: 'Target', type: 'EntityRef', default: 'Self'}, {name: 'NewLocation', type: 'Vec2'}], outputs: [], pure: false,
    handler: (args, ctx) => {
       if (ctx.services.logger) ctx.services.logger.log(`Set Location: ${JSON.stringify(args.NewLocation)}`);
    }
  }
];

// --- AUDIO ---
export const audioEntries: ApiEntry[] = [
  {
    id: 'audio.play_2d', displayName: 'Play Sound 2D', category: 'Audio',
    inputs: [{name: 'Sound', type: 'AssetRef'}], outputs: [], pure: false,
    handler: (args, ctx) => {
        if (ctx.services.logger) ctx.services.logger.log(`Playing Sound: ${args.Sound}`);
    }
  }
];

// --- INPUT ---
export const inputEntries: ApiEntry[] = [
  {
    id: 'input.is_key_pressed', displayName: 'Is Key Pressed', category: 'Input',
    inputs: [{name: 'Key', type: 'String'}], outputs: [{name: 'Result', type: 'Bool'}], pure: true,
    handler: (_args, _ctx) => {
        // Mock input check
        return { Result: false }; 
    }
  }
];

export const advancedEntries = [
    ...advancedMathEntries,
    ...stringEntries,
    ...vectorEntries,
    ...actorEntries,
    ...audioEntries,
    ...inputEntries
];
