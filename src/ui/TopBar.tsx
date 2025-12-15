import { Play, Square, Save, FolderOpen, Plus } from 'lucide-react';
import { useUIStore } from './store/uiStore';

export const TopBar = () => {
  const { run, stop, isRunning } = useUIStore();

  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-2 shadow-sm z-10">
      <div className="font-bold text-xl text-gray-800 mr-4 tracking-tight">Verto Studio</div>
      
      <div className="h-8 w-px bg-gray-200 mx-2" />
      
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors">
        <Plus size={16} /> New
      </button>
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors">
        <FolderOpen size={16} /> Open
      </button>
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors">
        <Save size={16} /> Save
      </button>

      <div className="h-8 w-px bg-gray-200 mx-2" />

      <button 
        onClick={run}
        disabled={isRunning}
        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
            isRunning 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow'
        }`}
      >
        <Play size={16} fill="currentColor" /> Run
      </button>

      <button 
        onClick={stop}
        disabled={!isRunning}
        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
            !isRunning 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow'
        }`}
      >
        <Square size={16} fill="currentColor" /> Stop
      </button>
      
      {isRunning && (
          <span className="ml-4 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded animate-pulse">
              Running
          </span>
      )}
    </div>
  );
};
