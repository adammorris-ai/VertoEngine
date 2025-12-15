import { describe, it, expect, vi } from 'vitest';
import { Graph, createPin } from '../graph/Graph';
import { Engine } from './Engine';
import { registry, NodeDefinition } from '../registry/NodeRegistry';
import { registerFlowNodes, registerLatentNodes } from '../registry';
import { PinDirection } from '../graph/types';
import { v4 as uuidv4 } from 'uuid';

describe('Engine Execution', () => {
  // Register core nodes
  registerFlowNodes();
  registerLatentNodes();

  it('should execute BeginPlay -> Delay -> MockNode', () => {
    const graph = new Graph();
    
    const beginNodeId = uuidv4();
    const delayNodeId = uuidv4();
    const mockNodeId = uuidv4();
    
    const mockFn = vi.fn();
    const MockNode: NodeDefinition = {
      type: 'debug.mock',
      category: 'Debug',
      label: 'Mock',
      create: () => ({
        inputs: [{ name: 'In', dataType: { type: 'Exec' } }],
        outputs: [],
      }),
      execute: () => {
        mockFn();
      }
    };
    registry.register(MockNode);

    // BeginPlay
    const beginOut = createPin(beginNodeId, 'Out', { type: 'Exec' }, PinDirection.Output);
    graph.addNode({ 
        id: beginNodeId, 
        type: 'flow.begin_play', 
        position: {x:0,y:0}, 
        inputs: [], 
        outputs: [beginOut] 
    });

    // Delay
    const delayIn = createPin(delayNodeId, 'In', { type: 'Exec' }, PinDirection.Input);
    const delayDuration = createPin(delayNodeId, 'Duration', { type: 'Float' }, PinDirection.Input); 
    delayDuration.defaultValue = 0.5;

    const delayOut = createPin(delayNodeId, 'Completed', { type: 'Exec' }, PinDirection.Output);
    graph.addNode({ 
        id: delayNodeId, 
        type: 'flow.delay', 
        position: {x:0,y:0}, 
        inputs: [delayIn, delayDuration], 
        outputs: [delayOut] 
    });

    // Mock
    const mockIn = createPin(mockNodeId, 'In', { type: 'Exec' }, PinDirection.Input);
    graph.addNode({ 
        id: mockNodeId, 
        type: 'debug.mock', 
        position: {x:0,y:0}, 
        inputs: [mockIn], 
        outputs: [] 
    });

    graph.connect(beginOut.id, delayIn.id);
    graph.connect(delayOut.id, mockIn.id);

    const engine = new Engine(graph.data, registry);

    engine.triggerEvent('Event BeginPlay');

    expect(mockFn).not.toHaveBeenCalled();

    engine.tick(0.2);
    expect(mockFn).not.toHaveBeenCalled();

    engine.tick(0.3); // Total 0.5
    expect(mockFn).toHaveBeenCalled();
  });
});
