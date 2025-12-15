import { describe, it, expect } from 'vitest';
import { Graph, createPin } from './Graph';
import { PinDirection, NodeData } from './types';
import { v4 as uuidv4 } from 'uuid';

describe('Graph Core Model', () => {
  it('should create a new graph', () => {
    const graph = new Graph();
    expect(graph.data.id).toBeDefined();
    expect(graph.data.nodes).toEqual({});
    expect(graph.data.connections).toEqual([]);
  });

  it('should add and remove nodes', () => {
    const graph = new Graph();
    const nodeId = uuidv4();
    const node: NodeData = {
      id: nodeId,
      type: 'test.node',
      position: { x: 0, y: 0 },
      inputs: [],
      outputs: []
    };

    graph.addNode(node);
    expect(graph.data.nodes[nodeId]).toBe(node);

    graph.removeNode(nodeId);
    expect(graph.data.nodes[nodeId]).toBeUndefined();
  });

  it('should connect and disconnect pins', () => {
    const graph = new Graph();
    const node1Id = uuidv4();
    const node2Id = uuidv4();

    const outPin = createPin(node1Id, 'Out', { type: 'Exec' }, PinDirection.Output);
    const inPin = createPin(node2Id, 'In', { type: 'Exec' }, PinDirection.Input);

    const node1: NodeData = {
      id: node1Id,
      type: 'test.node1',
      position: { x: 0, y: 0 },
      inputs: [],
      outputs: [outPin]
    };

    const node2: NodeData = {
      id: node2Id,
      type: 'test.node2',
      position: { x: 0, y: 0 },
      inputs: [inPin],
      outputs: []
    };

    graph.addNode(node1);
    graph.addNode(node2);

    graph.connect(outPin.id, inPin.id);
    expect(graph.data.connections).toHaveLength(1);
    expect(graph.data.connections[0]).toEqual({
      sourcePinId: outPin.id,
      targetPinId: inPin.id
    });

    graph.disconnect(outPin.id, inPin.id);
    expect(graph.data.connections).toHaveLength(0);
  });

  it('should handle JSON serialization round-trip', () => {
    const graph = new Graph();
    const nodeId = uuidv4();
    const node: NodeData = {
      id: nodeId,
      type: 'test.node',
      position: { x: 10, y: 20 },
      inputs: [],
      outputs: []
    };
    graph.addNode(node);

    const json = graph.toJSON();
    const graph2 = Graph.fromJSON(json);

    expect(graph2.data).toEqual(graph.data);
  });

  it('should replace existing data connections on single-input pins', () => {
      const graph = new Graph();
      const node1Id = uuidv4();
      const node2Id = uuidv4();
      const node3Id = uuidv4();
  
      const outPin1 = createPin(node1Id, 'Out1', { type: 'Float' }, PinDirection.Output);
      const outPin2 = createPin(node2Id, 'Out2', { type: 'Float' }, PinDirection.Output);
      const inPin = createPin(node3Id, 'In', { type: 'Float' }, PinDirection.Input);
  
      graph.addNode({ id: node1Id, type: 'n', position: {x:0,y:0}, inputs: [], outputs: [outPin1] });
      graph.addNode({ id: node2Id, type: 'n', position: {x:0,y:0}, inputs: [], outputs: [outPin2] });
      graph.addNode({ id: node3Id, type: 'n', position: {x:0,y:0}, inputs: [inPin], outputs: [] });

      // Connect 1 -> 3
      graph.connect(outPin1.id, inPin.id);
      expect(graph.data.connections).toHaveLength(1);
      expect(graph.data.connections[0].sourcePinId).toBe(outPin1.id);

      // Connect 2 -> 3 (should replace 1 -> 3)
      graph.connect(outPin2.id, inPin.id);
      expect(graph.data.connections).toHaveLength(1);
      expect(graph.data.connections[0].sourcePinId).toBe(outPin2.id);
  });
});
