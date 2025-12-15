import { GraphData, NodeData } from '../graph/types';
import { NodeRegistry } from '../registry/NodeRegistry';
import { Scheduler, LatentAction } from './Scheduler';
import { ExecutionContext } from './types';

export class Engine {
  graph: GraphData;
  registry: NodeRegistry;
  scheduler: Scheduler;
  
  // Runtime state
  nodeStates: Record<string, any> = {};
  pinValues: Record<string, any> = {}; 
  
  // Execution Control
  executionStack: string[] = [];
  isPaused: boolean = false;
  breakpoints: Set<string> = new Set();
  onBreakpointHit?: (nodeId: string) => void;

  services: any = {}; // Service container (World, etc)

  constructor(graph: GraphData, registry: NodeRegistry, services: any = {}) {
    this.graph = graph;
    this.registry = registry;
    this.scheduler = new Scheduler();
    this.services = services;
    // Initialize variables from graph if not provided in services
    if (!this.services.variables) {
        this.services.variables = {}; 
        // Copy initial values
        if (graph.variables) {
            for(const [name, def] of Object.entries(graph.variables)) {
                this.services.variables[name] = def.value;
            }
        }
    }
  }

  tick(dt: number) {
    this.scheduler.tick(dt);
    this.processStack();
  }

  triggerEvent(eventName: string, args: Record<string, any> = {}) {
    const eventNodes = Object.values(this.graph.nodes).filter(n => {
       const def = this.registry.get(n.type);
       return def?.label === eventName;
    });

    for (const node of eventNodes) {
      for (const [key, value] of Object.entries(args)) {
         this.setOutput(node, key, value);
      }
      this.executionStack.push(node.id);
    }
    this.processStack();
  }
  
  resume() {
    this.isPaused = false;
    this.processStack();
  }
  
  step() {
    this.isPaused = true;
    if (this.executionStack.length > 0) {
        const nodeId = this.executionStack.pop()!;
        this.executeNode(nodeId);
        // Do not continue loop
    }
  }

  private processStack() {
    if (this.isPaused) return;

    while (this.executionStack.length > 0) {
       const nodeId = this.executionStack.pop()!;
       
       if (this.breakpoints.has(nodeId)) {
         this.isPaused = true;
         this.executionStack.push(nodeId); 
         if (this.onBreakpointHit) this.onBreakpointHit(nodeId);
         return;
       }
       
       this.executeNode(nodeId);
       
       if (this.isPaused) return;
    }
  }

  private executeNode(nodeId: string) {
    const node = this.graph.nodes[nodeId];
    if (!node) return;

    const def = this.registry.get(node.type);
    if (!def || !def.execute) return;

    const pendingTriggers: string[] = [];
    let isSynchronous = true;

    const ctx: ExecutionContext = {
      state: this.getNodeState(node.id, node.data),
      services: this.services,
      getInput: (name: string) => this.getInput(node, name),
      setOutput: (name: string, value: any) => this.setOutput(node, name, value),
      trigger: (name: string) => {
         const targets = this.getTargetNodes(node, name);
         if (isSynchronous) {
             pendingTriggers.push(...targets);
         } else {
             // Async resume: Push directly to stack
             targets.forEach(t => this.executionStack.push(t));
         }
      },
      registerLatent: (action: LatentAction) => {
        this.scheduler.add({
          ...action,
          complete: () => {
             isSynchronous = false; 
             action.complete();
          }
        });
      },
    };

    def.execute(ctx);
    
    // Process synchronous triggers: Push to stack in REVERSE
    for (let i = pendingTriggers.length - 1; i >= 0; i--) {
      this.executionStack.push(pendingTriggers[i]);
    }
  }

  private getTargetNodes(node: NodeData, pinName: string): string[] {
    const pin = node.outputs.find(p => p.name === pinName);
    if (!pin) return [];
    
    const connections = this.graph.connections.filter(c => c.sourcePinId === pin.id);
    const targets: string[] = [];
    for (const conn of connections) {
      const targetNode = this.findNodeByPin(conn.targetPinId);
      if (targetNode) targets.push(targetNode.id);
    }
    return targets;
  }

  private getNodeState(nodeId: string, initialData: any) {
    if (!this.nodeStates[nodeId]) {
      this.nodeStates[nodeId] = { ...initialData };
    }
    return this.nodeStates[nodeId];
  }

  private getInput(node: NodeData, pinName: string): any {
    const pin = node.inputs.find(p => p.name === pinName);
    if (!pin) return undefined;

    const connection = this.graph.connections.find(c => c.targetPinId === pin.id);
    if (connection) {
      const sourceNode = this.findNodeByPin(connection.sourcePinId);
      if (sourceNode) {
         // Check if pure
         const isPure = !sourceNode.inputs.some(p => p.dataType.type === 'Exec') && 
                        !sourceNode.outputs.some(p => p.dataType.type === 'Exec');
         
         if (isPure) {
             if (this.breakpoints.has(sourceNode.id)) {
                 console.warn("Breakpoints on Pure nodes not fully supported in synchronous evaluation yet.");
             }
             this.executeNode(sourceNode.id);
         }
         
         return this.pinValues[connection.sourcePinId];
      }
    }

    return pin.defaultValue;
  }

  private setOutput(node: NodeData, pinName: string, value: any) {
    const pin = node.outputs.find(p => p.name === pinName);
    if (pin) {
      this.pinValues[pin.id] = value;
    }
  }

  private findNodeByPin(pinId: string): NodeData | undefined {
    return Object.values(this.graph.nodes).find(n => 
      [...n.inputs, ...n.outputs].some(p => p.id === pinId)
    );
  }
}
