export type PinId = string;
export type NodeId = string;
export type GraphId = string;

export type BaseType = 
  | 'Exec'
  | 'Bool'
  | 'Int'
  | 'Float'
  | 'String'
  | 'Vec2'
  | 'Color'
  | 'EntityRef'
  | 'AssetRef'
  | 'Any'
  | 'Wildcard';

export interface DataType {
  type: BaseType;
  isArray?: boolean;
  isMap?: boolean;
  isSet?: boolean;
  valueType?: BaseType; // For Map<Key, Value>, this would be Value. Key assumed string or primitive?
  // Unreal maps usually Key -> Value.
  keyType?: BaseType; // For Map
}

export enum PinDirection {
  Input = 'Input',
  Output = 'Output',
}

export interface PinData {
  id: PinId;
  nodeId: NodeId;
  name: string;
  dataType: DataType;
  direction: PinDirection;
  defaultValue?: any;
}

export interface Connection {
  sourcePinId: PinId;
  targetPinId: PinId;
}

export interface NodeData {
  id: NodeId;
  category?: string; // e.g. "Math", "Flow Control"
  type: string; // The specific operation identifier, e.g., "math.add"
  label?: string; // Display name
  position: { x: number; y: number };
  inputs: PinData[]; // Ordered list of inputs
  outputs: PinData[]; // Ordered list of outputs
  data?: any; // Instance-specific data
}

export interface GraphData {
  id: GraphId;
  nodes: Record<NodeId, NodeData>;
  connections: Connection[]; // Explicit edges
}
