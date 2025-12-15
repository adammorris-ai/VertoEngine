import DockLayout from 'rc-dock';
import "rc-dock/dist/rc-dock.css";
import { Palette } from '../panels/Palette';
import { Assets } from '../panels/Assets';
import { Inspector } from '../panels/Inspector';
import { SceneEditor } from '../editors/SceneEditor';
import { GraphEditor } from '../editors/GraphEditor';
import { Output } from '../panels/Output';
import { EngineProvider, useEngine } from '../context/EngineContext';
import { Play, Square, Save } from 'lucide-react';

const Toolbar = () => {
    const { engine } = useEngine();

    const handlePlay = () => {
        engine.triggerEvent('Event BeginPlay');
    };

    const handleStop = () => {
        // Not implemented fully
    };

    return (
        <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-4">
            <button onClick={handlePlay} className="text-green-500 hover:text-green-400" title="Run">
                <Play fill="currentColor" size={20} />
            </button>
            <button onClick={handleStop} className="text-red-500 hover:text-red-400" title="Stop">
                <Square fill="currentColor" size={20} />
            </button>
            <div className="h-6 w-px bg-gray-600 mx-2" />
            <button className="text-gray-400 hover:text-gray-200" title="Save">
                <Save size={20} />
            </button>
            <span className="ml-auto text-xs text-gray-500">Verto Studio Web v0.1</span>
        </div>
    );
};

const DockArea = () => {
  const defaultLayout = {
    dockbox: {
      mode: 'horizontal',
      children: [
        {
          mode: 'vertical',
          size: 250,
          children: [
             { tabs: [{ id: 'palette', title: 'Palette', content: <Palette /> }] },
             { tabs: [{ id: 'assets', title: 'Assets', content: <Assets /> }] }
          ]
        },
        {
          mode: 'horizontal',
          children: [
            { 
               tabs: [
                 { id: 'graph', title: 'Blueprint Graph', content: <GraphEditor /> },
                 { id: 'scene', title: 'Scene', content: <SceneEditor /> }
               ] 
            }
          ]
        },
        {
            size: 150,
            tabs: [{ id: 'output', title: 'Output', content: <Output /> }]
        },
        {
          size: 300,
          tabs: [{ id: 'inspector', title: 'Inspector', content: <Inspector /> }]
        }
      ]
    }
  };
  
  return (
    <div className="flex-1 relative">
         <DockLayout 
            defaultLayout={defaultLayout as any} 
            style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} 
         />
    </div>
  );
};

export const MainLayout = () => {
  return (
    <EngineProvider>
        <div className="flex flex-col h-screen w-screen bg-gray-900 text-white">
            <Toolbar />
            <DockArea />
        </div>
    </EngineProvider>
  );
}
