import React, { createContext, useContext, useState, useRef } from 'react';
import { Engine } from '../../core/execution/Engine';
import { Graph } from '../../core/graph/Graph';
import { registry } from '../../core/registry/NodeRegistry';
import { registerFlowNodes, registerLatentNodes, registerCatalogNodes } from '../../core/registry';
import { World } from '../../core/engine/World';
import { v4 as uuidv4 } from 'uuid';
import { createPin } from '../../core/graph/Graph';
import { PinDirection } from '../../core/graph/types';

// Register all nodes
registerFlowNodes();
registerLatentNodes();
registerCatalogNodes();

interface LogEntry {
  timestamp: number;
  message: string;
}

interface EngineContextType {
  engine: Engine;
  graph: Graph;
  world: World;
  refresh: number;
  forceUpdate: () => void;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  logs: LogEntry[];
  clearLogs: () => void;
}

const EngineContext = createContext<EngineContextType | null>(null);

export const useEngine = () => {
  const ctx = useContext(EngineContext);
  if (!ctx) throw new Error("useEngine must be used within EngineProvider");
  return ctx;
};

export const EngineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const engineRef = useRef<Engine | null>(null);
  const graphRef = useRef<Graph | null>(null);
  const worldRef = useRef<World | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  if (!engineRef.current) {
    const graph = new Graph();
    graphRef.current = graph;
    
    // Create a default graph
    const beginId = uuidv4();
    const beginOut = createPin(beginId, 'Out', {type:'Exec'}, PinDirection.Output);
    
    graph.addNode({ 
        id: beginId, 
        type: 'flow.begin_play', 
        position: { x: 100, y: 100 }, 
        inputs: [], 
        outputs: [beginOut] 
    });

    const printId = uuidv4();
    const printIn = createPin(printId, 'In', {type:'Exec'}, PinDirection.Input);
    const printStr = createPin(printId, 'String', {type:'String'}, PinDirection.Input);
    printStr.defaultValue = "Hello Verto Studio!";
    const printOut = createPin(printId, 'Out', {type:'Exec'}, PinDirection.Output);
    
    graph.addNode({ 
        id: printId, 
        type: 'debug.print', 
        position: { x: 400, y: 100 }, 
        inputs: [printIn, printStr], 
        outputs: [printOut] 
    });

    graph.connect(beginOut.id, printIn.id);

    // Initialize Engine with Logger Service
    // We need to be careful with setState inside synchronous execution if triggered during render (which shouldn't happen for engine exec)
    // But engine.triggerEvent is usually called from event handlers.
    const loggerService = {
        log: (msg: string) => {
            setLogs(prev => [...prev, { timestamp: Date.now(), message: String(msg) }]);
        }
    };

    const engine = new Engine(graph.data, registry, { logger: loggerService });
    const world = new World(engine);
    engine.services.world = world;
    
    engineRef.current = engine;
    worldRef.current = world;
  }

  const forceUpdate = () => setRefresh(prev => prev + 1);
  const clearLogs = () => setLogs([]);

  return (
    <EngineContext.Provider value={{ 
        engine: engineRef.current!, 
        graph: graphRef.current!,
        world: worldRef.current!, 
        refresh, 
        forceUpdate,
        selectedNodeId,
        setSelectedNodeId,
        logs,
        clearLogs
    }}>
      {children}
    </EngineContext.Provider>
  );
};
