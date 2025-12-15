import { v4 as uuidv4 } from 'uuid';
import { Transform } from './types';
import { World } from './World';

export abstract class Component {
  id: string = uuidv4();
  entity!: Entity; // Assigned when added
  
  abstract onAttach(): void;
  abstract onDetach(): void;
  // tick optional?
}

export class Entity {
  id: string = uuidv4();
  name: string = 'Entity';
  tags: Set<string> = new Set();
  transform: Transform = {
    position: { x: 0, y: 0 },
    rotation: 0,
    scale: { x: 1, y: 1 }
  };
  
  components: Component[] = [];
  world!: World;

  constructor(name?: string) {
    if (name) this.name = name;
  }

  addComponent(component: Component) {
    component.entity = this;
    this.components.push(component);
    component.onAttach();
  }

  removeComponent(componentId: string) {
    const idx = this.components.findIndex(c => c.id === componentId);
    if (idx !== -1) {
      this.components[idx].onDetach();
      this.components.splice(idx, 1);
    }
  }
}
