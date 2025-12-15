import { describe, it, expect, vi } from 'vitest';
import { Graph, createPin } from '../graph/Graph';
import { Engine } from './Engine';
import { registry } from '../registry/NodeRegistry';
import { registerFlowNodes } from '../registry';
import { PinDirection } from '../graph/types';
import { v4 as uuidv4 } from 'uuid';

describe('Debugger', () => {
  registerFlowNodes();

  it('should pause on breakpoint and resume', () => {
    const graph = new Graph();
    
    const nodeAId = uuidv4();
    const nodeBId = uuidv4();
    const beginId = uuidv4();
    
    const fnA = vi.fn();
    const fnB = vi.fn();
    
    // Register Mocks
    registry.register({
        type: 'mock.a', category: 'Debug', label: 'A',
        create: () => ({ inputs: [{ name: 'In', dataType: {type:'Exec'} }], outputs: [{ name: 'Out', dataType: {type:'Exec'} }] }),
        execute: (ctx) => { fnA(); ctx.trigger('Out'); }
    });
    registry.register({
        type: 'mock.b', category: 'Debug', label: 'B',
        create: () => ({ inputs: [{ name: 'In', dataType: {type:'Exec'} }], outputs: [] }),
        execute: () => { fnB(); }
    });

    // Build Graph
    const beginOut = createPin(beginId, 'Out', {type:'Exec'}, PinDirection.Output);
    graph.addNode({ id: beginId, type: 'flow.begin_play', position:{x:0,y:0}, inputs:[], outputs:[beginOut] });
    
    const aIn = createPin(nodeAId, 'In', {type:'Exec'}, PinDirection.Input);
    const aOut = createPin(nodeAId, 'Out', {type:'Exec'}, PinDirection.Output);
    graph.addNode({ id: nodeAId, type: 'mock.a', position:{x:0,y:0}, inputs:[aIn], outputs:[aOut] });
    
    const bIn = createPin(nodeBId, 'In', {type:'Exec'}, PinDirection.Input);
    graph.addNode({ id: nodeBId, type: 'mock.b', position:{x:0,y:0}, inputs:[bIn], outputs:[] });
    
    graph.connect(beginOut.id, aIn.id);
    graph.connect(aOut.id, bIn.id);
    
    // Init Engine
    const engine = new Engine(graph.data, registry);
    
    // Set Breakpoint on A
    engine.breakpoints.add(nodeAId);
    let hitNode = '';
    engine.onBreakpointHit = (id) => { hitNode = id; };
    
    // Trigger
    engine.triggerEvent('Event BeginPlay');
    
    // Should be paused at A
    expect(hitNode).toBe(nodeAId);
    expect(engine.isPaused).toBe(true);
    // A should NOT have executed yet (breakpoint hits BEFORE execute)
    expect(fnA).not.toHaveBeenCalled();
    
    // Step (execute A)
    engine.step();
    expect(fnA).toHaveBeenCalled();
    expect(engine.isPaused).toBe(true); // Step keeps it paused
    
    // B should not be executed yet
    expect(fnB).not.toHaveBeenCalled();
    
    // Resume
    engine.resume();
    expect(fnB).toHaveBeenCalled();
    expect(engine.isPaused).toBe(false);
  });
});
