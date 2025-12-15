import { describe, it, expect } from 'vitest';
import { Graph, createPin } from '../graph/Graph';
import { Engine } from '../execution/Engine';
import { registry } from '../registry/NodeRegistry';
import { registerFlowNodes } from '../registry';
import { PinDirection } from '../graph/types';
import { v4 as uuidv4 } from 'uuid';
import { World } from './World';
import { Entity } from './Entity';

describe('Runtime Engine', () => {
  registerFlowNodes();

  it('should move entity via blueprint', () => {
    const graph = new Graph();
    
    // Register Test Nodes
    // SetTransform
    registry.register({
        type: 'actor.set_transform', category: 'Actor', label: 'Set Transform',
        create: () => ({ 
            inputs: [
                { name: 'In', dataType: {type:'Exec'} },
                { name: 'NewX', dataType: {type:'Float'} }
            ], 
            outputs: [{ name: 'Out', dataType: {type:'Exec'} }] 
        }),
        execute: (ctx) => {
            const world = ctx.services.world as World;
            const ent = world.entities[0]; // Simplification
            const x = ctx.getInput('NewX');
            ent.transform.position.x = x;
            ctx.trigger('Out');
        }
    });

    // Tick Node
    const tickId = uuidv4();
    const tickOut = createPin(tickId, 'Out', {type:'Exec'}, PinDirection.Output);
    const tickDelta = createPin(tickId, 'DeltaSeconds', {type:'Float'}, PinDirection.Output);
    
    graph.addNode({ id: tickId, type: 'flow.tick', position:{x:0,y:0}, inputs:[], outputs:[tickOut, tickDelta] });
    
    // SetTransform Node
    const setTId = uuidv4();
    const setIn = createPin(setTId, 'In', {type:'Exec'}, PinDirection.Input);
    const setX = createPin(setTId, 'NewX', {type:'Float'}, PinDirection.Input); // We will hardcode or connect
    setX.defaultValue = 10.0;
    
    const setOut = createPin(setTId, 'Out', {type:'Exec'}, PinDirection.Output);
    
    graph.addNode({ id: setTId, type: 'actor.set_transform', position:{x:0,y:0}, inputs:[setIn, setX], outputs:[setOut] });

    // Connect
    graph.connect(tickOut.id, setIn.id);
    
    // Setup Engine & World
    // Note: Engine is constructed without services first? Or pass empty?
    // Then assign world.
    const engine = new Engine(graph.data, registry);
    const world = new World(engine);
    engine.services.world = world;
    
    const entity = new Entity();
    entity.transform.position.x = 0;
    world.addEntity(entity);
    
    expect(entity.transform.position.x).toBe(0);
    
    // Step World (Triggers Tick -> SetTransform)
    world.step(0.1);
    
    expect(entity.transform.position.x).toBe(10.0);
  });
});
