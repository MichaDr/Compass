const DEG_TO_RAD = Math.PI / 180;

// Rolling orientation samples smooth noisy gyro readings before applying motion.
let gyroEnabled = false;
let sampleIndex = 0;
const GYRO_SAMPLE_SIZE = 10;
const betaSamples = new Array(GYRO_SAMPLE_SIZE);
const gammaSamples = new Array(GYRO_SAMPLE_SIZE);
const alphaSamples = new Array(GYRO_SAMPLE_SIZE);
let gyroX = 0;
let gyroY = 0;
let gyroZ = 0;

function average(values) {
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
  }
  return sum / values.length;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function handleOrientation(event) {
  // If orientation data is missing, immediately fall back to mouse mode.
  if (event.beta === null || event.gamma === null || event.alpha === null) {
    console.log("Your device doesn't provide orientation data")
    useMouseControl = true;
    if (controlModeText) {  
      controlModeText.setText('Control: Mouse');
    }
    return;
  }

  if (sampleIndex > 1) {
    gyroEnabled = true;
    if (controlModeText) {
      controlModeText.setText('Control: Device Orientation');
      useMouseControl = false;
    }
  }
  
  const beta = clamp(event.beta, -90, 90);
  const gamma = clamp(event.gamma, -90, 90);

  betaSamples[sampleIndex % GYRO_SAMPLE_SIZE] = beta;
  gammaSamples[sampleIndex % GYRO_SAMPLE_SIZE] = gamma;
  alphaSamples[sampleIndex % GYRO_SAMPLE_SIZE] = event.alpha; 

  sampleIndex++;

  // Wait until the sample buffer is warm, then use averaged angles for stability.
  if (sampleIndex >= GYRO_SAMPLE_SIZE) {
    const avgBeta = average(betaSamples);
    const avgGamma = average(gammaSamples);
    const avgAlpha = average(alphaSamples);
    // Map angles to normalized acceleration components in [-1, 1].
    gyroX = Math.sin(avgGamma * DEG_TO_RAD);
    gyroY = Math.sin(avgBeta * DEG_TO_RAD);
    gyroZ = Math.sin(avgAlpha * DEG_TO_RAD);
  }
}

// Register orientation listener when supported; otherwise keep mouse mode.
function initializeOrientation() {
  if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", handleOrientation);
  } else {
    console.log("Your browser doesn't support Device Orientation")
    useMouseControl = true;  
    if (controlModeText) {
      controlModeText.setText('Control: Mouse');
    }
  }
}




