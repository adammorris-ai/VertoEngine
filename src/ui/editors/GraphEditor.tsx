import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: 'Event BeginPlay' }, type: 'input' },
  { id: '2', position: { x: 0, y: 100 }, data: { label: 'Print String' } },
];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

export const GraphEditor = () => {
  return (
    <div className="h-full w-full bg-gray-800">
      <ReactFlow 
        defaultNodes={initialNodes} 
        defaultEdges={initialEdges}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};
