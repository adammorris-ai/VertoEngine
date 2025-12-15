import { NodeDefinition, registry } from '../NodeRegistry';
import { DataType } from '../../graph/types';

const Exec: DataType = { type: 'Exec' };
const Any: DataType = { type: 'Any' };

export const GetVariable: NodeDefinition = {
  type: 'variable.get',
  category: 'Variables',
  label: 'Get Variable',
  create: () => ({
    inputs: [], // Dynamic: we need to select which variable
    outputs: [{ name: 'Value', dataType: Any }],
    data: { variableName: '' }
  }),
  execute: (ctx) => {
    // We need access to the graph variables.
    // Graph variables are usually stored in the runtime instance (Engine/Context), 
    // initialized from GraphData.
    // Let's assume ExecutionContext provides access to variables.
    if (ctx.services.variables) {
       const name = ctx.state.variableName;
       const val = ctx.services.variables[name];
       ctx.setOutput('Value', val);
    }
  }
};

export const SetVariable: NodeDefinition = {
  type: 'variable.set',
  category: 'Variables',
  label: 'Set Variable',
  create: () => ({
    inputs: [
        { name: 'In', dataType: Exec },
        { name: 'Value', dataType: Any }
    ],
    outputs: [
        { name: 'Out', dataType: Exec },
        { name: 'Value', dataType: Any }
    ],
    data: { variableName: '' }
  }),
  execute: (ctx) => {
    if (ctx.services.variables) {
       const name = ctx.state.variableName;
       const val = ctx.getInput('Value');
       ctx.services.variables[name] = val;
       ctx.setOutput('Value', val);
       ctx.trigger('Out');
    }
  }
};

export function registerVariableNodes() {
  registry.register(GetVariable);
  registry.register(SetVariable);
}
