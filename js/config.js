// Phaser boot configuration; scene callbacks are defined in game.js.
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update  
    }
};

// Start the game only after scripts defining preload/create/update are loaded.
var game = new Phaser.Game(config);
