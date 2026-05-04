// src/simulator/scene.js
// Scène Three.js avec vue top-down, mat texturé et robot.
// Le mouvement du robot est simulé en cinématique différentielle simple
// (pas de moteur physique complet : suffisant pour SPIKE).

import * as THREE from 'three';
import { loadLdrawModel } from '../robot/ldraw-loader.js';
import { buildRobotModel } from '../robot/robot-builder.js';
import { createSensorReader } from './sensors.js';

// 1 unité Three.js = 1 mm dans tout le simulateur

export async function initScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0d11);

  // Caméra top-down orthographique (vue d'application SPIKE)
  const camera = new THREE.OrthographicCamera(-1500, 1500, 1000, -1000, 1, 5000);
  camera.position.set(0, 2000, 0);
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, -1);

  // Lumières
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dir = new THREE.DirectionalLight(0xffffff, 0.7);
  dir.position.set(500, 1500, 500);
  scene.add(dir);

  // Sol par défaut (visible avant chargement d'un mat)
  const floorGeo = new THREE.PlaneGeometry(2362, 1143); // dimensions FLL standard
  const floorMat = new THREE.MeshBasicMaterial({ color: 0x1a1f26 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.userData.isMat = true;
  scene.add(floor);

  // État de la simulation
  const state = {
    renderer, scene, camera, canvas,
    mat: floor,
    matCanvas: null, // pour lecture de couleur
    matCtx: null,
    matWidthMm: 2362,
    matHeightMm: 1143,
    robot: null,        // THREE.Group du modèle
    robotModel: null,   // métadonnées (motors, sensors...)
    robotState: {
      x: 0, z: 0,                    // position en mm (Y est vertical)
      heading: 0,                    // angle en radians, 0 = robot face à -Z (nord du mat), CCW
      motorVel: { A:0,B:0,C:0,D:0,E:0,F:0 },  // % vitesse demandée
      motorPos: { A:0,B:0,C:0,D:0,E:0,F:0 },  // degrés cumulés
    },
    startPose: { x: 0, z: 0, heading: 0 },  // pose utilisée par Reset
    controller: null,
    sensors: null,
    dragging: false,
  };

  // Resize responsive : on cadre toujours la totalité du mat (avec une marge),
  // peu importe l'aspect ratio de la zone simulateur.
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    const aspect = w / h;
    const margin = 100;
    const matW = state.matWidthMm + margin;
    const matH = state.matHeightMm + margin;
    const matAspect = matW / matH;
    let halfW, halfH;
    if (aspect > matAspect) {
      // Canvas plus large que le mat : on cale sur la hauteur, on rajoute des marges horizontales
      halfH = matH / 2;
      halfW = halfH * aspect;
    } else {
      // Canvas plus étroit : on cale sur la largeur, on rajoute des marges verticales
      halfW = matW / 2;
      halfH = halfW / aspect;
    }
    camera.left = -halfW;
    camera.right = halfW;
    camera.top = halfH;
    camera.bottom = -halfH;
    camera.updateProjectionMatrix();
  }
  state._resize = resize;
  resize();
  new ResizeObserver(resize).observe(canvas);

  // Boucle de rendu + simulation cinématique
  let lastT = performance.now();
  let lastReadoutT = 0;
  function tick() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;

    if (state.robot && state.robotModel && !state.dragging) {
      stepKinematics(state, dt);
    }
    updateSensorMarkers(state);
    renderer.render(scene, camera);

    // Readout des capteurs (10 Hz, pas besoin de plus)
    if (now - lastReadoutT > 100) {
      lastReadoutT = now;
      updateSensorReadout(state);
    }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // Drag-and-drop pour positionner le robot
  setupRobotDrag(state);

  // Contrôleur exposé au runner Python
  state.controller = makeController(state);

  return state;
}


// --- Marqueurs debug : un disque à l'endroit exact où chaque capteur lit ---

function updateSensorMarkers(state) {
  if (!state.sensors || !state.robotModel || !state.controller) return;
  if (!state.sensorMarkers) state.sensorMarkers = new Map();

  for (const s of state.robotModel.sensors) {
    if (s.type !== 'color_sensor') continue;
    const wp = state.sensors._readPos ? state.sensors._readPos(s.port) : null;
    if (!wp) continue;
    let mk = state.sensorMarkers.get(s.port);
    if (!mk) {
      const geo = new THREE.RingGeometry(8, 12, 24);
      const mat = new THREE.MeshBasicMaterial({ color: 0xff00ff, side: THREE.DoubleSide, depthTest: false });
      mk = new THREE.Mesh(geo, mat);
      mk.rotation.x = -Math.PI / 2;
      mk.renderOrder = 999;
      state.scene.add(mk);
      state.sensorMarkers.set(s.port, mk);
    }
    mk.position.set(wp.x, 1, wp.z);
  }
}


// --- Readout capteurs (overlay live) ---

function updateSensorReadout(state) {
  const el = typeof document !== 'undefined' ? document.getElementById('sensor-readout') : null;
  if (!el) return;
  if (!state.robotModel) {
    el.innerHTML = '<div class="sensor-line"><span>—</span><span class="v">aucun robot</span></div>';
    return;
  }
  // Yaw boussole (CW positif) en degrés
  const yawCwDeg = -state.robotState.heading * 180 / Math.PI;
  const lines = [
    `<div class="sensor-line"><span>yaw</span><span class="v">${yawCwDeg.toFixed(1)}°</span></div>`,
  ];
  for (const s of state.robotModel.sensors) {
    if (s.type === 'color_sensor') {
      const c = state.controller.readColorSensor(s.port);
      const r = state.controller.readReflectedLight(s.port);
      lines.push(
        `<div class="sensor-line"><span>port ${s.port} couleur</span><span class="v">${c || '—'} (${r})</span></div>`
      );
    } else if (s.type === 'distance_sensor') {
      const d = state.controller.readDistanceSensor(s.port);
      lines.push(
        `<div class="sensor-line"><span>port ${s.port} dist</span><span class="v">${d} cm</span></div>`
      );
    } else if (s.type === 'force_sensor') {
      const f = state.controller.readForceSensor(s.port);
      lines.push(
        `<div class="sensor-line"><span>port ${s.port} force</span><span class="v">${f} N</span></div>`
      );
    }
  }
  el.innerHTML = lines.join('') || '<div class="sensor-line"><span>—</span><span class="v">aucun capteur</span></div>';
}


// --- Drag-and-drop : déplace / tourne le robot ---

function setupRobotDrag(state) {
  const { canvas, camera } = state;
  const raycaster = new THREE.Raycaster();
  let dragMode = null;  // 'move' | 'rotate'

  function ndcFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    return new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
  }

  function matPointFromEvent(e) {
    raycaster.setFromCamera(ndcFromEvent(e), camera);
    if (state.mat) {
      const hits = raycaster.intersectObject(state.mat);
      if (hits.length > 0) return { x: hits[0].point.x, z: hits[0].point.z };
    }
    return null;
  }

  function isOverRobot(e) {
    if (!state.robot) return false;
    const point = matPointFromEvent(e);
    if (!point) return false;
    state.robot.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(state.robot);
    if (box.isEmpty()) return false;
    // Marge de 20 mm autour du robot pour un grab confortable
    const m = 20;
    return point.x >= box.min.x - m && point.x <= box.max.x + m &&
           point.z >= box.min.z - m && point.z <= box.max.z + m;
  }

  function applyToVisual() {
    applyRobotPose(state);
  }

  canvas.addEventListener('pointerdown', (e) => {
    if (!isOverRobot(e)) return;
    state.dragging = true;
    dragMode = e.altKey ? 'rotate' : 'move';
    canvas.setPointerCapture(e.pointerId);
    canvas.style.cursor = 'grabbing';
    e.preventDefault();
  });

  let _debugCount = 0;
  canvas.addEventListener('pointermove', (e) => {
    if (!state.dragging) {
      const over = isOverRobot(e);
      canvas.style.cursor = over ? 'grab' : 'crosshair';
      if (_debugCount++ < 3) {
        const pt = matPointFromEvent(e);
        console.log('[drag-debug] hasRobot=', !!state.robot, 'matPoint=', pt, 'overRobot=', over);
      }
      return;
    }
    const point = matPointFromEvent(e);
    if (!point) return;
    if (dragMode === 'rotate') {
      const dx = point.x - state.robotState.x;
      const dz = point.z - state.robotState.z;
      if (dx * dx + dz * dz > 1) {
        // heading tel que forward = (-sin h, -cos h) pointe vers (dx, dz)
        state.robotState.heading = Math.atan2(-dx, -dz);
      }
    } else {
      state.robotState.x = point.x;
      state.robotState.z = point.z;
    }
    applyToVisual();
  });

  function endDrag(e) {
    if (!state.dragging) return;
    state.dragging = false;
    if (e?.pointerId !== undefined && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
    canvas.style.cursor = 'default';
    state.startPose = {
      x: state.robotState.x,
      z: state.robotState.z,
      heading: state.robotState.heading,
    };
    if (window.simLog) {
      const deg = (state.startPose.heading * 180 / Math.PI).toFixed(0);
      window.simLog(
        `Position de départ : (${state.startPose.x.toFixed(0)}, ${state.startPose.z.toFixed(0)}) mm, ${deg}°`,
        'info'
      );
    }
    state.onStartPoseChanged?.(state.startPose);
  }

  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
}

// Convention : heading=0 => robot face à -Z (nord du mat).
// Un heading positif est une rotation CCW vue de dessus.
function frontAxisToRotation(front) {
  const f = (front || '-z').toLowerCase();
  switch (f) {
    case '-z': return 0;
    case '+z': return Math.PI;
    case '+x': return Math.PI / 2;
    case '-x': return -Math.PI / 2;
    default: return 0;
  }
}

function applyRobotPose(state) {
  if (!state.robot) return;
  state.robot.position.set(state.robotState.x, 5, state.robotState.z);
  state.robot.rotation.y = state.robotState.heading + (state.robotModel?.frontRotation || 0);
}

function stepKinematics(state, dt) {
  const { robotModel, robotState } = state;
  const lp = robotModel.leftPort;
  const rp = robotModel.rightPort;
  if (!lp || !rp) return;

  // Vitesse % -> deg/s. À 100% le moteur SPIKE M tourne à ~1050 deg/s,
  // on prend 600 deg/s pour rester réaliste avec la charge.
  const DEG_PER_S_AT_100 = 600;
  const lDegS = (robotState.motorVel[lp] / 100) * DEG_PER_S_AT_100;
  const rDegS = (robotState.motorVel[rp] / 100) * DEG_PER_S_AT_100;

  // Mise à jour position moteurs (intégration)
  for (const p of ['A','B','C','D','E','F']) {
    robotState.motorPos[p] += (robotState.motorVel[p] / 100) * DEG_PER_S_AT_100 * dt;
  }

  // Vitesse linéaire des roues (mm/s) = (deg/s) * (π * D / 360)
  const D = robotModel.wheelDiameterMm;
  const lVel = lDegS * Math.PI * D / 360;
  const rVel = rDegS * Math.PI * D / 360;

  // Cinématique différentielle. heading=0 => avance vers -Z.
  const v = (lVel + rVel) / 2;
  const omega = (rVel - lVel) / robotModel.wheelbase;

  robotState.heading += omega * dt;
  robotState.x += v * -Math.sin(robotState.heading) * dt;
  robotState.z += v * -Math.cos(robotState.heading) * dt;

  applyRobotPose(state);
}

function makeController(state) {
  return {
    setMotorVelocity(port, v) { state.robotState.motorVel[port] = Math.max(-100, Math.min(100, v)); },
    stopMotor(port) { state.robotState.motorVel[port] = 0; },
    getMotorPosition(port) { return state.robotState.motorPos[port] || 0; },
    getMotorVelocity(port) { return state.robotState.motorVel[port] || 0; },
    getHeading() { return state.robotState.heading; },
    readColorSensor(port) {
      if (!state.sensors) return null;
      return state.sensors.readColor(port);
    },
    readReflectedLight(port) {
      if (!state.sensors) return 0;
      return state.sensors.readReflected(port);
    },
    readDistanceSensor(port) {
      if (!state.sensors) return 200;
      return state.sensors.readDistance(port);
    },
    readForceSensor(port) { return 0; }, // non implémenté en sim
  };
}

// --- Chargement Mat ---
export async function loadMat(state, config, jsonFile) {
  // L'image est référencée par chemin relatif. Si on a l'objet File du JSON,
  // on cherche dans le même répertoire (impossible en pur navigateur sans File System Access).
  // Donc : si l'image n'est pas un data-URL, on demande à l'utilisateur de la charger
  // séparément via un input ou on tente un fetch relatif (utile en dev local).

  const imgPath = config.image;
  if (!imgPath) throw new Error('Le JSON de mat doit contenir un champ "image".');

  // Tente de fetcher relativement au index.html (utile pour les mats bundlés)
  let imgUrl;
  if (imgPath.startsWith('data:') || imgPath.startsWith('http')) {
    imgUrl = imgPath;
  } else {
    imgUrl = `mats/${imgPath}`;
  }

  const tex = await new THREE.TextureLoader().loadAsync(imgUrl);
  tex.colorSpace = THREE.SRGBColorSpace;

  // Remplacer le sol
  state.scene.remove(state.mat);
  const geo = new THREE.PlaneGeometry(config.width_mm, config.height_mm);
  const mat = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex }));
  mat.rotation.x = -Math.PI / 2;
  state.scene.add(mat);
  state.mat = mat;
  state.matWidthMm = config.width_mm;
  state.matHeightMm = config.height_mm;

  // Préparer un canvas 2D pour lire les pixels (capteur couleur)
  const c = document.createElement('canvas');
  // résolution raisonnable : 1 px = 2 mm
  c.width = Math.round(config.width_mm / 2);
  c.height = Math.round(config.height_mm / 2);
  const ctx = c.getContext('2d');
  // image HTMLImage depuis la texture
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = imgUrl;
  await new Promise(r => { img.onload = r; img.onerror = r; });
  ctx.drawImage(img, 0, 0, c.width, c.height);
  state.matCanvas = c;
  state.matCtx = ctx;

  // Init capteurs maintenant que le mat est prêt
  if (state.robotModel) {
    state.sensors = createSensorReader(state);
  }

  // Recadrer la caméra sur le nouveau mat
  state._resize?.();

  // Position de départ (zone start) si fournie.
  // rotation_deg : convention boussole, 0° = nord (-Z), positif = horaire (CW).
  if (config.start_zone) {
    const sx = config.start_zone.x_mm - config.width_mm / 2;
    const sz = config.start_zone.y_mm - config.height_mm / 2;
    const heading = -(config.start_zone.rotation_deg || 0) * Math.PI / 180;
    state.robotState.x = sx;
    state.robotState.z = sz;
    state.robotState.heading = heading;
    state.startPose = { x: sx, z: sz, heading };
    applyRobotPose(state);
  }
}

// --- Chargement Robot ---
export async function loadRobot(state, ldrText, config = {}) {
  // Retirer ancien robot
  if (state.robot) {
    state.scene.remove(state.robot);
    state.robot = null;
    state.robotModel = null;
  }

  // La rotation `front` est appliquée DÈS le parse LDraw : tout est en repère
  // canonique (front = -Z, latéral = X) à partir d'ici.
  const { group, components } = await loadLdrawModel(ldrText, config);
  const model = buildRobotModel(components);
  model.frontRotation = 0;
  model.config = config;

  // Recentrer sur le milieu des deux roues motrices : c'est le repère naturel
  // de la cinématique différentielle (un moteur arrêté => pivot autour de cette roue).
  if (model.leftMotor && model.rightMotor) {
    const lp = model.leftMotor.position;
    const rp = model.rightMotor.position;
    const midX = (lp[0] + rp[0]) / 2;
    const midZ = (lp[2] + rp[2]) / 2;
    if (midX !== 0 || midZ !== 0) {
      for (const c of components) {
        c.position = [c.position[0] - midX, c.position[1], c.position[2] - midZ];
      }
      for (const child of group.children) {
        child.position.x -= midX;
        child.position.z -= midZ;
      }
    }
  }

  state.scene.add(group);
  state.robot = group;
  state.robotModel = model;

  applyRobotPose(state);

  state.sensors = createSensorReader(state);

  if (window.simLog) {
    const frontLabel = (config.front || '-z').toLowerCase();
    window.simLog(
      `Robot ${config.name || ''}: ${model.motors.length} moteurs, ${model.sensors.length} capteurs (avant=${frontLabel}).`,
      'info'
    );
    if (model.leftPort && model.rightPort) {
      window.simLog(`Propulsion: gauche=${model.leftPort}, droite=${model.rightPort}, empattement=${model.wheelbase.toFixed(0)}mm`, 'info');
    }
  }
}

// --- Reset ---
export function resetSimulation(state) {
  state.robotState.x = state.startPose?.x ?? 0;
  state.robotState.z = state.startPose?.z ?? 0;
  state.robotState.heading = state.startPose?.heading ?? 0;
  for (const p of Object.keys(state.robotState.motorVel)) {
    state.robotState.motorVel[p] = 0;
    state.robotState.motorPos[p] = 0;
  }
  applyRobotPose(state);
}
