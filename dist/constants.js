// Game configuration constants
export const GAME_CONFIG = {
  // Board dimensions
  MIN_TILE_INDEX: -8,
  MAX_TILE_INDEX: 8,
  TILE_SIZE: 42,
  
  // Game mechanics
  STEP_TIME: 0.2, // Seconds it takes to take a step
  PLAYER_JUMP_HEIGHT: 8,
  PLAYER_BASE_HEIGHT: 10,
  
  // Row generation
  INITIAL_ROWS: 20,
  SAFE_ROWS_AHEAD: 10, // Add new rows when player is this close to the end
  
  // Performance optimization
  VEHICLE_VISIBILITY_DISTANCE: 15, // Distance in tiles beyond which vehicles become invisible
  
  // Vehicle speeds (pixels per second)
  VEHICLE_SPEEDS: [125, 156, 188],
  
  // Difficulty progression
  DIFFICULTY: {
    SPEED_INCREASE_PER_LEVEL: 20,
    LEVEL_UP_EVERY_ROWS: 10,
    MAX_SPEED_MULTIPLIER: 2.5,
    MIN_VEHICLES_PER_LANE: 2,
    MAX_VEHICLES_PER_LANE: 5
  },
  
  // Forest generation
  TREES_PER_FOREST: 4,
  TREE_HEIGHTS: [20, 45, 60],
  
  // Vehicle generation
  CARS_PER_LANE: 3,
  TRUCKS_PER_LANE: 2,
  
  // Colors
  COLORS: {
    GRASS_PRIMARY: 0xbaf455,
    GRASS_SECONDARY: 0x99c846,
    ROAD_PRIMARY: 0x454a59,
    ROAD_SECONDARY: 0x393d49,
    TREE_FOLIAGE: 0x7aa21d,
    TREE_TRUNK: 0x4d2926,
    VEHICLE_COLORS: [0xa52523, 0xbdb638, 0x78b14b],
    PLAYER_BROWN: 0x8B4513,
    PLAYER_BELLY: 0xD2B48C,
    PLAYER_BEAK: 0xFFA500,
    PLAYER_LEGS: 0xFFA500,
    GLASSES_FRAME: 0x333333,
    GLASSES_LENS: 0xffffff,
    TRUCK_CARGO: 0xb4c6fc,
    WHEEL_COLOR: 0x333333,
    CAR_WINDOW: 0xffffff
  },
  
  // Camera settings
  CAMERA: {
    POSITION: [300, -300, 300],
    UP: [0, 0, 1]
  },
  
  // Lighting
  LIGHT: {
    POSITION: [-100, -100, 200],
    SHADOW_MAP_SIZE: [2048, 2048],
    SHADOW_CAMERA: {
      LEFT: -400,
      RIGHT: 400,
      TOP: 400,
      BOTTOM: -400,
      NEAR: 50,
      FAR: 400
    }
  }
};

// Derived constants
export const TILES_PER_ROW = GAME_CONFIG.MAX_TILE_INDEX - GAME_CONFIG.MIN_TILE_INDEX + 1;

// Row types for generation
export const ROW_TYPES = ["car", "truck", "forest"];