// Helper: round a number to two decimals (or show 0.00)
//function fmt(v) { return v ? v.toFixed(2) : '0.00'; }

// device Orientation
const absEl   = document.getElementById("abs");
const alphaEl = document.getElementById("alpha");
const betaEl  = document.getElementById("beta");
const gammaEl = document.getElementById("gamma");

//device Motion
const accXEl = document.getElementById("accX");
const accYEl = document.getElementById("accY");
const accZEl = document.getElementById("accZ");

const accGrXEl = document.getElementById("accGrX");
const accGrYEl = document.getElementById("accGrY");
const accGrZEl = document.getElementById("accGrZ");

const rotAlphaEl = document.getElementById("rotAlpha");
const rotBetaEl = document.getElementById("rotBeta");
const rotGammaEl = document.getElementById("rotGamma");


const intervalEl = document.getElementById("interval");

function deviceOrientationListener(event) {
  absEl.textContent   = event.absolute;
  alphaEl.textContent = event.alpha?.toFixed(2);
  betaEl.textContent  = event.beta?.toFixed(2);
  gammaEl.textContent = event.gamma?.toFixed(2);
}

function deviceMotionListener(event) {
  console.log(event);
  accXEl.textContent   = event.acceleration?.x?.toFixed(2);
  accYEl.textContent   = event.acceleration?.y?.toFixed(2);
  accZEl.textContent   = event.acceleration?.z?.toFixed(2);

  accGrXEl.textContent = event.accelerationIncludingGravity?.x?.toFixed(2);
  accGrYEl.textContent = event.accelerationIncludingGravity?.y?.toFixed(2);
  accGrZEl.textContent = event.accelerationIncludingGravity?.z?.toFixed(2);

  rotAlphaEl.textContent  = event.rotationRate?.alpha?.toFixed(2);
  rotBetaEl.textContent  = event.rotationRate?.beta?.toFixed(2);
  rotGammaEl.textContent  = event.rotationRate?.gamma?.toFixed(2);

  intervalEl.textContent = event.interval?.toFixed(2);
}

// Check for Browser support - DeviceOrientationEvent
if (window.DeviceOrientationEvent) {
  window.addEventListener("deviceorientation", deviceOrientationListener);
} else {
  console.log("Your browser doesnt't support Device Orientation")
  alert("Your browser doesn't support Device Orientation")
}

// Check for Browser support - DeviceMotionEvent
if (window.DeviceMotionEvent) {
  window.addEventListener("devicemotion", deviceMotionListener);
} else {
  console.log("Your browser doesnt't support Device Motion")
  alert("Your browser doesn't support Device Motion")
}




