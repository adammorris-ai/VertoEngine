export interface LatentAction {
  id: string;
  update: (dt: number) => boolean; // Returns true when finished
  complete: () => void;
}

export class Scheduler {
  actions: LatentAction[] = [];
  
  tick(dt: number) {
    // Iterate backwards to allow removal
    for (let i = this.actions.length - 1; i >= 0; i--) {
      const action = this.actions[i];
      const finished = action.update(dt);
      if (finished) {
        action.complete();
        this.actions.splice(i, 1);
      }
    }
  }

  add(action: LatentAction) {
    this.actions.push(action);
  }
  
  clear() {
    this.actions = [];
  }
}
