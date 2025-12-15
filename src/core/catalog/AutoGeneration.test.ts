import { describe, it, expect, vi } from 'vitest';
import { Graph, createPin } from '../graph/Graph';
import { Engine } from '../execution/Engine';
import { registerCatalogNodes } from './index';
import { PinDirection } from '../graph/types';
import { v4 as uuidv4 } from 'uuid';
import { registry } from '../registry/NodeRegistry';

describe('Auto Node Generation', () => {
  registerCatalogNodes();

  it('should execute auto-generated pure node (Math.Add)', () => {
    const graph = new Graph();
    const nodeId = uuidv4();
    
    // Math.Add(A=5, B=3)
    const pinA = createPin(nodeId, 'A', {type:'Float'}, PinDirection.Input);
    pinA.defaultValue = 5;
    const pinB = createPin(nodeId, 'B', {type:'Float'}, PinDirection.Input);
    pinB.defaultValue = 3;
    const pinRes = createPin(nodeId, 'Result', {type:'Float'}, PinDirection.Output);
    
    graph.addNode({ id: nodeId, type: 'math.add', position:{x:0,y:0}, inputs:[pinA, pinB], outputs:[pinRes] });
    
    const printId = uuidv4();
    const printIn = createPin(printId, 'In', {type:'Exec'}, PinDirection.Input);
    const printStr = createPin(printId, 'String', {type:'String'}, PinDirection.Input);
    const printOut = createPin(printId, 'Out', {type:'Exec'}, PinDirection.Output);
    
    graph.addNode({ id: printId, type: 'debug.print', position:{x:0,y:0}, inputs:[printIn, printStr], outputs:[printOut] });
    
    graph.connect(pinRes.id, printStr.id);
    
    const beginId = uuidv4();
    const beginOut = createPin(beginId, 'Out', {type:'Exec'}, PinDirection.Output);

    registry.register({
        type: 'flow.begin_play', category: 'Events', label: 'BeginPlay',
        create: () => ({ inputs: [], outputs: [{name:'Out', dataType:{type:'Exec'}}] }),
        execute: (ctx) => ctx.trigger('Out')
    });
    
    graph.addNode({ id: beginId, type: 'flow.begin_play', position:{x:0,y:0}, inputs:[], outputs:[beginOut] });
    graph.connect(beginOut.id, printIn.id);
    
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    const engine = new Engine(graph.data, registry);
    engine.triggerEvent('BeginPlay');
    
    expect(logSpy).toHaveBeenCalledWith(8); 
    logSpy.mockRestore();
  });
});
