
export interface Point {
  x: number;
  y: number;
}

export interface Size {
  w: number;
  h: number;
}

export type EntityType = 'platform' | 'spike' | 'banana' | 'portal' | 'moving_hazard';

export interface Entity extends Point, Size {
  type: EntityType;
  color?: string;
  collected?: boolean;
  vx?: number;
  range?: number;
  startX?: number;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  grounded: boolean;
  facing: 'left' | 'right';
  animFrame: number;
  state: 'idle' | 'run' | 'jump';
  dead: boolean;
}

export interface GameLevel {
  id: number;
  platforms: Entity[];
  hazards: Entity[];
  collectibles: Entity[];
  portal: Entity;
  requiredBananas: number;
  spawn: Point;
}
