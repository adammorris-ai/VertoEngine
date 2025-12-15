import { useState } from 'react';
import { registry } from '../../core/registry/NodeRegistry';
import { useEngine } from '../context/EngineContext';
import { v4 as uuidv4 } from 'uuid';
import { createPin } from '../../core/graph/Graph';
import { PinDirection } from '../../core/graph/types';
import { Search } from 'lucide-react';

export const Palette = () => {
  const { graph, forceUpdate } = useEngine();
  const [search, setSearch] = useState('');

  const nodes = registry.search(search);

  const addNode = (type: string) => {
      const def = registry.get(type);
      if (!def) return;

      const { inputs: defInputs, outputs: defOutputs, data } = def.create();
      const nodeId = uuidv4();
      
      const inputs = defInputs.map(p => ({
          ...createPin(nodeId, p.name, p.dataType, PinDirection.Input),
          defaultValue: p.defaultValue
      }));
      
      const outputs = defOutputs.map(p => ({
          ...createPin(nodeId, p.name, p.dataType, PinDirection.Output),
          defaultValue: p.defaultValue
      }));

      // Add with slight random offset or center
      graph.addNode({
          id: nodeId,
          type: type,
          label: def.label,
          position: { x: 200 + Math.random() * 50, y: 200 + Math.random() * 50 },
          inputs,
          outputs,
          data: data || {}
      });
      
      forceUpdate();
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-gray-200 border-r border-gray-700">
      <div className="p-2 border-b border-gray-700 flex items-center gap-2">
        <Search size={16} />
        <input 
            className="bg-transparent border-none outline-none w-full text-sm placeholder-gray-500"
            placeholder="Search nodes..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto p-2">
         {nodes.map(def => (
             <div 
                key={def.type}
                className="p-2 hover:bg-gray-800 rounded cursor-pointer text-sm flex flex-col group"
                onClick={() => addNode(def.type)}
             >
                 <div className="font-medium text-blue-400 group-hover:text-blue-300">{def.label}</div>
                 <div className="text-xs text-gray-500">{def.category}</div>
             </div>
         ))}
      </div>
    </div>
  );
};
