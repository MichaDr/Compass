// Global variables
let ball;
let walls;
let moveableWall;
let goal;
let gameWon = false;
let winText;
let loseText;
let controlModeText;
let fallIntoHole = false;
let cursors;


// Control mode
let useMouseControl = true;

// Physics constants
var TILT_MULTIPLIER = 400;
var MOUSE_FORCE = 0.9; 
const MAX_VELOCITY = 350;   
const BALL_BOUNCE = 0.3;    

// Preload function
function preload() {
    // Preloading function for Phaser
    // Add any assets that need to be preloaded here
}

function create() {
    const scene = this;

    // Create the ball
    ball = this.add.circle(50, 50, 15, 0x3498db);
    this.physics.add.existing(ball);
    ball.body.setCollideWorldBounds(true);
    ball.body.setBounce(BALL_BOUNCE);
    ball.body.setDamping(true);
    ball.body.setDrag(0.99);
    ball.body.setMaxVelocity(MAX_VELOCITY);
    
    walls = this.physics.add.staticGroup();
    
    createMaze.call(this);

    holes = this.physics.add.staticGroup();

    createHoles.call(this);

    moveableWall = this.add.rectangle(400, 300, 200, 20, 0xe74c3c);
    this.physics.add.existing(moveableWall);
    moveableWall.body.setImmovable(true);
    moveableWall.body.setAllowGravity(false);
 
    bounceWall = this.add.rectangle(250, 136, 10, 60, 0xe2ec70);
    this.physics.add.existing(bounceWall);
    bounceWall.body.setImmovable(true);
    bounceWall.body.setAllowGravity(false);   

    speedWall = this.add.rectangle(230, 560, 10, 90, 0x9b59b6);
    this.physics.add.existing(speedWall);
    speedWall.body.setImmovable(true);
    speedWall.body.setAllowGravity(false);

    goal = this.add.circle(770, 320, 20, 0x2ecc71);
    this.physics.add.existing(goal, true); 
    
    // Add collision detection
    this.physics.add.collider(ball, walls);
    this.physics.add.collider(ball, bounceWall, increaseBounce, null, this);
    this.physics.add.collider(ball, moveableWall, reachHole, null, this);
    this.physics.add.collider(ball, speedWall, increaseSpeed, null, this);
    this.physics.add.overlap(ball, holes, reachHole, null, this);
    this.physics.add.overlap(ball, goal, reachGoal, null, this);
    
    loseText = this.add.text(400, 300, 'You fell into a hole!', {
        fontSize: '32px',
        fill: '#e74c3c',
        stroke: '#000',
        strokeThickness: 6
    });
    loseText.setOrigin(0.5);
    loseText.setVisible(false);

    // Win text (hidden initially)
    winText = this.add.text(400, 300, 'YOU WIN!', {
        fontSize: '64px',
        fill: '#2ecc71',
        stroke: '#000',
        strokeThickness: 6
    });
    winText.setOrigin(0.5);
    winText.setVisible(false);
    
    // Control mode indicator (will be updated in initializeOrientation)
    controlModeText = this.add.text(400, 570, 'Control: Detecting...', {
        fontSize: '16px',
        fill: '#fff',
        backgroundColor: '#00000088',
        padding: { x: 8, y: 4 }
    });
    controlModeText.setOrigin(0.5);
    
    // Setup mouse/pointer controls
    initializeMouseControls(this);
    // Setup wall movement with keyboard
    cursors = this.input.keyboard.createCursorKeys();
    
    // Request device orientation permission (for iOS 13+)
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        // Create a button for iOS permission
        const permButton = this.add.text(400, 300, 'Tap to enable device motion', {
            fontSize: '24px',
            fill: '#fff',
            backgroundColor: '#3498db',
            padding: { x: 20, y: 10 }
        });
        permButton.setOrigin(0.5);
        permButton.setInteractive();
        
        permButton.on('pointerdown', () => {
            DeviceOrientationEvent.requestPermission()
                .then(response => {
                    if (response === 'granted') {
                        permButton.destroy();
                        initializeOrientation();
                    } else {
                        permButton.destroy();
                        useMouseControl = true;
                    }
                })
                .catch(() => {
                    permButton.destroy();
                    useMouseControl = true;
                });
        });
    } else {
        initializeOrientation();
    }
}

function createHoles() {
    const createHole = (x, y) => {
        const hole = this.add.rectangle(x, y, 20, 20, 0x34495e);
        holes.add(hole);
        hole.body.updateFromGameObject();
    };
    
    createHole(100, 30); // Hole 1
    createHole(300, 70); // Hole 2
    createHole(400, 30); // Hole 3

    createHole(460, 130); // Fake hole 1

    createHole(320, 210); // Hole 4
    createHole(110, 250); // Hole 5

    createHole(30, 260); // Hole 6
    createHole(30, 420); // Hole 7
    createHole(55, 200); // Fake Hole 2
    createHole(30, 485); // Hole 8

    createHole(170, 390)
    createHole(260, 490)
    createHole(330, 430)

    createHole(390, 200)
}


function createMaze() {
    const createWall = (x, y, width, height) => {
        const wall = this.add.rectangle(x, y, width, height, 0x34495e);
        walls.add(wall);
        wall.body.updateFromGameObject();
    };
    
    createWall(80, 0, 10, 200);  
    createWall(20, 170, 250, 10); 
  //  createWall(150, 145, 10, 100);

    createWall(240, 100, 180, 10);
    createWall(330, 80, 10, 50); 

    createWall(420, 30, 10, 70);
    createWall(460, 70, 80, 10);
    createWall(400, 180, 190, 10);
    createWall(500, 265, 10, 400);  

    createWall(245, 240, 110, 10);
    createWall(190, 300, 10, 120);
    createWall(120, 340, 140, 10);

    createWall(140, 440, 10, 200);
    createWall(37, 450, 70, 10);
    createWall(110, 545, 70, 10);

    
    createWall(360, 235, 10, 100);  // Vertical wall 3
    createWall(360, 400, 10, 100);  // Horizontal wall 2
    createWall(440, 300, 10, 100);  // Horizontal wall 3

    createWall(400, 350, 80, 10);  // Vertical wall 4

    createWall(600, 450, 200, 10);  // Horizontal wall 3
    createWall(800, 350, 160, 10);  // Small horizontal wall 2
    
    //ziel
    createWall(800, 250, 10, 500);  // Vertical wall 4
    createWall(740, 200, 10, 290);  // Vertical wall 4
}

function update() {
    if (gameWon) return;
    if (fallIntoHole) return;


    if (useMouseControl) {
        if (cursors.left.isDown && moveableWall.x > 100) {
            moveableWall.x -= 2;
            moveableWall.body.updateFromGameObject();
        } else if (cursors.right.isDown && moveableWall.x < 700) {
            moveableWall.x += 2;
            moveableWall.body.updateFromGameObject();
       }
    } else if (moveableWall.x > 100 && moveableWall.x < 700) {
            moveableWall.x -= gyroZ; 
            moveableWall.body.updateFromGameObject();
        } else if (moveableWall.x <= 100) {
            moveableWall.x = 100;
            moveableWall.body.updateFromGameObject();
        } else if (moveableWall.x >= 700) {
            moveableWall.x = 700;
            moveableWall.body.updateFromGameObject();
        }
    
    

    if (useMouseControl) {
        // Mouse control: move ball toward mouse position
        const dx = mouseX - ball.x;
        const dy = mouseY - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            // Normalize and apply force
            const accelX = (dx / distance) * distance * MOUSE_FORCE;
            const accelY = (dy / distance) * distance * MOUSE_FORCE;
            ball.body.setAcceleration(accelX, accelY);
        } else {
            ball.body.setAcceleration(0, 0);
        }
    } else {
        // Device orientation control
        // Beta: front-back tilt (negative = tilt forward, positive = tilt back)
        // Gamma: left-right tilt (negative = tilt left, positive = tilt right)
        
        const accelX = gyroX * TILT_MULTIPLIER;
        const accelY = gyroY * TILT_MULTIPLIER;
        
        // Apply acceleration to ball
        ball.body.setAcceleration(accelX, accelY);
    }
}




function reachHole() {
    if (!fallIntoHole) {
        fallIntoHole = true;
        ball.body.setVelocity(0, 0);
        ball.body.setAcceleration(0, 0);
        loseText.setVisible(true);
        
        setTimeout(() => {
            if (confirm('You fell into a hole! Try again?')) {
                location.reload();
            }
        }, 1000);
    }
}

function increaseBounce(ball) {
    ball.body.setBounce(BALL_BOUNCE * 2.5);
    ball.body.updateFromGameObject();
} 

function increaseSpeed(ball) {
    MOUSE_FORCE *= 1.2;
    TILT_MULTIPLIER *= 1.2;
    ball.body.updateFromGameObject();
}

function reachGoal() {
    if (!gameWon) {
        gameWon = true;
        ball.body.setVelocity(0, 0);
        ball.body.setAcceleration(0, 0);
        winText.setVisible(true);
        
        // Optional: Add a reset button or restart level
        setTimeout(() => {
            if (confirm('You won! Play again?')) {
                location.reload();
            }
        }, 1000);
    }
}
