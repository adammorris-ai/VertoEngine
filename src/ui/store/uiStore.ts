import { create } from 'zustand';
import { Engine } from '../../core/execution/Engine';
import { Graph } from '../../core/graph/Graph';
import { World } from '../../core/engine/World';
import { registry, registerFlowNodes, registerLatentNodes, registerVariableNodes, registerCatalogNodes } from '../../core/registry';
import { v4 as uuidv4 } from 'uuid';
import { createPin } from '../../core/graph/Graph';
import { PinDirection } from '../../core/graph/types';

// Register
registerFlowNodes();
registerLatentNodes();
registerVariableNodes();
registerCatalogNodes();

interface UIState {
  engine: Engine;
  graph: Graph;
  world: World;
  isRunning: boolean;
  selectedNodeId: string | null;
  logs: { timestamp: number; message: string }[];
  
  // Actions
  run: () => void;
  stop: () => void;
  selectNode: (id: string | null) => void;
  addLog: (msg: string) => void;
  clearLogs: () => void;
  // Graph mutation wrappers can go here or be direct graph access
}

const createEngine = () => {
    const graph = new Graph();
    // Default Nodes
    const beginId = uuidv4();
    const beginOut = createPin(beginId, 'Out', {type:'Exec'}, PinDirection.Output);
    graph.addNode({ id: beginId, type: 'flow.begin_play', position: { x: 100, y: 100 }, inputs: [], outputs: [beginOut] });

    const printId = uuidv4();
    const printIn = createPin(printId, 'In', {type:'Exec'}, PinDirection.Input);
    const printStr = createPin(printId, 'String', {type:'String'}, PinDirection.Input);
    printStr.defaultValue = "Hello from Verto!";
    const printOut = createPin(printId, 'Out', {type:'Exec'}, PinDirection.Output);
    graph.addNode({ id: printId, type: 'debug.print', position: { x: 400, y: 100 }, inputs: [printIn, printStr], outputs: [printOut] });
    
    graph.connect(beginOut.id, printIn.id);

    // Engine
    const engine = new Engine(graph.data, registry);
    const world = new World(engine);
    engine.services.world = world;
    
    return { engine, graph, world };
};

const initial = createEngine();
// Hook log into engine
initial.engine.services.logger = {
    log: (msg: string) => useUIStore.getState().addLog(msg)
};

export const useUIStore = create<UIState>((set, get) => ({
  engine: initial.engine,
  graph: initial.graph,
  world: initial.world,
  isRunning: false,
  selectedNodeId: null,
  logs: [],

  run: () => {
      set({ isRunning: true });
      get().clearLogs();
      get().engine.triggerEvent('Event BeginPlay');
  },
  stop: () => {
      set({ isRunning: false });
      // Reset engine state if possible, or just stop ticking
      // Ideally we'd re-instantiate engine state or clear runtime memory
  },
  selectNode: (id) => set({ selectedNodeId: id }),
  addLog: (msg) => set(state => ({ logs: [...state.logs, { timestamp: Date.now(), message: msg }] })),
  clearLogs: () => set({ logs: [] })
}));
