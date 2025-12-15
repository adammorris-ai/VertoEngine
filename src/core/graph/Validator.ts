import { GraphData, NodeData, PinData, DataType, PinDirection } from './types';

export enum DiagnosticSeverity {
  Error = 'Error',
  Warning = 'Warning',
  Info = 'Info',
}

export interface Diagnostic {
  nodeId: string;
  pinId?: string;
  message: string;
  severity: DiagnosticSeverity;
  suggestion?: string;
}

export class GraphValidator {
  validate(graph: GraphData): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    // 1. Validate Connections (Dangling, Types)
    for (const connection of graph.connections) {
      const sourceNode = this.findNodeByPin(graph, connection.sourcePinId);
      const targetNode = this.findNodeByPin(graph, connection.targetPinId);

      if (!sourceNode || !targetNode) {
        // This is a corrupt graph, edges pointing to nowhere
        continue;
      }

      const sourcePin = this.findPin(sourceNode, connection.sourcePinId);
      const targetPin = this.findPin(targetNode, connection.targetPinId);

      if (!sourcePin || !targetPin) continue;

      if (!this.areTypesCompatible(sourcePin.dataType, targetPin.dataType)) {
        diagnostics.push({
          nodeId: targetNode.id,
          pinId: targetPin.id,
          message: `Type mismatch: Cannot connect ${sourcePin.dataType.type} to ${targetPin.dataType.type}`,
          severity: DiagnosticSeverity.Error,
        });
      }
    }

    // 2. Validate Required Inputs (Simple check: Exec inputs on some nodes?)
    // For now, most inputs are optional (default values).
    
    // 3. Detect Data Cycles
    // DFS on data pins.
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    for (const node of Object.values(graph.nodes)) {
       // Start DFS from every data output
       for (const output of node.outputs) {
         if (output.dataType.type !== 'Exec') {
           if (this.detectCycle(graph, output.id, visited, recursionStack)) {
              diagnostics.push({
                nodeId: node.id,
                message: 'Cycle detected in data flow',
                severity: DiagnosticSeverity.Error,
              });
           }
         }
       }
    }

    return diagnostics;
  }

  private findNodeByPin(graph: GraphData, pinId: string): NodeData | undefined {
    return Object.values(graph.nodes).find(n => 
      [...n.inputs, ...n.outputs].some(p => p.id === pinId)
    );
  }

  private findPin(node: NodeData, pinId: string): PinData | undefined {
    return [...node.inputs, ...node.outputs].find(p => p.id === pinId);
  }

  private areTypesCompatible(source: DataType, target: DataType): boolean {
    if (source.type === target.type) return true;
    if (target.type === 'Wildcard' || source.type === 'Wildcard') return true;
    if (target.type === 'Any') return true;
    
    // Implicit conversions
    if (source.type === 'Int' && target.type === 'Float') return true;
    
    // TODO: Array checking
    
    return false;
  }

  private detectCycle(
    graph: GraphData, 
    currentPinId: string, 
    visited: Set<string>, 
    stack: Set<string>
  ): boolean {
    if (stack.has(currentPinId)) return true;
    if (visited.has(currentPinId)) return false;

    visited.add(currentPinId);
    stack.add(currentPinId);

    const node = this.findNodeByPin(graph, currentPinId);
    if (!node) return false; // Should not happen

    // Traverse:
    // If currentPin is Output, go to connected Inputs (downstream)
    // If currentPin is Input, go to owning Node's Outputs (data dependency)
    
    const pin = this.findPin(node, currentPinId);
    if (!pin) return false;

    if (pin.direction === PinDirection.Output) {
       // Find connections from this output
       const outgoing = graph.connections.filter(c => c.sourcePinId === currentPinId);
       for (const conn of outgoing) {
         // Only follow Data connections
         const targetNode = this.findNodeByPin(graph, conn.targetPinId);
         const targetPin = targetNode && this.findPin(targetNode, conn.targetPinId);
         if (targetPin && targetPin.dataType.type !== 'Exec') {
            if (this.detectCycle(graph, conn.targetPinId, visited, stack)) return true;
         }
       }
    } else {
       // Input -> Node -> Output (Data dependency)
       // This implies the node calculates outputs based on inputs.
       // For Pure nodes, ALL inputs affect ALL outputs usually.
       // For Impure (Exec) nodes, Data Inputs might not strictly drive Data Outputs synchronously without Exec.
       // BUT, usually we treat data flow as "Input needed for Output".
       
       // Simple assumption: If node has outputs, they depend on inputs.
       for (const output of node.outputs) {
         if (output.dataType.type !== 'Exec') {
           if (this.detectCycle(graph, output.id, visited, stack)) return true;
         }
       }
    }

    stack.delete(currentPinId);
    return false;
  }
}
