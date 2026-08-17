import React, { useEffect, useRef, useState } from 'react';
import { gameAudio } from '../utils/audio';
import robotImg from '../assets/robot.png';

// 19x19 Maze Grid Layout (1 = Wall, 0 = Path)
const MAZE_GRID = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1], // TL Room (cols 1..3), TR Room (cols 15..17)
  [1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1], // Room entry doors at col 4 and 14
  [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // Center Row (player starts at 9, 9)
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1], // BL Room (cols 1..3), BR Room (cols 15..17)
  [1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// Room Centers & Colors
const ROOMS = [
  { id: 0, x: 2, y: 2, label: 'أعلى اليسار', color: '#39ff14', glow: 'rgba(57, 255, 20, 0.15)' }, // TL
  { id: 1, x: 16, y: 2, label: 'أعلى اليمين', color: '#bd00ff', glow: 'rgba(189, 0, 255, 0.15)' }, // TR
  { id: 2, x: 2, y: 16, label: 'أسفل اليسار', color: '#ff5f00', glow: 'rgba(255, 95, 0, 0.15)' }, // BL
  { id: 3, x: 16, y: 16, label: 'أسفل اليمين', color: '#ff007f', glow: 'rgba(255, 0, 127, 0.15)' } // BR
];

// 4 Portals — one per answer room, cycling: TL → TR → BR → BL → TL
const PORTALS = [
  { id: 0, x: 2, y: 0, targetPortalId: 1, color: '#39ff14', exitX: 2, exitY: 1, exitDir: 'down' }, // TL top wall
  { id: 1, x: 18, y: 2, targetPortalId: 2, color: '#bd00ff', exitX: 17, exitY: 2, exitDir: 'left' }, // TR right wall
  { id: 2, x: 16, y: 18, targetPortalId: 3, color: '#ff007f', exitX: 16, exitY: 17, exitDir: 'up' }, // BR bottom wall
  { id: 3, x: 0, y: 16, targetPortalId: 0, color: '#ff5f00', exitX: 1, exitY: 16, exitDir: 'right' }, // BL left wall
];

interface Monster {
  x: number;
  y: number;
  gridX: number;
  gridY: number;
  targetX: number;
  targetY: number;
  speed: number;
  color: string;
  personality: 'chaser' | 'random';
}

interface MazeCanvasProps {
  words: string[]; // 4 words distributed to the 4 rooms
  correctWord: string;
  onCorrect: () => void;
  onWrong: (word: string) => void;
  onLoseLife: () => void;
  lives: number;
  isPaused: boolean;
  externalDirection: string | null; // For on-screen controls
}

export const MazeCanvas: React.FC<MazeCanvasProps> = ({
  words,
  correctWord,
  onCorrect,
  onWrong,
  onLoseLife,
  lives,
  isPaused,
  externalDirection,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const robotImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = robotImg;
    img.onload = () => {
      robotImageRef.current = img;
    };
  }, []);

  // Player state
  const playerRef = useRef({
    x: 9 * 32 + 16,
    y: 9 * 32 + 16,
    gridX: 9,
    gridY: 9,
    targetX: 9,
    targetY: 9,
    speed: 2,
    dir: 'none',
    nextDir: 'none',
    invincibleFrames: 0,
    facingDir: 'left',
  });

  // Monsters state
  const monstersRef = useRef<Monster[]>([]);

  // Local state for wrong room cooldowns to prevent double triggers
  const lastRoomVisitedRef = useRef<{ id: number; time: number } | null>(null);
  const cameraRef = useRef({ x: 9 * 32 + 16, y: 9 * 32 + 16 });
  const teleportEffectRef = useRef<{
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    progress: number;
    maxFrames: number;
    color: string;
  } | null>(null);

  // Joystick state
  const [joystick, setJoystick] = useState<{
    startX: number;
    startY: number;
    curX: number;
    curY: number;
  } | null>(null);

  const joystickStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchDirectionRef = useRef<string | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isPaused || lives <= 0) return;
    const touch = e.touches[0];
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    joystickStartRef.current = { x, y };
    setJoystick({
      startX: x,
      startY: y,
      curX: x,
      curY: y
    });
    touchDirectionRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!joystickStartRef.current || isPaused || lives <= 0) return;
    const touch = e.touches[0];
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const start = joystickStartRef.current;

    setJoystick({
      startX: start.x,
      startY: start.y,
      curX: x,
      curY: y
    });

    const dx = x - start.x;
    const dy = y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 15) {
      if (Math.abs(dx) > Math.abs(dy)) {
        touchDirectionRef.current = dx > 0 ? 'right' : 'left';
      } else {
        touchDirectionRef.current = dy > 0 ? 'down' : 'up';
      }
    } else {
      touchDirectionRef.current = null;
    }
  };

  const handleTouchEnd = () => {
    joystickStartRef.current = null;
    setJoystick(null);
    touchDirectionRef.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPaused || lives <= 0) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    joystickStartRef.current = { x, y };
    setJoystick({
      startX: x,
      startY: y,
      curX: x,
      curY: y
    });
    touchDirectionRef.current = null;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!joystickStartRef.current || isPaused || lives <= 0) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const start = joystickStartRef.current;

    setJoystick({
      startX: start.x,
      startY: start.y,
      curX: x,
      curY: y
    });

    const dx = x - start.x;
    const dy = y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 15) {
      if (Math.abs(dx) > Math.abs(dy)) {
        touchDirectionRef.current = dx > 0 ? 'right' : 'left';
      } else {
        touchDirectionRef.current = dy > 0 ? 'down' : 'up';
      }
    } else {
      touchDirectionRef.current = null;
    }
  };

  const handleMouseUpOrLeave = () => {
    joystickStartRef.current = null;
    setJoystick(null);
    touchDirectionRef.current = null;
  };

  const cellSize = 32;

  // Initialize monsters
  const resetEntities = () => {
    // Reset player
    playerRef.current = {
      x: 9 * cellSize + cellSize / 2,
      y: 9 * cellSize + cellSize / 2,
      gridX: 9,
      gridY: 9,
      targetX: 9,
      targetY: 9,
      speed: 2,
      dir: 'none',
      nextDir: 'none',
      invincibleFrames: 120, // 2 seconds safety on level start
      facingDir: 'left',
    };

    cameraRef.current = {
      x: 9 * cellSize + cellSize / 2,
      y: 9 * cellSize + cellSize / 2,
    };

    // Reset monsters based on current level / words length
    // We'll spawn 3 monsters: 1 chaser (Red), 2 random patrollers (Cyan, Orange)
    monstersRef.current = [
      {
        x: 5 * cellSize + cellSize / 2,
        y: 5 * cellSize + cellSize / 2,
        gridX: 5,
        gridY: 5,
        targetX: 5,
        targetY: 5,
        speed: 1,
        color: '#ff0000', // Red: Chaser
        personality: 'chaser'
      },
      {
        x: 13 * cellSize + cellSize / 2,
        y: 5 * cellSize + cellSize / 2,
        gridX: 13,
        gridY: 5,
        targetX: 13,
        targetY: 5,
        speed: 1,
        color: '#00f0ff', // Cyan: Random
        personality: 'random'
      },
      {
        x: 5 * cellSize + cellSize / 2,
        y: 13 * cellSize + cellSize / 2,
        gridX: 5,
        gridY: 13,
        targetX: 5,
        targetY: 13,
        speed: 1.1,
        color: '#ffaa00', // Orange: Random
        personality: 'random'
      }
    ];

    lastRoomVisitedRef.current = null;
  };

  // Reset when words/level changes
  useEffect(() => {
    resetEntities();
  }, [words]);

  const externalDirectionRef = useRef<string | null>(null);
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});

  // Sync external direction (touch/mouse hold)
  useEffect(() => {
    externalDirectionRef.current = externalDirection;
  }, [externalDirection]);

  // Handle keyboard inputs with held down tracking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused || lives <= 0) return;

      const trackedKeys = ['ArrowUp', 'w', 'W', 'ArrowDown', 's', 'S', 'ArrowLeft', 'a', 'A', 'ArrowRight', 'd', 'D'];
      if (trackedKeys.includes(e.key)) {
        e.preventDefault();
      }

      keysPressedRef.current[e.key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key] = false;
    };

    const handleBlur = () => {
      keysPressedRef.current = {};
      externalDirectionRef.current = null;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isPaused, lives]);

  const getDesiredDirection = (): string | null => {
    if (touchDirectionRef.current) {
      return touchDirectionRef.current;
    }
    if (externalDirectionRef.current) {
      return externalDirectionRef.current;
    }
    const keys = keysPressedRef.current;
    if (keys['ArrowUp'] || keys['w'] || keys['W']) return 'up';
    if (keys['ArrowDown'] || keys['s'] || keys['S']) return 'down';
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) return 'left';
    if (keys['ArrowRight'] || keys['d'] || keys['D']) return 'right';
    return null;
  };

  const isPortalCell = (gx: number, gy: number): boolean => {
    return PORTALS.some(p => p.x === gx && p.y === gy);
  };

  const isWalkable = (gx: number, gy: number): boolean => {
    if (gx < 0 || gx >= 19 || gy < 0 || gy >= 19) return false;
    if (isPortalCell(gx, gy)) return true;
    return MAZE_GRID[gy][gx] !== 1;
  };

  // Main game loop inside requestAnimationFrame
  useEffect(() => {
    let animationId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateGame = () => {
      if (isPaused || lives <= 0) return;

      const player = playerRef.current;

      // 1. Move Player
      const targetPx = player.targetX * cellSize + cellSize / 2;
      const targetPy = player.targetY * cellSize + cellSize / 2;

      // Interpolate position
      if (player.x < targetPx) player.x = Math.min(player.x + player.speed, targetPx);
      else if (player.x > targetPx) player.x = Math.max(player.x - player.speed, targetPx);

      if (player.y < targetPy) player.y = Math.min(player.y + player.speed, targetPy);
      else if (player.y > targetPy) player.y = Math.max(player.y - player.speed, targetPy);

      // Decrement invincibility
      if (player.invincibleFrames > 0) {
        player.invincibleFrames--;
      }

      // Check if player has arrived at target tile
      if (player.x === targetPx && player.y === targetPy) {
        player.gridX = player.targetX;
        player.gridY = player.targetY;

        // Check if player stepped on a portal
        const steppedPortal = PORTALS.find(p => p.x === player.gridX && p.y === player.gridY);
        if (steppedPortal) {
          const targetPortal = PORTALS.find(p => p.id === steppedPortal.targetPortalId);
          if (targetPortal) {
            gameAudio.playTeleport();

            const exitGridX = targetPortal.exitX;
            const exitGridY = targetPortal.exitY;

            const fromX = player.x;
            const fromY = player.y;

            player.x = exitGridX * cellSize + cellSize / 2;
            player.y = exitGridY * cellSize + cellSize / 2;
            player.gridX = exitGridX;
            player.gridY = exitGridY;
            player.targetX = exitGridX;
            player.targetY = exitGridY;
            player.dir = targetPortal.exitDir;
            player.nextDir = targetPortal.exitDir;

            // Invincibility protection
            player.invincibleFrames = Math.max(player.invincibleFrames, 30);

            // Teleport trail animation setup
            teleportEffectRef.current = {
              fromX: fromX,
              fromY: fromY,
              toX: player.x,
              toY: player.y,
              progress: 0,
              maxFrames: 25,
              color: steppedPortal.color
            };
          }
        }

        const desiredDir = getDesiredDirection();
        let dX = 0;
        let dY = 0;

        if (desiredDir) {
          if (desiredDir === 'up' && isWalkable(player.gridX, player.gridY - 1)) dY = -1;
          else if (desiredDir === 'down' && isWalkable(player.gridX, player.gridY + 1)) dY = 1;
          else if (desiredDir === 'left' && isWalkable(player.gridX - 1, player.gridY)) {
            dX = -1;
            player.facingDir = 'left';
          }
          else if (desiredDir === 'right' && isWalkable(player.gridX + 1, player.gridY)) {
            dX = 1;
            player.facingDir = 'right';
          }

          if (dX !== 0 || dY !== 0) {
            player.dir = desiredDir;
            player.targetX = player.gridX + dX;
            player.targetY = player.gridY + dY;
            gameAudio.playMove();
          } else {
            player.dir = 'none';
          }
        } else {
          player.dir = 'none';
        }
      }

      // Update camera smooth follow with boundary clamping
      const camera = cameraRef.current;
      const camLerp = teleportEffectRef.current ? 0.22 : 0.1;
      camera.x += (player.x - camera.x) * camLerp;
      camera.y += (player.y - camera.y) * camLerp;

      const zoom = 1.8;
      const visibleWidth = (19 * cellSize) / zoom;
      const visibleHeight = (19 * cellSize) / zoom;
      const minX = visibleWidth / 2;
      const maxX = (19 * cellSize) - minX;
      const minY = visibleHeight / 2;
      const maxY = (19 * cellSize) - minY;

      camera.x = Math.max(minX, Math.min(maxX, camera.x));
      camera.y = Math.max(minY, Math.min(maxY, camera.y));

      // 2. Move Monsters
      const monsters = monstersRef.current;
      monsters.forEach((monster) => {
        const mTargetPx = monster.targetX * cellSize + cellSize / 2;
        const mTargetPy = monster.targetY * cellSize + cellSize / 2;

        // Interpolate position
        if (monster.x < mTargetPx) monster.x = Math.min(monster.x + monster.speed, mTargetPx);
        else if (monster.x > mTargetPx) monster.x = Math.max(monster.x - monster.speed, mTargetPx);

        if (monster.y < mTargetPy) monster.y = Math.min(monster.y + monster.speed, mTargetPy);
        else if (monster.y > mTargetPy) monster.y = Math.max(monster.y - monster.speed, mTargetPy);

        // Arrived at target tile
        if (monster.x === mTargetPx && monster.y === mTargetPy) {
          monster.gridX = monster.targetX;
          monster.gridY = monster.targetY;

          // Find possible moves (prevent reversing direction directly unless dead end)
          const moves = [
            { dir: 'up', dx: 0, dy: -1 },
            { dir: 'down', dx: 0, dy: 1 },
            { dir: 'left', dx: -1, dy: 0 },
            { dir: 'right', dx: 1, dy: 0 }
          ];

          // Identify current moving direction
          let curDir = 'none';
          if (monster.targetX > monster.gridX) curDir = 'right';
          else if (monster.targetX < monster.gridX) curDir = 'left';
          else if (monster.targetY > monster.gridY) curDir = 'down';
          else if (monster.targetY < monster.gridY) curDir = 'up';

          const validMoves = moves.filter((m) => {
            // Must be walkable
            if (!isWalkable(monster.gridX + m.dx, monster.gridY + m.dy)) return false;
            // Avoid opposite direction
            if (curDir === 'right' && m.dir === 'left') return false;
            if (curDir === 'left' && m.dir === 'right') return false;
            if (curDir === 'up' && m.dir === 'down') return false;
            if (curDir === 'down' && m.dir === 'up') return false;
            return true;
          });

          let chosenMove = null;

          if (validMoves.length > 0) {
            if (monster.personality === 'chaser') {
              // Red Ghost: Greedy chase towards player's grid position
              let minDistance = Infinity;
              validMoves.forEach((move) => {
                const nextGx = monster.gridX + move.dx;
                const nextGy = monster.gridY + move.dy;
                // Manhattan distance
                const dist = Math.abs(nextGx - player.gridX) + Math.abs(nextGy - player.gridY);
                if (dist < minDistance) {
                  minDistance = dist;
                  chosenMove = move;
                }
              });
            } else {
              // Random decision at intersections
              const randIdx = Math.floor(Math.random() * validMoves.length);
              chosenMove = validMoves[randIdx];
            }
          } else {
            // Dead end, must turn back
            const opposite = moves.find((m) => {
              if (curDir === 'right' && m.dir === 'left') return true;
              if (curDir === 'left' && m.dir === 'right') return true;
              if (curDir === 'up' && m.dir === 'down') return true;
              if (curDir === 'down' && m.dir === 'up') return true;
              return false;
            });
            if (opposite && isWalkable(monster.gridX + opposite.dx, monster.gridY + opposite.dy)) {
              chosenMove = opposite;
            }
          }

          if (chosenMove) {
            monster.targetX = monster.gridX + chosenMove.dx;
            monster.targetY = monster.gridY + chosenMove.dy;
          }
        }
      });

      // 3. Collision Checks (Player vs Monsters)
      if (player.invincibleFrames === 0) {
        monsters.forEach((monster) => {
          const dx = player.x - monster.x;
          const dy = player.y - monster.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Overlap check (circle radius sum roughly 24px)
          if (dist < 20) {
            gameAudio.playHit();
            onLoseLife();

            // Flash and reset positions
            player.invincibleFrames = 120;
            player.x = 9 * cellSize + cellSize / 2;
            player.y = 9 * cellSize + cellSize / 2;
            player.gridX = 9;
            player.gridY = 9;
            player.targetX = 9;
            player.targetY = 9;
            player.dir = 'none';
            player.nextDir = 'none';
            player.facingDir = 'left';

            // Reset monsters positions
            monsters[0].x = 5 * cellSize + cellSize / 2;
            monsters[0].y = 5 * cellSize + cellSize / 2;
            monsters[0].gridX = 5;
            monsters[0].gridY = 5;
            monsters[0].targetX = 5;
            monsters[0].targetY = 5;

            monsters[1].x = 13 * cellSize + cellSize / 2;
            monsters[1].y = 5 * cellSize + cellSize / 2;
            monsters[1].gridX = 13;
            monsters[1].gridY = 5;
            monsters[1].targetX = 13;
            monsters[1].targetY = 5;

            monsters[2].x = 5 * cellSize + cellSize / 2;
            monsters[2].y = 13 * cellSize + cellSize / 2;
            monsters[2].gridX = 5;
            monsters[2].gridY = 13;
            monsters[2].targetX = 5;
            monsters[2].targetY = 13;
          }
        });
      }

      // 4. Room Detection (Player inside corner rooms)
      ROOMS.forEach((room) => {
        // If player reaches the exact center tile of the room
        if (player.gridX === room.x && player.gridY === room.y) {
          const now = Date.now();
          const lastVisited = lastRoomVisitedRef.current;

          // Prevent immediate duplicate triggering
          if (lastVisited && lastVisited.id === room.id && now - lastVisited.time < 3000) {
            return;
          }

          const wordInRoom = words[room.id];
          lastRoomVisitedRef.current = { id: room.id, time: now };

          if (wordInRoom === correctWord) {
            onCorrect();
          } else {
            gameAudio.playWrong();
            onWrong(wordInRoom);
          }
        }
      });

      // 5. Update teleport effect
      if (teleportEffectRef.current) {
        teleportEffectRef.current.progress++;
        if (teleportEffectRef.current.progress >= teleportEffectRef.current.maxFrames) {
          teleportEffectRef.current = null;
        }
      }
    };

    const drawGame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.scale(2, 2);
      const zoom = 1.8;
      ctx.translate((19 * cellSize) / 2, (19 * cellSize) / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-cameraRef.current.x, -cameraRef.current.y);

      const player = playerRef.current;
      const monsters = monstersRef.current;

      // 1. Draw Room Glow zones
      ROOMS.forEach((room) => {
        ctx.fillStyle = room.glow;
        ctx.fillRect((room.x - 1) * cellSize, (room.y - 1) * cellSize, cellSize * 3, cellSize * 3);

        // Neon Room Borders
        ctx.strokeStyle = room.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = room.color;
        ctx.shadowBlur = 10;
        ctx.strokeRect((room.x - 1) * cellSize, (room.y - 1) * cellSize, cellSize * 3, cellSize * 3);
      });
      ctx.shadowBlur = 0; // Reset shadows

      // 2. Draw Maze Walls
      ctx.fillStyle = '#0f172a'; // dark wall block
      ctx.strokeStyle = '#312e81'; // neon dark indigo wall border
      ctx.lineWidth = 1;

      for (let r = 0; r < 19; r++) {
        for (let c = 0; c < 19; c++) {
          if (MAZE_GRID[r][c] === 1 && !isPortalCell(c, r)) {
            ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
            ctx.strokeRect(c * cellSize, r * cellSize, cellSize, cellSize);

            // Neon line borders for outer edges
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 1;
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
            ctx.strokeRect(c * cellSize, r * cellSize, cellSize, cellSize);
            ctx.shadowBlur = 0; // Reset
          }
        }
      }

      // 2.5 Draw Galaxy Portals
      const now = Date.now();
      PORTALS.forEach((portal) => {
        const px = portal.x * cellSize + cellSize / 2;
        const py = portal.y * cellSize + cellSize / 2;
        const baseAngle = (now / 600) % (Math.PI * 2);
        const radius = cellSize / 2;

        ctx.save();

        // Clip to circle so everything stays within the portal
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.clip();

        // Deep space background
        const bgGrad = ctx.createRadialGradient(px, py, 0, px, py, radius);
        bgGrad.addColorStop(0, '#0a0015');
        bgGrad.addColorStop(0.6, '#050010');
        bgGrad.addColorStop(1, '#000000');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2);

        // Nebula glow cloud (rotating colored haze)
        for (let layer = 0; layer < 3; layer++) {
          const layerAngle = baseAngle * (0.8 + layer * 0.3) + layer * 1.2;
          const nebulaGrad = ctx.createRadialGradient(
            px + Math.cos(layerAngle) * radius * 0.25,
            py + Math.sin(layerAngle) * radius * 0.25,
            0,
            px, py, radius * 0.9
          );
          const alpha = 0.12 + Math.sin(now / 400 + layer) * 0.04;
          nebulaGrad.addColorStop(0, portal.color + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
          nebulaGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = nebulaGrad;
          ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2);
        }

        // Spiral arms (galaxy shape)
        ctx.strokeStyle = portal.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        for (let arm = 0; arm < 2; arm++) {
          ctx.beginPath();
          for (let t = 0; t < 60; t++) {
            const tt = t / 60;
            const spiralR = tt * radius * 0.9;
            const spiralAngle = baseAngle + arm * Math.PI + tt * Math.PI * 3;
            const sx = px + Math.cos(spiralAngle) * spiralR;
            const sy = py + Math.sin(spiralAngle) * spiralR;
            if (t === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.stroke();
        }
        ctx.globalAlpha = 1;

        // Orbiting star particles
        const starCount = 18;
        for (let i = 0; i < starCount; i++) {
          const seed = i * 137.508; // golden angle spread
          const orbitR = (radius * 0.15) + ((i / starCount) * radius * 0.75);
          const speed = 0.0008 + (i % 5) * 0.0003;
          const starAngle = baseAngle * (1 + i * 0.05) + seed;
          const sx = px + Math.cos(starAngle) * orbitR;
          const sy = py + Math.sin(starAngle) * orbitR;
          const starSize = 0.6 + Math.sin(now * speed + seed) * 0.4;
          const brightness = 0.6 + Math.sin(now / 200 + seed) * 0.4;

          ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
          ctx.beginPath();
          ctx.arc(sx, sy, starSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // Bright galaxy core
        const coreGrad = ctx.createRadialGradient(px, py, 0, px, py, radius * 0.3);
        coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        coreGrad.addColorStop(0.3, portal.color + '66');
        coreGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(px, py, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore(); // un-clip

        // Outer ring glow
        ctx.save();
        ctx.shadowColor = portal.color;
        ctx.shadowBlur = 14;
        ctx.strokeStyle = portal.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, radius - 1, 0, Math.PI * 2);
        ctx.stroke();

        // Pulsing outer ring
        const pulse = 0.4 + Math.sin(now / 300) * 0.3;
        ctx.strokeStyle = portal.color + Math.floor(pulse * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(px, py, radius + 2 + Math.sin(now / 200) * 1.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();
      });

      // 2.6 Draw Teleport Laser Effect
      if (teleportEffectRef.current) {
        const { fromX, fromY, toX, toY, progress, maxFrames, color } = teleportEffectRef.current;
        const ratio = progress / maxFrames;

        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 4 * (1 - ratio);
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        // Glowing particles
        ctx.fillStyle = '#ffffff';
        const numParticles = 8;
        for (let i = 0; i < numParticles; i++) {
          const pRatio = (ratio + i / numParticles) % 1;
          const px = fromX + (toX - fromX) * pRatio;
          const py = fromY + (toY - fromY) * pRatio;
          ctx.beginPath();
          ctx.arc(px, py, 3 * (1 - ratio), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 3. Draw Room Words (Arabic connected text support)
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 18px Cairo';

      ROOMS.forEach((room) => {
        const textX = room.x * cellSize + cellSize / 2;
        const textY = room.y * cellSize + cellSize / 2;

        // Draw shadow/glow behind word
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 19px Cairo';
        ctx.fillText(words[room.id] || '', textX + 1, textY + 1);

        // Draw word text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Cairo';
        ctx.fillText(words[room.id] || '', textX, textY);
      });

      // 4. Draw Player
      const isInvincible = player.invincibleFrames > 0;
      // Flashing effect during invincibility
      if (!isInvincible || Math.floor(player.invincibleFrames / 5) % 2 === 0) {
        if (robotImageRef.current) {
          ctx.save();
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = isInvincible ? 15 : 6;
          const size = 26; // Fits nicely in 32x32 cell

          if (player.facingDir === 'left') {
            ctx.translate(player.x, player.y);
            ctx.scale(-1, 1);
            ctx.drawImage(
              robotImageRef.current,
              -size / 2,
              -size / 2,
              size,
              size
            );
          } else {
            ctx.drawImage(
              robotImageRef.current,
              player.x - size / 2,
              player.y - size / 2,
              size,
              size
            );
          }
          ctx.restore();
          ctx.shadowBlur = 0; // Reset
        } else {
          ctx.beginPath();
          ctx.arc(player.x, player.y, 11, 0, Math.PI * 2);
          ctx.fillStyle = '#fff01f';
          ctx.fill();
        }
      }

      // 5. Draw Monsters
      monsters.forEach((monster) => {
        const mx = monster.x;
        const my = monster.y;

        // Draw ghost dome body
        ctx.beginPath();
        ctx.arc(mx, my - 2, 10, Math.PI, 0, false); // top dome
        ctx.lineTo(mx + 10, my + 10);

        // Wavy bottom skirt
        ctx.lineTo(mx + 6, my + 7);
        ctx.lineTo(mx + 2, my + 10);
        ctx.lineTo(mx - 2, my + 7);
        ctx.lineTo(mx - 6, my + 10);
        ctx.lineTo(mx - 10, my + 7);

        ctx.closePath();
        ctx.fillStyle = monster.color;
        ctx.shadowColor = monster.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset

        // Draw white eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(mx - 4, my - 2, 3, 0, Math.PI * 2);
        ctx.arc(mx + 4, my - 2, 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw pupils looking in movement direction
        ctx.fillStyle = '#0000ff';
        let pupilDx = 0;
        let pupilDy = 0;

        let mDir = 'none';
        if (monster.targetX > monster.gridX) mDir = 'right';
        else if (monster.targetX < monster.gridX) mDir = 'left';
        else if (monster.targetY > monster.gridY) mDir = 'down';
        else if (monster.targetY < monster.gridY) mDir = 'up';

        if (mDir === 'up') pupilDy = -1.5;
        else if (mDir === 'down') pupilDy = 1.5;
        else if (mDir === 'left') pupilDx = -1.5;
        else if (mDir === 'right') pupilDx = 1.5;

        ctx.beginPath();
        ctx.arc(mx - 4 + pupilDx, my - 2 + pupilDy, 1.5, 0, Math.PI * 2);
        ctx.arc(mx + 4 + pupilDx, my - 2 + pupilDy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    };

    const runFrame = () => {
      updateGame();
      drawGame();
      animationId = requestAnimationFrame(runFrame);
    };

    runFrame();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPaused, lives, words, correctWord]);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      className="relative flex justify-center items-center w-full h-full aspect-square rounded-2xl overflow-hidden shadow-2xl bg-[#030712] border border-[#312e81] touch-none select-none"
    >
      <canvas
        ref={canvasRef}
        width={19 * cellSize * 2}
        height={19 * cellSize * 2}
        className="block max-w-full max-h-full h-auto"
        style={{ imageRendering: 'pixelated' }}
      />
      {joystick && (
        <div
          className="absolute pointer-events-none rounded-full flex items-center justify-center animate-fade-in"
          style={{
            left: joystick.startX - 50,
            top: joystick.startY - 50,
            width: 100,
            height: 100,
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '2px solid rgba(0, 240, 255, 0.3)',
            boxShadow: '0 0 15px rgba(0, 240, 255, 0.15)',
            zIndex: 50,
          }}
        >
          <div
            className="absolute rounded-full transition-transform duration-75"
            style={{
              width: 40,
              height: 40,
              backgroundColor: 'rgba(0, 240, 255, 0.8)',
              border: '2px solid #ffffff',
              boxShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
              transform: (() => {
                const dx = joystick.curX - joystick.startX;
                const dy = joystick.curY - joystick.startY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const maxDist = 30;
                if (dist === 0) return 'translate(0px, 0px)';

                const angle = Math.atan2(dy, dx);
                const limitDist = Math.min(dist, maxDist);
                const translateX = Math.cos(angle) * limitDist;
                const translateY = Math.sin(angle) * limitDist;
                return `translate(${translateX}px, ${translateY}px)`;
              })(),
            }}
          />
        </div>
      )}
    </div>
  );
};
