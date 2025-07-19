# Cipher Road

A Crossy Road clone built with React Three Fiber, featuring a cyberpunk-inspired owl character navigating through procedurally generated obstacles.

## Features

### Core Gameplay
- **3D Crossy Road clone** with React Three Fiber and Three.js
- **Procedural level generation** with cars, trucks, and forests
- **Progressive difficulty** that increases speed and vehicle density
- **Collision detection** with vehicles and trees
- **Score tracking** with persistent high score storage

### Controls
- **Arrow Keys** or **Touch Controls** for movement
- **Space** or **Escape** to pause/resume
- **Responsive mobile design** with larger touch targets

### Visual & Audio Features
- **3D Graphics** with shadows and lighting
- **Camera shake** effects on game over
- **Procedural sound effects** using Web Audio API
- **Smooth animations** and transitions
- **Particle effects** (planned)

### Quality of Life
- **Pause functionality** with overlay screen
- **High score persistence** using localStorage
- **Level indicator** showing current difficulty
- **Performance optimizations** with view frustum culling
- **Accessibility features** with ARIA labels and keyboard instructions

## Technical Architecture

### File Structure
```
dist/
├── index.html          # Main HTML file
├── style.css           # Styles and responsive design
├── script.js           # Main game logic and React components
├── constants.js        # Game configuration and constants
├── utils.js            # Utility functions and generators
├── sound.js            # Audio system and sound effects
└── particles.js        # Particle system (future enhancement)
```

### Key Components
- **Game Store** (Zustand) - Global state management
- **Map Store** (Zustand) - Level data and generation
- **Player System** - Movement, animation, and physics
- **Vehicle System** - Traffic generation and animation
- **Sound System** - Procedural audio feedback
- **Difficulty System** - Progressive challenge scaling

### Performance Optimizations
- **View Frustum Culling** - Hide distant vehicles
- **Efficient State Management** - Minimal re-renders
- **Optimized Animations** - Pause-aware frame loops
- **Memory Management** - Proper cleanup and pooling

## Development

### Local Setup
```bash
# Install dependencies (optional - currently uses CDN)
npm install

# Start development server
npm run dev
# or
python3 -m http.server 8000
```

### Configuration
Game settings can be modified in `constants.js`:
- Board dimensions and tile size
- Vehicle speeds and counts
- Difficulty progression rates
- Visual and audio settings

### Adding Features
The modular architecture makes it easy to add:
- New obstacle types
- Power-ups and collectibles
- Different character models
- Enhanced visual effects
- Multiplayer functionality

## Browser Compatibility
- Modern browsers with WebGL support
- Web Audio API for sound effects
- Touch events for mobile devices
- LocalStorage for high score persistence

## Credits
Built with:
- [React Three Fiber](https://github.com/pmndrs/react-three-fiber)
- [Three.js](https://threejs.org/)
- [Zustand](https://github.com/pmndrs/zustand)
- [React](https://reactjs.org/)

Inspired by the original Crossy Road game.
