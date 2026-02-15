// Shared pointer target consumed by game.js each frame.
let mouseX = 0;
let mouseY = 0;

function initializeMouseControls(scene) {
  scene.input.on('pointermove', (pointer) => {
    mouseX = pointer.x;
    mouseY = pointer.y;
  });
}
