export interface Vector2 {
  x: number;
  y: number;
}

export interface Transform {
  position: Vector2;
  rotation: number; // Degrees
  scale: Vector2;
}

export interface InputState {
  keys: Set<string>; // Pressed keys
  mouseButtons: Set<number>;
  mousePosition: Vector2;
}
