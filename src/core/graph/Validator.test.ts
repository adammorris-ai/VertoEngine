import { describe, it, expect } from 'vitest';
import { Graph, createPin } from './Graph';
import { GraphValidator, DiagnosticSeverity } from './Validator';
import { PinDirection } from './types';
import { v4 as uuidv4 } from 'uuid';

describe('GraphValidator', () => {
  it('should detect type mismatches', () => {
    const graph = new Graph();
    const validator = new GraphValidator();
    
    const node1Id = uuidv4();
    const node2Id = uuidv4();
    
    const outPin = createPin(node1Id, 'Out', { type: 'Float' }, PinDirection.Output);
    const inPin = createPin(node2Id, 'In', { type: 'String' }, PinDirection.Input); // Mismatch
    
    graph.addNode({ id: node1Id, type: 'n', position: {x:0,y:0}, inputs: [], outputs: [outPin] });
    graph.addNode({ id: node2Id, type: 'n', position: {x:0,y:0}, inputs: [inPin], outputs: [] });
    
    // Force connection (bypass graph.connect checks if any, or just push to data)
    graph.data.connections.push({ sourcePinId: outPin.id, targetPinId: inPin.id });
    
    const diags = validator.validate(graph.data);
    expect(diags).toHaveLength(1);
    expect(diags[0].severity).toBe(DiagnosticSeverity.Error);
    expect(diags[0].message).toContain('Type mismatch');
  });

  it('should allow implicit conversion Int -> Float', () => {
    const graph = new Graph();
    const validator = new GraphValidator();
    
    const node1Id = uuidv4();
    const node2Id = uuidv4();
    
    const outPin = createPin(node1Id, 'Out', { type: 'Int' }, PinDirection.Output);
    const inPin = createPin(node2Id, 'In', { type: 'Float' }, PinDirection.Input);
    
    graph.addNode({ id: node1Id, type: 'n', position: {x:0,y:0}, inputs: [], outputs: [outPin] });
    graph.addNode({ id: node2Id, type: 'n', position: {x:0,y:0}, inputs: [inPin], outputs: [] });
    
    graph.data.connections.push({ sourcePinId: outPin.id, targetPinId: inPin.id });
    
    const diags = validator.validate(graph.data);
    expect(diags).toHaveLength(0);
  });

  it('should detect data cycles', () => {
    const graph = new Graph();
    const validator = new GraphValidator();
    
    const n1 = uuidv4();
    const n2 = uuidv4();
    
    // N1 Out -> N2 In
    // N2 Out -> N1 In
    
    const n1Out = createPin(n1, 'Out', { type: 'Float' }, PinDirection.Output);
    const n1In = createPin(n1, 'In', { type: 'Float' }, PinDirection.Input);
    
    const n2Out = createPin(n2, 'Out', { type: 'Float' }, PinDirection.Output);
    const n2In = createPin(n2, 'In', { type: 'Float' }, PinDirection.Input);
    
    graph.addNode({ id: n1, type: 'n', position: {x:0,y:0}, inputs: [n1In], outputs: [n1Out] });
    graph.addNode({ id: n2, type: 'n', position: {x:0,y:0}, inputs: [n2In], outputs: [n2Out] });
    
    graph.connect(n1Out.id, n2In.id);
    graph.connect(n2Out.id, n1In.id);
    
    const diags = validator.validate(graph.data);
    expect(diags.length).toBeGreaterThan(0);
    expect(diags[0].message).toContain('Cycle detected');
  });

  it('should ignore cycles in Exec pins', () => {
    const graph = new Graph();
    const validator = new GraphValidator();
    
    const n1 = uuidv4();
    const n2 = uuidv4();
    
    const n1Out = createPin(n1, 'Out', { type: 'Exec' }, PinDirection.Output);
    const n1In = createPin(n1, 'In', { type: 'Exec' }, PinDirection.Input);
    
    const n2Out = createPin(n2, 'Out', { type: 'Exec' }, PinDirection.Output);
    const n2In = createPin(n2, 'In', { type: 'Exec' }, PinDirection.Input);
    
    graph.addNode({ id: n1, type: 'n', position: {x:0,y:0}, inputs: [n1In], outputs: [n1Out] });
    graph.addNode({ id: n2, type: 'n', position: {x:0,y:0}, inputs: [n2In], outputs: [n2Out] });
    
    graph.connect(n1Out.id, n2In.id);
    graph.connect(n2Out.id, n1In.id);
    
    const diags = validator.validate(graph.data);
    expect(diags).toHaveLength(0);
  });
});
