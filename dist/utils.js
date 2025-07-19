import { GAME_CONFIG, ROW_TYPES } from './constants.js';
import * as THREE from "https://esm.sh/three";

// Utility function to get random element from array
export function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Generate multiple rows
export function generateRows(amount) {
  const rows = [];
  for (let i = 0; i < amount; i++) {
    const rowData = generateRow();
    rows.push(rowData);
  }
  return rows;
}

// Generate a single row
export function generateRow() {
  const type = randomElement(ROW_TYPES);
  if (type === "car") return generateCarLaneMetadata();
  if (type === "truck") return generateTruckLaneMetadata();
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

// Generate car lane metadata
export function generateCarLaneMetadata() {
  const direction = randomElement([true, false]);
  const speed = randomElement(GAME_CONFIG.VEHICLE_SPEEDS);

  const occupiedTiles = new Set();

  const vehicles = Array.from({ length: GAME_CONFIG.CARS_PER_LANE }, () => {
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

// Generate truck lane metadata
export function generateTruckLaneMetadata() {
  const direction = randomElement([true, false]);
  const speed = randomElement(GAME_CONFIG.VEHICLE_SPEEDS);

  const occupiedTiles = new Set();

  const vehicles = Array.from({ length: GAME_CONFIG.TRUCKS_PER_LANE }, () => {
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