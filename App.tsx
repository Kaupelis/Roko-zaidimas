
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { V_WIDTH, V_HEIGHT, LEVELS, GRAVITY, JUMP_FORCE, MOVE_SPEED, FRICTION } from './constants';
import { PlayerState, GameLevel, Entity } from './types';
import { Renderer } from './engine/Renderer';
import { audioService } from './services/AudioService';

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [levelIdx, setLevelIdx] = useState(0);
  const [bananas, setBananas] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'menu'>('playing');
  const [keys, setKeys] = useState<Set<string>>(new Set());
  
  const playerRef = useRef<PlayerState>({
    x: LEVELS[0].spawn.x,
    y: LEVELS[0].spawn.y,
    vx: 0,
    vy: 0,
    width: 40,
    height: 50,
    grounded: false,
    facing: 'right',
    animFrame: 0,
    state: 'idle',
    dead: false,
  });

  const levelRef = useRef<GameLevel>(JSON.parse(JSON.stringify(LEVELS[0])));
  const rendererRef = useRef<Renderer | null>(null);
  const frameRef = useRef<number>(0);

  // Input Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => {
        const next = new Set(prev);
        next.add(e.code);
        return next;
      });
      if (e.code === 'KeyR') resetLevel();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => {
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const resetLevel = useCallback(() => {
    const lvl = LEVELS[levelIdx];
    levelRef.current = JSON.parse(JSON.stringify(lvl));
    playerRef.current = {
      ...playerRef.current,
      x: lvl.spawn.x,
      y: lvl.spawn.y,
      vx: 0,
      vy: 0,
      dead: false,
    };
    setBananas(0);
  }, [levelIdx]);

  const nextLevel = useCallback(() => {
    if (levelIdx + 1 < LEVELS.length) {
      setLevelIdx(prev => prev + 1);
    } else {
      setGameStatus('won');
      audioService.playWin();
    }
  }, [levelIdx]);

  // Game Loop
  useEffect(() => {
    if (!canvasRef.current || gameStatus !== 'playing') return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    rendererRef.current = new Renderer(ctx);

    const loop = (time: number) => {
      update(time);
      render(time);
      frameRef.current = requestAnimationFrame(loop);
    };

    const update = (time: number) => {
      const p = playerRef.current;
      if (p.dead) return;

      const currentLvl = levelRef.current;

      // Input
      if (keys.has('ArrowLeft') || keys.has('KeyA')) {
        p.vx = -MOVE_SPEED;
        p.facing = 'left';
        p.state = 'run';
      } else if (keys.has('ArrowRight') || keys.has('KeyD')) {
        p.vx = MOVE_SPEED;
        p.facing = 'right';
        p.state = 'run';
      } else {
        p.vx *= FRICTION;
        if (Math.abs(p.vx) < 0.1) {
          p.vx = 0;
          p.state = 'idle';
        }
      }

      if ((keys.has('Space') || keys.has('ArrowUp') || keys.has('KeyW')) && p.grounded) {
        p.vy = JUMP_FORCE;
        p.grounded = false;
        audioService.playJump();
      }

      if (!p.grounded) p.state = 'jump';

      // Physics
      p.vy += GRAVITY;
      p.x += p.vx;
      p.y += p.vy;

      // Platform Collision (AABB)
      p.grounded = false;
      currentLvl.platforms.forEach(plat => {
        if (p.x < plat.x + plat.w &&
            p.x + p.width > plat.x &&
            p.y < plat.y + plat.h &&
            p.y + p.height > plat.y) {
          
          // Collision from top
          if (p.vy > 0 && p.y + p.height - p.vy <= plat.y) {
            p.y = plat.y - p.height;
            p.vy = 0;
            p.grounded = true;
          } 
          // Collision from bottom
          else if (p.vy < 0 && p.y - p.vy >= plat.y + plat.h) {
            p.y = plat.y + plat.h;
            p.vy = 0;
          }
        }
      });

      // Moving Hazards Update
      currentLvl.hazards.filter(h => h.type === 'moving_hazard').forEach(h => {
        h.x += h.vx!;
        if (h.startX && (h.x > h.startX + h.range! || h.x < h.startX)) {
          h.vx! *= -1;
        }
      });

      // Death Collisions
      currentLvl.hazards.forEach(h => {
        if (p.x < h.x + h.w && p.x + p.width > h.x && p.y < h.y + h.h && p.y + p.height > h.y) {
          p.dead = true;
          audioService.playDeath();
          setTimeout(resetLevel, 1000);
        }
      });

      // Screen Bounds
      if (p.y > V_HEIGHT) {
        p.dead = true;
        audioService.playDeath();
        setTimeout(resetLevel, 1000);
      }

      // Collectibles
      currentLvl.collectibles.forEach(b => {
        if (!b.collected && p.x < b.x + b.w && p.x + p.width > b.x && p.y < b.y + b.h && p.y + p.height > b.y) {
          b.collected = true;
          setBananas(prev => prev + 1);
          audioService.playCollect();
        }
      });

      // Portal
      if (bananas >= currentLvl.requiredBananas) {
        const portal = currentLvl.portal;
        if (p.x < portal.x + portal.w && p.x + p.width > portal.x && p.y < portal.y + portal.h && p.y + p.height > portal.y) {
          nextLevel();
        }
      }
    };

    const render = (time: number) => {
      if (rendererRef.current) {
        rendererRef.current.draw(playerRef.current, levelRef.current, bananas, time / 100);
      }
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [gameStatus, levelIdx, bananas, keys, resetLevel, nextLevel]);

  // Level transition effect
  useEffect(() => {
    resetLevel();
  }, [levelIdx, resetLevel]);

  const restartGame = () => {
    setLevelIdx(0);
    setGameStatus('playing');
    setBananas(0);
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-black select-none">
      {/* HUD */}
      {gameStatus === 'playing' && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-8 flex justify-between items-start pointer-events-none">
          <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-xl border-b-4 border-brown-600">
            <h2 className="text-2xl font-black text-brown-800 uppercase tracking-tighter">Level {levelIdx + 1}/3</h2>
            <p className="text-sm font-bold text-brown-500">WASD to Move • SPACE to Jump</p>
          </div>
          <div className="bg-yellow-400 rounded-2xl p-4 shadow-xl border-b-4 border-yellow-600 flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">🍌</div>
            <div>
              <p className="text-xs font-black text-yellow-800 uppercase">Bananas</p>
              <p className="text-2xl font-black text-yellow-900 leading-none">{bananas} <span className="text-lg opacity-50">/ {levelRef.current.requiredBananas}</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Game Over / Win Screens */}
      {gameStatus === 'won' && (
        <div className="absolute inset-0 bg-yellow-400/95 flex flex-col items-center justify-center text-center z-50 p-8">
          <div className="animate-bounce text-9xl mb-4">🐒🏆</div>
          <h1 className="text-6xl font-black text-yellow-900 mb-2">KING OF THE JUNGLE!</h1>
          <p className="text-xl text-yellow-800 mb-8 max-w-md">You've collected all the bananas and escaped the jungle dangers. You are truly the monkey master!</p>
          <button 
            onClick={restartGame}
            className="bg-yellow-900 hover:bg-yellow-800 text-white px-12 py-4 rounded-full text-2xl font-black shadow-2xl transition-all transform hover:scale-105 active:scale-95 border-b-8 border-black/20"
          >
            PLAY AGAIN
          </button>
        </div>
      )}

      <canvas 
        ref={canvasRef} 
        width={V_WIDTH} 
        height={V_HEIGHT}
        className="max-w-full max-h-full aspect-video rounded-lg shadow-2xl border-4 border-white/10"
      />
      
      <div className="absolute bottom-4 text-white/30 text-xs font-mono">
        R to restart level • Virtual Resolution: 1280x720 • React Engine v1.0
      </div>
    </div>
  );
};

export default App;
