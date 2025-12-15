import { useCallback, useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  NodeChange, 
  EdgeChange, 
  Connection, 
  Node,
  Edge
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useEngine } from '../context/EngineContext';
import { BlueprintNode } from '../components/BlueprintNode';

const nodeTypes = {
  custom: BlueprintNode
};

export const GraphEditor = () => {
  const { graph, refresh, forceUpdate, setSelectedNodeId } = useEngine();
  const nodesData = graph.data.nodes; 
  const connectionsData = graph.data.connections;

  // Convert Engine Nodes to ReactFlow Nodes
  const nodes: Node[] = useMemo(() => {
    return Object.values(nodesData).map(node => ({
      id: node.id,
      type: 'custom',
      position: node.position,
      data: node, 
    }));
  }, [nodesData, refresh]); 

  // Convert Engine Connections to ReactFlow Edges
  const edges: Edge[] = useMemo(() => {
    return connectionsData.map(conn => ({
      id: `${conn.sourcePinId}-${conn.targetPinId}`,
      source: nodesData[Object.values(nodesData).find(n => n.outputs.some(p => p.id === conn.sourcePinId))?.id || '']?.id,
      sourceHandle: conn.sourcePinId,
      target: nodesData[Object.values(nodesData).find(n => n.inputs.some(p => p.id === conn.targetPinId))?.id || '']?.id,
      targetHandle: conn.targetPinId,
      type: 'default', 
      animated: false,
      style: { stroke: '#fff', strokeWidth: 2 },
    })).filter(e => e.source && e.target); 
  }, [connectionsData, nodesData, refresh]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach(change => {
        if (change.type === 'position' && change.position) {
            const node = nodesData[change.id];
            if (node) {
                node.position = change.position;
            }
        }
        if (change.type === 'remove') {
            graph.removeNode(change.id);
        }
      });
      forceUpdate();
    },
    [graph, nodesData, forceUpdate]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
       changes.forEach(change => {
           if (change.type === 'remove') {
               const [sourcePinId, targetPinId] = change.id.split('-');
               if (sourcePinId && targetPinId) {
                   graph.disconnect(sourcePinId, targetPinId);
               }
           }
       });
       forceUpdate();
    },
    [graph, forceUpdate]
  );

  const onConnect = useCallback(
    (params: Connection) => {
       if (params.sourceHandle && params.targetHandle) {
           try {
             graph.connect(params.sourceHandle, params.targetHandle);
             forceUpdate();
           } catch (e) {
               console.error("Connection failed", e);
           }
       }
    },
    [graph, forceUpdate]
  );

  const onSelectionChange = useCallback(({ nodes }: { nodes: Node[] }) => {
      if (nodes.length > 0) {
          setSelectedNodeId(nodes[0].id);
      } else {
          setSelectedNodeId(null);
      }
  }, [setSelectedNodeId]);

  return (
    <div className="h-full w-full bg-gray-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-900"
      >
        <Background color="#222" gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  );
};
