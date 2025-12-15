import React, { useState } from 'react';
import { Search, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { registry } from '../core/registry/NodeRegistry';
import { useUIStore } from './store/uiStore';
import { v4 as uuidv4 } from 'uuid';
import { createPin } from '../core/graph/Graph';
import { PinDirection } from '../core/graph/types';

export const NodePalette = () => {
  const [search, setSearch] = useState('');
  const { graph } = useUIStore();
  
  // Group nodes by category
  const allNodes = registry.search(search);
  const categories: Record<string, typeof allNodes> = {};
  
  allNodes.forEach(def => {
      if (!categories[def.category]) categories[def.category] = [];
      categories[def.category].push(def);
  });

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

      graph.addNode({
          id: nodeId,
          type,
          label: def.label,
          position: { x: 300 + Math.random() * 100, y: 300 + Math.random() * 100 },
          inputs,
          outputs,
          data: data || {}
      });
      
      // Force update needs to happen via store trigger or react-flow sync
      // We'll rely on ReactFlow component re-rendering on graph changes if we hook it up right
      // Or we can dispatch a dummy action
      useUIStore.setState({}); 
  };
  
  const onDragStart = (event: React.DragEvent, type: string) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full shadow-inner">
       <div className="p-3 border-b border-gray-200 bg-white">
           <div className="relative">
               <Search className="absolute left-2 top-2 text-gray-400" size={16} />
               <input 
                 className="w-full pl-8 pr-2 py-1.5 bg-gray-100 border border-transparent focus:bg-white focus:border-blue-400 rounded-md text-sm outline-none transition-all"
                 placeholder="Add node..."
                 value={search}
                 onChange={e => setSearch(e.target.value)}
               />
           </div>
       </div>
       
       <div className="flex-1 overflow-y-auto p-2 space-y-1">
           {Object.entries(categories).map(([cat, nodes]) => (
               <CategoryGroup key={cat} title={cat} nodes={nodes} onAdd={addNode} onDragStart={onDragStart} />
           ))}
       </div>
    </div>
  );
};

const CategoryGroup = ({ title, nodes, onAdd, onDragStart }: any) => {
    const [expanded, setExpanded] = useState(true);
    
    return (
        <div>
            <div 
                className="flex items-center gap-1 p-1.5 hover:bg-gray-100 rounded cursor-pointer text-gray-700 font-semibold text-xs uppercase tracking-wider select-none"
                onClick={() => setExpanded(!expanded)}
            >
                {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                {title}
            </div>
            
            {expanded && (
                <div className="ml-2 pl-2 border-l border-gray-200 space-y-1 mt-1 mb-2">
                    {nodes.map((node: any) => (
                        <div 
                            key={node.type}
                            className="group flex items-center gap-2 p-2 bg-white border border-gray-200 hover:border-blue-400 hover:shadow-sm rounded cursor-grab active:cursor-grabbing transition-all"
                            onClick={() => onAdd(node.type)}
                            draggable
                            onDragStart={(e) => onDragStart(e, node.type)}
                        >
                            <div className="w-1 h-6 bg-blue-500 rounded-full" />
                            <div className="text-sm text-gray-700 font-medium">{node.label}</div>
                            <GripVertical className="ml-auto text-gray-300 opacity-0 group-hover:opacity-100" size={12} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
