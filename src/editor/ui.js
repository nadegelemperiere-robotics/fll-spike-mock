// src/editor/ui.js — point d'entrée principal
import { initScene, loadMat, loadRobot, resetSimulation } from '../simulator/scene.js';
import { setupBlockly } from './blockly-config.js';
import { setupMonaco } from './monaco-config.js';
import { runPython, stopPython } from './runner.js';
import { parseIoFile } from '../robot/io-parser.js';

const consoleOut = document.getElementById('console-output');
const simStatus = document.getElementById('sim-status');
const robotName = document.getElementById('robot-name');
const matName = document.getElementById('mat-name');

// Petit helper console
export function log(msg, kind = 'log') {
  const ts = new Date().toLocaleTimeString('fr-FR', { hour12: false });
  const div = document.createElement('div');
  div.innerHTML = `<span class="ts">${ts}</span><span class="${kind}">${msg}</span>`;
  consoleOut.appendChild(div);
  consoleOut.scrollTop = consoleOut.scrollHeight;
}
window.simLog = log;

document.getElementById('clear-console').onclick = () => (consoleOut.innerHTML = '');

// --- Persistance localStorage ---
const STORAGE_KEY = 'spike-mock:v2';  // v2: stocke des noms de fichiers, pas les configs complètes
let selectedMatFile = null;
let selectedRobotFile = null;
let saveTimer = null;
let restoring = false;

function saveSessionDebounced() {
  if (restoring) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(saveSession, 300);
}

function saveSession() {
  saveTimer = null;
  try {
    const data = {
      code: typeof monaco !== 'undefined' && monaco?.getValue ? monaco.getValue() : null,
      blocks: (typeof blocklyWorkspace !== 'undefined' && blocklyWorkspace && typeof Blockly !== 'undefined')
        ? Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(blocklyWorkspace))
        : null,
      matFile: selectedMatFile,
      robotFile: selectedRobotFile,
      startPose: scene?.startPose || null,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Sauvegarde session échouée:', e);
  }
}

function readSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Onglets éditeur
document.querySelectorAll('.tab').forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.remove('hidden');
    if (tab.dataset.tab === 'python') syncBlocksToPython();
  };
});

// --- Initialisation ---
log('Initialisation du simulateur...', 'info');

// Scène 3D
const scene = await initScene(document.getElementById('sim-canvas'));
scene.onStartPoseChanged = saveSession;
log('Scène 3D prête.', 'ok');

// --- Sélecteurs robot / mat (alimentés par les manifestes du serveur) ---
const matSelect = document.getElementById('mat-select');
const robotSelect = document.getElementById('robot-select');

async function fetchManifest(path) {
  try {
    const resp = await fetch(`${path}?v=${Date.now()}`, { cache: 'no-store' });
    if (!resp.ok) return [];
    return await resp.json();
  } catch (e) {
    log(`Manifest ${path} introuvable.`, 'err');
    return [];
  }
}

function populateSelect(selectEl, items, selectedFile) {
  selectEl.innerHTML = '';
  for (const item of items) {
    const opt = document.createElement('option');
    opt.value = item.file;
    opt.textContent = item.name || item.file;
    if (item.file === selectedFile) opt.selected = true;
    selectEl.appendChild(opt);
  }
}

async function loadMatByFile(file) {
  if (!file) return;
  log(`Chargement mat ${file}...`, 'info');
  try {
    const resp = await fetch(`mats/${file}?v=${Date.now()}`, { cache: 'no-store' });
    if (!resp.ok) throw new Error(`mats/${file} introuvable`);
    const config = JSON.parse(await resp.text());
    await loadMat(scene, config);
    matName.textContent = config.name || file;
    selectedMatFile = file;
    saveSession();
    log(`Mat ${config.width_mm}×${config.height_mm}mm chargé.`, 'ok');
  } catch (err) {
    log('Erreur chargement mat: ' + err.message, 'err');
    console.error(err);
  }
}

async function loadRobotByFile(file) {
  if (!file) return;
  log(`Chargement robot ${file}...`, 'info');
  try {
    const resp = await fetch(`robots/${file}?v=${Date.now()}`, { cache: 'no-store' });
    if (!resp.ok) throw new Error(`robots/${file} introuvable`);
    const config = JSON.parse(await resp.text());
    if (!config.model) throw new Error('JSON robot sans champ "model"');
    const modelResp = await fetch(`robots/${config.model}?v=${Date.now()}`, { cache: 'no-store' });
    if (!modelResp.ok) throw new Error(`robots/${config.model} introuvable`);
    let ldrText;
    if (config.model.toLowerCase().endsWith('.io')) {
      const blob = await modelResp.blob();
      ldrText = await parseIoFile(new File([blob], config.model));
    } else {
      ldrText = await modelResp.text();
    }
    await loadRobot(scene, ldrText, config);
    robotName.textContent = config.name || file;
    selectedRobotFile = file;
    saveSession();
    log('Robot chargé.', 'ok');
  } catch (err) {
    log('Erreur chargement robot: ' + err.message, 'err');
    console.error(err);
  }
}

matSelect.addEventListener('change', () => loadMatByFile(matSelect.value));
robotSelect.addEventListener('change', () => loadRobotByFile(robotSelect.value));

document.getElementById('reset-btn').onclick = () => {
  resetSimulation(scene);
  simStatus.textContent = 'Prêt';
  log('Simulation réinitialisée.', 'info');
};

// Éditeurs
const blocklyWorkspace = setupBlockly(document.getElementById('blockly-area'));
const monaco = await setupMonaco(document.getElementById('monaco-area'));

function syncBlocksToPython() {
  try {
    const code = Blockly.Python.workspaceToCode(blocklyWorkspace);
    monaco.setValue(code);
  } catch (e) {
    console.warn('Conversion blocs->python:', e);
  }
}

// Sauvegarde sur changement éditeur (debounced)
monaco.onDidChangeModelContent(() => saveSessionDebounced());
blocklyWorkspace.addChangeListener((e) => {
  if (e.isUiEvent) return;
  saveSessionDebounced();
});

// Sauvegarde finale au déchargement de la page
window.addEventListener('beforeunload', () => saveSession());

// --- Restauration session + peuplement des sélecteurs ---
async function initSelectorsAndRestore() {
  restoring = true;
  try {
    const data = readSession() || {};

    // 1) Restaurer code / blocs immédiatement (ne dépend pas du réseau)
    if (data.code) {
      try { monaco.setValue(data.code); } catch (e) { console.warn(e); }
    }
    if (data.blocks) {
      try {
        const dom = Blockly.utils.xml.textToDom(data.blocks);
        blocklyWorkspace.clear();
        Blockly.Xml.domToWorkspace(dom, blocklyWorkspace);
      } catch (e) { console.warn('Restauration blocs:', e); }
    }

    // 2) Récupérer les manifestes
    const [mats, robots] = await Promise.all([
      fetchManifest('mats/index.json'),
      fetchManifest('robots/index.json'),
    ]);

    // 3) Choix par défaut : sauvegardé s'il existe encore, sinon premier de la liste
    const matChoice = mats.find(m => m.file === data.matFile)?.file || mats[0]?.file || null;
    const robotChoice = robots.find(r => r.file === data.robotFile)?.file || robots[0]?.file || null;

    populateSelect(matSelect, mats, matChoice);
    populateSelect(robotSelect, robots, robotChoice);

    // 4) Charger le mat puis le robot
    if (matChoice) await loadMatByFile(matChoice);
    if (robotChoice) await loadRobotByFile(robotChoice);

    // 5) Appliquer la pose de départ sauvegardée (override de start_zone)
    if (data.startPose) {
      scene.startPose = data.startPose;
      scene.robotState.x = data.startPose.x;
      scene.robotState.z = data.startPose.z;
      scene.robotState.heading = data.startPose.heading;
      if (scene.robot) {
        scene.robot.position.set(data.startPose.x, 5, data.startPose.z);
        scene.robot.rotation.y = data.startPose.heading + (scene.robotModel?.frontRotation || 0);
      }
    }
  } finally {
    restoring = false;
    saveSession();
  }
}
await initSelectorsAndRestore();

// Initialiser Pyodide en arrière-plan (n'empêche pas le chargement mat/robot)
log('Chargement de Pyodide (Python dans le navigateur)...', 'info');
let pyodide = null;
const SPIKE3_MODULES = [
  '_sim', 'hub', 'motor', 'motor_pair', 'color',
  'color_sensor', 'distance_sensor', 'force_sensor', 'runloop',
];
const pyodideReady = (async () => {
  try {
    pyodide = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
    });
    window.pyodide = pyodide;
    log('Pyodide prêt.', 'ok');
    pyodide.FS.mkdirTree('/lib');
    const cacheBust = Date.now();
    for (const m of SPIKE3_MODULES) {
      const src = await fetch(`src/api/${m}.py?v=${cacheBust}`, { cache: 'no-store' }).then(r => r.text());
      pyodide.FS.writeFile(`/lib/${m}.py`, src);
    }
    pyodide.runPython("import sys; sys.path.insert(0, '/lib')");
    log('API SPIKE 3 chargée.', 'ok');
  } catch (e) {
    log('Erreur init Pyodide : ' + e.message, 'err');
    console.error(e);
  }
})();

// --- Boutons run/stop ---
document.getElementById('run-btn').onclick = async () => {
  if (!pyodide) {
    log('Pyodide pas encore prêt, patientez...', 'info');
    await pyodideReady;
    if (!pyodide) { log('Pyodide indisponible.', 'err'); return; }
  }
  const code = monaco.getValue();
  if (!code.trim()) { log('Code vide.', 'err'); return; }
  simStatus.textContent = 'En cours...';
  try {
    const result = await runPython(pyodide, code, scene, log);
    simStatus.textContent = result?.stopped ? 'Arrêté' : 'Terminé';
  } catch (e) {
    log(String(e), 'err');
    simStatus.textContent = 'Erreur';
  }
};

document.getElementById('stop-btn').onclick = () => {
  stopPython();
  simStatus.textContent = 'Arrêté';
};

log('Prêt. Importez un robot et un mat pour commencer.', 'info');
