
import { GameLevel } from './types';

export const V_WIDTH = 1280;
export const V_HEIGHT = 720;
export const GRAVITY = 0.6;
export const JUMP_FORCE = -15;
export const MOVE_SPEED = 6;
export const FRICTION = 0.8;

export const LEVELS: GameLevel[] = [
  {
    id: 1,
    spawn: { x: 100, y: 500 },
    requiredBananas: 3,
    platforms: [
      { type: 'platform', x: 0, y: 650, w: 1280, h: 70 }, // Ground
      { type: 'platform', x: 300, y: 500, w: 200, h: 40 },
      { type: 'platform', x: 600, y: 400, w: 200, h: 40 },
      { type: 'platform', x: 900, y: 300, w: 200, h: 40 },
    ],
    hazards: [
      { type: 'spike', x: 550, y: 620, w: 40, h: 30 },
      { type: 'spike', x: 800, y: 620, w: 40, h: 30 },
    ],
    collectibles: [
      { type: 'banana', x: 350, y: 450, w: 30, h: 30 },
      { type: 'banana', x: 650, y: 350, w: 30, h: 30 },
      { type: 'banana', x: 950, y: 250, w: 30, h: 30 },
    ],
    portal: { type: 'portal', x: 1150, y: 550, w: 80, h: 100 },
  },
  {
    id: 2,
    spawn: { x: 100, y: 500 },
    requiredBananas: 4,
    platforms: [
      { type: 'platform', x: 0, y: 650, w: 300, h: 70 },
      { type: 'platform', x: 450, y: 550, w: 200, h: 40 },
      { type: 'platform', x: 750, y: 450, w: 200, h: 40 },
      { type: 'platform', x: 1050, y: 350, w: 230, h: 40 },
      { type: 'platform', x: 800, y: 200, w: 150, h: 40 },
      { type: 'platform', x: 400, y: 250, w: 200, h: 40 },
    ],
    hazards: [
      { type: 'spike', x: 500, y: 520, w: 40, h: 30 },
      { type: 'spike', x: 800, y: 420, w: 40, h: 30 },
      { type: 'moving_hazard', x: 600, y: 300, w: 40, h: 40, vx: 3, range: 200, startX: 600 },
    ],
    collectibles: [
      { type: 'banana', x: 480, y: 500, w: 30, h: 30 },
      { type: 'banana', x: 780, y: 400, w: 30, h: 30 },
      { type: 'banana', x: 1100, y: 300, w: 30, h: 30 },
      { type: 'banana', x: 450, y: 200, w: 30, h: 30 },
    ],
    portal: { type: 'portal', x: 50, y: 150, w: 80, h: 100 },
  },
  {
    id: 3,
    spawn: { x: 50, y: 600 },
    requiredBananas: 5,
    platforms: [
      { type: 'platform', x: 0, y: 650, w: 150, h: 70 },
      { type: 'platform', x: 250, y: 550, w: 100, h: 30 },
      { type: 'platform', x: 450, y: 450, w: 100, h: 30 },
      { type: 'platform', x: 650, y: 350, w: 100, h: 30 },
      { type: 'platform', x: 850, y: 250, w: 100, h: 30 },
      { type: 'platform', x: 1050, y: 350, w: 100, h: 30 },
      { type: 'platform', x: 1150, y: 550, w: 130, h: 30 },
      { type: 'platform', x: 800, y: 650, w: 300, h: 70 },
    ],
    hazards: [
      { type: 'moving_hazard', x: 200, y: 400, w: 50, h: 50, vx: 5, range: 800, startX: 200 },
      { type: 'moving_hazard', x: 1000, y: 500, w: 50, h: 50, vx: -4, range: 600, startX: 1000 },
      { type: 'spike', x: 900, y: 620, w: 40, h: 30 },
      { type: 'spike', x: 1000, y: 620, w: 40, h: 30 },
    ],
    collectibles: [
      { type: 'banana', x: 280, y: 500, w: 30, h: 30 },
      { type: 'banana', x: 680, y: 300, w: 30, h: 30 },
      { type: 'banana', x: 880, y: 200, w: 30, h: 30 },
      { type: 'banana', x: 1180, y: 500, w: 30, h: 30 },
      { type: 'banana', x: 950, y: 600, w: 30, h: 30 },
    ],
    portal: { type: 'portal', x: 10, y: 550, w: 80, h: 100 },
  }
];
