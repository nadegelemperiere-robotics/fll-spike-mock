// src/editor/ui.js — point d'entrée principal
import { initScene, loadMat, loadRobot, resetSimulation } from '../simulator/scene.js';
import { setupBlockly } from './blockly-config.js';
import { setupMonaco } from './monaco-config.js';
import { initRunner, runPython, stopPython } from './runner.js';
import { parseIoFile } from '../robot/io-parser.js';
import { HubDisplay } from '../simulator/hub-display.js';

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

// --- Splitter draggable entre éditeur et simulateur/console ---
(function setupSplitter() {
  const splitter = document.getElementById('layout-splitter');
  const layout = document.querySelector('.layout');
  if (!splitter || !layout) return;

  let dragging = false;
  const MIN = 280;  // largeur min de l'éditeur
  const RIGHT_MIN = 280;  // largeur min côté sim/console

  splitter.addEventListener('pointerdown', (e) => {
    dragging = true;
    splitter.classList.add('dragging');
    splitter.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  splitter.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const rect = layout.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clamped = Math.max(MIN, Math.min(rect.width - RIGHT_MIN, x));
    layout.style.setProperty('--editor-width', `${clamped}px`);
    // Forcer re-layout Blockly (Monaco s'adapte tout seul via automaticLayout)
    if (typeof Blockly !== 'undefined' && typeof blocklyWorkspace !== 'undefined' && blocklyWorkspace) {
      Blockly.svgResize(blocklyWorkspace);
    }
  });

  splitter.addEventListener('pointerup', (e) => {
    if (!dragging) return;
    dragging = false;
    splitter.classList.remove('dragging');
    splitter.releasePointerCapture(e.pointerId);
    saveSession();
  });
})();

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
    const layout = document.querySelector('.layout');
    const data = {
      code: typeof monaco !== 'undefined' && monaco?.getValue ? monaco.getValue() : null,
      blocks: (typeof blocklyWorkspace !== 'undefined' && blocklyWorkspace && typeof Blockly !== 'undefined')
        ? Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(blocklyWorkspace))
        : null,
      matFile: selectedMatFile,
      robotFile: selectedRobotFile,
      startPose: scene?.startPose || null,
      editorWidth: layout?.style.getPropertyValue('--editor-width') || null,
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
const hubDisplay = new HubDisplay();
window.hubDisplay = hubDisplay;
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
  hubDisplay.reset();
  simStatus.textContent = 'Prêt';
  log('Simulation réinitialisée.', 'info');
};

// Éditeurs
const blocklyWorkspace = setupBlockly(document.getElementById('blockly-area'));
const monaco = await setupMonaco(document.getElementById('monaco-area'));

// Affichage du Python généré dans l'onglet Python.
// Mettre à false pour cacher le code généré (l'onglet Python devient un éditeur indépendant).
const SHOW_GENERATED_PYTHON = true;

function generatePythonFromBlocks() {
  try {
    return Blockly.Python.workspaceToCode(blocklyWorkspace);
  } catch (e) {
    console.warn('Conversion blocs->python:', e);
    return '';
  }
}

function syncBlocksToPython() {
  if (!SHOW_GENERATED_PYTHON) return;
  monaco.setValue(generatePythonFromBlocks());
}

// Source active : blocs (régénérée à la volée) ou Python (Monaco)
function getActiveCode() {
  const blocksTab = document.querySelector('.tab[data-tab="blocks"]');
  if (blocksTab?.classList.contains('active')) {
    return generatePythonFromBlocks();
  }
  return monaco.getValue();
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

    // 0) Restaurer la largeur de l'éditeur
    if (data.editorWidth) {
      const layout = document.querySelector('.layout');
      if (layout) layout.style.setProperty('--editor-width', data.editorWidth);
    }

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

// Initialiser Pyodide dans un Web Worker (n'empêche pas le chargement mat/robot).
// Le worker permet d'interrompre des boucles Python pures (while True: pass) :
// le main thread reste libre pour gérer le clic Stop.
log('Chargement de Pyodide (worker)...', 'info');
const pyodideReady = initRunner(scene, log).then(r => {
  if (r?.ready) log('API SPIKE 3 chargée.', 'ok');
  return r;
});

// --- Boutons run/stop ---
document.getElementById('run-btn').onclick = async () => {
  const r = await pyodideReady;
  if (!r?.ready) { log('Pyodide indisponible.', 'err'); return; }
  const code = getActiveCode();
  if (!code.trim()) { log('Code vide.', 'err'); return; }
  simStatus.textContent = 'En cours...';
  try {
    const result = await runPython(code);
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

// --- Charger / Sauver ---
function downloadBlob(name, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function pickFile(accept) {
  return new Promise((resolve) => {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = accept;
    inp.onchange = () => {
      const f = inp.files?.[0];
      if (!f) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve({ name: f.name, content: String(reader.result) });
      reader.onerror = () => resolve(null);
      reader.readAsText(f);
    };
    inp.click();
  });
}

// Bascule d'onglet sans déclencher syncBlocksToPython (qui écraserait
// le code qu'on vient de charger).
function activateTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('hidden', c.id !== `tab-${name}`));
}

function isBlocksTabActive() {
  return document.querySelector('.tab[data-tab="blocks"]')?.classList.contains('active');
}

// Ouvre un vrai « Save As » natif si l'API File System Access est dispo
// (Chrome/Edge), sinon retombe sur prompt + téléchargement classique (Firefox/Safari).
async function saveWithDialog(suggested, content, mime, ext) {
  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: suggested,
        types: [{ description: ext.toUpperCase(), accept: { [mime]: ['.' + ext] } }],
      });
      const w = await handle.createWritable();
      await w.write(content);
      await w.close();
      return handle.name;
    } catch (e) {
      if (e.name === 'AbortError') return null;
      console.warn('showSaveFilePicker indisponible, fallback prompt :', e);
    }
  }
  const name = window.prompt('Nom du fichier :', suggested);
  if (!name) return null;
  const finalName = name.toLowerCase().endsWith('.' + ext) ? name : `${name}.${ext}`;
  downloadBlob(finalName, content, mime);
  return finalName;
}

document.getElementById('save-btn').onclick = async () => {
  if (isBlocksTabActive()) {
    const xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(blocklyWorkspace));
    const name = await saveWithDialog('program.xml', xml, 'application/xml', 'xml');
    if (name) log(`Blocs sauvés (${name}).`, 'ok');
  } else {
    const name = await saveWithDialog('program.py', monaco.getValue(), 'text/x-python', 'py');
    if (name) log(`Python sauvé (${name}).`, 'ok');
  }
};

document.getElementById('load-btn').onclick = async () => {
  const f = await pickFile('.py,.xml');
  if (!f) return;
  const isXml = f.name.toLowerCase().endsWith('.xml');
  if (isXml) {
    try {
      const dom = Blockly.utils.xml.textToDom(f.content);
      blocklyWorkspace.clear();
      Blockly.Xml.domToWorkspace(dom, blocklyWorkspace);
      activateTab('blocks');
      log(`Blocs chargés depuis ${f.name}.`, 'ok');
    } catch (e) {
      log('Erreur lecture XML : ' + e.message, 'err');
    }
  } else {
    monaco.setValue(f.content);
    activateTab('python');
    log(`Python chargé depuis ${f.name}.`, 'ok');
  }
  saveSession();
};

log('Prêt. Importez un robot et un mat pour commencer.', 'info');
