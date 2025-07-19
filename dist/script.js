import React, { useRef, useEffect, useState } from "https://esm.sh/react";
import { createRoot } from "https://esm.sh/react-dom/client";
import { Canvas, useFrame, useThree } from "https://esm.sh/@react-three/fiber";
import { Bounds } from "https://esm.sh/@react-three/drei";
import * as THREE from "https://esm.sh/three";
import { create } from "https://esm.sh/zustand";
import { GAME_CONFIG, TILES_PER_ROW } from './constants.js';
import { generateRows, calculateFinalPosition, getDifficultyLevel, isMobileDevice, createSwipeDetector } from './utils.js';
import { soundSystem } from './sound.js';

// Mobile device auto-redirect (unless already on mobile page or forced)
if (typeof window !== 'undefined' && !window.FORCE_MOBILE_MODE) {
  const isMobile = isMobileDevice();
  const currentPath = window.location.pathname;
  
  // Redirect mobile users to mobile.html if not already there
  if (isMobile && !currentPath.includes('mobile.html')) {
    const currentUrl = new URL(window.location);
    currentUrl.pathname = currentUrl.pathname.replace(/\/[^\/]*$/, '/mobile.html');
    window.location.href = currentUrl.toString();
  }
}

const minTileIndex = GAME_CONFIG.MIN_TILE_INDEX;
const maxTileIndex = GAME_CONFIG.MAX_TILE_INDEX;
const tilesPerRow = TILES_PER_ROW;
const tileSize = GAME_CONFIG.TILE_SIZE;

const playerState = {
  currentRow: 0,
  currentTile: 0,
  movesQueue: [],
  ref: null };


function queueMove(direction) {
  const isValidMove = endsUpInValidPosition(
  { rowIndex: playerState.currentRow, tileIndex: playerState.currentTile },
  [...playerState.movesQueue, direction]);


  if (!isValidMove) return;

  playerState.movesQueue.push(direction);
}

function stepCompleted() {
  const direction = playerState.movesQueue.shift();

  if (direction === "forward") playerState.currentRow += 1;
  if (direction === "backward") playerState.currentRow -= 1;
  if (direction === "left") playerState.currentTile -= 1;
  if (direction === "right") playerState.currentTile += 1;

  // Play movement sound
  soundSystem.playMoveSound();

  // Add new rows if the player is running out of them
  if (playerState.currentRow === useMapStore.getState().rows.length - GAME_CONFIG.SAFE_ROWS_AHEAD) {
    useMapStore.getState().addRows();
  }

  const previousScore = useGameStore.getState().score;
  useGameStore.getState().updateScore(playerState.currentRow);
  
  // Play score sound if score increased
  if (playerState.currentRow > previousScore) {
    soundSystem.playScoreSound();
  }
}

function setPlayerRef(ref) {
  playerState.ref = ref;
}

function resetPlayerStore() {
  playerState.currentRow = 0;
  playerState.currentTile = 0;
  playerState.movesQueue = [];

  if (!playerState.ref) return;
  playerState.ref.position.x = 0;
  playerState.ref.position.y = 0;
  playerState.ref.children[0].rotation.z = 0;
}

const useGameStore = create(set => ({
  status: "running", // "running", "paused", "over"
  score: 0,
  highScore: parseInt(localStorage.getItem('cipher-road-high-score')) || 0,
  cameraShake: 0,
  updateScore: rowIndex => {
    set(state => {
      const newScore = Math.max(rowIndex, state.score);
      const newHighScore = Math.max(newScore, state.highScore);
      if (newHighScore > state.highScore) {
        localStorage.setItem('cipher-road-high-score', newHighScore.toString());
      }
      return { score: newScore, highScore: newHighScore };
    });
  },
  endGame: () => {
    soundSystem.playGameOverSound();
    set({ status: "over", cameraShake: 1 });
  },
  togglePause: () => {
    set(state => {
      const newStatus = state.status === "running" ? "paused" : 
                       state.status === "paused" ? "running" : state.status;
      if (newStatus === "paused") {
        soundSystem.playPauseSound();
      }
      return { status: newStatus };
    });
  },
  updateCameraShake: (value) => {
    set({ cameraShake: value });
  },
  reset: () => {
    useMapStore.getState().reset();
    resetPlayerStore();
    set({ status: "running", score: 0, cameraShake: 0 });
  } }));


const useMapStore = create(set => ({
  rows: generateRows(GAME_CONFIG.INITIAL_ROWS),
  addRows: () => {
    const currentRowCount = useMapStore.getState().rows.length;
    const newRows = generateRows(GAME_CONFIG.INITIAL_ROWS, currentRowCount);
    set(state => ({ rows: [...state.rows, ...newRows] }));
  },
  reset: () => set({ rows: generateRows(GAME_CONFIG.INITIAL_ROWS) })
}));


function Game() {
  return /*#__PURE__*/(
    React.createElement("div", { className: "game" }, /*#__PURE__*/
    React.createElement(Scene, null, /*#__PURE__*/
    React.createElement(Player, null), /*#__PURE__*/
    React.createElement(Map, null)), /*#__PURE__*/

    React.createElement(Score, null), /*#__PURE__*/
    React.createElement(Controls, null), /*#__PURE__*/
    React.createElement(PauseOverlay, null), /*#__PURE__*/
    React.createElement(Result, null)));


}

const Scene = ({ children }) => {
  return /*#__PURE__*/(
    React.createElement(Canvas, {
      orthographic: true,
      shadows: true,
      camera: {
        up: [0, 0, 1],
        position: [300, -300, 300] } }, /*#__PURE__*/


    React.createElement("ambientLight", null),
    children));


};

function Controls() {
  useEventListeners();
  const togglePause = useGameStore(state => state.togglePause);
  const status = useGameStore(state => state.status);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileInfo, setShowMobileInfo] = useState(false);

  useEffect(() => {
    const mobile = window.FORCE_MOBILE_MODE || isMobileDevice();
    setIsMobile(mobile);
    
    if (mobile) {
      // Show mobile info briefly when game loads
      setShowMobileInfo(true);
      const timer = setTimeout(() => setShowMobileInfo(false), 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleButtonPress = (direction) => {
    queueMove(direction);
    // Add haptic feedback on mobile if available
    if (isMobile && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  return /*#__PURE__*/(
    React.createElement(React.Fragment, null,
      // Mobile swipe zone
      isMobile && React.createElement(MobileSwipeZone, null),
      
      // Mobile info overlay
      isMobile && showMobileInfo && /*#__PURE__*/
      React.createElement("div", { className: "mobile-controls-info" },
        "Swipe to move or use buttons below", /*#__PURE__*/
        React.createElement("br", null),
        "Tap anywhere to dismiss"
      ),

      /*#__PURE__*/React.createElement("div", { 
        id: "controls",
        onClick: isMobile && showMobileInfo ? () => setShowMobileInfo(false) : undefined
      }, /*#__PURE__*/
      React.createElement("div", null, /*#__PURE__*/
      React.createElement("button", { 
        onClick: () => handleButtonPress("forward"), 
        "aria-label": "Move forward",
        style: isMobile ? { 
          background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
          border: '2px solid #ddd'
        } : {}
      }, "▲"), /*#__PURE__*/
      React.createElement("button", { 
        onClick: () => handleButtonPress("left"), 
        "aria-label": "Move left",
        style: isMobile ? { 
          background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
          border: '2px solid #ddd'
        } : {}
      }, "◀"), /*#__PURE__*/
      React.createElement("button", { 
        onClick: () => handleButtonPress("backward"), 
        "aria-label": "Move backward",
        style: isMobile ? { 
          background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
          border: '2px solid #ddd'
        } : {}
      }, "▼"), /*#__PURE__*/
      React.createElement("button", { 
        onClick: () => handleButtonPress("right"), 
        "aria-label": "Move right",
        style: isMobile ? { 
          background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
          border: '2px solid #ddd'
        } : {}
      }, "▶")), /*#__PURE__*/
      React.createElement("button", { 
        onClick: togglePause, 
        "aria-label": status === "paused" ? "Resume game" : "Pause game",
        style: { 
          marginTop: "10px", 
          padding: isMobile ? "15px 30px" : "10px 20px",
          backgroundColor: status === "paused" ? "#4CAF50" : "#f44336",
          color: "white",
          border: "none",
          borderRadius: isMobile ? "10px" : "5px",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: isMobile ? "16px" : "inherit"
        } 
      }, status === "paused" ? "Resume" : "Pause"),
      React.createElement("div", {
        style: {
          marginTop: "10px",
          fontSize: isMobile ? "10px" : "12px",
          color: "white",
          textAlign: "center",
          textShadow: "1px 1px 2px rgba(0,0,0,0.8)"
        }
      }, isMobile ? "Swipe or tap buttons • Tap pause" : "Use arrow keys or buttons • Space/Esc to pause"))
    )
  );
}

function MobileSwipeZone() {
  const gameRef = useRef(null);
  const status = useGameStore(state => state.status);

  useEffect(() => {
    if (!gameRef.current || status !== "running") return;

    const swipeDetector = createSwipeDetector(gameRef.current);
    
    swipeDetector.onSwipe((direction) => {
      if (status === "running") {
        queueMove(direction);
        // Add haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate(30);
        }
      }
    });

    return () => {
      swipeDetector.destroy();
    };
  }, [status]);

  return /*#__PURE__*/(
    React.createElement("div", { 
      ref: gameRef,
      className: "mobile-swipe-zone",
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        pointerEvents: status === "running" ? "auto" : "none"
      }
    })
  );
}

function Score() {
  const score = useGameStore(state => state.score);
  const level = getDifficultyLevel(score) + 1;

  return /*#__PURE__*/(
    React.createElement("div", { id: "score" }, 
      React.createElement("div", null, "Score: ", score),
      React.createElement("div", { style: { fontSize: "0.6em", marginTop: "5px" } }, "Level: ", level)
    )
  );
}

function PauseOverlay() {
  const status = useGameStore(state => state.status);
  const togglePause = useGameStore(state => state.togglePause);

  if (status !== "paused") return null;

  return /*#__PURE__*/(
    React.createElement("div", { id: "result-container" }, /*#__PURE__*/
    React.createElement("div", { id: "result" }, /*#__PURE__*/
    React.createElement("h1", null, "Game Paused"), /*#__PURE__*/
    React.createElement("p", null, "Press Space/Escape or click Resume to continue"), /*#__PURE__*/
    React.createElement("button", { onClick: togglePause }, "Resume"))));


}

function Result() {
  const status = useGameStore(state => state.status);
  const score = useGameStore(state => state.score);
  const highScore = useGameStore(state => state.highScore);
  const reset = useGameStore(state => state.reset);

  if (status !== "over") return null;

  const isNewHighScore = score === highScore && score > 0;

  return /*#__PURE__*/(
    React.createElement("div", { id: "result-container" }, /*#__PURE__*/
    React.createElement("div", { id: "result" }, /*#__PURE__*/
    React.createElement("h1", null, isNewHighScore ? "New High Score!" : "Game Over"), /*#__PURE__*/
    React.createElement("p", null, "Your score: ", score), /*#__PURE__*/
    React.createElement("p", null, "High score: ", highScore), /*#__PURE__*/
    React.createElement("button", { onClick: reset }, "Retry"))));



}

function Player() {
  const player = useRef(null);
  const lightRef = useRef(null);
  const camera = useThree(state => state.camera);
  const cameraShake = useGameStore(state => state.cameraShake);
  const updateCameraShake = useGameStore(state => state.updateCameraShake);

  usePlayerAnimation(player);

  // Camera shake effect
  useFrame(() => {
    if (!camera || cameraShake <= 0) return;
    
    const intensity = cameraShake * 20;
    camera.position.x += (Math.random() - 0.5) * intensity;
    camera.position.y += (Math.random() - 0.5) * intensity;
    camera.position.z += (Math.random() - 0.5) * intensity;
    
    // Gradually reduce shake
    updateCameraShake(Math.max(0, cameraShake - 0.05));
  });

  useEffect(() => {
    if (!player.current) return;
    if (!lightRef.current) return;

    // Attach the camera to the player
    player.current.add(camera);
    lightRef.current.target = player.current;

    // Set the player reference in the store
    setPlayerRef(player.current);
  });

  return /*#__PURE__*/(
    React.createElement(Bounds, { fit: true, clip: true, observe: true, margin: 10 }, /*#__PURE__*/
    React.createElement("group", { ref: player }, /*#__PURE__*/
      // This group contains all the parts of the owl character
      React.createElement("group", null,
        // Main Body
        React.createElement("mesh", { position: [0, 0, 8], castShadow: true, receiveShadow: true },
          React.createElement("boxGeometry", { args: [14, 14, 16] }),
          React.createElement("meshLambertMaterial", { color: 0x8B4513, flatShading: true })
        ),
        // Belly Patch
        React.createElement("mesh", { position: [0, 10.1, 7] },
            React.createElement("boxGeometry", { args: [14, 1, 12] }),
            React.createElement("meshBasicMaterial", { color: 0xD2B48C })
        ),
        // Wings
        React.createElement("mesh", { position: [-11, 0, 6], castShadow: true, receiveShadow: true },
            React.createElement("boxGeometry", { args: [3, 10, 12] }),
            React.createElement("meshLambertMaterial", { color: 0x8B4513, flatShading: true })
        ),
        React.createElement("mesh", { position: [11, 0, 6], castShadow: true, receiveShadow: true },
            React.createElement("boxGeometry", { args: [3, 10, 12] }),
            React.createElement("meshLambertMaterial", { color: 0x8B4513, flatShading: true })
        ),
        
        // --- Glasses & Eyes ---
        // Left Lens (white part)
        React.createElement("mesh", { position: [-5, 10.2, 11] },
          React.createElement("boxGeometry", { args: [6, 1, 6] }),
          React.createElement("meshBasicMaterial", { color: 0xffffff })
        ),
        // Right Lens (white part)
        React.createElement("mesh", { position: [5, 10.2, 11] },
          React.createElement("boxGeometry", { args: [6, 1, 6] }),
          React.createElement("meshBasicMaterial", { color: 0xffffff })
        ),
        // Left Frame - Top
        React.createElement("mesh", { position: [-5, 10.3, 14.5] },
          React.createElement("boxGeometry", { args: [8, 1.5, 1] }),
          React.createElement("meshBasicMaterial", { color: 0x333333 })
        ),
        // Left Frame - Bottom
        React.createElement("mesh", { position: [-5, 10.3, 7.5] },
          React.createElement("boxGeometry", { args: [8, 1.5, 1] }),
          React.createElement("meshBasicMaterial", { color: 0x333333 })
        ),
        // Left Frame - Side
        React.createElement("mesh", { position: [-9.5, 10.3, 11] },
          React.createElement("boxGeometry", { args: [1, 1.5, 8] }),
          React.createElement("meshBasicMaterial", { color: 0x333333 })
        ),
         // Right Frame - Top
        React.createElement("mesh", { position: [5, 10.3, 14.5] },
          React.createElement("boxGeometry", { args: [8, 1.5, 1] }),
          React.createElement("meshBasicMaterial", { color: 0x333333 })
        ),
        // Right Frame - Bottom
        React.createElement("mesh", { position: [5, 10.3, 7.5] },
          React.createElement("boxGeometry", { args: [8, 1.5, 1] }),
          React.createElement("meshBasicMaterial", { color: 0x333333 })
        ),
        // Right Frame - Side
        React.createElement("mesh", { position: [9.5, 10.3, 11] },
          React.createElement("boxGeometry", { args: [1, 1.5, 8] }),
          React.createElement("meshBasicMaterial", { color: 0x333333 })
        ),
        // Bridge
        React.createElement("mesh", { position: [0, 10.3, 11] },
          React.createElement("boxGeometry", { args: [3, 1.5, 2] }),
          React.createElement("meshBasicMaterial", { color: 0x333333 })
        ),
        // --- End Glasses & Eyes ---

        // Beak
        React.createElement("mesh", { position: [0, 10.5, 5] },
          React.createElement("coneGeometry", { args: [1.5, 3, 4] }),
          React.createElement("meshLambertMaterial", { color: 0xFFA500, flatShading: true })
        ),
        // Ear Tufts
        React.createElement("mesh", { position: [-6, 0, 17], "rotation-z": -0.5 },
          React.createElement("coneGeometry", { args: [2, 6, 4] }),
          React.createElement("meshLambertMaterial", { color: 0x8B4513, flatShading: true })
        ),
        React.createElement("mesh", { position: [6, 0, 17], "rotation-z": 0.5 },
          React.createElement("coneGeometry", { args: [2, 6, 4] }),
          React.createElement("meshLambertMaterial", { color: 0x8B4513, flatShading: true })
        ),
        // Legs
        React.createElement("mesh", { position: [-4, 8, -2], castShadow: true, receiveShadow: true },
            React.createElement("boxGeometry", { args: [3, 3, 4] }),
            React.createElement("meshLambertMaterial", { color: 0xFFA500, flatShading: true })
        ),
        React.createElement("mesh", { position: [4, 8, -2], castShadow: true, receiveShadow: true },
            React.createElement("boxGeometry", { args: [3, 3, 4] }),
            React.createElement("meshLambertMaterial", { color: 0xFFA500, flatShading: true })
        )
      ), /*#__PURE__*/
      React.createElement(DirectionalLight, { ref: lightRef })
    ))
  );
}

function DirectionalLight({ ref }) {
  return /*#__PURE__*/(
    React.createElement("directionalLight", {
      ref: ref,
      position: [-100, -100, 200],
      up: [0, 0, 1],
      castShadow: true,
      "shadow-mapSize": [2048, 2048],
      "shadow-camera-left": -400,
      "shadow-camera-right": 400,
      "shadow-camera-top": 400,
      "shadow-camera-bottom": -400,
      "shadow-camera-near": 50,
      "shadow-camera-far": 400 }));


}

function Map() {
  const rows = useMapStore(state => state.rows);

  return /*#__PURE__*/(
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement(Grass, { rowIndex: 0 }), /*#__PURE__*/
    React.createElement(Grass, { rowIndex: -1 }), /*#__PURE__*/
    React.createElement(Grass, { rowIndex: -2 }), /*#__PURE__*/
    React.createElement(Grass, { rowIndex: -3 }), /*#__PURE__*/
    React.createElement(Grass, { rowIndex: -4 }), /*#__PURE__*/
    React.createElement(Grass, { rowIndex: -5 }), /*#__PURE__*/
    React.createElement(Grass, { rowIndex: -6 }), /*#__PURE__*/
    React.createElement(Grass, { rowIndex: -7 }), /*#__PURE__*/
    React.createElement(Grass, { rowIndex: -8 }),

    rows.map((rowData, index) => /*#__PURE__*/
    React.createElement(Row, { key: index, rowIndex: index + 1, rowData: rowData }))));



}

function Row({ rowIndex, rowData }) {
  switch (rowData.type) {
    case "forest":{
        return /*#__PURE__*/React.createElement(Forest, { rowIndex: rowIndex, rowData: rowData });
      }
    case "car":{
        return /*#__PURE__*/React.createElement(CarLane, { rowIndex: rowIndex, rowData: rowData });
      }
    case "truck":{
        return /*#__PURE__*/React.createElement(TruckLane, { rowIndex: rowIndex, rowData: rowData });
      }}

}

function Forest({ rowIndex, rowData }) {
  return /*#__PURE__*/(
    React.createElement(Grass, { rowIndex: rowIndex },
    rowData.trees.map((tree, index) => /*#__PURE__*/
    React.createElement(Tree, { key: index, tileIndex: tree.tileIndex, height: tree.height }))));



}

function CarLane({ rowIndex, rowData }) {
  return /*#__PURE__*/(
    React.createElement(Road, { rowIndex: rowIndex },
    rowData.vehicles.map((vehicle, index) => /*#__PURE__*/
    React.createElement(Car, {
      key: index,
      rowIndex: rowIndex,
      initialTileIndex: vehicle.initialTileIndex,
      direction: rowData.direction,
      speed: rowData.speed,
      color: vehicle.color }))));




}

function TruckLane({ rowIndex, rowData }) {
  return /*#__PURE__*/(
    React.createElement(Road, { rowIndex: rowIndex },
    rowData.vehicles.map((vehicle, index) => /*#__PURE__*/
    React.createElement(Truck, {
      key: index,
      rowIndex: rowIndex,
      color: vehicle.color,
      initialTileIndex: vehicle.initialTileIndex,
      direction: rowData.direction,
      speed: rowData.speed }))));




}

function Grass({ rowIndex, children }) {
  return /*#__PURE__*/(
    React.createElement("group", { "position-y": rowIndex * tileSize }, /*#__PURE__*/
    React.createElement("mesh", { receiveShadow: true }, /*#__PURE__*/
    React.createElement("boxGeometry", { args: [tilesPerRow * tileSize, tileSize, 3] }), /*#__PURE__*/
    React.createElement("meshLambertMaterial", { color: 0xbaf455, flatShading: true })), /*#__PURE__*/

    React.createElement("mesh", { receiveShadow: true, "position-x": tilesPerRow * tileSize }, /*#__PURE__*/
    React.createElement("boxGeometry", { args: [tilesPerRow * tileSize, tileSize, 3] }), /*#__PURE__*/
    React.createElement("meshLambertMaterial", { color: 0x99c846, flatShading: true })), /*#__PURE__*/

    React.createElement("mesh", { receiveShadow: true, "position-x": -tilesPerRow * tileSize }, /*#__PURE__*/
    React.createElement("boxGeometry", { args: [tilesPerRow * tileSize, tileSize, 3] }), /*#__PURE__*/
    React.createElement("meshLambertMaterial", { color: 0x99c846, flatShading: true })),

    children));


}

function Road({ rowIndex, children }) {
  return /*#__PURE__*/(
    React.createElement("group", { "position-y": rowIndex * tileSize }, /*#__PURE__*/
    React.createElement("mesh", { receiveShadow: true }, /*#__PURE__*/
    React.createElement("planeGeometry", { args: [tilesPerRow * tileSize, tileSize] }), /*#__PURE__*/
    React.createElement("meshLambertMaterial", { color: 0x454a59, flatShading: true })), /*#__PURE__*/

    React.createElement("mesh", { receiveShadow: true, "position-x": tilesPerRow * tileSize }, /*#__PURE__*/
    React.createElement("planeGeometry", { args: [tilesPerRow * tileSize, tileSize] }), /*#__PURE__*/
    React.createElement("meshLambertMaterial", { color: 0x393d49, flatShading: true })), /*#__PURE__*/

    React.createElement("mesh", { receiveShadow: true, "position-x": -tilesPerRow * tileSize }, /*#__PURE__*/
    React.createElement("planeGeometry", { args: [tilesPerRow * tileSize, tileSize] }), /*#__PURE__*/
    React.createElement("meshLambertMaterial", { color: 0x393d49, flatShading: true })),

    children));


}

function Tree({ tileIndex, height }) {
  return /*#__PURE__*/(
    React.createElement("group", { "position-x": tileIndex * tileSize }, /*#__PURE__*/
    React.createElement("mesh", { "position-z": height / 2 + 20, castShadow: true, receiveShadow: true }, /*#__PURE__*/
    React.createElement("boxGeometry", { args: [30, 30, height] }), /*#__PURE__*/
    React.createElement("meshLambertMaterial", { color: 0x7aa21d, flatShading: true })), /*#__PURE__*/

    React.createElement("mesh", { "position-z": 10, castShadow: true, receiveShadow: true }, /*#__PURE__*/
    React.createElement("boxGeometry", { args: [15, 15, 20] }), /*#__PURE__*/
    React.createElement("meshLambertMaterial", { color: 0x4d2926, flatShading: true }))));



}

function Car({ rowIndex, initialTileIndex, direction, speed, color }) {
  const car = useRef(null);
  useVehicleAnimation(car, direction, speed);
  useHitDetection(car, rowIndex);

  return /*#__PURE__*/(
    React.createElement("group", {
      "position-x": initialTileIndex * tileSize,
      "rotation-z": direction ? 0 : Math.PI,
      ref: car }, /*#__PURE__*/

    React.createElement("mesh", { position: [0, 0, 12], castShadow: true, receiveShadow: true }, /*#__PURE__*/
    React.createElement("boxGeometry", { args: [60, 30, 15] }), /*#__PURE__*/
    React.createElement("meshLambertMaterial", { color: color, flatShading: true })), /*#__PURE__*/

    React.createElement("mesh", { position: [-6, 0, 25.5], castShadow: true, receiveShadow: true }, /*#__PURE__*/
    React.createElement("boxGeometry", { args: [33, 24, 12] }), /*#__PURE__*/
    React.createElement("meshLambertMaterial", { color: 0xffffff, flatShading: true })), /*#__PURE__*/

    React.createElement(Wheel, { x: -18 }), /*#__PURE__*/
    React.createElement(Wheel, { x: 18 })));


}

function Truck({ rowIndex, initialTileIndex, direction, speed, color }) {
  const truck = useRef(null);
  useVehicleAnimation(truck, direction, speed);
  useHitDetection(truck, rowIndex);

  return /*#__PURE__*/(
    React.createElement("group", {
      "position-x": initialTileIndex * tileSize,
      "rotation-z": direction ? 0 : Math.PI,
      ref: truck }, /*#__PURE__*/

    React.createElement("mesh", { position: [-15, 0, 25], castShadow: true, receiveShadow: true }, /*#__PURE__*/
    React.createElement("boxGeometry", { args: [70, 35, 35] }), /*#__PURE__*/
    React.createElement("meshLambertMaterial", { color: 0xb4c6fc, flatShading: true })), /*#__PURE__*/

    React.createElement("mesh", { position: [35, 0, 20], castShadow: true, receiveShadow: true }, /*#__PURE__*/
    React.createElement("boxGeometry", { args: [30, 30, 30] }), /*#__PURE__*/
    React.createElement("meshLambertMaterial", { color: color, flatShading: true })), /*#__PURE__*/

    React.createElement(Wheel, { x: -35 }), /*#__PURE__*/
    React.createElement(Wheel, { x: 5 }), /*#__PURE__*/
    React.createElement(Wheel, { x: 37 })));


}

function Wheel({ x }) {
  return /*#__PURE__*/(
    React.createElement("mesh", { position: [x, 0, 6] }, /*#__PURE__*/
    React.createElement("boxGeometry", { args: [12, 33, 12] }), /*#__PURE__*/
    React.createElement("meshLambertMaterial", { color: 0x333333, flatShading: true })));


}

function useVehicleAnimation(ref, direction, speed) {
  useFrame((state, delta) => {
    if (!ref.current) return;
    const status = useGameStore.getState().status;
    if (status !== "running") return; // Pause vehicles when game is paused
    
    const vehicle = ref.current;

    // Performance optimization: only animate vehicles near the player
    const distanceFromPlayer = Math.abs(vehicle.position.y - playerState.currentRow * tileSize);
    if (distanceFromPlayer > 5 * tileSize) {
      vehicle.visible = false;
      return;
    } else {
      vehicle.visible = true;
    }

    const beginningOfRow = (minTileIndex - 2) * tileSize;
    const endOfRow = (maxTileIndex + 2) * tileSize;

    if (direction) {
      vehicle.position.x =
      vehicle.position.x > endOfRow ?
      beginningOfRow :
      vehicle.position.x + speed * delta;
    } else {
      vehicle.position.x =
      vehicle.position.x < beginningOfRow ?
      endOfRow :
      vehicle.position.x - speed * delta;
    }
  });
}

function useEventListeners() {
  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        queueMove("forward");
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        queueMove("backward");
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        queueMove("left");
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        queueMove("right");
      } else if (event.key === " " || event.key === "Escape") {
        event.preventDefault();
        useGameStore.getState().togglePause();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
}

function usePlayerAnimation(ref) {
  const moveClock = new THREE.Clock(false);
  const status = useGameStore(state => state.status);

  useFrame(() => {
    if (!ref.current) return;
    if (status !== "running") return; // Pause movement when game is paused
    if (!playerState.movesQueue.length) return;
    const player = ref.current;

    if (!moveClock.running) moveClock.start();

    const stepTime = GAME_CONFIG.STEP_TIME;
    const progress = Math.min(1, moveClock.getElapsedTime() / stepTime);

    setPosition(player, progress);
    setRotation(player, progress);

    // Once a step has ended
    if (progress >= 1) {
      stepCompleted();
      moveClock.stop();
    }
  });
}

function setPosition(player, progress) {
  const startX = playerState.currentTile * tileSize;
  const startY = playerState.currentRow * tileSize;
  let endX = startX;
  let endY = startY;

  if (playerState.movesQueue[0] === "left") endX -= tileSize;
  if (playerState.movesQueue[0] === "right") endX += tileSize;
  if (playerState.movesQueue[0] === "forward") endY += tileSize;
  if (playerState.movesQueue[0] === "backward") endY -= tileSize;

  player.position.x = THREE.MathUtils.lerp(startX, endX, progress);
  player.position.y = THREE.MathUtils.lerp(startY, endY, progress);
  // Use constants for player height
  player.children[0].position.z = GAME_CONFIG.PLAYER_BASE_HEIGHT + Math.sin(progress * Math.PI) * GAME_CONFIG.PLAYER_JUMP_HEIGHT;
}

function setRotation(player, progress) {
  let endRotation = 0;
  if (playerState.movesQueue[0] == "forward") endRotation = 0;
  if (playerState.movesQueue[0] == "left") endRotation = Math.PI / 2;
  if (playerState.movesQueue[0] == "right") endRotation = -Math.PI / 2;
  if (playerState.movesQueue[0] == "backward") endRotation = Math.PI;

  player.children[0].rotation.z = THREE.MathUtils.lerp(
  player.children[0].rotation.z,
  endRotation,
  progress);

}

function endsUpInValidPosition(currentPosition, moves) {
  // Calculate where the player would end up after the move
  const finalPosition = calculateFinalPosition(currentPosition, moves);

  // Detect if we hit the edge of the board
  if (
  finalPosition.rowIndex === -1 ||
  finalPosition.tileIndex === minTileIndex - 1 ||
  finalPosition.tileIndex === maxTileIndex + 1)
  {
    // Invalid move, ignore move command
    return false;
  }

  // Detect if we hit a tree
  const finalRow = useMapStore.getState().rows[finalPosition.rowIndex - 1];
  if (
  finalRow &&
  finalRow.type === "forest" &&
  finalRow.trees.some(tree => tree.tileIndex === finalPosition.tileIndex))
  {
    // Invalid move, ignore move command
    return false;
  }

  return true;
}

function useHitDetection(vehicle, rowIndex) {
  const endGame = useGameStore(state => state.endGame);

  useFrame(() => {
    if (!vehicle.current) return;
    if (!playerState.ref) return;
    const status = useGameStore.getState().status;
    if (status !== "running") return; // Don't detect hits when paused

    if (
    rowIndex === playerState.currentRow ||
    rowIndex === playerState.currentRow + 1 ||
    rowIndex === playerState.currentRow - 1)
    {
      const vehicleBoundingBox = new THREE.Box3();
      vehicleBoundingBox.setFromObject(vehicle.current);

      const playerBoundingBox = new THREE.Box3();
      playerBoundingBox.setFromObject(playerState.ref);

      if (playerBoundingBox.intersectsBox(vehicleBoundingBox)) {
        endGame();
      }
    }
  });
}

const root = createRoot(document.getElementById("root"));
root.render( /*#__PURE__*/React.createElement(Game, null));
