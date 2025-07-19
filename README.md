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
- **Mobile Features**:
  - Automatic mobile detection and redirect to optimized version
  - Full-screen swipe gestures for movement (swipe up/down/left/right)
  - Enhanced touch buttons with haptic feedback
  - Larger touch targets and improved spacing
  - Mobile-specific UI optimizations

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
├── index.html          # Main HTML file (desktop) with mobile redirect
├── mobile.html         # Mobile-optimized version
├── style.css           # Styles and responsive design
├── script.js           # Main game logic and React components
├── constants.js        # Game configuration and constants
├── utils.js            # Utility functions and mobile detection
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
- **Mobile System** - Touch controls and swipe detection

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

## Mobile Experience

### Automatic Detection & Redirect
- Mobile devices are automatically detected and redirected to `mobile.html`
- Optimized mobile interface loads with enhanced controls

### Enhanced Mobile Controls
- **Swipe Gestures**: Full-screen swipe detection for movement
  - Swipe up: Move forward
  - Swipe down: Move backward  
  - Swipe left: Move left
  - Swipe right: Move right
- **Touch Buttons**: Larger, more responsive control buttons
- **Haptic Feedback**: Vibration feedback on supported devices
- **Visual Feedback**: Enhanced button animations and states

### Mobile Optimizations
- **Larger Touch Targets**: 90x70px buttons with 15px spacing
- **Improved Layout**: Fixed controls positioning for thumb navigation
- **Touch Prevention**: Disabled zoom, text selection, and unwanted scrolling
- **Performance**: Mobile-specific optimizations and reduced resource usage

## Browser Compatibility
- Modern browsers with WebGL support
- Web Audio API for sound effects
- Touch events for mobile devices
- LocalStorage for high score persistence

## Screenshot Description

The provided screenshot shows a blank white page, which represents the game's loading state when external CDN resources (React, Three.js, React Three Fiber, Zustand) are blocked or fail to load. This typically occurs in restricted network environments or when CDN services are unavailable. In normal operation, this page would display the 3D Crossy Road game with a cyberpunk-themed owl character navigating through procedurally generated obstacles.

## Credits
Built with:
- [React Three Fiber](https://github.com/pmndrs/react-three-fiber)
- [Three.js](https://threejs.org/)
- [Zustand](https://github.com/pmndrs/zustand)
- [React](https://reactjs.org/)

Inspired by the original Crossy Road game.
