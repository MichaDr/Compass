Ball-in-a-maze browser game built with Phaser 3.

## Controls
- Uses device orientation when supported and permission is granted.
- Falls back to mouse control when orientation data is unavailable.
- Arrow keys move the dynamic wall pair.

## Notes
- Physics and scene logic are in `js/game.js`.
- Input adapters are split into `js/sensor.js` and `js/mouseControls.js`.
