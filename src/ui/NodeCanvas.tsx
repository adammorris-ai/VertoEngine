import { useCallback, useMemo, useState, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  NodeChange, 
  EdgeChange, 
  Connection, 
  Node,
  Edge,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useUIStore } from './store/uiStore';
import { NodeCard } from './NodeCard';
import { registry } from '../core/registry/NodeRegistry';
import { v4 as uuidv4 } from 'uuid';
import { createPin } from '../core/graph/Graph';
import { PinDirection } from '../core/graph/types';

const nodeTypes = {
  custom: NodeCard
};

const CanvasInner = () => {
  const { graph, addLog, isRunning } = useUIStore();
  
  // Hooks for state syncing
  // We need to sync ReactFlow state <-> Engine Graph state
  // Simplest: map Engine Graph -> ReactFlow Nodes/Edges on every render/store update
  
  // Note: To properly sync without infinite loops, usually we use a "version" or "refresh" token in store
  // For this MVP, we will rely on React's render cycle triggered by useUIStore updates.
  // However, useUIStore currently stores the GRAPH OBJECT which is mutable and doesn't trigger updates automatically unless we clone or use a version counter.
  // I will add a manual refresh trigger.
  
  const [version, setVersion] = useState(0);
  
  // Hack: Hook into store to force re-render when we mutate graph
  useEffect(() => {
      const interval = setInterval(() => {
          // Simple polling for MVP to catch engine updates or external changes
          setVersion(v => v + 1);
      }, 500); 
      return () => clearInterval(interval);
  }, []);

  const nodesData = graph.data.nodes; 
  const connectionsData = graph.data.connections;

  const nodes: Node[] = useMemo(() => {
    return Object.values(nodesData).map(node => ({
      id: node.id,
      type: 'custom',
      position: node.position,
      data: node, 
      draggable: !isRunning,
      selectable: !isRunning
    }));
  }, [nodesData, version, isRunning]); 

  const edges: Edge[] = useMemo(() => {
    return connectionsData.map(conn => ({
      id: `${conn.sourcePinId}-${conn.targetPinId}`,
      source: Object.values(nodesData).find(n => n.outputs.some(p => p.id === conn.sourcePinId))?.id || '',
      sourceHandle: conn.sourcePinId,
      target: Object.values(nodesData).find(n => n.inputs.some(p => p.id === conn.targetPinId))?.id || '',
      targetHandle: conn.targetPinId,
      type: 'default', 
      animated: !!(conn.sourcePinId && nodesData[Object.values(nodesData).find(n => n.outputs.some(p => p.id === conn.sourcePinId))?.id || '']?.outputs.find(p => p.id === conn.sourcePinId)?.dataType.type === 'Exec'),
      style: { stroke: '#555', strokeWidth: 2 },
    })).filter(e => e.source && e.target); 
  }, [connectionsData, nodesData, version]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
      changes.forEach(change => {
        if (change.type === 'position' && change.position) {
            const node = nodesData[change.id];
            if (node) node.position = change.position;
        }
        if (change.type === 'remove') {
            graph.removeNode(change.id);
        }
      });
      setVersion(v => v + 1);
  }, [graph, nodesData]);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
       changes.forEach(change => {
           if (change.type === 'remove') {
               const [sourcePinId, targetPinId] = change.id.split('-');
               if (sourcePinId && targetPinId) graph.disconnect(sourcePinId, targetPinId);
           }
       });
       setVersion(v => v + 1);
  }, [graph]);

  const onConnect = useCallback((params: Connection) => {
       if (params.sourceHandle && params.targetHandle) {
           try {
             graph.connect(params.sourceHandle, params.targetHandle);
             setVersion(v => v + 1);
           } catch (e: any) {
               addLog(`Error: ${e.message}`);
           }
       }
  }, [graph, addLog]);

  const onDrop = useCallback((event: any) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      
      if (!type) return;
      
      const def = registry.get(type);
      if (!def) return;
      
      // Calculate position
      // We need screen to flow coords, simpler to just use mouse for now or random
      // ReactFlow provides `project` function but we need the instance.
      // For MVP, just drop at random offset near center or top left
      
      const { inputs: defInputs, outputs: defOutputs, data } = def.create();
      const nodeId = uuidv4();
      const inputs = defInputs.map(p => ({ ...createPin(nodeId, p.name, p.dataType, PinDirection.Input), defaultValue: p.defaultValue }));
      const outputs = defOutputs.map(p => ({ ...createPin(nodeId, p.name, p.dataType, PinDirection.Output), defaultValue: p.defaultValue }));

      graph.addNode({
          id: nodeId, type, label: def.label,
          position: { x: event.clientX - 300, y: event.clientY - 100 }, // Rough approx
          inputs, outputs, data: data || {}
      });
      setVersion(v => v + 1);
  }, [graph]);

  const onDragOver = useCallback((event: any) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div className="flex-1 h-full bg-gray-50 relative" onDrop={onDrop} onDragOver={onDragOver}>
      {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium pointer-events-none z-10">
              Drag nodes from the left to start
          </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50"
      >
        <Background color="#e5e7eb" gap={24} size={1} />
        <Controls showInteractive={false} className="!bg-white !shadow-sm !border-gray-200 !text-gray-600" />
      </ReactFlow>
      
      {isRunning && (
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] pointer-events-none z-20 flex items-start justify-center pt-10">
             {/* Overlay to indicate running state if desired */}
          </div>
      )}
    </div>
  );
};

export const NodeCanvas = () => (
    <ReactFlowProvider>
        <CanvasInner />
    </ReactFlowProvider>
);
