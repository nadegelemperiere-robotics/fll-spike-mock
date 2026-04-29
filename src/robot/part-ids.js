// src/robot/part-ids.js
// Numéros de pièces LDraw pour les composants SPIKE Prime.
// Ces IDs sont utilisés pour reconnaître automatiquement les éléments du robot
// dans un fichier .ldr exporté de Studio.
//
// On accepte plusieurs variantes : BrickLink utilise parfois des IDs `bbXXXX(cYY)`
// pour ses pièces "non encore officielles" en LDraw, et LEGO Education a ses
// propres design IDs (45601, 45605...).

export const HUB_IDS = new Set([
  '27843',     // SPIKE Prime Hub (BrickLink)
  '27843c01',
  'bb1142',    // SPIKE Hub (BrickLink Studio internal)
  'bb1142c01',
  '45601',     // LEGO design ID
  '45601c01',
  'u9393c02',  // SPIKE Hub (variante LDraw unofficial)
  'u9393',
  '53444',     // SPIKE Hub (variante BrickLink)
  '53444c01',
]);

export const MOTOR_IDS = new Set([
  // Large Angular Motor
  '54696', '54696c01',
  '76505', '76505c01',
  'bb1180', 'bb1180c01',
  '45602', '45602c01',
  // Medium Angular Motor
  '54675', '54675c01',
  '76506', '76506c01',
  'bb1181', 'bb1181c01',
  '45603', '45603c01',
  // Small Angular Motor
  '6214085',
]);

export const COLOR_SENSOR_IDS = new Set([
  '37308', '37308c01',
  '76491', '76491c01',
  'bb1188', 'bb1188c01',
  '45605', '45605c01',
]);

export const DISTANCE_SENSOR_IDS = new Set([
  '37316', '37316c01',
  'bb1189', 'bb1189c01',
  '45604', '45604c01',
]);

export const FORCE_SENSOR_IDS = new Set([
  '37312', '37312c01',
  'bb1186', 'bb1186c01',
  '45606', '45606c01',
]);

// Roues SPIKE communes (utiles pour calculer la circonférence réelle)
export const WHEEL_IDS = new Map([
  ['39367', { diameter_mm: 56, name: 'Tire 56x14' }],
  ['32007', { diameter_mm: 43.2, name: 'Tire 43.2x22' }],
  ['86652', { diameter_mm: 49.5, name: 'Tire 49.5x20' }],
  ['41897', { diameter_mm: 56, name: 'Tire 56x28 ZR' }],
  ['24799', { diameter_mm: 53, name: 'Tire 53x22' }],
  // Variantes "spike big blue wheel"
  ['49295c01', { diameter_mm: 56, name: 'Wheel SPIKE 56mm' }],
]);

/** Nettoie un nom de pièce LDraw (enlève .dat, met en minuscules). */
export function normalizePartId(s) {
  return s.toLowerCase().replace(/\.dat$/, '').trim();
}

/** Catégorise une pièce par son ID. Retourne {type, ...meta} ou null si non SPIKE. */
export function classifyPart(partId) {
  const id = normalizePartId(partId);
  if (HUB_IDS.has(id)) return { type: 'hub' };
  if (MOTOR_IDS.has(id)) return { type: 'motor' };
  if (COLOR_SENSOR_IDS.has(id)) return { type: 'color_sensor' };
  if (DISTANCE_SENSOR_IDS.has(id)) return { type: 'distance_sensor' };
  if (FORCE_SENSOR_IDS.has(id)) return { type: 'force_sensor' };
  if (WHEEL_IDS.has(id)) return { type: 'wheel', ...WHEEL_IDS.get(id) };
  return null;
}
