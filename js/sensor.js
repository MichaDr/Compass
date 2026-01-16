// Helper: round a number to two decimals (or show 0.00)
function fmt(v) { return v ? v.toFixed(2) : '0.00'; }

const absEl   = document.getElementById("abs");
const alphaEl = document.getElementById("alpha");
const betaEl  = document.getElementById("beta");
const gammaEl = document.getElementById("gamma");

function deviceOrientationListener(event) {
  absEl.textContent   = event.absolute;
  alphaEl.textContent = event.alpha?.toFixed(1);
  betaEl.textContent  = event.beta?.toFixed(1);
  gammaEl.textContent = event.gamma?.toFixed(1);


}

// Check for Browser support
if (window.DeviceOrientationEvent) {
  window.addEventListener("deviceorientation", deviceOrientationListener);
} else {
  console.log("Your browser doesnt't support Device Orientation")
  alert("Your browser doesn't support Device Orientation")
}


