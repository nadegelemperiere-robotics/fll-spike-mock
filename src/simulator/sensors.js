// src/simulator/sensors.js
// Lecture des capteurs : couleur depuis l'image du mat, distance via raycast.

import * as THREE from 'three';

// Bins de couleurs reconnues par le capteur SPIKE (palette SPIKE 3 complète).
const COLOR_BINS = [
  { name: 'black',     rgb: [30,  30,  30] },
  { name: 'magenta',   rgb: [200, 30,  130] },
  { name: 'purple',    rgb: [130, 50,  180] },
  { name: 'blue',      rgb: [40,  100, 200] },
  { name: 'azure',     rgb: [60,  170, 230] },
  { name: 'turquoise', rgb: [60,  200, 180] },
  { name: 'green',     rgb: [50,  170, 80] },
  { name: 'yellow',    rgb: [240, 220, 60] },
  { name: 'orange',    rgb: [240, 140, 50] },
  { name: 'red',       rgb: [200, 50,  50] },
  { name: 'white',     rgb: [240, 240, 240] },
];

function nearestColor(r, g, b) {
  let best = null, bestD = Infinity;
  for (const c of COLOR_BINS) {
    const [cr, cg, cb] = c.rgb;
    const d = (r-cr)**2 + (g-cg)**2 + (b-cb)**2;
    if (d < bestD) { bestD = d; best = c.name; }
  }
  return best;
}

export function createSensorReader(state) {
  return {
    readColor(port) {
      if (!state.matCtx || !state.robotModel) return null;
      const sensor = state.robotModel.sensors.find(s => s.port === port && s.type === 'color_sensor');
      if (!sensor) return null;
      const { x, z } = sensorWorldPos(state, sensor);
      const px = Math.floor((x + state.matWidthMm / 2) / state.matWidthMm * state.matCanvas.width);
      const py = Math.floor((z + state.matHeightMm / 2) / state.matHeightMm * state.matCanvas.height);
      if (px < 0 || py < 0 || px >= state.matCanvas.width || py >= state.matCanvas.height) return null;
      const data = state.matCtx.getImageData(px, py, 1, 1).data;
      return nearestColor(data[0], data[1], data[2]);
    },

    readReflected(port) {
      if (!state.matCtx || !state.robotModel) return 0;
      const sensor = state.robotModel.sensors.find(s => s.port === port && s.type === 'color_sensor');
      if (!sensor) return 0;
      const { x, z } = sensorWorldPos(state, sensor);
      const px = Math.floor((x + state.matWidthMm / 2) / state.matWidthMm * state.matCanvas.width);
      const py = Math.floor((z + state.matHeightMm / 2) / state.matHeightMm * state.matCanvas.height);
      if (px < 0 || py < 0 || px >= state.matCanvas.width || py >= state.matCanvas.height) return 0;
      const data = state.matCtx.getImageData(px, py, 1, 1).data;
      // Luminance perçue
      const lum = 0.2126*data[0] + 0.7152*data[1] + 0.0722*data[2];
      return Math.round(lum / 255 * 100);
    },

    readDistance(port) {
      // Pour l'instant : pas d'obstacles dans la scène à part le mat,
      // donc on retourne 200 cm (max ToF SPIKE = 200 cm).
      // À étendre quand on ajoutera des obstacles 3D.
      return 200;
    },
  };
}

function sensorWorldPos(state, sensor) {
  // Position du capteur en coord-monde, en tenant compte
  // du déplacement du robot (les positions stockées sont relatives au modèle initial).
  const local = new THREE.Vector3(...sensor.position);
  // Rotation du robot autour de Y
  const cosA = Math.cos(-state.robotState.heading);
  const sinA = Math.sin(-state.robotState.heading);
  const rx = local.x * cosA - local.z * sinA;
  const rz = local.x * sinA + local.z * cosA;
  return { x: state.robotState.x + rx, z: state.robotState.z + rz };
}
