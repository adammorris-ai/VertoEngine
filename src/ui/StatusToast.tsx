import { useEffect, useState } from 'react';
import { useUIStore } from './store/uiStore';
import { X, AlertCircle } from 'lucide-react';

export const StatusToast = () => {
    const { logs } = useUIStore();
    const [visible, setVisible] = useState(false);
    
    // Show last log
    const lastLog = logs[logs.length - 1];
    
    useEffect(() => {
        if (lastLog) {
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [lastLog]);

    if (!visible || !lastLog) return null;

    const isError = lastLog.message.toLowerCase().includes('error');

    return (
        <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg flex items-center gap-3 z-50 text-sm font-medium animate-in slide-in-from-bottom-2 fade-in ${
            isError ? 'bg-red-500 text-white' : 'bg-gray-800 text-white'
        }`}>
            {isError ? <AlertCircle size={16} /> : <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
            <span>{lastLog.message}</span>
            <button onClick={() => setVisible(false)} className="opacity-70 hover:opacity-100 ml-2">
                <X size={14} />
            </button>
        </div>
    );
};
