// Global variables
let ball;
let walls;
let goal;
let gameWon = false;
let winText;
let loseText;
let controlModeText;
let fallIntoHole = false;


// Control mode
let useMouseControl = true;

// Physics constants
const TILT_MULTIPLIER = 400;
const MOUSE_FORCE = 0.9; 
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

    this.wall = this.add.rectangle(400, 300, 200, 20, 0xe74c3c);
    this.physics.add.existing(this.wall);
    this.wall.body.setImmovable(true);
    this.wall.body.setAllowGravity(false);
    
    goal = this.add.circle(750, 550, 20, 0x2ecc71);
    this.physics.add.existing(goal, true); 
    
    // Add collision detection
    this.physics.add.collider(ball, walls);
    this.physics.add.collider(ball, this.wall);
    this.physics.add.collider(ball, holes, reachHole, null, this);
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
    
    // Instructions
    const instructionText = this.add.text(400, 30, 'Move the ball to the green goal!', {
        fontSize: '18px',
        fill: '#fff',
        align: 'center',
        backgroundColor: '#00000088',
        padding: { x: 10, y: 5 }
    });
    instructionText.setOrigin(0.5);
    
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
        const hole = this.add.circle(x, y, 20, 0x34495e);
        holes.add(hole);
        hole.body.updateFromGameObject();
    };
    
    createHole(200, 200);
    createHole(600, 400);
    createHole(300, 500);
}

function createMaze() {
    const createWall = (x, y, width, height) => {
        const wall = this.add.rectangle(x, y, width, height, 0x34495e);
        walls.add(wall);
        wall.body.updateFromGameObject();
    };
    
    createWall(150, 150, 10, 300);  // Vertical wall 1
    createWall(300, 100, 400, 10);  // Horizontal wall 1
    createWall(500, 250, 10, 300);  // Vertical wall 2
    createWall(250, 450, 300, 10);  // Horizontal wall 2
    createWall(350, 300, 10, 200);  // Vertical wall 3
    createWall(650, 150, 10, 300);  // Vertical wall 4
    createWall(600, 450, 200, 10);  // Horizontal wall 3
    createWall(200, 250, 100, 10);  // Small horizontal wall
    createWall(700, 350, 100, 10);  // Small horizontal wall 2
}

function update() {
    if (gameWon) return;
    if (fallIntoHole) return;

    
        this.wall.x += gyroZ; 
        this.wall.body.updateFromGameObject();

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
