import { v4 as uuidv4 } from 'uuid';
import { GraphData, NodeData, NodeId, PinId, PinData, DataType, PinDirection } from './types';

export class Graph {
  data: GraphData;

  constructor(id?: string) {
    this.data = {
      id: id || uuidv4(),
      nodes: {},
      connections: [],
      variables: {}
    };
  }

  static fromJSON(json: string): Graph {
    const data = JSON.parse(json);
    // TODO: Validate schema
    const graph = new Graph(data.id);
    graph.data = data;
    return graph;
  }

  toJSON(): string {
    return JSON.stringify(this.data, null, 2);
  }

  addNode(node: NodeData): void {
    if (this.data.nodes[node.id]) {
      throw new Error(`Node with id ${node.id} already exists`);
    }
    this.data.nodes[node.id] = node;
  }

  removeNode(nodeId: NodeId): void {
    if (!this.data.nodes[nodeId]) return;

    // Remove connections attached to this node
    const node = this.data.nodes[nodeId];
    const pinIds = new Set([...node.inputs, ...node.outputs].map(p => p.id));
    
    this.data.connections = this.data.connections.filter(
      c => !pinIds.has(c.sourcePinId) && !pinIds.has(c.targetPinId)
    );

    delete this.data.nodes[nodeId];
  }

  connect(sourcePinId: PinId, targetPinId: PinId): void {
    // Validate existence
    const sourceNode = this.findNodeByPin(sourcePinId);
    const targetNode = this.findNodeByPin(targetPinId);

    if (!sourceNode || !targetNode) {
      throw new Error('Pin not found');
    }

    const sourcePin = [...sourceNode.inputs, ...sourceNode.outputs].find(p => p.id === sourcePinId);
    const targetPin = [...targetNode.inputs, ...targetNode.outputs].find(p => p.id === targetPinId);

    if (!sourcePin || !targetPin) throw new Error('Pin not found (internal error)');

    // Basic Validation
    if (sourcePin.direction === targetPin.direction) {
      throw new Error('Cannot connect pins of same direction');
    }

    // Identify actual source (Output) and target (Input)
    const outputPin = sourcePin.direction === PinDirection.Output ? sourcePin : targetPin;
    const inputPin = sourcePin.direction === PinDirection.Input ? sourcePin : targetPin;

    // Check for existing connection
    const exists = this.data.connections.some(
      c => c.sourcePinId === outputPin.id && c.targetPinId === inputPin.id
    );
    if (exists) return; // Idempotent

    // Disconnect existing input connection if it's a data pin (single input only usually, unless Exec?)
    // Exec pins: Output can drive multiple, Input can accept multiple (Merge)? 
    // Usually Exec Inputs accept multiple (Merge), Outputs drive one (unless Sequence).
    // Data Inputs accept ONE source. Data Outputs drive multiple.
    
    if (inputPin.dataType.type !== 'Exec') {
       // Remove any existing connection to this input
       this.data.connections = this.data.connections.filter(c => c.targetPinId !== inputPin.id);
    }
    
    this.data.connections.push({
      sourcePinId: outputPin.id,
      targetPinId: inputPin.id
    });
  }

  disconnect(sourcePinId: PinId, targetPinId: PinId): void {
     this.data.connections = this.data.connections.filter(
      c => !(c.sourcePinId === sourcePinId && c.targetPinId === targetPinId) &&
           !(c.sourcePinId === targetPinId && c.targetPinId === sourcePinId)
    );
  }

  findNodeByPin(pinId: PinId): NodeData | undefined {
    return Object.values(this.data.nodes).find(node => 
      [...node.inputs, ...node.outputs].some(p => p.id === pinId)
    );
  }
}

export function createPin(
  nodeId: NodeId, 
  name: string, 
  dataType: DataType, 
  direction: PinDirection, 
  id?: string
): PinData {
  return {
    id: id || uuidv4(),
    nodeId,
    name,
    dataType,
    direction,
  };
}
