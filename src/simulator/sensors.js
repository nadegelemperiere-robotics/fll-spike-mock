// src/simulator/sensors.js
// Lecture des capteurs : couleur depuis l'image du mat, distance via raycast.

import * as THREE from 'three';

// Couleurs reconnues par le capteur SPIKE Prime (les 9 officielles).
const COLOR_BINS = [
  { name: 'black',   rgb: [30,  30,  30] },
  { name: 'magenta', rgb: [244, 142,  192] },
  { name: 'purple', rgb: [110, 100,  178] },
  { name: 'blue',    rgb: [40,  100, 200] },
  { name: 'azure',   rgb: [60,  170, 230] },
  { name: 'green',   rgb: [50,  170, 80] },
  { name: 'yellow',  rgb: [240, 220, 60] },
  { name: 'orange',  rgb: [240, 140, 50] },
  { name: 'red',     rgb: [200, 50,  50] },
  { name: 'white',   rgb: [240, 240, 240] },
];

function nearestColor(r, g, b) {
  // Garde de saturation : sur une jonction noir/blanc, l'anti-aliasing produit
  // des pixels gris (~128,128,128). Le nearest-neighbor saturé tomberait sur
  // "green" ou "orange". On force black/white pour les zones peu chromatiques.
  const chroma = Math.max(r, g, b) - Math.min(r, g, b);
  if (chroma < 35) {
    const lum = 0.2126*r + 0.7152*g + 0.0722*b;
    return lum < 90 ? 'black' : 'white';
  }
  let best = null, bestD = Infinity;
  for (const c of COLOR_BINS) {
    const [cr, cg, cb] = c.rgb;
    const d = (r-cr)**2 + (g-cg)**2 + (b-cb)**2;
    if (d < bestD) { bestD = d; best = c.name; }
  }
  return best;
}

// Moyenne RGB sur une petite fenêtre autour du point lu : lisse les jonctions
// et reflète mieux le spot ~5 mm du vrai capteur SPIKE.
function sampleAvgRGB(ctx, cx, cy, w, h, half = 1) {
  const x0 = Math.max(0, cx - half);
  const y0 = Math.max(0, cy - half);
  const x1 = Math.min(w - 1, cx + half);
  const y1 = Math.min(h - 1, cy + half);
  const dw = x1 - x0 + 1;
  const dh = y1 - y0 + 1;
  if (dw <= 0 || dh <= 0) return null;
  const data = ctx.getImageData(x0, y0, dw, dh).data;
  let r = 0, g = 0, b = 0;
  const n = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i]; g += data[i+1]; b += data[i+2];
  }
  return [r / n, g / n, b / n];
}

export function createSensorReader(state) {
  return {
    _readPos(port) {
      const sensor = state.robotModel?.sensors.find(s => s.port === port && s.type === 'color_sensor');
      if (!sensor) return null;
      return sensorWorldPos(state, sensor);
    },
    readColor(port) {
      if (!state.matCtx || !state.robotModel) return null;
      const sensor = state.robotModel.sensors.find(s => s.port === port && s.type === 'color_sensor');
      if (!sensor) return null;
      const { x, z } = sensorWorldPos(state, sensor);
      const w = state.matCanvas.width, h = state.matCanvas.height;
      const px = Math.floor((x + state.matWidthMm / 2) / state.matWidthMm * w);
      const py = Math.floor((z + state.matHeightMm / 2) / state.matHeightMm * h);
      if (px < 0 || py < 0 || px >= w || py >= h) return null;
      const rgb = sampleAvgRGB(state.matCtx, px, py, w, h);
      if (!rgb) return null;
      return nearestColor(rgb[0], rgb[1], rgb[2]);
    },

    readReflected(port) {
      if (!state.matCtx || !state.robotModel) return 0;
      const sensor = state.robotModel.sensors.find(s => s.port === port && s.type === 'color_sensor');
      if (!sensor) return 0;
      const { x, z } = sensorWorldPos(state, sensor);
      const w = state.matCanvas.width, h = state.matCanvas.height;
      const px = Math.floor((x + state.matWidthMm / 2) / state.matWidthMm * w);
      const py = Math.floor((z + state.matHeightMm / 2) / state.matHeightMm * h);
      if (px < 0 || py < 0 || px >= w || py >= h) return 0;
      const rgb = sampleAvgRGB(state.matCtx, px, py, w, h);
      if (!rgb) return 0;
      const lum = 0.2126*rgb[0] + 0.7152*rgb[1] + 0.0722*rgb[2];
      return Math.round(lum / 255 * 100);
    },

    readRGBI(port) {
      if (!state.matCtx || !state.robotModel) return [0, 0, 0, 0];
      const sensor = state.robotModel.sensors.find(s => s.port === port && s.type === 'color_sensor');
      if (!sensor) return [0, 0, 0, 0];
      const { x, z } = sensorWorldPos(state, sensor);
      const w = state.matCanvas.width, h = state.matCanvas.height;
      const px = Math.floor((x + state.matWidthMm / 2) / state.matWidthMm * w);
      const py = Math.floor((z + state.matHeightMm / 2) / state.matHeightMm * h);
      if (px < 0 || py < 0 || px >= w || py >= h) return [0, 0, 0, 0];
      const rgb = sampleAvgRGB(state.matCtx, px, py, w, h);
      if (!rgb) return [0, 0, 0, 0];
      const scale = (v) => Math.round(v * 1024 / 255);
      const lum = 0.2126*rgb[0] + 0.7152*rgb[1] + 0.0722*rgb[2];
      return [scale(rgb[0]), scale(rgb[1]), scale(rgb[2]), scale(lum)];
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
  // sensor.position est relatif au hub (recentrage à la lecture du LDR).
  // L'angle visuel du robot = heading + frontRotation (alignement modèle).
  const local = new THREE.Vector3(...sensor.position);
  const totalAngle = state.robotState.heading + (state.robotModel?.frontRotation || 0);
  const cos = Math.cos(totalAngle);
  const sin = Math.sin(totalAngle);
  // Rotation autour de Y comme dans Three.js (rotation.y = totalAngle)
  const rx = cos * local.x + sin * local.z;
  const rz = -sin * local.x + cos * local.z;
  return { x: state.robotState.x + rx, z: state.robotState.z + rz };
}
