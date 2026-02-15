// Scene objects and UI state shared across lifecycle callbacks.
let ball;
let walls;
let holes;
let moveableWall;
let moveableWall2;
let verticalWall;
let verticalWall2;
let bounceWall;
let speedWall;
let goal;
let gameWon = false;
let winText;
let loseText;
let loseText2;
let controlModeText;
let dead = false;
let cursors;

// Starts in mouse mode until orientation data is confirmed usable.
let useMouseControl = true;

// Physics constants
let TILT_MULTIPLIER = 400;
let MOUSE_FORCE = 0.9;
const MAX_VELOCITY = 350;
const BALL_BOUNCE = 0.3;
const WALL_SPEED = 2;
const WALL_X_MIN = 100;
const WALL_X_MAX = 700;
const VERTICAL_Y_MIN = 50;
const VERTICAL_Y_MAX = 550;

// Static maze segments: [x, y, width, height]
const MAZE_WALLS = [
    [80, 0, 10, 200],
    [20, 170, 250, 10],
    [150, 145, 10, 100],
    [240, 100, 180, 10],
    [330, 80, 10, 50],
    [420, 30, 10, 70],
    [460, 70, 80, 10],
    [400, 180, 190, 10],
    [500, 265, 10, 400],
    [245, 240, 110, 10],
    [190, 300, 10, 120],
    [120, 340, 140, 10],
    [140, 440, 10, 200],
    [37, 450, 70, 10],
    [110, 545, 70, 10],
    [360, 235, 10, 100],
    [360, 400, 10, 100],
    [440, 300, 10, 100],
    [400, 350, 80, 10],
    [600, 450, 200, 10],
    [800, 350, 160, 10],
    [740, 200, 10, 290]
];

const HOLE_POSITIONS = [
    [100, 30],
    [300, 70],
    [400, 30],
    [460, 130],
    [320, 210],
    [110, 250],
    [30, 260],
    [30, 420],
    [55, 200],
    [30, 485],
    [170, 390],
    [260, 490],
    [330, 430],
    [390, 200],
    [470, 500],
    [470, 40],
    [700, 550],
    [550, 200],
    [700, 200]
];

// Only preload assets that are used as textures/sprites.
function preload() {
    this.load.image('hole', 'assets/hole.png');
}

function create() {
    this.cameras.main.setBackgroundColor(0xffffff);

    // Create the ball
    ball = this.add.circle(50, 50, 15, 0x3498db);
    this.physics.add.existing(ball);
    ball.body.setCollideWorldBounds(true);
    ball.body.setBounce(BALL_BOUNCE);
    ball.body.setDamping(true);
    ball.body.setDrag(0.99);
    ball.body.setMaxVelocity(MAX_VELOCITY);

    walls = this.physics.add.staticGroup();
    holes = this.physics.add.staticGroup();

    createMaze.call(this);
    createHoles.call(this);

    moveableWall = createImmovableRect(this, 400, 300, 200, 20, 0xe74c3c);
    moveableWall2 = createImmovableRect(this, 400, 550, 200, 20, 0xe2ec70);
    verticalWall = createImmovableRect(this, 610, 51, 20, 100, 0xe74c3c);
    verticalWall2 = createImmovableRect(this, 680, 549, 20, 100, 0xe74c3c);
    bounceWall = createImmovableRect(this, 250, 136, 10, 60, 0xe2ec70);
    speedWall = createImmovableRect(this, 230, 560, 10, 90, 0x9b59b6);

    goal = this.add.circle(770, 320, 20, 0x2ecc71);
    this.physics.add.existing(goal, true);

    // Collision effects are intentionally per-wall to support distinct behaviors.
    this.physics.add.collider(ball, walls);
    this.physics.add.collider(ball, bounceWall, increaseBounce, null, this);
    this.physics.add.collider(ball, moveableWall, reachDeadlyWall, null, this);
    this.physics.add.collider(ball, moveableWall2, increaseBounce, null, this);
    this.physics.add.collider(ball, verticalWall, reachDeadlyWall, null, this);
    this.physics.add.collider(ball, verticalWall2, reachDeadlyWall, null, this);
    this.physics.add.collider(ball, speedWall, increaseSpeed, null, this);
    this.physics.add.overlap(ball, holes, reachHole, null, this);
    this.physics.add.overlap(ball, goal, reachGoal, null, this);

    loseText = createCenteredText(this, 400, 300, 'You fell into a hole!', {
        fontSize: '50px',
        fill: '#fff',
        stroke: '#000',
        strokeThickness: 6
    });
    loseText2 = createCenteredText(this, 400, 300, 'You hit a deadly wall!', {
        fontSize: '50px',
        fill: '#fff',
        stroke: '#000',
        strokeThickness: 6
    });
    loseText.setVisible(false);
    loseText2.setVisible(false);

    winText = createCenteredText(this, 400, 300, 'YOU WIN!', {
        fontSize: '64px',
        fill: '#2ecc71',
        stroke: '#000',
        strokeThickness: 6
    });
    winText.setVisible(false);

    // Updated by sensor.js when orientation becomes available/unavailable.
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

    setupOrientationPermission(this);
}

function createImmovableRect(scene, x, y, width, height, color) {
    const rect = scene.add.rectangle(x, y, width, height, color);
    scene.physics.add.existing(rect);
    rect.body.setImmovable(true);
    rect.body.setAllowGravity(false);
    return rect;
}

function createCenteredText(scene, x, y, text, style) {
    const label = scene.add.text(x, y, text, style);
    label.setOrigin(0.5);
    return label;
}

// iOS requires a user gesture before motion sensors can be accessed.
function setupOrientationPermission(scene) {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permButton = scene.add.text(400, 300, 'Tap to enable device motion', {
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
                    permButton.destroy();
                    if (response === 'granted') {
                        initializeOrientation();
                    } else {
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
    HOLE_POSITIONS.forEach(([x, y]) => {
        const hole = holes.create(x, y, 'hole');
        hole.setDisplaySize(30, 30);
        hole.refreshBody();
        hole.body.setSize(20, 20, true);
    });
}


function createMaze() {
    MAZE_WALLS.forEach(([x, y, width, height]) => {
        const wall = this.add.rectangle(x, y, width, height, 0x34495e);
        walls.add(wall);
        wall.body.updateFromGameObject();
    });
}

function update() {
    if (gameWon || dead) return;

    if (useMouseControl) {
        updateWallsWithKeyboard();
    } else {
        updateWallsWithGyro();
    }

    if (useMouseControl) {
        updateBallWithMouse();
    } else {
        updateBallWithGyro();
    }
}

function updateWallsWithKeyboard() {
    // Horizontal pair moves together.
    if (cursors.left.isDown && moveableWall.x > WALL_X_MIN) {
        moveWallPairX(-WALL_SPEED);
    } else if (cursors.right.isDown && moveableWall.x < WALL_X_MAX) {
        moveWallPairX(WALL_SPEED);
    }

    // Vertical pair is mirrored (one goes up while the other goes down).
    if (cursors.left.isDown && verticalWall.y > VERTICAL_Y_MIN) {
        moveWallPairY(-WALL_SPEED);
    } else if (cursors.right.isDown && verticalWall.y < VERTICAL_Y_MAX) {
        moveWallPairY(WALL_SPEED);
    }
}

function updateWallsWithGyro() {
    // Clamp wall pairs at bounds to prevent drift from sensor noise.
    if (moveableWall.x > WALL_X_MIN && moveableWall.x < WALL_X_MAX) {
        moveWallPairX(-gyroZ);
    } else if (moveableWall.x <= WALL_X_MIN) {
        setWallPairX(WALL_X_MIN);
    } else if (moveableWall.x >= WALL_X_MAX) {
        setWallPairX(WALL_X_MAX);
    }

    if (verticalWall.y > VERTICAL_Y_MIN && verticalWall.y < VERTICAL_Y_MAX) {
        moveWallPairY(-gyroZ);
    } else if (verticalWall.y <= VERTICAL_Y_MIN) {
        setWallPairY(VERTICAL_Y_MIN, VERTICAL_Y_MAX);
    } else if (verticalWall.y >= VERTICAL_Y_MAX) {
        setWallPairY(VERTICAL_Y_MAX, VERTICAL_Y_MIN);
    }
}

function moveWallPairX(delta) {
    moveableWall.x += delta;
    moveableWall2.x += delta;
    moveableWall.body.updateFromGameObject();
    moveableWall2.body.updateFromGameObject();
}

function setWallPairX(x) {
    moveableWall.x = x;
    moveableWall2.x = x;
    moveableWall.body.updateFromGameObject();
    moveableWall2.body.updateFromGameObject();
}

function moveWallPairY(delta) {
    // Keep spacing constant by moving the second wall with opposite delta.
    verticalWall.y += delta;
    verticalWall2.y -= delta;
    verticalWall.body.updateFromGameObject();
    verticalWall2.body.updateFromGameObject();
}

function setWallPairY(y1, y2) {
    verticalWall.y = y1;
    verticalWall2.y = y2;
    verticalWall.body.updateFromGameObject();
    verticalWall2.body.updateFromGameObject();
}

function updateBallWithMouse() {
    const dx = mouseX - ball.x;
    const dy = mouseY - ball.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {
        const accelX = (dx / distance) * distance * MOUSE_FORCE;
        const accelY = (dy / distance) * distance * MOUSE_FORCE;
        ball.body.setAcceleration(accelX, accelY);
    } else {
        ball.body.setAcceleration(0, 0);
    }
}

function updateBallWithGyro() {
    const accelX = gyroX * TILT_MULTIPLIER;
    const accelY = gyroY * TILT_MULTIPLIER;
    ball.body.setAcceleration(accelX, accelY);
}

function reachDeadlyWall() {
    if (!dead) {
        dead = true;
        ball.body.setVelocity(0, 0);
        ball.body.setAcceleration(0, 0);
        loseText2.setVisible(true);
        
        setTimeout(() => {
            if (confirm('You hit a deadly wall! Try again?')) {
                location.reload();
            }
        }, 1000);
    }
}

function reachHole() {
    if (!dead) {
        dead = true;
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
        
        setTimeout(() => {
            if (confirm('You won! Play again?')) {
                location.reload();
            }
        }, 1000);
    }
}
