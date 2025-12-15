import { useEngine } from '../context/EngineContext';

export const Inspector = () => {
  const { engine, selectedNodeId, forceUpdate } = useEngine();
  
  if (!selectedNodeId) {
    return <div className="p-4 text-gray-500 text-sm">No selection</div>;
  }

  const node = engine.graph.nodes[selectedNodeId];
  if (!node) {
      return <div className="p-4 text-gray-500 text-sm">Node not found</div>;
  }

  const handleInputChange = (pinId: string, value: any) => {
      // Find pin
      const pin = node.inputs.find(p => p.id === pinId);
      if (pin) {
          pin.defaultValue = value;
          forceUpdate();
      }
  };
  
  const handleDataChange = (key: string, value: any) => {
      if (!node.data) node.data = {};
      node.data[key] = value;
      forceUpdate();
  };

  return (
    <div className="h-full bg-gray-900 text-gray-200 p-4 overflow-y-auto border-l border-gray-700">
      <div className="font-bold text-lg mb-4 text-blue-400">{node.label || node.type}</div>
      
      <div className="space-y-4">
          <div>
            <div className="text-xs uppercase font-bold text-gray-500 mb-2">Inputs</div>
            {node.inputs.map(pin => {
                 // Check if connected
                 const isConnected = engine.graph.connections.some(c => c.targetPinId === pin.id);
                 if (isConnected || pin.dataType.type === 'Exec') return null;

                 return (
                     <div key={pin.id} className="mb-2">
                         <label className="text-xs block mb-1">{pin.name} ({pin.dataType.type})</label>
                         {pin.dataType.type === 'Bool' ? (
                             <input 
                                type="checkbox" 
                                checked={!!pin.defaultValue} 
                                onChange={e => handleInputChange(pin.id, e.target.checked)}
                             />
                         ) : (
                             <input 
                                type="text" 
                                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm"
                                value={pin.defaultValue ?? ''}
                                onChange={e => {
                                    const val = e.target.value;
                                    const num = parseFloat(val);
                                    if ((pin.dataType.type === 'Float' || pin.dataType.type === 'Int') && !isNaN(num)) {
                                        handleInputChange(pin.id, num);
                                    } else {
                                        handleInputChange(pin.id, val);
                                    }
                                }}
                             />
                         )}
                     </div>
                 );
            })}
          </div>
          
          {node.data && Object.keys(node.data).length > 0 && (
              <div>
                <div className="text-xs uppercase font-bold text-gray-500 mb-2">Node Data</div>
                {Object.entries(node.data).map(([key, val]) => (
                    <div key={key} className="mb-2">
                         <label className="text-xs block mb-1">{key}</label>
                         <input 
                            type="text" 
                            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm"
                            value={String(val)}
                            onChange={e => handleDataChange(key, e.target.value)} // Naive, needs type check
                         />
                    </div>
                ))}
              </div>
          )}
      </div>
    </div>
  );
};
