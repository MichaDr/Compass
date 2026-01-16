// Helper: round a number to two decimals (or show 0.00)
function fmt(v) { return v ? v.toFixed(2) : '0.00'; }

// Accelerometer and Gyroscope
let accel, gyro;

try {
  accel = new Accelerometer({frequency: 30});   // 30 updates per second
} catch (e) {
  console.warn('Accelerometer not available:', e);
}

try {
  gyro = new Gyroscope({frequency: 30});
} catch (e) {
  console.warn('Gyroscope not available:', e);
}

// start listening to sensors
function startSensors() {
  // ----- Accelerometer -----
  if (accel) {
    accel.addEventListener('reading', () => {
      document.getElementById('acc-x').textContent = fmt(accel.x);
      document.getElementById('acc-y').textContent = fmt(accel.y);
      document.getElementById('acc-z').textContent = fmt(accel.z);
    });
    accel.addEventListener('error', e => console.error('Accel error:', e.error.name));
    accel.start();
  }

  // ----- Gyroscope -----
  if (gyro) {
    gyro.addEventListener('reading', () => {
      document.getElementById('gyro-a').textContent = fmt(gyro.x);
      document.getElementById('gyro-b').textContent = fmt(gyro.y);
      document.getElementById('gyro-g').textContent = fmt(gyro.z);
    });
    gyro.addEventListener('error', e => console.error('Gyro error:', e.error.name));
    gyro.start();
  }
}

// Permission Handling
if (typeof Sensor !== 'undefined' && 'requestPermission' in Sensor) {
  Sensor.requestPermission()
        .then(result => {
          if (result === 'granted') {
            startSensors();
          } else {
            alert('Permission denied – sensor data won’t appear.');
          }
        })
        .catch(err => console.error('Permission request failed:', err));
} else {
  startSensors();
}

// Fallback
if (!accel && typeof DeviceMotionEvent !== 'undefined') {
  window.addEventListener('devicemotion', ev => {
    const a = ev.accelerationIncludingGravity;
    document.getElementById('acc-x').textContent = fmt(a.x);
    document.getElementById('acc-y').textContent = fmt(a.y);
    document.getElementById('acc-z').textContent = fmt(a.z);
  });
}

if (!gyro && typeof DeviceOrientationEvent !== 'undefined') {
  window.addEventListener('deviceorientation', ev => {
    document.getElementById('gyro-a').textContent = fmt(ev.alpha);
    document.getElementById('gyro-b').textContent = fmt(ev.beta);
    document.getElementById('gyro-g').textContent = fmt(ev.gamma);
  });
}
