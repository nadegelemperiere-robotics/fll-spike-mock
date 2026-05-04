// src/editor/runner.js — Exécute le code Python (SPIKE 3) dans Pyodide.
// L'utilisateur appelle `runloop.run(main())`. Le module runloop enregistre
// la coroutine ; après runPythonAsync, on l'attend explicitement.

const STOP_MARKER = 'Stop demandé.';
let stopRequested = false;

export function stopPython() { stopRequested = true; }

export async function runPython(pyodide, code, scene, log) {
  stopRequested = false;

  const bridge = {
    log: (s) => log(String(s), 'log'),
    sleep: async (sec) => {
      const t0 = performance.now();
      while ((performance.now() - t0) < sec * 1000) {
        if (stopRequested) throw new Error(STOP_MARKER);
        await new Promise(r => setTimeout(r, 16));
      }
    },
    setMotor: (port, velocity) => scene.controller.setMotorVelocity(port, velocity),
    stopMotor: (port) => scene.controller.stopMotor(port),
    getMotorPosition: (port) => scene.controller.getMotorPosition(port),
    getMotorVelocity: (port) => scene.controller.getMotorVelocity(port),
    getHeading: () => scene.controller.getHeading(),
    getColor: (port) => scene.controller.readColorSensor(port),
    getReflectedLight: (port) => scene.controller.readReflectedLight(port),
    getDistance: (port) => scene.controller.readDistanceSensor(port),
    getForce: (port) => scene.controller.readForceSensor(port),
    isStopped: () => stopRequested,
  };

  pyodide.registerJsModule('_sim_bridge', bridge);

  // Rediriger print() / sys.stderr vers la console UI
  pyodide.setStdout({ batched: (s) => log(s, 'log') });
  pyodide.setStderr({ batched: (s) => log(s, 'err') });

  let stopped = false;
  let errored = false;
  try {
    // Reset des états Python qui persistent entre runs (modules cachés par Pyodide).
    await pyodide.runPythonAsync(`
import sys
_m = sys.modules.get('motor')
if _m is not None:
    _m._default_pct.clear()
_mp = sys.modules.get('motor_pair')
if _mp is not None:
    _mp._pairs.clear()
_h = sys.modules.get('hub')
if _h is not None and hasattr(_h, 'motion_sensor'):
    _h.motion_sensor._yaw_offset_rad = 0.0
`);

    await pyodide.runPythonAsync(code);
    await pyodide.runPythonAsync(`
import runloop as _rl
if _rl._main_coro is not None:
    _coro = _rl._main_coro
    _rl._main_coro = None
    await _coro
`);
  } catch (e) {
    const msg = e.message || String(e);
    if (msg.includes(STOP_MARKER)) {
      stopped = true;
      log('Exécution arrêtée.', 'info');
    } else {
      errored = true;
      log(msg, 'err');
      throw e;
    }
  } finally {
    // On stoppe les moteurs uniquement sur Stop explicite ou erreur.
    // Si main() se termine normalement, on laisse motor.run() continuer.
    if (stopped || errored) {
      for (const port of ['A', 'B', 'C', 'D', 'E', 'F']) {
        scene.controller.stopMotor(port);
      }
    }
  }
  return { stopped };
}
