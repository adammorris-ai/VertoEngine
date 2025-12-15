import { useEffect, useRef } from 'react';
import { useEngine } from '../context/EngineContext';
import { Trash2 } from 'lucide-react';

export const Output = () => {
  const { logs, clearLogs } = useEngine();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="h-full flex flex-col bg-gray-900 text-gray-200 border-t border-gray-700 font-mono text-sm">
      <div className="flex items-center justify-between p-2 border-b border-gray-700 bg-gray-800">
        <span className="font-bold text-gray-400">Output Log</span>
        <button onClick={clearLogs} className="text-gray-400 hover:text-white" title="Clear Log">
            <Trash2 size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
         {logs.length === 0 && <div className="text-gray-600 italic">No output</div>}
         {logs.map((log, i) => (
             <div key={i} className="mb-1 border-b border-gray-800 pb-1 last:border-0">
                 <span className="text-gray-500 mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                 <span className="text-green-400">{log.message}</span>
             </div>
         ))}
         <div ref={bottomRef} />
      </div>
    </div>
  );
};
