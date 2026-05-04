// src/editor/runner.js — Manage Pyodide-in-worker + shared state mirror.
// Pyodide tourne dans un Web Worker pour que le main thread reste libre :
//  - les rAF (animation 3D) continuent même quand Python boucle sans await
//  - les clics (Stop) atteignent toujours le handler JS, qui pose SIGINT
//    dans le SAB d'interruption de Pyodide → KeyboardInterrupt côté Python.
//
// Les lectures synchrones du bridge Python (getMotorPosition, getHeading,
// getColor, …) lisent un Float64Array partagé qu'on rafraîchit ici à chaque
// frame. Les écritures (setMotor, hubMatrix*, …) arrivent en postMessage et
// sont appliquées au scene controller / hub display.

const STOP_MARKER = 'Stop demandé.';

// --- Layout du miroir partagé (doit matcher python-worker.js) ---
const F = {
  HEADING: 0,
  ANGULAR_VEL: 1,
  PORT_BASE: 8,
  PORT_STRIDE: 16,
};
const PF = {
  POS: 0, VEL: 1, COLOR: 2, REFL: 3,
  R: 4, G: 5, B: 6, I: 7,
  DIST: 8, FORCE: 9,
};
const I = {
  STOP: 0,
  BTN_LEFT: 1,
  BTN_RIGHT: 2,
};

const SPIKE3_MODULES = [
  '_sim', 'hub', 'motor', 'motor_pair', 'color', 'orientation',
  'color_sensor', 'distance_sensor', 'force_sensor', 'runloop',
];

function portFloat(port, off) {
  const idx = 'ABCDEF'.indexOf(String(port || '').toUpperCase());
  if (idx < 0) return -1;
  return F.PORT_BASE + idx * F.PORT_STRIDE + off;
}

let worker = null;
let workerReady = false;
let readyResolvers = [];
let runResolver = null;
let logFn = null;
let sceneRef = null;

let floatBuffer = null;
let intBuffer = null;
let interruptBuffer = null;
let floatMirror = null;
let int32Mirror = null;
let interruptMirror = null;

let mirrorRafHandle = 0;

async function fetchModules() {
  const cacheBust = Date.now();
  const out = {};
  for (const m of SPIKE3_MODULES) {
    out[m] = await fetch(`src/api/${m}.py?v=${cacheBust}`, { cache: 'no-store' }).then(r => r.text());
  }
  return out;
}

export async function initRunner(scene, log) {
  sceneRef = scene;
  logFn = log;

  if (typeof SharedArrayBuffer === 'undefined' || !self.crossOriginIsolated) {
    log("SharedArrayBuffer indisponible (page pas isolée). Recharge la page : le service worker COOP/COEP doit s'installer au premier chargement.", 'err');
    return null;
  }

  floatBuffer     = new SharedArrayBuffer(128 * 8);
  intBuffer       = new SharedArrayBuffer(32 * 4);
  interruptBuffer = new SharedArrayBuffer(1);
  floatMirror     = new Float64Array(floatBuffer);
  int32Mirror     = new Int32Array(intBuffer);
  interruptMirror = new Uint8Array(interruptBuffer);

  worker = new Worker(new URL('./python-worker.js', import.meta.url), { type: 'classic' });
  worker.onmessage = onWorkerMessage;
  worker.onerror = (e) => {
    log(`Worker error: ${e.message || e}`, 'err');
    if (runResolver) { runResolver.resolve({ stopped: false }); runResolver = null; }
  };

  const apiModules = await fetchModules();
  worker.postMessage({
    type: 'init',
    floatBuffer, intBuffer, interruptBuffer,
    apiModules,
  });

  await new Promise((resolve) => readyResolvers.push(resolve));
  startMirrorLoop();
  return { ready: true };
}

function onWorkerMessage(e) {
  const msg = e.data;
  if (!msg) return;
  if (msg.kind === 'ready') {
    workerReady = true;
    readyResolvers.forEach(r => r(true));
    readyResolvers = [];
  } else if (msg.kind === 'init-error') {
    logFn?.('Erreur init Pyodide : ' + msg.message, 'err');
    readyResolvers.forEach(r => r(false));
    readyResolvers = [];
  } else if (msg.kind === 'log') {
    logFn?.(msg.s, msg.level || 'log');
  } else if (msg.kind === 'cmd') {
    handleCommand(msg.type, msg.args);
  } else if (msg.kind === 'done') {
    if (msg.stopped || msg.errored) {
      // Sur Stop ou erreur, on coupe les moteurs. Si main() s'est terminé
      // normalement, on laisse motor.run() continuer (parité avec l'ancien comportement).
      const c = sceneRef?.controller;
      if (c) for (const p of 'ABCDEF') c.stopMotor(p);
    }
    if (runResolver) { runResolver.resolve({ stopped: msg.stopped }); runResolver = null; }
  }
}

function handleCommand(type, args) {
  const c = sceneRef?.controller;
  const hd = (typeof window !== 'undefined') ? window.hubDisplay : null;
  if (!c) return;
  switch (type) {
    case 'setMotor':       c.setMotorVelocity(args[0], args[1]); break;
    case 'stopMotor':      c.stopMotor(args[0]); break;
    case 'setMotorPair':   c.setMotorPair(args[0], args[1]); break;
    case 'setMotionYawFace':  c.setMotionYawFace(args[0]); break;
    case 'setMotionTBOffset': c.setMotionTBOffset(args[0]); break;
    case 'requestStop':
      Atomics.store(int32Mirror, I.STOP, 1);
      interruptMirror[0] = 2;
      for (const p of 'ABCDEF') c.stopMotor(p);
      break;
    case 'hubMatrixSetPixel':    hd?.setPixel(args[0], args[1], args[2]); break;
    case 'hubMatrixClear':       hd?.clear(); break;
    case 'hubMatrixShow':        hd?.showImage(args[0]); break;
    case 'hubMatrixWrite':       hd?.write(args[0]); break;
    case 'hubMatrixBrightness':  hd?.setBrightness(args[0]); break;
    case 'hubMatrixRotate':      hd?.rotate(args[0]); break;
    case 'hubMatrixOrientation': hd?.setOrientation(args[0]); break;
    case 'hubButtonLight':       hd?.setButtonColor(args[0], args[1], args[2]); break;
    case 'hubLightColor':        hd?.setLightColor(args[0], args[1]); break;
  }
}

function setSensorFloat(idx, v) {
  floatMirror[idx] = (v === null || v === undefined) ? NaN : v;
}

// Boucle qui rafraîchit le miroir partagé à chaque frame. Le worker lit
// les valeurs synchrones depuis ce miroir (motor pos/vel, heading, sensors…).
function startMirrorLoop() {
  if (mirrorRafHandle) cancelAnimationFrame(mirrorRafHandle);
  function tick() {
    const c = sceneRef?.controller;
    if (c) {
      // Motors
      for (const port of 'ABCDEF') {
        floatMirror[portFloat(port, PF.POS)] = c.getMotorPosition(port);
        floatMirror[portFloat(port, PF.VEL)] = c.getMotorVelocity(port);
      }
      // Motion
      floatMirror[F.HEADING]     = c.getHeading();
      floatMirror[F.ANGULAR_VEL] = c.getAngularVelocity();
      // Sensors (NaN si capteur absent → bridge Python renvoie None)
      for (const port of 'ABCDEF') {
        setSensorFloat(portFloat(port, PF.COLOR), c.readColorSensor(port));
        setSensorFloat(portFloat(port, PF.REFL),  c.readReflectedLight(port));
        const rgbi = c.readColorRGBI(port);
        if (rgbi) {
          floatMirror[portFloat(port, PF.R)] = rgbi[0];
          floatMirror[portFloat(port, PF.G)] = rgbi[1];
          floatMirror[portFloat(port, PF.B)] = rgbi[2];
          floatMirror[portFloat(port, PF.I)] = rgbi[3];
        } else {
          floatMirror[portFloat(port, PF.R)] = NaN;
        }
        setSensorFloat(portFloat(port, PF.DIST),  c.readDistanceSensor(port));
        setSensorFloat(portFloat(port, PF.FORCE), c.readForceSensor(port));
      }
    }
    // Buttons (ms écoulées depuis l'appui)
    const hd = (typeof window !== 'undefined') ? window.hubDisplay : null;
    if (hd) {
      Atomics.store(int32Mirror, I.BTN_LEFT,  Math.floor(hd.getButtonPressed?.(1) || 0));
      Atomics.store(int32Mirror, I.BTN_RIGHT, Math.floor(hd.getButtonPressed?.(2) || 0));
    }
    mirrorRafHandle = requestAnimationFrame(tick);
  }
  mirrorRafHandle = requestAnimationFrame(tick);
}

export async function runPython(code) {
  if (!workerReady) throw new Error('Pyodide pas encore prêt.');
  // Reset visuel du hub à chaque run
  (typeof window !== 'undefined') && window.hubDisplay?.reset();
  Atomics.store(int32Mirror, I.STOP, 0);
  interruptMirror[0] = 0;

  worker.postMessage({ type: 'run', code });
  return new Promise((resolve, reject) => {
    runResolver = { resolve, reject };
  });
}

export function stopPython() {
  if (!int32Mirror) return;
  Atomics.store(int32Mirror, I.STOP, 1);
  if (interruptMirror) interruptMirror[0] = 2;  // SIGINT → KeyboardInterrupt
  // Force l'arrêt des moteurs même si plus aucun Python ne tourne.
  const c = sceneRef?.controller;
  if (c) for (const p of 'ABCDEF') c.stopMotor(p);
}
