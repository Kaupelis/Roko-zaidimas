
import { PlayerState, Entity, GameLevel } from '../types';
import { V_WIDTH, V_HEIGHT } from '../constants';

export class Renderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  draw(player: PlayerState, level: GameLevel, bananasCollected: number, time: number) {
    this.ctx.clearRect(0, 0, V_WIDTH, V_HEIGHT);

    // 1. Draw Parallax Background
    this.drawBackground(time);

    // 2. Draw Level Entities
    this.drawLevel(level, bananasCollected);

    // 3. Draw Player
    if (!player.dead) {
      this.drawPlayer(player, time);
    } else {
      this.drawDeathEffect(player);
    }
  }

  private drawBackground(time: number) {
    // Sky gradient
    const skyGrd = this.ctx.createLinearGradient(0, 0, 0, V_HEIGHT);
    skyGrd.addColorStop(0, '#87CEEB');
    skyGrd.addColorStop(1, '#E0F6FF');
    this.ctx.fillStyle = skyGrd;
    this.ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

    // Distant Mountains (Layer 1)
    this.ctx.fillStyle = '#6BA7C1';
    this.drawMountains(time * 0.05, 100, 300, 0.4);

    // Hills (Layer 2)
    this.ctx.fillStyle = '#4A8D7E';
    this.drawMountains(time * 0.1, 150, 450, 0.6);
  }

  private drawMountains(offset: number, height: number, y: number, frequency: number) {
    this.ctx.beginPath();
    this.ctx.moveTo(0, V_HEIGHT);
    for (let x = 0; x <= V_WIDTH; x += 10) {
      const noise = Math.sin(x * 0.005 * frequency + offset) * height;
      this.ctx.lineTo(x, y + noise);
    }
    this.ctx.lineTo(V_WIDTH, V_HEIGHT);
    this.ctx.fill();
  }

  private drawLevel(level: GameLevel, bananasCollected: number) {
    // Platforms
    this.ctx.fillStyle = '#5D4037'; // Earth brown
    level.platforms.forEach(p => {
      this.ctx.beginPath();
      this.ctx.roundRect(p.x, p.y, p.w, p.h, 10);
      this.ctx.fill();
      // Grass top
      this.ctx.fillStyle = '#8BC34A';
      this.ctx.fillRect(p.x, p.y, p.w, 10);
      this.ctx.fillStyle = '#5D4037';
    });

    // Spikes
    this.ctx.fillStyle = '#78909C';
    level.hazards.filter(h => h.type === 'spike').forEach(s => {
      this.ctx.beginPath();
      this.ctx.moveTo(s.x, s.y + s.h);
      this.ctx.lineTo(s.x + s.w / 2, s.y);
      this.ctx.lineTo(s.x + s.w, s.y + s.h);
      this.ctx.fill();
    });

    // Moving Hazards (Snakes/Bees)
    level.hazards.filter(h => h.type === 'moving_hazard').forEach(m => {
      this.ctx.fillStyle = '#FFC107';
      this.ctx.beginPath();
      this.ctx.arc(m.x + m.w / 2, m.y + m.h / 2, m.w / 2, 0, Math.PI * 2);
      this.ctx.fill();
      // Stripes
      this.ctx.fillStyle = '#212121';
      this.ctx.fillRect(m.x + m.w * 0.2, m.y, m.w * 0.2, m.h);
      this.ctx.fillRect(m.x + m.w * 0.6, m.y, m.w * 0.2, m.h);
    });

    // Bananas
    level.collectibles.forEach(b => {
      if (!b.collected) {
        this.ctx.save();
        this.ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
        this.ctx.rotate(Math.sin(Date.now() / 200) * 0.2);
        this.ctx.fillStyle = '#FFEB3B';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 15, 8, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    });

    // Portal
    const isReady = bananasCollected >= level.requiredBananas;
    this.ctx.strokeStyle = isReady ? '#E91E63' : '#9E9E9E';
    this.ctx.lineWidth = 5;
    this.ctx.beginPath();
    this.ctx.ellipse(level.portal.x + level.portal.w / 2, level.portal.y + level.portal.h / 2, level.portal.w / 2, level.portal.h / 2, 0, 0, Math.PI * 2);
    this.ctx.stroke();

    if (isReady) {
      // Glow effect
      this.ctx.fillStyle = 'rgba(233, 30, 99, 0.3)';
      this.ctx.fill();
      // Particles
      for (let i = 0; i < 5; i++) {
        const px = level.portal.x + Math.random() * level.portal.w;
        const py = level.portal.y + Math.random() * level.portal.h;
        this.ctx.fillStyle = '#FFF';
        this.ctx.fillRect(px, py, 2, 2);
      }
    }
  }

  private drawPlayer(p: PlayerState, time: number) {
    const { x, y, width, height, facing, state } = p;
    this.ctx.save();
    this.ctx.translate(x + width / 2, y + height / 2);
    if (facing === 'left') this.ctx.scale(-1, 1);

    // Body wobble
    let bounce = 0;
    let limbAngle = 0;

    if (state === 'run') {
      bounce = Math.abs(Math.sin(time * 0.2)) * 5;
      limbAngle = Math.sin(time * 0.2) * 0.5;
    } else if (state === 'jump') {
      bounce = -5;
    }

    // Tail
    this.ctx.strokeStyle = '#5D4037';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(-10, 10);
    this.ctx.quadraticCurveTo(-25, 10 + Math.sin(time * 0.1) * 5, -20, -5);
    this.ctx.stroke();

    // Body
    this.ctx.fillStyle = '#795548';
    this.ctx.beginPath();
    this.ctx.ellipse(0, 5 - bounce, 15, 18, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Belly patch
    this.ctx.fillStyle = '#D7CCC8';
    this.ctx.beginPath();
    this.ctx.ellipse(0, 8 - bounce, 10, 12, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Head
    this.ctx.fillStyle = '#795548';
    this.ctx.beginPath();
    this.ctx.arc(0, -15 - bounce, 12, 0, Math.PI * 2);
    this.ctx.fill();

    // Ears
    this.ctx.beginPath();
    this.ctx.arc(-12, -18 - bounce, 4, 0, Math.PI * 2);
    this.ctx.arc(12, -18 - bounce, 4, 0, Math.PI * 2);
    this.ctx.fill();

    // Face patch
    this.ctx.fillStyle = '#D7CCC8';
    this.ctx.beginPath();
    this.ctx.ellipse(0, -13 - bounce, 9, 7, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Eyes
    this.ctx.fillStyle = '#212121';
    this.ctx.beginPath();
    this.ctx.arc(-4, -15 - bounce, 1.5, 0, Math.PI * 2);
    this.ctx.arc(4, -15 - bounce, 1.5, 0, Math.PI * 2);
    this.ctx.fill();

    // Limbs
    this.ctx.strokeStyle = '#5D4037';
    this.ctx.lineWidth = 4;
    this.ctx.lineCap = 'round';

    // Arms
    const armY = state === 'jump' ? -10 : 5;
    this.ctx.beginPath();
    this.ctx.moveTo(-10, 0);
    this.ctx.lineTo(-18, armY);
    this.ctx.moveTo(10, 0);
    this.ctx.lineTo(18, armY);
    this.ctx.stroke();

    // Legs
    this.ctx.beginPath();
    this.ctx.moveTo(-8, 15 - bounce);
    this.ctx.lineTo(-8 + limbAngle * 10, 25 - bounce);
    this.ctx.moveTo(8, 15 - bounce);
    this.ctx.lineTo(8 - limbAngle * 10, 25 - bounce);
    this.ctx.stroke();

    this.ctx.restore();
  }

  private drawDeathEffect(p: PlayerState) {
    // Explosion particles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dist = 30;
      this.ctx.fillStyle = '#795548';
      this.ctx.beginPath();
      this.ctx.arc(p.x + p.width / 2 + Math.cos(angle) * dist, p.y + p.height / 2 + Math.sin(angle) * dist, 5, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
}
