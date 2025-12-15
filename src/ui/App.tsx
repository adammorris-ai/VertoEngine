import { TopBar } from './TopBar';
import { NodePalette } from './NodePalette';
import { NodeCanvas } from './NodeCanvas';
import { AssetPanel } from './AssetPanel';
import { StatusToast } from './StatusToast';

export default function App() {
  return (
    <div className="flex flex-col h-screen w-screen bg-white text-gray-900 overflow-hidden font-sans">
       <TopBar />
       <div className="flex-1 flex overflow-hidden">
           <NodePalette />
           <NodeCanvas />
           <AssetPanel />
       </div>
       <StatusToast />
    </div>
  );
}
