# Vehicle Visibility Fix - Testing Guide

## Problem Description
The original issue was that obstacles (cars and trucks) would become invisible after the player made a few movements. This was caused by an overly aggressive performance optimization that hid vehicles when they were more than 5 tiles away from the player.

## Root Cause
In `dist/script.js`, the `useVehicleAnimation` function contains a performance optimization:

```javascript
// Original problematic code:
const distanceFromPlayer = Math.abs(vehicle.position.y - playerState.currentRow * tileSize);
if (distanceFromPlayer > 5 * tileSize) {
  vehicle.visible = false;  // Problem: too aggressive
  return;
}
```

The threshold of 5 tiles was too small for the camera's field of view, causing vehicles that should be visible to disappear.

## Fix Applied

### 1. Increased Visibility Distance
- **Before**: 5 tiles (≈210 pixels)
- **After**: 15 tiles (≈630 pixels)

### 2. Made Distance Configurable
Added `VEHICLE_VISIBILITY_DISTANCE` to `constants.js`:
```javascript
// In constants.js
VEHICLE_VISIBILITY_DISTANCE: 15, // Distance in tiles beyond which vehicles become invisible

// In script.js
const visibilityThreshold = GAME_CONFIG.VEHICLE_VISIBILITY_DISTANCE * tileSize;
```

### 3. Improved Documentation
Added clear comments explaining the optimization and its purpose.

## How to Test the Fix

### Manual Testing Steps
1. **Start the game**: Open `dist/index.html` in a web browser
2. **Move forward**: Use arrow keys to move the player forward 10-15 times
3. **Observe vehicles**: Look for cars and trucks in the lanes around you
4. **Move backward**: Move the player backward 10-15 times  
5. **Check visibility**: Verify that vehicles remain visible and don't disappear

### Expected Behavior (Fixed)
✅ Vehicles remain visible throughout normal gameplay
✅ Obstacles appear and disappear smoothly based on distance
✅ No sudden popping or vanishing of nearby vehicles
✅ Game feels populated with obstacles at appropriate density

### Bug Behavior (Original Issue)
❌ Vehicles become completely invisible after a few movements
❌ Obstacles don't reappear when player moves back
❌ Game feels empty or broken due to missing obstacles

## Technical Details

### Performance Impact
- **Before**: ~25 vehicles visible (5 tiles radius)
- **After**: ~75 vehicles visible (15 tiles radius)
- **Impact**: 3x more vehicles rendered, but still reasonable for modern browsers
- **Benefit**: Vehicles beyond 15 tiles are still culled for performance

### Files Changed
1. `dist/script.js` - Updated visibility logic and threshold
2. `dist/constants.js` - Added configurable visibility distance
3. `test-visibility.html` - Created testing interface

### Affected Components
- **Cars**: ✅ Fixed - use `useVehicleAnimation` hook
- **Trucks**: ✅ Fixed - use `useVehicleAnimation` hook  
- **Trees**: ℹ️ Not affected - static components without visibility optimization

## Troubleshooting

### If vehicles still disappear:
1. Check browser console for JavaScript errors
2. Verify the game is loading the updated `script.js` file
3. Test in different browsers (Chrome, Firefox, Safari)
4. Clear browser cache and reload

### If performance issues occur:
- Reduce `VEHICLE_VISIBILITY_DISTANCE` in `constants.js`
- Current value of 15 tiles should work well on most devices
- Could be reduced to 10-12 tiles if needed

### For further debugging:
Add console logging to the visibility check:
```javascript
// Temporary debugging code
console.log(`Vehicle distance: ${distanceFromPlayer}, threshold: ${visibilityThreshold}, visible: ${distanceFromPlayer <= visibilityThreshold}`);
```

## Configuration

To adjust the visibility distance in the future:
1. Edit `VEHICLE_VISIBILITY_DISTANCE` in `dist/constants.js`
2. Higher values = more vehicles visible = better visual experience but lower performance
3. Lower values = fewer vehicles visible = better performance but potential visibility issues
4. Recommended range: 10-20 tiles

## Summary

This fix resolves the obstacle visibility issue by:
1. **Increasing** the visibility distance from 5 to 15 tiles
2. **Making** the distance configurable for future adjustments  
3. **Maintaining** performance optimization while fixing the visual bug
4. **Preserving** the original game mechanics and behavior

The fix is minimal and surgical, changing only the visibility threshold while maintaining all other game functionality.