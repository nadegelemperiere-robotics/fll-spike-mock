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
  hub: 0xf3ce0e,
  motor: 0x2ad7ea,
  color_sensor: 0x1e1e20,
  distance_sensor: 0x1e1e20,
  force_sensor: 0x1e1e20,
  wheel: 0x2ad7ea,
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
  const allPositions = [];  // toutes les pièces (classées + Technic) pour le contour
  const unclassified = new Set();
  const identity = new THREE.Matrix4();
  expandFile(files, main, identity, components, unclassified, allPositions);

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
    for (let i = 0; i < allPositions.length; i++) {
      const [x, y, z] = allPositions[i];
      allPositions[i] = [x - hx, y - hy, z - hz];
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
    for (let i = 0; i < allPositions.length; i++) {
      const [x, y, z] = allPositions[i];
      allPositions[i] = [cos * x + sin * z, y, -sin * x + cos * z];
    }
  }

  // Construire un groupe 3D simple avec des boîtes colorées
  const group = buildPlaceholderGroup(components);

  // Contour : convex hull XZ de toutes les pièces du .io, dessiné en noir.
  addHullOutline(group, allPositions);

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


function expandFile(files, file, parentMatrix, components, unclassified, allPositions) {
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
      const posMm = [pos.x * LDU_TO_MM, -pos.y * LDU_TO_MM, pos.z * LDU_TO_MM];
      components.push({
        type: cls.type,
        partId: partName,
        position: posMm,
        rotation: quat.toArray(),
        meta: cls,
      });
      if (allPositions) allPositions.push([...posMm]);
      continue;
    }

    // Sinon référence à un sous-modèle MPD ?
    const sub = files.find(s => s.name === partName);
    if (sub) {
      expandFile(files, sub, worldM, components, unclassified, allPositions);
      continue;
    }

    // Pièce Technic non classée : on garde quand même sa position pour le contour.
    if (allPositions) {
      const pos = new THREE.Vector3();
      const quat = new THREE.Quaternion();
      const scale = new THREE.Vector3();
      worldM.decompose(pos, quat, scale);
      allPositions.push([pos.x * LDU_TO_MM, -pos.y * LDU_TO_MM, pos.z * LDU_TO_MM]);
    }
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


// --- Contour : enveloppe convexe XZ ---

// Andrew's monotone chain. Entrée : points [[x,z], …]. Sortie : sommets de
// l'enveloppe en CCW. O(n log n).
function convexHullXZ(points) {
  if (points.length < 3) return points.slice();
  const pts = points.slice().sort((a, b) => (a[0] - b[0]) || (a[1] - b[1]));
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  upper.pop(); lower.pop();
  return lower.concat(upper);
}

function addHullOutline(group, allPositions) {
  if (!allPositions || allPositions.length < 3) return;
  const xz = allPositions.map(p => [p[0], p[2]]);
  const hull = convexHullXZ(xz);
  if (hull.length < 3) return;
  const points = hull.map(([x, z]) => new THREE.Vector3(x, 30, z));
  const geom = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({ color: 0x000000, depthTest: false });
  const line = new THREE.LineLoop(geom, mat);
  line.renderOrder = 200;
  line.userData.spikeType = 'hull';
  group.add(line);
}


// --- Placeholder geometry ---

function buildPlaceholderGroup(components) {
  const group = new THREE.Group();
  for (const c of components) {
    const size = PLACEHOLDER_SIZES_MM[c.type] || [16, 16, 16];
    const geom = new THREE.BoxGeometry(size[0], size[1], size[2]);
    // MeshBasicMaterial : pas d'éclairage, la couleur est rendue telle quelle.
    // En vue top-down ça évite la désaturation imposée par le PBR.
    const mat = new THREE.MeshBasicMaterial({
      color: PLACEHOLDER_COLORS[c.type] || 0x888888,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(c.position[0], c.position[1], c.position[2]);
    mesh.userData.fileName = c.partId;
    mesh.userData.spikeType = c.type;
    group.add(mesh);
  }
  return group;
}
