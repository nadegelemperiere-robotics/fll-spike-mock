// src/robot/ldraw-loader.js
// Parse un texte LDraw / MPD pour en extraire les composants SPIKE
// (Hub, moteurs, capteurs, roues) avec leur position en mm.
//
// On n'utilise PAS three.js LDrawLoader : la bibliothèque publique ne contient
// pas les pièces SPIKE Prime récentes (27843, 54696, etc.) et chercher des CDN
// alternatifs est fragile. À la place, on construit un groupe Three.js de
// placeholders (boîtes colorées) à partir des composants détectés.
// Largement suffisant pour un simulateur top-down différentiel.

import * as THREE from 'three';
import { classifyPart } from './part-ids.js';

const LDU_TO_MM = 0.4;

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

const PLACEHOLDER_COLORS = {
  hub: 0xffd166,
  motor: 0x4a4a4a,
  color_sensor: 0x4dd2ff,
  distance_sensor: 0xff8c42,
  force_sensor: 0xff5e7d,
  wheel: 0x1a1f26,
};

const PLACEHOLDER_SIZES_MM = {
  hub: [86, 28, 70],
  motor: [42, 42, 28],
  color_sensor: [22, 22, 22],
  distance_sensor: [22, 22, 22],
  force_sensor: [22, 22, 22],
  wheel: [12, 56, 56],
};


/**
 * Parse un texte LDraw / MPD et retourne :
 *   { group: THREE.Group, components: [{type, port?, position, rotation, partId}, ...] }
 *
 * `config.front` ('+x'|'-x'|'+z'|'-z') indique l'axe LDraw qui correspond à
 * l'avant du robot ; les positions sont pivotées pour que toute la suite du
 * pipeline travaille dans le repère canonique (avant = -Z, latéral = X).
 */
export async function loadLdrawModel(ldrText, config = {}) {
  const files = parseMpdFiles(ldrText);
  const main = files.find(f => f.name === '__root__') || files[0];

  const components = [];
  const unclassified = new Set();
  const identity = new THREE.Matrix4();
  expandFile(files, main, identity, components, unclassified);

  // Auto-assigner les ports A-F aux moteurs et capteurs dans l'ordre où
  // ils apparaissent (ordre de parsing).
  const ports = ['A', 'B', 'C', 'D', 'E', 'F'];
  let portIdx = 0;
  for (const c of components) {
    if (['motor', 'color_sensor', 'distance_sensor', 'force_sensor'].includes(c.type)) {
      c.port = ports[portIdx++] || `X${portIdx}`;
    }
  }

  // Recentrer toutes les pièces sur le hub : sa position devient (0,0,0) dans
  // le repère du robot. Comme ça, faire pivoter le groupe autour de son origine
  // fait pivoter le robot autour de son hub (et pas autour de l'origine LDR).
  const hub = components.find(c => c.type === 'hub');
  if (hub) {
    const [hx, hy, hz] = hub.position;
    for (const c of components) {
      c.position = [c.position[0] - hx, c.position[1] - hy, c.position[2] - hz];
    }
  }

  // Appliquer la rotation `front` aux positions pour passer en repère canonique
  // (front = -Z, latéral = X). Comme ça, robot-builder peut trier sur X pour
  // identifier gauche/droite, et la cinématique différentielle marche directement.
  const frontAngle = frontAxisToRotation(config.front);
  if (frontAngle !== 0) {
    const cos = Math.cos(frontAngle);
    const sin = Math.sin(frontAngle);
    for (const c of components) {
      const [x, y, z] = c.position;
      c.position = [cos * x + sin * z, y, -sin * x + cos * z];
    }
  }

  // Construire un groupe 3D simple avec des boîtes colorées
  const group = buildPlaceholderGroup(components);

  // Diagnostic systématique
  if (typeof window !== 'undefined' && window.simLog) {
    const counts = { hub: 0, motor: 0, color_sensor: 0, distance_sensor: 0, force_sensor: 0, wheel: 0 };
    for (const c of components) counts[c.type] = (counts[c.type] || 0) + 1;
    const summary = Object.entries(counts).filter(([, n]) => n > 0).map(([k, n]) => `${k}=${n}`).join(', ');
    window.simLog(`Pièces SPIKE détectées : ${summary || '(aucune)'}.`, 'info');
    if (unclassified.size > 0) {
      const sample = [...unclassified].slice(0, 30).join(', ');
      window.simLog(
        `Pièces non classées (${unclassified.size}) : ${sample}${unclassified.size > 30 ? '…' : ''}`,
        'info'
      );
    }
  }

  return { group, components };
}


// --- Parsing MPD ---

function parseMpdFiles(text) {
  // MPD : un fichier peut contenir plusieurs sous-modèles délimités par
  // `0 FILE <nom>` / `0 NOFILE`. Sans aucun marker, tout est dans __root__.
  const files = [];
  let current = { name: '__root__', lines: [] };
  files.push(current);
  let sawFileMarker = false;

  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    const fileMatch = trimmed.match(/^0\s+FILE\s+(.+)$/i);
    if (fileMatch) {
      const name = fileMatch[1].trim().toLowerCase();
      current = { name, lines: [] };
      files.push(current);
      sawFileMarker = true;
      continue;
    }
    if (/^0\s+NOFILE\b/i.test(trimmed)) {
      current = { name: '__orphan__', lines: [] };
      continue;
    }
    current.lines.push(line);
  }

  // Si des FILE markers existent, le premier sous-modèle nommé devient la racine.
  // L'éventuel `__root__` initial (lignes avant la première directive FILE)
  // n'est utilisé que comme commentaires de tête : on le jette.
  if (sawFileMarker) {
    const initialRoot = files[0];
    const namedFiles = files.filter(f => f !== initialRoot && f.name !== '__orphan__');
    if (namedFiles.length > 0) {
      namedFiles[0].name = '__root__';
      return namedFiles;
    }
  }
  return files.filter(f => f.name !== '__orphan__');
}


function expandFile(files, file, parentMatrix, components, unclassified) {
  for (const line of file.lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('1 ')) continue;
    // Format LDraw : 1 colour x y z a b c d e f g h i partname
    const tokens = trimmed.split(/\s+/);
    if (tokens.length < 15) continue;

    const x = parseFloat(tokens[2]);
    const y = parseFloat(tokens[3]);
    const z = parseFloat(tokens[4]);
    const a = parseFloat(tokens[5]), b = parseFloat(tokens[6]), c = parseFloat(tokens[7]);
    const d = parseFloat(tokens[8]), e = parseFloat(tokens[9]), f = parseFloat(tokens[10]);
    const g = parseFloat(tokens[11]), h = parseFloat(tokens[12]), i = parseFloat(tokens[13]);

    // Le nom de pièce peut contenir des espaces (rare). On reconstruit.
    const partName = tokens.slice(14).join(' ').toLowerCase();

    // Matrice locale (ligne par ligne dans set())
    const localM = new THREE.Matrix4().set(
      a, b, c, x,
      d, e, f, y,
      g, h, i, z,
      0, 0, 0, 1
    );
    const worldM = parentMatrix.clone().multiply(localM);

    // Pièce SPIKE connue (priorité sur les sous-modèles, au cas où un sous-modèle
    // porte le même nom qu'une pièce officielle) ?
    const cls = classifyPart(partName);
    if (cls) {
      const pos = new THREE.Vector3();
      const quat = new THREE.Quaternion();
      const scale = new THREE.Vector3();
      worldM.decompose(pos, quat, scale);
      // LDU -> mm avec inversion Y (LDraw Y pointe vers le bas)
      components.push({
        type: cls.type,
        partId: partName,
        position: [pos.x * LDU_TO_MM, -pos.y * LDU_TO_MM, pos.z * LDU_TO_MM],
        rotation: quat.toArray(),
        meta: cls,
      });
      continue;
    }

    // Sinon référence à un sous-modèle MPD ?
    const sub = files.find(s => s.name === partName);
    if (sub) {
      expandFile(files, sub, worldM, components, unclassified);
      continue;
    }

    // Pièce inconnue : on l'enregistre pour le diagnostic
    if (unclassified) unclassified.add(partName);
  }
}


function collectAllPartIds(files) {
  const set = new Set();
  for (const file of files) {
    for (const line of file.lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('1 ')) continue;
      const tokens = trimmed.split(/\s+/);
      if (tokens.length >= 15) set.add(tokens.slice(14).join(' ').toLowerCase());
    }
  }
  return [...set];
}


// --- Placeholder geometry ---

function buildPlaceholderGroup(components) {
  const group = new THREE.Group();
  for (const c of components) {
    const size = PLACEHOLDER_SIZES_MM[c.type] || [16, 16, 16];
    const geom = new THREE.BoxGeometry(size[0], size[1], size[2]);
    const mat = new THREE.MeshStandardMaterial({
      color: PLACEHOLDER_COLORS[c.type] || 0x888888,
      roughness: 0.6,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(c.position[0], c.position[1], c.position[2]);
    mesh.userData.fileName = c.partId;
    mesh.userData.spikeType = c.type;
    group.add(mesh);
  }
  return group;
}
