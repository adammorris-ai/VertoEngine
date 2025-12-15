import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData, PinData } from '../core/graph/types';
import { cn } from '../utils/cn'; 

const PIN_COLORS: Record<string, string> = {
  'Exec': '#333333', // Dark Grey for Exec
  'Bool': '#d92b2b', // Red
  'Int': '#00dcb5', // Cyan
  'Float': '#88e31b', // Lime
  'String': '#e81ce8', // Magenta
  'Vec2': '#f0c808', // Yellow
  'Color': '#0075ff', // Blue
  'EntityRef': '#0099ff', 
  'Any': '#999999'
};

const PinView = ({ pin, isInput }: { pin: PinData; isInput: boolean }) => {
  const isExec = pin.dataType.type === 'Exec';
  const color = PIN_COLORS[pin.dataType.type] || '#999999';

  return (
    <div className={cn("flex items-center gap-2 h-7 px-1", isInput ? "flex-row" : "flex-row-reverse")}>
       <div className="relative w-4 h-4 flex items-center justify-center">
         <Handle
            type={isInput ? 'target' : 'source'}
            position={isInput ? Position.Left : Position.Right}
            id={pin.id}
            className={cn(
                "!w-3 !h-3 !bg-transparent !border-0",
                "top-auto left-auto right-auto bottom-auto relative transition-transform hover:scale-125"
            )}
            style={{ backgroundColor: 'transparent' }} 
         >
             {isExec ? (
                <div className="w-0 h-0 border-l-[10px] border-y-[6px] border-l-gray-700 border-y-transparent transform scale-75" />
             ) : (
                <div 
                    className="w-3 h-3 rounded-full border-2 border-gray-500 bg-white" 
                    style={{ backgroundColor: color, borderColor: '#555' }} 
                />
             )}
         </Handle>
       </div>
       <span className="text-xs text-gray-700 font-medium">{pin.name}</span>
    </div>
  );
};

export const NodeCard = memo(({ data, selected }: NodeProps<NodeData>) => {
  const inputs = data.inputs || [];
  const outputs = data.outputs || [];

  return (
    <div className={cn(
        "min-w-[140px] bg-white rounded-lg shadow-sm border transition-shadow",
        selected ? "border-blue-500 shadow-md ring-2 ring-blue-100" : "border-gray-300 hover:border-gray-400"
    )}>
      {/* Header */}
      <div className="px-3 py-2 bg-gray-50 rounded-t-lg border-b border-gray-100 flex items-center justify-between">
         <div className="font-bold text-xs text-gray-800 truncate">{data.label || data.type}</div>
      </div>

      {/* Body */}
      <div className="p-2 flex justify-between gap-4">
         <div className="flex flex-col gap-0.5 items-start">
            {inputs.map(p => <PinView key={p.id} pin={p} isInput={true} />)}
         </div>
         <div className="flex flex-col gap-0.5 items-end">
            {outputs.map(p => <PinView key={p.id} pin={p} isInput={false} />)}
         </div>
      </div>
    </div>
  );
});
