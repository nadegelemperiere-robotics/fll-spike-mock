// src/editor/python-worker.js — Pyodide tourne ici, dans un Web Worker.
// Le bridge Python lit l'état partagé via SharedArrayBuffer (lectures synchrones,
// pas de round-trip postMessage) et envoie les écritures via postMessage.
// Le bouton Stop côté main thread écrit dans le SAB d'interruption :
// Pyodide lève KeyboardInterrupt même dans une boucle Python pure (while True: pass).

importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');

const STOP_MARKER = 'Stop demandé.';

// --- Layout du miroir partagé (doit matcher runner.js côté main) ---
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

function portFloat(port, off) {
  const idx = 'ABCDEF'.indexOf(String(port || '').toUpperCase());
  if (idx < 0) return -1;
  return F.PORT_BASE + idx * F.PORT_STRIDE + off;
}

let pyodide = null;
let floatMirror = null;
let int32Mirror = null;
let interruptMirror = null;

function postCmd(type, args) {
  self.postMessage({ kind: 'cmd', type, args });
}
function postLog(s, level) {
  self.postMessage({ kind: 'log', s, level });
}

// Lecture défensive : si le slot a NaN (sentinelle « pas de capteur »), on
// renvoie null pour reproduire le comportement « capteur absent ».
function readFloat(idx) {
  const v = floatMirror[idx];
  return Number.isNaN(v) ? null : v;
}

const bridge = {
  log: (s) => postLog(String(s), 'log'),

  sleep: async (sec) => {
    const t0 = performance.now();
    while ((performance.now() - t0) < sec * 1000) {
      if (Atomics.load(int32Mirror, I.STOP) !== 0) throw new Error(STOP_MARKER);
      await new Promise(r => setTimeout(r, 16));
    }
  },

  // --- Écritures (fire-and-forget vers le main thread) ---
  setMotor: (p, v) => postCmd('setMotor', [p, v]),
  stopMotor: (p) => postCmd('stopMotor', [p]),
  setMotorPair: (l, r) => postCmd('setMotorPair', [l, r]),
  setMotionYawFace: (f) => postCmd('setMotionYawFace', [f]),
  setMotionTBOffset: (rad) => postCmd('setMotionTBOffset', [rad]),
  requestStop: () => {
    Atomics.store(int32Mirror, I.STOP, 1);
    postCmd('requestStop', []);
  },
  hubMatrixSetPixel: (x, y, intensity) => postCmd('hubMatrixSetPixel', [x, y, intensity]),
  hubMatrixClear:    () => postCmd('hubMatrixClear', []),
  hubMatrixShow:     (id) => postCmd('hubMatrixShow', [id]),
  hubMatrixWrite:    (text) => postCmd('hubMatrixWrite', [text]),
  hubMatrixBrightness: (pct) => postCmd('hubMatrixBrightness', [pct]),
  hubMatrixRotate:   (dir) => postCmd('hubMatrixRotate', [dir]),
  hubMatrixOrientation: (ori) => postCmd('hubMatrixOrientation', [ori]),
  hubButtonLight:    (r, g, b) => postCmd('hubButtonLight', [r, g, b]),
  hubLightColor:     (lightId, colorId) => postCmd('hubLightColor', [lightId, colorId]),

  // --- Lectures synchrones (depuis le miroir SAB) ---
  getMotorPosition: (p) => readFloat(portFloat(p, PF.POS)) || 0,
  getMotorVelocity: (p) => readFloat(portFloat(p, PF.VEL)) || 0,
  getHeading: () => floatMirror[F.HEADING] || 0,
  getAngularVelocity: () => floatMirror[F.ANGULAR_VEL] || 0,
  getColor: (p) => {
    const v = floatMirror[portFloat(p, PF.COLOR)];
    return Number.isNaN(v) ? null : v;
  },
  getReflectedLight: (p) => readFloat(portFloat(p, PF.REFL)) || 0,
  getColorRGBI: (p) => {
    const ri = portFloat(p, PF.R);
    if (ri < 0 || Number.isNaN(floatMirror[ri])) return null;
    return [
      floatMirror[ri],
      floatMirror[portFloat(p, PF.G)],
      floatMirror[portFloat(p, PF.B)],
      floatMirror[portFloat(p, PF.I)],
    ];
  },
  getDistance: (p) => readFloat(portFloat(p, PF.DIST)) ?? 200,
  getForce: (p) => readFloat(portFloat(p, PF.FORCE)) || 0,
  isStopped: () => Atomics.load(int32Mirror, I.STOP) !== 0,
  hubButtonPressed: (id) => {
    if (id === 1) return Atomics.load(int32Mirror, I.BTN_LEFT);
    if (id === 2) return Atomics.load(int32Mirror, I.BTN_RIGHT);
    return 0;
  },
};

self.onmessage = async (e) => {
  const msg = e.data;

  if (msg.type === 'init') {
    floatMirror     = new Float64Array(msg.floatBuffer);
    int32Mirror     = new Int32Array(msg.intBuffer);
    interruptMirror = new Uint8Array(msg.interruptBuffer);

    try {
      pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
      });
      pyodide.setInterruptBuffer(interruptMirror);
      pyodide.registerJsModule('_sim_bridge', bridge);
      pyodide.setStdout({ batched: (s) => postLog(s, 'log') });
      pyodide.setStderr({ batched: (s) => postLog(s, 'err') });

      pyodide.FS.mkdirTree('/lib');
      for (const [name, src] of Object.entries(msg.apiModules)) {
        pyodide.FS.writeFile(`/lib/${name}.py`, src);
      }
      pyodide.runPython("import sys; sys.path.insert(0, '/lib')");
      self.postMessage({ kind: 'ready' });
    } catch (err) {
      self.postMessage({ kind: 'init-error', message: err?.message || String(err) });
    }
    return;
  }

  if (msg.type === 'run') {
    let stopped = false;
    let errored = false;
    Atomics.store(int32Mirror, I.STOP, 0);
    interruptMirror[0] = 0;

    try {
      // Reset des états Python qui persistent entre runs.
      await pyodide.runPythonAsync(`
import sys
_mp = sys.modules.get('motor_pair')
if _mp is not None:
    _mp._pairs.clear()
_h = sys.modules.get('hub')
if _h is not None and hasattr(_h, 'motion_sensor'):
    _h.motion_sensor._tb_offset_rad = 0.0
    _h.motion_sensor._yaw_face = _h.motion_sensor.TOP
import _sim_bridge as _sb
_sb.setMotionYawFace(0)
_sb.setMotionTBOffset(0)
`);

      await pyodide.runPythonAsync(msg.code);
      await pyodide.runPythonAsync(`
import runloop as _rl
if _rl._main_coro is not None:
    _coro = _rl._main_coro
    _rl._main_coro = None
    await _coro
`);
    } catch (e) {
      const errMsg = e?.message || String(e);
      if (errMsg.includes(STOP_MARKER) || errMsg.includes('KeyboardInterrupt')) {
        stopped = true;
        postLog('Exécution arrêtée.', 'info');
      } else {
        errored = true;
        postLog(errMsg, 'err');
      }
    }
    self.postMessage({ kind: 'done', stopped, errored });
  }
};
