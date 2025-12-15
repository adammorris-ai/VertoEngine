import { Entity } from './Entity';
import { Engine } from '../execution/Engine';
import { InputState } from './types';

export class World {
  entities: Entity[] = [];
  blueprintEngine: Engine;
  
  input: InputState = {
    keys: new Set(),
    mouseButtons: new Set(),
    mousePosition: { x: 0, y: 0 }
  };

  constructor(blueprintEngine: Engine) {
    this.blueprintEngine = blueprintEngine;
  }

  addEntity(entity: Entity) {
    entity.world = this;
    this.entities.push(entity);
  }

  removeEntity(entityId: string) {
    const idx = this.entities.findIndex(e => e.id === entityId);
    if (idx !== -1) {
      this.entities.splice(idx, 1);
    }
  }

  step(dt: number) {
    // 1. Physics / Collision (Stub)
    this.resolveCollisions();
    
    // 2. Blueprint Tick (Global Level Blueprint)
    this.blueprintEngine.triggerEvent('Event Tick', { DeltaSeconds: dt });
    
    // 3. Update Scheduler
    this.blueprintEngine.tick(dt);
  }

  private resolveCollisions() {
     // Check for AABB overlaps
     // Only simple check for now if needed, or leave empty
     // "Collision: AABB overlap events + optional swept motion"
  }
}
