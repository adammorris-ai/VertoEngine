import { Upload, FileAudio, FileImage, File } from 'lucide-react';

export const AssetPanel = () => {
  // Mock assets
  const assets = [
      { name: 'HeroSprite.png', type: 'image' },
      { name: 'Jump.wav', type: 'audio' },
      { name: 'Level1.map', type: 'file' }
  ];

  return (
    <div className="w-56 bg-white border-l border-gray-200 flex flex-col h-full shadow-sm">
      <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <span className="font-bold text-xs text-gray-500 uppercase tracking-wider">Assets</span>
          <button className="p-1 hover:bg-gray-200 rounded text-gray-600">
              <Upload size={14} />
          </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {assets.map((asset, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 border border-transparent hover:border-gray-200 cursor-pointer group">
                  {asset.type === 'image' && <FileImage size={16} className="text-purple-500" />}
                  {asset.type === 'audio' && <FileAudio size={16} className="text-yellow-500" />}
                  {asset.type === 'file' && <File size={16} className="text-gray-400" />}
                  <span className="text-sm text-gray-700 truncate">{asset.name}</span>
              </div>
          ))}
          
          <div className="mt-4 p-4 border-2 border-dashed border-gray-200 rounded-lg text-center">
              <span className="text-xs text-gray-400 block mb-1">Drag files here</span>
              <span className="text-[10px] text-gray-300">Supported: png, jpg, wav</span>
          </div>
      </div>
    </div>
  );
};
