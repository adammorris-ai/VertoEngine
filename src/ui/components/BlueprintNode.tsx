import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData, PinData } from '../../core/graph/types';
import { cn } from '../../utils/cn'; 

const PIN_COLORS: Record<string, string> = {
  'Exec': '#ffffff',
  'Bool': '#920101', // Dark Red
  'Int': '#22e5bf', // Cyan-ish
  'Float': '#a5f442', // Lime
  'String': '#f20dcf', // Magenta
  'Vec2': '#f4c842', // Yellow
  'Color': '#0051ff', // Blue
  'EntityRef': '#0095ff', // Light Blue
};

const PinRow = ({ pin, isInput }: { pin: PinData; isInput: boolean }) => {
  const color = PIN_COLORS[pin.dataType.type] || '#cccccc';
  const isExec = pin.dataType.type === 'Exec';
  
  return (
    <div className={cn("flex items-center gap-2 h-6", isInput ? "flex-row" : "flex-row-reverse")}>
      <div className="relative flex items-center justify-center w-4">
          <Handle
            type={isInput ? 'target' : 'source'}
            position={isInput ? Position.Left : Position.Right}
            id={pin.id}
            className={cn(
                "!w-3 !h-3 !bg-transparent !border-0",
                "top-auto left-auto right-auto bottom-auto relative"
            )}
            style={{ backgroundColor: 'transparent' }} // Override default
          >
             {isExec ? (
                <div className="w-0 h-0 border-l-[10px] border-y-[6px] border-l-white border-y-transparent" />
             ) : (
                <div 
                    className="w-3 h-3 rounded-full border-2 border-gray-900" 
                    style={{ backgroundColor: color, borderColor: isExec ? 'transparent' : '#111' }} 
                />
             )}
          </Handle>
      </div>
      <span className="text-xs text-gray-200 font-medium">{pin.name}</span>
    </div>
  );
};

export const BlueprintNode = memo(({ data }: NodeProps<NodeData>) => {
  const inputs = data.inputs || [];
  const outputs = data.outputs || [];

  return (
    <div className="min-w-[150px] bg-gray-800/90 border-2 border-gray-600 rounded-lg shadow-xl overflow-hidden backdrop-blur-sm select-none">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-gray-800 px-3 py-1 border-b border-gray-600">
        <div className="font-bold text-sm text-white truncate">{data.type.split('.').pop()}</div>
        {data.label && <div className="text-xs text-gray-300 truncate">{data.label}</div>}
      </div>

      {/* Body */}
      <div className="p-2 flex justify-between gap-4">
        {/* Inputs */}
        <div className="flex flex-col gap-1 items-start">
          {inputs.map(pin => (
            <PinRow key={pin.id} pin={pin} isInput={true} />
          ))}
        </div>

        {/* Outputs */}
        <div className="flex flex-col gap-1 items-end">
          {outputs.map(pin => (
            <PinRow key={pin.id} pin={pin} isInput={false} />
          ))}
        </div>
      </div>
    </div>
  );
});
