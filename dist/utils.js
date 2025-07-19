import { GAME_CONFIG, ROW_TYPES } from './constants.js';
import * as THREE from "https://esm.sh/three";

// Utility function to get random element from array
export function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Generate multiple rows with progressive difficulty
export function generateRows(amount, startingRow = 0) {
  const rows = [];
  for (let i = 0; i < amount; i++) {
    const currentRow = startingRow + i;
    const difficultyLevel = getDifficultyLevel(currentRow);
    const rowData = generateRow(difficultyLevel);
    rows.push(rowData);
  }
  return rows;
}

// Generate a single row with difficulty
export function generateRow(difficultyLevel = 0) {
  const type = randomElement(ROW_TYPES);
  if (type === "car") return generateCarLaneMetadata(difficultyLevel);
  if (type === "truck") return generateTruckLaneMetadata(difficultyLevel);
  return generateForestMetadata();
}

// Generate forest row metadata
export function generateForestMetadata() {
  const occupiedTiles = new Set();
  const trees = Array.from({ length: GAME_CONFIG.TREES_PER_FOREST }, () => {
    let tileIndex;
    do {
      tileIndex = THREE.MathUtils.randInt(GAME_CONFIG.MIN_TILE_INDEX, GAME_CONFIG.MAX_TILE_INDEX);
    } while (occupiedTiles.has(tileIndex));
    occupiedTiles.add(tileIndex);

    const height = randomElement(GAME_CONFIG.TREE_HEIGHTS);

    return { tileIndex, height };
  });

  return { type: "forest", trees };
}

// Calculate difficulty level based on current score
export function getDifficultyLevel(score) {
  return Math.floor(score / GAME_CONFIG.DIFFICULTY.LEVEL_UP_EVERY_ROWS);
}

// Get adjusted speed based on difficulty
export function getAdjustedSpeed(baseSpeed, difficultyLevel) {
  const speedIncrease = difficultyLevel * GAME_CONFIG.DIFFICULTY.SPEED_INCREASE_PER_LEVEL;
  const multiplier = Math.min(
    1 + speedIncrease / 100,
    GAME_CONFIG.DIFFICULTY.MAX_SPEED_MULTIPLIER
  );
  return baseSpeed * multiplier;
}

// Get vehicle count based on difficulty
export function getVehicleCount(baseCount, difficultyLevel) {
  const additionalVehicles = Math.floor(difficultyLevel / 2);
  return Math.min(
    baseCount + additionalVehicles,
    GAME_CONFIG.DIFFICULTY.MAX_VEHICLES_PER_LANE
  );
}

// Generate car lane metadata with difficulty
export function generateCarLaneMetadata(difficultyLevel = 0) {
  const direction = randomElement([true, false]);
  const baseSpeed = randomElement(GAME_CONFIG.VEHICLE_SPEEDS);
  const speed = getAdjustedSpeed(baseSpeed, difficultyLevel);
  const vehicleCount = getVehicleCount(GAME_CONFIG.CARS_PER_LANE, difficultyLevel);

  const occupiedTiles = new Set();

  const vehicles = Array.from({ length: vehicleCount }, () => {
    let initialTileIndex;
    do {
      initialTileIndex = THREE.MathUtils.randInt(GAME_CONFIG.MIN_TILE_INDEX, GAME_CONFIG.MAX_TILE_INDEX);
    } while (occupiedTiles.has(initialTileIndex));
    occupiedTiles.add(initialTileIndex - 1);
    occupiedTiles.add(initialTileIndex);
    occupiedTiles.add(initialTileIndex + 1);

    const color = randomElement(GAME_CONFIG.COLORS.VEHICLE_COLORS);

    return { initialTileIndex, color };
  });

  return { type: "car", direction, speed, vehicles };
}

// Generate truck lane metadata with difficulty
export function generateTruckLaneMetadata(difficultyLevel = 0) {
  const direction = randomElement([true, false]);
  const baseSpeed = randomElement(GAME_CONFIG.VEHICLE_SPEEDS);
  const speed = getAdjustedSpeed(baseSpeed, difficultyLevel);
  const vehicleCount = Math.max(
    GAME_CONFIG.DIFFICULTY.MIN_VEHICLES_PER_LANE,
    getVehicleCount(GAME_CONFIG.TRUCKS_PER_LANE, difficultyLevel)
  );

  const occupiedTiles = new Set();

  const vehicles = Array.from({ length: vehicleCount }, () => {
    let initialTileIndex;
    do {
      initialTileIndex = THREE.MathUtils.randInt(GAME_CONFIG.MIN_TILE_INDEX, GAME_CONFIG.MAX_TILE_INDEX);
    } while (occupiedTiles.has(initialTileIndex));
    occupiedTiles.add(initialTileIndex - 2);
    occupiedTiles.add(initialTileIndex - 1);
    occupiedTiles.add(initialTileIndex);
    occupiedTiles.add(initialTileIndex + 1);
    occupiedTiles.add(initialTileIndex + 2);

    const color = randomElement(GAME_CONFIG.COLORS.VEHICLE_COLORS);

    return { initialTileIndex, color };
  });

  return { type: "truck", direction, speed, vehicles };
}

// Calculate final position after a series of moves
export function calculateFinalPosition(currentPosition, moves) {
  return moves.reduce((position, direction) => {
    if (direction === "forward")
      return {
        rowIndex: position.rowIndex + 1,
        tileIndex: position.tileIndex
      };

    if (direction === "backward")
      return {
        rowIndex: position.rowIndex - 1,
        tileIndex: position.tileIndex
      };

    if (direction === "left")
      return {
        rowIndex: position.rowIndex,
        tileIndex: position.tileIndex - 1
      };

    if (direction === "right")
      return {
        rowIndex: position.rowIndex,
        tileIndex: position.tileIndex + 1
      };

    return position;
  }, currentPosition);
}

// Mobile device detection
export function isMobileDevice() {
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
  const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768;
  
  return isMobileUA || (isTouchDevice && isSmallScreen);
}

// Touch gesture detection utilities
export function createSwipeDetector(element, threshold = 50) {
  let startX = 0;
  let startY = 0;
  let startTime = 0;
  
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    startTime = Date.now();
  };
  
  const handleTouchEnd = (e) => {
    if (!startX || !startY) return;
    
    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    const deltaTime = Date.now() - startTime;
    
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    
    // Only process quick swipes (under 300ms)
    if (deltaTime > 300) return;
    
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    // Determine swipe direction
    if (absDeltaX > absDeltaY && absDeltaX > threshold) {
      return deltaX > 0 ? 'right' : 'left';
    } else if (absDeltaY > absDeltaX && absDeltaY > threshold) {
      return deltaY > 0 ? 'backward' : 'forward';
    }
    
    return null;
  };
  
  element.addEventListener('touchstart', handleTouchStart, { passive: true });
  element.addEventListener('touchend', handleTouchEnd, { passive: true });
  
  return {
    destroy: () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    },
    onSwipe: (callback) => {
      const originalTouchEnd = handleTouchEnd;
      element.removeEventListener('touchend', originalTouchEnd);
      
      const newTouchEnd = (e) => {
        const direction = originalTouchEnd(e);
        if (direction && callback) {
          callback(direction);
        }
      };
      
      element.addEventListener('touchend', newTouchEnd, { passive: true });
    }
  };
}