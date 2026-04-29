// src/robot/robot-builder.js
// Convertit les composants SPIKE détectés en un modèle physique simulable :
// - calcule l'empattement, le centre, l'orientation
// - associe les moteurs aux roues les plus proches
// - prépare les positions des capteurs en repère robot-local

import * as THREE from 'three';

export function buildRobotModel(components) {
  const hub = components.find(c => c.type === 'hub');
  if (!hub) throw new Error('Aucun Hub SPIKE détecté dans le modèle.');

  const motors = components.filter(c => c.type === 'motor');
  const sensors = components.filter(c => c.type.endsWith('_sensor'));
  const wheels = components.filter(c => c.type === 'wheel');

  // Centre du robot = position du hub
  const hubPos = new THREE.Vector3(...hub.position);

  // Pour chaque moteur, trouver la roue la plus proche -> moteur de propulsion
  const drivingMotors = [];
  for (const m of motors) {
    const mPos = new THREE.Vector3(...m.position);
    let closest = null;
    let closestDist = Infinity;
    for (const w of wheels) {
      const d = mPos.distanceTo(new THREE.Vector3(...w.position));
      if (d < closestDist) { closestDist = d; closest = w; }
    }
    if (closest && closestDist < 80) { // 80 mm de proximité = roue motrice
      drivingMotors.push({ motor: m, wheel: closest, distToHub: hubPos.distanceTo(mPos) });
    }
  }

  // Identifier moteur gauche / droit en regardant la position relative au hub
  // (axe X local : on choisit l'axe avec la plus grande variance entre moteurs)
  let left = null, right = null;
  if (drivingMotors.length >= 2) {
    drivingMotors.sort((a, b) => {
      const ax = new THREE.Vector3(...a.motor.position).x - hubPos.x;
      const bx = new THREE.Vector3(...b.motor.position).x - hubPos.x;
      return ax - bx;
    });
    left = drivingMotors[0];
    right = drivingMotors[drivingMotors.length - 1];
  }

  const wheelDiameterMm = left?.wheel?.meta?.diameter_mm || 56;
  const wheelbase = left && right
    ? new THREE.Vector3(...left.motor.position).distanceTo(new THREE.Vector3(...right.motor.position))
    : 130; // valeur par défaut

  // Bounding box pour estimer la taille du châssis
  const box = new THREE.Box3();
  for (const c of components) box.expandByPoint(new THREE.Vector3(...c.position));
  const size = box.getSize(new THREE.Vector3());

  return {
    hub,
    motors,
    sensors,
    drivingMotors,
    leftMotor: left?.motor,
    rightMotor: right?.motor,
    leftPort: left?.motor?.port,
    rightPort: right?.motor?.port,
    wheelDiameterMm,
    wheelbase,
    chassisSize: { x: size.x, y: size.y, z: size.z },
    hubPosition: hubPos.toArray(),
  };
}
