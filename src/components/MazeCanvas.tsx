import React, { useEffect, useRef, useState, useMemo } from 'react';
import { gameAudio } from '../utils/audio';
import robotImg from '../assets/robot.png';
import robotSideImg from '../assets/robot-side.png';
import robotUpImg from '../assets/robot-up.png';
import robotDownImg from '../assets/robot-down.png';

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

// Warp Portals (Top <-> Bottom)
const WARP_PORTALS = [
  { x: 9, y: 1, targetX: 9, targetY: 16, exitDir: 'up', color: '#00f0ff' },
  { x: 9, y: 17, targetX: 9, targetY: 2, exitDir: 'down', color: '#ff007f' }
];

// Room Centers & Colors
const ROOMS = [
  { id: 0, x: 2, y: 2, label: 'أعلى اليسار', color: '#39ff14', glow: 'rgba(57, 255, 20, 0.15)' }, // TL
  { id: 1, x: 16, y: 2, label: 'أعلى اليمين', color: '#bd00ff', glow: 'rgba(189, 0, 255, 0.15)' }, // TR
  { id: 2, x: 2, y: 16, label: 'أسفل اليسار', color: '#ff5f00', glow: 'rgba(255, 95, 0, 0.15)' }, // BL
  { id: 3, x: 16, y: 16, label: 'أسفل اليمين', color: '#ff007f', glow: 'rgba(255, 0, 127, 0.15)' } // BR
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
  const numWords = words.length;

  const activeRooms = useMemo(() => ROOMS.filter(r => r.id < numWords), [numWords]);
  const cagedRooms = useMemo(() => ROOMS.filter(r => r.id >= numWords), [numWords]);


  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const robotImageRef = useRef<HTMLImageElement | null>(null);
  const robotSideRef = useRef<HTMLImageElement | null>(null);
  const robotUpRef = useRef<HTMLImageElement | null>(null);
  const robotDownRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = robotImg;
    img.onload = () => robotImageRef.current = img;

    const sideImg = new Image();
    sideImg.src = robotSideImg;
    sideImg.onload = () => robotSideRef.current = sideImg;

    const upImg = new Image();
    upImg.src = robotUpImg;
    upImg.onload = () => robotUpRef.current = upImg;

    const downImg = new Image();
    downImg.src = robotDownImg;
    downImg.onload = () => robotDownRef.current = downImg;
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
  const cameraRef = useRef({ x: 9 * 32 + 16, y: 9 * 32 + 16, zoom: 1.8 });
  const celebrationRef = useRef<{ active: boolean, progress: number } | null>(null);


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
      zoom: 1.8
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



  const isWalkable = (gx: number, gy: number): boolean => {
    if (gx < 0 || gx >= 19 || gy < 0 || gy >= 19) return false;
    
    // Check if inside a caged room (3x3 area + portal entrance)
    for (const room of cagedRooms) {
      if (Math.abs(gx - room.x) <= 1 && Math.abs(gy - room.y) <= 1) return false;

    }


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



        const desiredDir = getDesiredDirection();
        let dX = 0;
        let dY = 0;

        if (desiredDir) {
          if (desiredDir === 'up' && isWalkable(player.gridX, player.gridY - 1)) {
            dY = -1;
            player.facingDir = 'up';
          }
          else if (desiredDir === 'down' && isWalkable(player.gridX, player.gridY + 1)) {
            dY = 1;
            player.facingDir = 'down';
          }
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
      const camLerp = 0.1;
      camera.x += (player.x - camera.x) * camLerp;
      camera.y += (player.y - camera.y) * camLerp;

      const zoom = camera.zoom;
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
      activeRooms.forEach((room) => {
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
            if (!celebrationRef.current) {
              celebrationRef.current = { active: true, progress: 0 };
              gameAudio.playTeleport(); // Play some sound for success
            }
          } else {
            gameAudio.playWrong();
            onWrong(wordInRoom);
            
            // Teleport back to center on wrong answer
            player.x = 9 * cellSize + cellSize / 2;
            player.y = 9 * cellSize + cellSize / 2;
            player.gridX = 9;
            player.gridY = 9;
            player.targetX = 9;
            player.targetY = 9;
            player.dir = 'down';
            player.nextDir = 'down';
            
            // Give some invincibility frames so they aren't instantly killed if a monster is at the center
            player.invincibleFrames = Math.max(player.invincibleFrames, 60);
          }
        }
      });


    };

    const drawGame = () => {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.scale(2, 2);
      const zoom = cameraRef.current.zoom;
      ctx.translate((19 * cellSize) / 2, (19 * cellSize) / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-cameraRef.current.x, -cameraRef.current.y);

      // 0.5 Draw Sci-Fi Floor Grid
      ctx.strokeStyle = 'rgba(255, 150, 0, 0.15)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 19; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, 19 * cellSize);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(19 * cellSize, i * cellSize);
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(255, 150, 0, 0.8)';
      ctx.shadowColor = '#ff9600';
      ctx.shadowBlur = 4;
      for (let r = 0; r <= 19; r++) {
        for (let c = 0; c <= 19; c++) {
           ctx.beginPath();
           ctx.arc(c * cellSize, r * cellSize, 1.5, 0, Math.PI * 2);
           ctx.fill();
        }
      }
      ctx.shadowBlur = 0;

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
      for (let r = 0; r < 19; r++) {
        for (let c = 0; c < 19; c++) {
          let isWall = MAZE_GRID[r][c] === 1;

          // Dynamically turn caged rooms into walls
          for (const room of cagedRooms) {
            if (Math.abs(c - room.x) <= 1 && Math.abs(r - room.y) <= 1) isWall = true;

          }

          if (isWall) {
            const x = c * cellSize;
            const y = r * cellSize;
            
            // Base wall (dark blue metallic)
            ctx.fillStyle = '#0a192f'; 
            ctx.fillRect(x, y, cellSize, cellSize);
            
            // Inner raised panel
            ctx.fillStyle = '#112240'; 
            ctx.fillRect(x + 3, y + 3, cellSize - 6, cellSize - 6);

            // Sci-fi borders
            ctx.strokeStyle = '#1e3a8a';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, cellSize, cellSize);

            // Neon blue corner highlights
            ctx.strokeStyle = '#00f0ff';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 5;
            
            // Top left corner highlight
            ctx.beginPath();
            ctx.moveTo(x + 6, y + 1);
            ctx.lineTo(x + 1, y + 1);
            ctx.lineTo(x + 1, y + 6);
            ctx.stroke();

            // Bottom right corner highlight
            ctx.beginPath();
            ctx.moveTo(x + cellSize - 6, y + cellSize - 1);
            ctx.lineTo(x + cellSize - 1, y + cellSize - 1);
            ctx.lineTo(x + cellSize - 1, y + cellSize - 6);
            ctx.stroke();

            // Occasional bright neon accents on panels
            if ((r * 13 + c * 7) % 11 === 0) {
              ctx.shadowBlur = 8;
              ctx.fillStyle = '#00f0ff';
              ctx.fillRect(x + cellSize/2 - 3, y + 3, 6, 2);
            }

            ctx.shadowBlur = 0; // Reset
          }
        }
      }

      // 2.5 Draw Warp Portals
      const now = Date.now();
      WARP_PORTALS.forEach((portal) => {
        const px = portal.x * cellSize + cellSize / 2;
        const py = portal.y * cellSize + cellSize / 2;
        const baseAngle = (now / 600) % (Math.PI * 2);
        const radius = cellSize / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.clip();

        ctx.fillStyle = '#050a1f';
        ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2);

        for (let layer = 1; layer <= 2; layer++) {
          const layerAngle = baseAngle * (layer % 2 === 0 ? 1 : -1) / layer;
          const nebulaGrad = ctx.createRadialGradient(
            px + Math.cos(layerAngle) * radius * 0.25,
            py + Math.sin(layerAngle) * radius * 0.25,
            0,
            px, py, radius * 0.9
          );
          const alpha = 0.15 + Math.sin(now / 400 + layer) * 0.05;
          nebulaGrad.addColorStop(0, portal.color + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
          nebulaGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = nebulaGrad;
          ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2);
        }

        ctx.strokeStyle = portal.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.6;
        for (let arm = 0; arm < 2; arm++) {
          ctx.beginPath();
          for (let t = 0; t < 40; t++) {
            const angle = baseAngle * 2 + (arm * Math.PI) + (t * 0.15);
            const r = (t / 40) * radius;
            const x = px + Math.cos(angle) * r;
            const y = py + Math.sin(angle) * r;
            if (t === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        ctx.restore();

        ctx.save();
        ctx.shadowColor = portal.color;
        ctx.shadowBlur = 10;
        ctx.strokeStyle = portal.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, radius - 1, 0, Math.PI * 2);
        ctx.stroke();

        const pulse = 0.5 + Math.sin(now / 300) * 0.3;
        ctx.strokeStyle = portal.color + Math.floor(pulse * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(px, py, radius + 2 + Math.sin(now / 200) * 1.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // 3. Draw Room Words (Arabic connected text support)
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 18px Cairo';

      // Room colored floor glow
      activeRooms.forEach((room) => {
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
        
        // Select the correct image based on direction
        let currentImg = robotDownRef.current; // Default to facing camera
        let flipHorizontal = false;

        if (player.facingDir === 'up') {
          currentImg = robotUpRef.current;
        } else if (player.facingDir === 'down') {
          currentImg = robotDownRef.current;
        } else if (player.facingDir === 'left') {
          currentImg = robotSideRef.current;
          flipHorizontal = true; // Side image faces right by default
        } else if (player.facingDir === 'right') {
          currentImg = robotSideRef.current;
        }

        // Fallback to original image if directional ones didn't load
        if (!currentImg) currentImg = robotImageRef.current;

        if (currentImg) {
          ctx.save();
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = isInvincible ? 15 : 6;
          const size = 26; // Fits nicely in 32x32 cell

          if (flipHorizontal) {
            ctx.translate(player.x, player.y);
            ctx.scale(-1, 1);
            ctx.drawImage(
              currentImg,
              -size / 2,
              -size / 2,
              size,
              size
            );
          } else {
            ctx.drawImage(
              currentImg,
              player.x - size / 2,
              player.y - size / 2,
              size,
              size
            );
          }
          ctx.restore();
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
      if (celebrationRef.current) {
        celebrationRef.current.progress++;
        const p = celebrationRef.current.progress;
        const maxFrames = 75; // 1.25 seconds of celebration zoom
        const ratio = Math.min(p / maxFrames, 1);
        
        // Easing cubic out
        const easeRatio = 1 - Math.pow(1 - ratio, 3);
        cameraRef.current.zoom = 1.8 + (6.0 - 1.8) * easeRatio;
        
        // Pull camera heavily towards player during zoom
        const player = playerRef.current;
        cameraRef.current.x += (player.x - cameraRef.current.x) * 0.15;
        cameraRef.current.y += (player.y - cameraRef.current.y) * 0.15;
        
        if (p >= maxFrames) {
          celebrationRef.current = null;
          cameraRef.current.zoom = 1.8; // reset
          onCorrect();
        }
      } else {
        updateGame();
      }
      
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
      className="relative flex justify-center items-center rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,240,255,0.15)] bg-[#030712] border-2 border-[#1e3a8a]/50 touch-none select-none"
      style={{
        aspectRatio: '1/1',
        width: '100%',
        height: 'auto',
        maxWidth: '100%',
        maxHeight: '100%'
      }}
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
