// src/editor/blockly-config.js
// Palette Blockly inspirée de l'app LEGO SPIKE Prime 3.
// Génère du Python qui cible nos modules /lib/* (motor, motor_pair, color_sensor, ...).

const C = {
  motor:     '#3f8eee',  // Bleu SPIKE
  events:    '#edc643',
  movement:  '#EC5AC8',  // Rose SPIKE
  light:     '#946cee',
  sound:     '#b466e9',
  sensors:   '#5CB1D6',
  control:   '#f4b844',
  operators: '#53b65a',  // Vert SPIKE Operators
  myblocks:  '#ed7082',  // Rose foncé style SPIKE My Blocks
  vars:      '#f19d4c',  // Orange clair SPIKE Variables
  lists:     '#ed724a',  // Orange foncé SPIKE Lists
};

// Petite icône moteur SPIKE (roue avec 4 plots) — affichée à gauche de chaque bloc Motor.
const MOTOR_ICON_URL = 'data:image/svg+xml;base64,' + btoa(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
  '<circle cx="12" cy="12" r="11" fill="white"/>' +
  '<circle cx="12" cy="12" r="3" fill="#3f8eee"/>' +
  '<circle cx="12" cy="4" r="2.2" fill="#3f8eee"/>' +
  '<circle cx="12" cy="20" r="2.2" fill="#3f8eee"/>' +
  '<circle cx="4" cy="12" r="2.2" fill="#3f8eee"/>' +
  '<circle cx="20" cy="12" r="2.2" fill="#3f8eee"/>' +
  '</svg>'
);
const MOTOR_ICON = { type: 'field_image', src: MOTOR_ICON_URL, width: 22, height: 22, alt: '' };

// Helper générique pour fabriquer une icône (data URI SVG → field_image).
function eventIcon(svg, w = 22, h = 22) {
  const url = 'data:image/svg+xml;base64,' + btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${svg}</svg>`
  );
  return { type: 'field_image', src: url, width: w, height: h, alt: '' };
}

const PLAY_ICON       = eventIcon('<polygon points="6,4 19,11 6,18" fill="white"/>');
const COLOR_EVT_ICON  = eventIcon('<circle cx="11" cy="11" r="9" fill="white"/><circle cx="11" cy="11" r="3.5" fill="#FFBF00"/>');
const HUB_MATRIX_ICON = eventIcon(
  '<rect x="2" y="2" width="18" height="18" rx="2" fill="white"/>' +
  '<rect x="4" y="4" width="3" height="3" rx="0.5" fill="#FFBF00"/>' +
  '<rect x="9.5" y="4" width="3" height="3" rx="0.5" fill="#FFBF00"/>' +
  '<rect x="15" y="4" width="3" height="3" rx="0.5" fill="#FFBF00"/>' +
  '<rect x="4" y="9.5" width="3" height="3" rx="0.5" fill="#FFBF00"/>' +
  '<rect x="9.5" y="9.5" width="3" height="3" rx="0.5" fill="#FFBF00"/>' +
  '<rect x="15" y="9.5" width="3" height="3" rx="0.5" fill="#FFBF00"/>' +
  '<rect x="4" y="15" width="3" height="3" rx="0.5" fill="#FFBF00"/>' +
  '<rect x="9.5" y="15" width="3" height="3" rx="0.5" fill="#FFBF00"/>' +
  '<rect x="15" y="15" width="3" height="3" rx="0.5" fill="#FFBF00"/>'
);
const FORCE_EVT_ICON  = eventIcon('<rect x="3" y="3" width="16" height="16" rx="6" fill="white"/>');
const DIST_EVT_ICON   = eventIcon('<circle cx="7" cy="11" r="5" fill="white"/><circle cx="15" cy="11" r="5" fill="white"/><circle cx="7" cy="11" r="2" fill="#FFBF00"/><circle cx="15" cy="11" r="2" fill="#FFBF00"/>');

// Icône matrice 5x5 pour les blocs Light (violet SPIKE).
const LIGHT_MATRIX_ICON = eventIcon(
  (() => {
    let out = '<rect x="2" y="2" width="18" height="18" rx="2" fill="white"/>';
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        out += `<rect x="${3.2 + x * 2.9}" y="${3.2 + y * 2.9}" width="2" height="2" rx="0.3" fill="#946cee"/>`;
      }
    }
    return out;
  })()
);
// Icône capteur couleur pour le bloc "light up" (LED autour du capteur).
const COLOR_LIGHT_ICON = eventIcon('<circle cx="11" cy="11" r="9" fill="white"/><circle cx="11" cy="11" r="3.5" fill="#946cee"/>');

// Icône double moteur (roue avant/arrière côte à côte) — pour les blocs Movement.
const DRIVE_ICON_URL = 'data:image/svg+xml;base64,' + btoa(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 24">' +
  '<circle cx="9" cy="12" r="9" fill="white"/>' +
  '<circle cx="9" cy="12" r="2.5" fill="#EC5AC8"/>' +
  '<circle cx="9" cy="5" r="1.7" fill="#EC5AC8"/>' +
  '<circle cx="9" cy="19" r="1.7" fill="#EC5AC8"/>' +
  '<circle cx="2" cy="12" r="1.7" fill="#EC5AC8"/>' +
  '<circle cx="16" cy="12" r="1.7" fill="#EC5AC8"/>' +
  '<circle cx="23" cy="12" r="9" fill="white"/>' +
  '<circle cx="23" cy="12" r="2.5" fill="#EC5AC8"/>' +
  '<circle cx="23" cy="5" r="1.7" fill="#EC5AC8"/>' +
  '<circle cx="23" cy="19" r="1.7" fill="#EC5AC8"/>' +
  '<circle cx="30" cy="12" r="1.7" fill="#EC5AC8"/>' +
  '</svg>'
);
const DRIVE_ICON = { type: 'field_image', src: DRIVE_ICON_URL, width: 30, height: 22, alt: '' };

const PORT_OPTIONS = [['A','A'],['B','B'],['C','C'],['D','D'],['E','E'],['F','F']];
const COLOR_OPTIONS = [
  ['black',     'BLACK'],
  ['magenta',   'MAGENTA'],
  ['purple',    'PURPLE'],
  ['blue',      'BLUE'],
  ['azure',     'AZURE'],
  ['turquoise', 'TURQUOISE'],
  ['green',     'GREEN'],
  ['yellow',    'YELLOW'],
  ['orange',    'ORANGE'],
  ['red',       'RED'],
  ['white',     'WHITE'],
];
const IMAGE_OPTIONS = [
  ['heart',          'IMAGE_HEART'],
  ['heart small',    'IMAGE_HEART_SMALL'],
  ['happy',          'IMAGE_HAPPY'],
  ['smile',          'IMAGE_SMILE'],
  ['sad',            'IMAGE_SAD'],
  ['confused',       'IMAGE_CONFUSED'],
  ['angry',          'IMAGE_ANGRY'],
  ['asleep',         'IMAGE_ASLEEP'],
  ['surprised',      'IMAGE_SURPRISED'],
  ['silly',          'IMAGE_SILLY'],
  ['fabulous',       'IMAGE_FABULOUS'],
  ['meh',            'IMAGE_MEH'],
  ['yes',            'IMAGE_YES'],
  ['no',             'IMAGE_NO'],
  ['clock 12',       'IMAGE_CLOCK12'],
  ['clock 1',        'IMAGE_CLOCK1'],
  ['clock 2',        'IMAGE_CLOCK2'],
  ['clock 3',        'IMAGE_CLOCK3'],
  ['clock 4',        'IMAGE_CLOCK4'],
  ['clock 5',        'IMAGE_CLOCK5'],
  ['clock 6',        'IMAGE_CLOCK6'],
  ['clock 7',        'IMAGE_CLOCK7'],
  ['clock 8',        'IMAGE_CLOCK8'],
  ['clock 9',        'IMAGE_CLOCK9'],
  ['clock 10',       'IMAGE_CLOCK10'],
  ['clock 11',       'IMAGE_CLOCK11'],
  ['arrow N ↑',      'IMAGE_ARROW_N'],
  ['arrow NE ↗',     'IMAGE_ARROW_NE'],
  ['arrow E →',      'IMAGE_ARROW_E'],
  ['arrow SE ↘',     'IMAGE_ARROW_SE'],
  ['arrow S ↓',      'IMAGE_ARROW_S'],
  ['arrow SW ↙',     'IMAGE_ARROW_SW'],
  ['arrow W ←',      'IMAGE_ARROW_W'],
  ['arrow NW ↖',     'IMAGE_ARROW_NW'],
  ['go right',       'IMAGE_GO_RIGHT'],
  ['go left',        'IMAGE_GO_LEFT'],
  ['go up',          'IMAGE_GO_UP'],
  ['go down',        'IMAGE_GO_DOWN'],
  ['triangle',       'IMAGE_TRIANGLE'],
  ['triangle left',  'IMAGE_TRIANGLE_LEFT'],
  ['chessboard',     'IMAGE_CHESSBOARD'],
  ['diamond',        'IMAGE_DIAMOND'],
  ['diamond small',  'IMAGE_DIAMOND_SMALL'],
  ['square',         'IMAGE_SQUARE'],
  ['square small',   'IMAGE_SQUARE_SMALL'],
  ['rabbit',         'IMAGE_RABBIT'],
  ['cow',            'IMAGE_COW'],
  ['music crotchet', 'IMAGE_MUSIC_CROTCHET'],
  ['music quaver',   'IMAGE_MUSIC_QUAVER'],
  ['music quavers',  'IMAGE_MUSIC_QUAVERS'],
  ['pitchfork',      'IMAGE_PITCHFORK'],
  ['xmas',           'IMAGE_XMAS'],
  ['pacman',         'IMAGE_PACMAN'],
  ['target',         'IMAGE_TARGET'],
  ['t-shirt',        'IMAGE_TSHIRT'],
  ['rollerskate',    'IMAGE_ROLLERSKATE'],
  ['duck',           'IMAGE_DUCK'],
  ['house',          'IMAGE_HOUSE'],
  ['tortoise',       'IMAGE_TORTOISE'],
  ['butterfly',      'IMAGE_BUTTERFLY'],
  ['stick figure',   'IMAGE_STICKFIGURE'],
  ['ghost',          'IMAGE_GHOST'],
  ['sword',          'IMAGE_SWORD'],
  ['giraffe',        'IMAGE_GIRAFFE'],
  ['skull',          'IMAGE_SKULL'],
  ['umbrella',       'IMAGE_UMBRELLA'],
  ['snake',          'IMAGE_SNAKE'],
];

// Helper : crée un bloc de toolbox avec des shadow blocks pour ses entrées numériques/texte.
// num(spec) où spec est un nombre crée un math_number shadow. Une chaîne crée un text shadow.
function tb(type, shadows = {}, fields = null) {
  const inputs = {};
  for (const [name, value] of Object.entries(shadows)) {
    if (typeof value === 'number') {
      inputs[name] = { shadow: { type: 'math_number', fields: { NUM: value } } };
    } else if (typeof value === 'string') {
      inputs[name] = { shadow: { type: 'text', fields: { TEXT: value } } };
    }
  }
  const out = { kind: 'block', type };
  if (fields) out.fields = fields;
  if (Object.keys(inputs).length) out.inputs = inputs;
  return out;
}

const TOOLBOX = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category', name: 'Motor', colour: C.motor, contents: [
        tb('spike_motor_run_for',         { N: 1 }),
        tb('spike_motor_go_to_position',  { POS: 0 }),
        tb('spike_motor_start'),
        tb('spike_motor_stop'),
        tb('spike_motor_set_speed',       { PCT: 50 }),
        tb('spike_motor_get_speed'),
        tb('spike_motor_position'),
      ]
    },
    {
      kind: 'category', name: 'Movement', colour: C.movement, contents: [
        tb('movement_move_dir_for',           { N: 10 }),
        tb('movement_move_steer_for',         { STEER: 0, N: 10 }),
        tb('movement_start_dir'),
        tb('movement_start_steer',            { STEER: 0 }),
        tb('movement_stop'),
        tb('movement_set_motors'),
        tb('movement_set_speed',              { PCT: 50 }),
        tb('movement_set_distance_per_rotation', { AMOUNT: 17.5 }),
      ]
    },
    {
      kind: 'category', name: 'Light', colour: C.light, contents: [
        tb('light_turn_on_image_for', { T: 2 }),
        tb('light_turn_on_image'),
        tb('light_turn_off'),
        tb('light_write'),
        tb('light_set_pixel',         { PCT: 100 }),
        tb('light_set_orientation'),
        tb('light_power_button'),
      ]
    },
    {
      kind: 'category', name: 'Sound', colour: C.sound, contents: [
        tb('sound_beep', { F: 440, D: 200 }),
      ]
    },
    {
      kind: 'category', name: 'Events', colour: C.events, contents: [
        tb('event_when_started'),
        tb('event_when_color'),
        tb('event_when_tilted'),
        tb('event_when_force'),
        tb('event_when_distance', { N: 8 }),
        tb('event_when_timer',    { T: 10 }),
        tb('event_when_condition'),
      ]
    },
    {
      kind: 'category', name: 'Control', colour: C.control, contents: [
        tb('control_wait_seconds', { T: 1 }),
        tb('control_repeat',       { TIMES: 10 }),
        tb('control_if'),
        tb('control_forever'),
        tb('control_if_else'),
        tb('control_wait_until'),
        tb('control_repeat_until'),
        tb('control_stop_other_stacks'),
        tb('control_stop'),
      ]
    },
    {
      kind: 'category', name: 'Sensors', colour: C.sensors, contents: [
        tb('sensor_is_color'),
        tb('sensor_color'),
        tb('sensor_reflection_compare', { N: 50 }),
        tb('sensor_reflected_light'),
        tb('sensor_timer'),
        tb('sensor_reset_timer'),
        tb('sensor_set_yaw_zero'),
        tb('sensor_tilt_angle'),
        tb('sensor_button_pressed'),
      ]
    },
    {
      kind: 'category', name: 'Operators', colour: C.operators, contents: [
        // Comparaisons
        tb('logic_compare', { A: 0, B: 100 }, { OP: 'GT' }),
        tb('logic_compare', { A: 0, B: 100 }, { OP: 'EQ' }),
        tb('logic_compare', { A: 0, B: 100 }, { OP: 'LT' }),
        // Logique
        tb('logic_operation', {}, { OP: 'AND' }),
        tb('logic_operation', {}, { OP: 'OR' }),
        tb('logic_negate'),
        // Plage
        tb('op_in_between', { VAL: 0, LO: -10, HI: 10 }),
        // Arithmétique
        tb('math_arithmetic', { A: 0, B: 0 }, { OP: 'ADD' }),
        tb('math_arithmetic', { A: 0, B: 0 }, { OP: 'MINUS' }),
        tb('math_arithmetic', { A: 0, B: 0 }, { OP: 'MULTIPLY' }),
        tb('math_arithmetic', { A: 0, B: 0 }, { OP: 'DIVIDE' }),
        tb('math_modulo',   { DIVIDEND: 0, DIVISOR: 0 }),
        tb('math_random_int', { FROM: 1, TO: 10 }),
        tb('math_round'),
        tb('math_single'),
        // Texte
        tb('text_join'),
        tb('text_charAt', { VALUE: 'apple' }),
        tb('text_length', { VALUE: 'apple' }),
        tb('op_text_contains', { TEXT: 'apple', SUB: 'a' }),
        // Littéraux
        tb('math_number'),
        tb('text'),
        tb('logic_boolean'),
      ]
    },
    { kind: 'category', name: 'Variables', colour: C.vars, custom: 'VARIABLE_AND_LIST' },
    { kind: 'category', name: 'My Blocks', colour: C.myblocks, custom: 'PROCEDURE' },
  ]
};


// Construit une coroutine async pour un event hat block donné.
// `body` est le code Python du chain de blocs après le hat (avec son indentation
// d'origine = niveau module). On l'indente et on l'enveloppe selon le type d'event.
function wrapEventCoro(P, block, funcName, body) {
  const indent = (s, n) => s.split('\n').map(l => l ? ' '.repeat(n) + l : l).join('\n');
  const trimmed = body.replace(/\s+$/, '');
  const safeBody = trimmed || 'pass';
  const globalsLine = '    global _mvmt_speed, _mvmt_dpr_mm, _motor_speed, _program_start_t';

  switch (block.type) {
    case 'event_when_started':
      return (
        `async def ${funcName}():\n` +
        `${globalsLine}\n` +
        `${indent(safeBody, 4)}\n`
      );

    case 'event_when_color': {
      const portRef = `port.${block.getFieldValue('PORT')}`;
      const col = block.getFieldValue('COLOR');
      return (
        `async def ${funcName}():\n` +
        `${globalsLine}\n` +
        `    while True:\n` +
        `        await runloop.until(lambda: color_sensor.color(${portRef}) == color.${col})\n` +
        `${indent(safeBody, 8)}\n` +
        `        await runloop.until(lambda: color_sensor.color(${portRef}) != color.${col})\n`
      );
    }

    case 'event_when_tilted': {
      const dir = block.getFieldValue('DIR');
      // tilt_angles() retourne (yaw, pitch, roll) en décidegrés. Seuil ~20°.
      const TH = 200;
      const triggers = {
        UP:    `_t[1] > ${TH}`,
        DOWN:  `_t[1] < ${-TH}`,
        LEFT:  `_t[2] < ${-TH}`,
        RIGHT: `_t[2] > ${TH}`,
      };
      const cond = triggers[dir] || 'False';
      const condInv = `not (${cond})`;
      return (
        `async def ${funcName}():\n` +
        `${globalsLine}\n` +
        `    while True:\n` +
        `        await runloop.until(lambda: (lambda _t=motion_sensor.tilt_angles(): ${cond})())\n` +
        `${indent(safeBody, 8)}\n` +
        `        await runloop.until(lambda: (lambda _t=motion_sensor.tilt_angles(): ${condInv})())\n`
      );
    }

    case 'event_when_force': {
      const portRef = `port.${block.getFieldValue('PORT')}`;
      const state = block.getFieldValue('STATE');
      const cond = state === 'PRESSED'
        ? `force_sensor.pressed(${portRef})`
        : `not force_sensor.pressed(${portRef})`;
      const condInv = state === 'PRESSED'
        ? `not force_sensor.pressed(${portRef})`
        : `force_sensor.pressed(${portRef})`;
      return (
        `async def ${funcName}():\n` +
        `${globalsLine}\n` +
        `    while True:\n` +
        `        await runloop.until(lambda: ${cond})\n` +
        `${indent(safeBody, 8)}\n` +
        `        await runloop.until(lambda: ${condInv})\n`
      );
    }

    case 'event_when_distance': {
      const portRef = `port.${block.getFieldValue('PORT')}`;
      const cmp = block.getFieldValue('CMP');
      const N = P.valueToCode(block, 'N', P.ORDER_ATOMIC) || '0';
      const unit = block.getFieldValue('UNIT');
      // Conversion en mm. % = 0..100 sur portée ToF SPIKE (0..2000 mm).
      const mmExpr = unit === 'cm'     ? `(${N}) * 10` :
                      unit === 'inches' ? `(${N}) * 25.4` :
                      /* PCT */            `(${N}) * 20`;
      const op    = cmp === 'CLOSER' ? '<'  : '>';
      const opInv = cmp === 'CLOSER' ? '>=' : '<=';
      return (
        `async def ${funcName}():\n` +
        `${globalsLine}\n` +
        `    while True:\n` +
        `        await runloop.until(lambda: distance_sensor.distance(${portRef}) ${op} ${mmExpr})\n` +
        `${indent(safeBody, 8)}\n` +
        `        await runloop.until(lambda: distance_sensor.distance(${portRef}) ${opInv} ${mmExpr})\n`
      );
    }

    case 'event_when_timer': {
      const T = P.valueToCode(block, 'T', P.ORDER_ATOMIC) || '0';
      return (
        `async def ${funcName}():\n` +
        `${globalsLine}\n` +
        `    await runloop.until(lambda: _time.monotonic() - _program_start_t > ${T})\n` +
        `${indent(safeBody, 4)}\n`
      );
    }

    case 'event_when_condition': {
      const cond = P.valueToCode(block, 'COND', P.ORDER_NONE) || 'False';
      return (
        `async def ${funcName}():\n` +
        `${globalsLine}\n` +
        `    while True:\n` +
        `        await runloop.until(lambda: (${cond}))\n` +
        `${indent(safeBody, 8)}\n` +
        `        await runloop.until(lambda: not (${cond}))\n`
      );
    }

    default:
      return (
        `async def ${funcName}():\n` +
        `${globalsLine}\n` +
        `${indent(safeBody, 4)}\n`
      );
  }
}


function defineBlocks() {
  Blockly.defineBlocksWithJsonArray([

    // === Events ===
    {
      type: 'event_when_started',
      message0: '%1 when program starts',
      args0: [PLAY_ICON],
      nextStatement: null,
      colour: C.events,
      tooltip: 'Runs once at program start.',
    },
    {
      type: 'event_when_color',
      message0: '%1 %2 when color is %3',
      args0: [
        COLOR_EVT_ICON,
        { type: 'field_dropdown', name: 'PORT', options: PORT_OPTIONS },
        { type: 'field_dropdown', name: 'COLOR', options: COLOR_OPTIONS },
      ],
      nextStatement: null,
      colour: C.events,
    },
    {
      type: 'event_when_tilted',
      message0: '%1 when tilted %2',
      args0: [
        HUB_MATRIX_ICON,
        { type: 'field_dropdown', name: 'DIR', options: [
          ['↑', 'UP'],
          ['↓', 'DOWN'],
          ['←', 'LEFT'],
          ['→', 'RIGHT'],
        ] },
      ],
      nextStatement: null,
      colour: C.events,
    },
    {
      type: 'event_when_force',
      message0: '%1 %2 when %3',
      args0: [
        FORCE_EVT_ICON,
        { type: 'field_dropdown', name: 'PORT', options: PORT_OPTIONS },
        { type: 'field_dropdown', name: 'STATE', options: [
          ['pressed',  'PRESSED'],
          ['released', 'RELEASED'],
        ] },
      ],
      nextStatement: null,
      colour: C.events,
    },
    {
      type: 'event_when_distance',
      message0: '%1 %2 when %3 %4 %5',
      args0: [
        DIST_EVT_ICON,
        { type: 'field_dropdown', name: 'PORT', options: PORT_OPTIONS },
        { type: 'field_dropdown', name: 'CMP', options: [
          ['closer than',  'CLOSER'],
          ['farther than', 'FARTHER'],
        ] },
        { type: 'input_value', name: 'N', check: 'Number' },
        { type: 'field_dropdown', name: 'UNIT', options: [
          ['cm',     'cm'],
          ['inches', 'inches'],
          ['%',      'PCT'],
        ] },
      ],
      nextStatement: null,
      colour: C.events,
      inputsInline: true,
    },
    {
      type: 'event_when_timer',
      message0: 'when timer > %1',
      args0: [
        { type: 'input_value', name: 'T', check: 'Number' },
      ],
      nextStatement: null,
      colour: C.events,
    },
    {
      type: 'event_when_condition',
      message0: 'when %1',
      args0: [
        { type: 'input_value', name: 'COND', check: 'Boolean' },
      ],
      nextStatement: null,
      colour: C.events,
    },

    // === Movement (style app SPIKE) ===
    {
      type: 'movement_move_dir_for',
      message0: '%1 move %2 for %3 %4',
      args0: [
        DRIVE_ICON,
        { type: 'field_dropdown', name: 'DIR', options: [
          ['↑', 'FORWARD'],
          ['↓', 'BACKWARD'],
        ] },
        { type: 'input_value', name: 'N', check: 'Number' },
        { type: 'field_dropdown', name: 'UNIT', options: [
          ['rotations', 'rotations'],
          ['degrees', 'degrees'],
          ['seconds', 'seconds'],
          ['cm', 'cm'],
          ['inches', 'inches'],
        ] },
      ],
      previousStatement: null, nextStatement: null, colour: C.movement,
      inputsInline: true,
    },
    {
      type: 'movement_move_steer_for',
      message0: '%1 move steering %2 for %3 %4',
      args0: [
        DRIVE_ICON,
        { type: 'input_value', name: 'STEER', check: 'Number' },
        { type: 'input_value', name: 'N', check: 'Number' },
        { type: 'field_dropdown', name: 'UNIT', options: [
          ['rotations', 'rotations'],
          ['degrees', 'degrees'],
          ['seconds', 'seconds'],
          ['cm', 'cm'],
          ['inches', 'inches'],
        ] },
      ],
      previousStatement: null, nextStatement: null, colour: C.movement,
      inputsInline: true,
    },
    {
      type: 'movement_start_dir',
      message0: '%1 start moving %2',
      args0: [
        DRIVE_ICON,
        { type: 'field_dropdown', name: 'DIR', options: [
          ['↑', 'FORWARD'],
          ['↓', 'BACKWARD'],
        ] },
      ],
      previousStatement: null, nextStatement: null, colour: C.movement,
    },
    {
      type: 'movement_start_steer',
      message0: '%1 start moving steering %2',
      args0: [
        DRIVE_ICON,
        { type: 'input_value', name: 'STEER', check: 'Number' },
      ],
      previousStatement: null, nextStatement: null, colour: C.movement,
      inputsInline: true,
    },
    {
      type: 'movement_stop',
      message0: '%1 stop moving',
      args0: [DRIVE_ICON],
      previousStatement: null, nextStatement: null, colour: C.movement,
    },
    {
      type: 'movement_set_motors',
      message0: '%1 set movement motors to %2 + %3',
      args0: [
        DRIVE_ICON,
        { type: 'field_dropdown', name: 'L', options: PORT_OPTIONS },
        { type: 'field_dropdown', name: 'R', options: PORT_OPTIONS },
      ],
      previousStatement: null, nextStatement: null, colour: C.movement,
    },
    {
      type: 'movement_set_speed',
      message0: '%1 set movement speed to %2 %%',
      args0: [
        DRIVE_ICON,
        { type: 'input_value', name: 'PCT', check: 'Number' },
      ],
      previousStatement: null, nextStatement: null, colour: C.movement,
      inputsInline: true,
    },
    {
      type: 'movement_set_distance_per_rotation',
      message0: '%1 set 1 motor rotation to %2 %3 moved',
      args0: [
        DRIVE_ICON,
        { type: 'input_value', name: 'AMOUNT', check: 'Number' },
        { type: 'field_dropdown', name: 'UNIT', options: [['cm', 'cm'], ['inches', 'inches']] },
      ],
      previousStatement: null, nextStatement: null, colour: C.movement,
      inputsInline: true,
    },

    // === Motor (SPIKE app style) ===
    {
      type: 'spike_motor_run_for',
      message0: '%1 %2 run %3 for %4 %5',
      args0: [
        MOTOR_ICON,
        { type: 'field_dropdown', name: 'PORT', options: PORT_OPTIONS },
        { type: 'field_dropdown', name: 'DIR', options: [['↻', 'CW'], ['↺', 'CCW']] },
        { type: 'input_value', name: 'N', check: 'Number' },
        { type: 'field_dropdown', name: 'UNIT', options: [
          ['rotations', 'rotations'],
          ['degrees', 'degrees'],
          ['seconds', 'seconds'],
        ] },
      ],
      previousStatement: null, nextStatement: null, colour: C.motor,
      inputsInline: true,
    },
    {
      type: 'spike_motor_go_to_position',
      message0: '%1 %2 go %3 to position %4',
      args0: [
        MOTOR_ICON,
        { type: 'field_dropdown', name: 'PORT', options: PORT_OPTIONS },
        { type: 'field_dropdown', name: 'PATH', options: [
          ['shortest path', 'SHORTEST_PATH'],
          ['clockwise', 'CLOCKWISE'],
          ['counterclockwise', 'COUNTERCLOCKWISE'],
        ] },
        { type: 'input_value', name: 'POS', check: 'Number' },
      ],
      previousStatement: null, nextStatement: null, colour: C.motor,
      inputsInline: true,
    },
    {
      type: 'spike_motor_start',
      message0: '%1 %2 start motor %3',
      args0: [
        MOTOR_ICON,
        { type: 'field_dropdown', name: 'PORT', options: PORT_OPTIONS },
        { type: 'field_dropdown', name: 'DIR', options: [['↻', 'CW'], ['↺', 'CCW']] },
      ],
      previousStatement: null, nextStatement: null, colour: C.motor,
      inputsInline: true,
    },
    {
      type: 'spike_motor_stop',
      message0: '%1 %2 stop motor',
      args0: [
        MOTOR_ICON,
        { type: 'field_dropdown', name: 'PORT', options: PORT_OPTIONS },
      ],
      previousStatement: null, nextStatement: null, colour: C.motor,
    },
    {
      type: 'spike_motor_set_speed',
      message0: '%1 %2 set speed to %3 %%',
      args0: [
        MOTOR_ICON,
        { type: 'field_dropdown', name: 'PORT', options: PORT_OPTIONS },
        { type: 'input_value', name: 'PCT', check: 'Number' },
      ],
      previousStatement: null, nextStatement: null, colour: C.motor,
      inputsInline: true,
    },
    {
      type: 'spike_motor_get_speed',
      message0: '%1 %2 speed',
      args0: [
        MOTOR_ICON,
        { type: 'field_dropdown', name: 'PORT', options: PORT_OPTIONS },
      ],
      output: 'Number', colour: C.motor,
    },

    // === Motor (SPIKE app style) ===
    {
      type: 'spike_motor_position',
      message0: '%1 %2 position',
      args0: [
        MOTOR_ICON,
        { type: 'field_dropdown', name: 'PORT', options: PORT_OPTIONS },
      ],
      output: 'Number', colour: C.motor,
    },

    // === Light (style app SPIKE) ===
    {
      type: 'light_turn_on_image_for',
      message0: '%1 turn on %2 for %3 seconds',
      args0: [
        LIGHT_MATRIX_ICON,
        { type: 'field_dropdown', name: 'IMG', options: IMAGE_OPTIONS },
        { type: 'input_value', name: 'T', check: 'Number' },
      ],
      previousStatement: null, nextStatement: null, colour: C.light,
      inputsInline: true,
    },
    {
      type: 'light_turn_on_image',
      message0: '%1 turn on %2',
      args0: [
        LIGHT_MATRIX_ICON,
        { type: 'field_dropdown', name: 'IMG', options: IMAGE_OPTIONS },
      ],
      previousStatement: null, nextStatement: null, colour: C.light,
    },
    {
      type: 'light_turn_off',
      message0: '%1 turn off pixels',
      args0: [LIGHT_MATRIX_ICON],
      previousStatement: null, nextStatement: null, colour: C.light,
    },
    {
      type: 'light_write',
      message0: '%1 write %2',
      args0: [
        LIGHT_MATRIX_ICON,
        { type: 'field_input', name: 'TXT', text: 'Hello' },
      ],
      previousStatement: null, nextStatement: null, colour: C.light,
    },
    {
      type: 'light_set_pixel',
      message0: '%1 set pixel at %2 , %3 to %4 %%',
      args0: [
        LIGHT_MATRIX_ICON,
        { type: 'field_dropdown', name: 'X', options: [['1','1'],['2','2'],['3','3'],['4','4'],['5','5']] },
        { type: 'field_dropdown', name: 'Y', options: [['1','1'],['2','2'],['3','3'],['4','4'],['5','5']] },
        { type: 'input_value', name: 'PCT', check: 'Number' },
      ],
      previousStatement: null, nextStatement: null, colour: C.light,
      inputsInline: true,
    },
    {
      type: 'light_set_orientation',
      message0: '%1 set orientation to %2',
      args0: [
        LIGHT_MATRIX_ICON,
        { type: 'field_dropdown', name: 'OR', options: [
          ['up',    'UP'],
          ['right', 'RIGHT'],
          ['down',  'DOWN'],
          ['left',  'LEFT'],
        ] },
      ],
      previousStatement: null, nextStatement: null, colour: C.light,
    },
    {
      type: 'light_power_button',
      message0: '%1 set %2 light to %3',
      args0: [
        LIGHT_MATRIX_ICON,
        { type: 'field_dropdown', name: 'LIGHT', options: [
          ['power',     'POWER'],
          ['connect',   'CONNECT'],
        ] },
        { type: 'field_dropdown', name: 'COLOR', options: COLOR_OPTIONS },
      ],
      previousStatement: null, nextStatement: null, colour: C.light,
    },

    // === Sound ===
    {
      type: 'sound_beep',
      message0: 'beep %1 Hz for %2 ms',
      args0: [
        { type: 'input_value', name: 'F', check: 'Number' },
        { type: 'input_value', name: 'D', check: 'Number' },
      ],
      previousStatement: null, nextStatement: null, colour: C.sound,
      inputsInline: true,
    },

    // === Sensors ===
    {
      type: 'sensor_is_color',
      message0: '%1 %2 is color %3 ?',
      args0: [
        COLOR_EVT_ICON,
        { type: 'field_dropdown', name: 'PORT', options: PORT_OPTIONS },
        { type: 'field_dropdown', name: 'COLOR', options: COLOR_OPTIONS },
      ],
      output: 'Boolean', colour: C.sensors,
      inputsInline: true,
    },
    {
      type: 'sensor_color',
      message0: '%1 %2 color',
      args0: [
        COLOR_EVT_ICON,
        { type: 'field_dropdown', name: 'PORT', options: PORT_OPTIONS },
      ],
      output: 'Number', colour: C.sensors,
      inputsInline: true,
    },
    {
      type: 'sensor_reflection_compare',
      message0: '%1 %2 reflection %3 %4 %% ?',
      args0: [
        COLOR_EVT_ICON,
        { type: 'field_dropdown', name: 'PORT', options: PORT_OPTIONS },
        { type: 'field_dropdown', name: 'OP', options: [['<','LT'], ['=','EQ'], ['>','GT']] },
        { type: 'input_value', name: 'N', check: 'Number' },
      ],
      output: 'Boolean', colour: C.sensors,
      inputsInline: true,
    },
    {
      type: 'sensor_reflected_light',
      message0: '%1 %2 reflected light',
      args0: [
        COLOR_EVT_ICON,
        { type: 'field_dropdown', name: 'PORT', options: PORT_OPTIONS },
      ],
      output: 'Number', colour: C.sensors,
      inputsInline: true,
    },
    {
      type: 'sensor_timer',
      message0: 'timer',
      output: 'Number', colour: C.sensors,
      tooltip: 'Seconds elapsed since program start or last reset.',
    },
    {
      type: 'sensor_reset_timer',
      message0: 'reset timer',
      previousStatement: null, nextStatement: null, colour: C.sensors,
    },
    {
      type: 'sensor_set_yaw_zero',
      message0: '%1 set yaw angle to 0',
      args0: [HUB_MATRIX_ICON],
      previousStatement: null, nextStatement: null, colour: C.sensors,
      inputsInline: true,
    },
    {
      type: 'sensor_tilt_angle',
      message0: '%1 %2 angle',
      args0: [
        HUB_MATRIX_ICON,
        { type: 'field_dropdown', name: 'AXIS', options: [['yaw','YAW'], ['pitch','PITCH'], ['roll','ROLL']] },
      ],
      output: 'Number', colour: C.sensors,
      inputsInline: true,
      tooltip: 'Tilt angle in degrees (yaw / pitch / roll).',
    },
    {
      type: 'sensor_button_pressed',
      message0: '%1 is %2 button %3 ?',
      args0: [
        HUB_MATRIX_ICON,
        { type: 'field_dropdown', name: 'BTN',   options: [['left','LEFT'], ['right','RIGHT']] },
        { type: 'field_dropdown', name: 'STATE', options: [['pressed','PRESSED'], ['released','RELEASED']] },
      ],
      output: 'Boolean', colour: C.sensors,
      inputsInline: true,
    },

    // === Control ===
    {
      type: 'control_wait_seconds',
      message0: 'wait %1 seconds',
      args0: [{ type: 'input_value', name: 'T', check: 'Number' }],
      previousStatement: null, nextStatement: null, colour: C.control,
    },
    {
      type: 'control_repeat',
      message0: 'repeat %1 %2 %3',
      args0: [
        { type: 'input_value', name: 'TIMES', check: 'Number' },
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'BODY' },
      ],
      previousStatement: null, nextStatement: null, colour: C.control,
    },
    {
      type: 'control_if',
      message0: 'if %1 then %2 %3',
      args0: [
        { type: 'input_value', name: 'COND', check: 'Boolean' },
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'BODY' },
      ],
      previousStatement: null, nextStatement: null, colour: C.control,
    },
    {
      type: 'control_if_else',
      message0: 'if %1 then %2 %3 else %4 %5',
      args0: [
        { type: 'input_value', name: 'COND', check: 'Boolean' },
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'THEN' },
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'ELSE' },
      ],
      previousStatement: null, nextStatement: null, colour: C.control,
    },
    {
      type: 'control_wait_until',
      message0: 'wait until %1',
      args0: [{ type: 'input_value', name: 'COND', check: 'Boolean' }],
      previousStatement: null, nextStatement: null, colour: C.control,
    },
    {
      type: 'control_repeat_until',
      message0: 'repeat until %1 %2 %3',
      args0: [
        { type: 'input_value', name: 'COND', check: 'Boolean' },
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'BODY' },
      ],
      previousStatement: null, nextStatement: null, colour: C.control,
    },
    {
      type: 'control_forever',
      message0: 'forever %1 %2',
      args0: [
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'BODY' },
      ],
      previousStatement: null, colour: C.control,
    },
    {
      type: 'control_stop_other_stacks',
      message0: 'stop other stacks',
      previousStatement: null, nextStatement: null, colour: C.control,
    },
    {
      type: 'control_stop',
      message0: 'stop %1',
      args0: [
        { type: 'field_dropdown', name: 'TARGET', options: [
          ['all',        'ALL'],
          ['this stack', 'THIS'],
        ] },
      ],
      previousStatement: null, colour: C.control,  // terminal : pas de nextStatement
    },

    // === Lists (style SPIKE, basé sur des variables typées 'List') ===
    {
      type: 'data_addtolist',
      message0: 'add %1 to %2',
      args0: [
        { type: 'input_value', name: 'VALUE' },
        { type: 'field_variable', name: 'LIST', variableTypes: ['List'], defaultType: 'List' },
      ],
      previousStatement: null, nextStatement: null, colour: C.lists,
      inputsInline: true,
    },
    {
      type: 'data_deleteoflist',
      message0: 'delete %1 of %2',
      args0: [
        { type: 'input_value', name: 'INDEX', check: 'Number' },
        { type: 'field_variable', name: 'LIST', variableTypes: ['List'], defaultType: 'List' },
      ],
      previousStatement: null, nextStatement: null, colour: C.lists,
      inputsInline: true,
    },
    {
      type: 'data_deletealloflist',
      message0: 'delete all of %1',
      args0: [
        { type: 'field_variable', name: 'LIST', variableTypes: ['List'], defaultType: 'List' },
      ],
      previousStatement: null, nextStatement: null, colour: C.lists,
      inputsInline: true,
    },
    {
      type: 'data_insertatlist',
      message0: 'insert %1 at %2 of %3',
      args0: [
        { type: 'input_value', name: 'VALUE' },
        { type: 'input_value', name: 'INDEX', check: 'Number' },
        { type: 'field_variable', name: 'LIST', variableTypes: ['List'], defaultType: 'List' },
      ],
      previousStatement: null, nextStatement: null, colour: C.lists,
      inputsInline: true,
    },
    {
      type: 'data_replaceitemoflist',
      message0: 'replace item %1 of %2 with %3',
      args0: [
        { type: 'input_value', name: 'INDEX', check: 'Number' },
        { type: 'field_variable', name: 'LIST', variableTypes: ['List'], defaultType: 'List' },
        { type: 'input_value', name: 'VALUE' },
      ],
      previousStatement: null, nextStatement: null, colour: C.lists,
      inputsInline: true,
    },
    {
      type: 'data_itemoflist',
      message0: 'item %1 of %2',
      args0: [
        { type: 'input_value', name: 'INDEX', check: 'Number' },
        { type: 'field_variable', name: 'LIST', variableTypes: ['List'], defaultType: 'List' },
      ],
      output: null, colour: C.lists,
      inputsInline: true,
    },
    {
      type: 'data_itemnumoflist',
      message0: 'item # of %1 in %2',
      args0: [
        { type: 'input_value', name: 'VALUE' },
        { type: 'field_variable', name: 'LIST', variableTypes: ['List'], defaultType: 'List' },
      ],
      output: 'Number', colour: C.lists,
      inputsInline: true,
    },
    {
      type: 'data_lengthoflist',
      message0: 'length of %1',
      args0: [
        { type: 'field_variable', name: 'LIST', variableTypes: ['List'], defaultType: 'List' },
      ],
      output: 'Number', colour: C.lists,
      inputsInline: true,
    },
    {
      type: 'data_listcontainsitem',
      message0: '%1 contains %2 ?',
      args0: [
        { type: 'field_variable', name: 'LIST', variableTypes: ['List'], defaultType: 'List' },
        { type: 'input_value', name: 'VALUE' },
      ],
      output: 'Boolean', colour: C.lists,
      inputsInline: true,
    },

    // === Operators (custom : pas dans le stock Blockly) ===
    {
      type: 'op_in_between',
      message0: 'is %1 in between %2 and %3 ?',
      args0: [
        { type: 'input_value', name: 'VAL', check: 'Number' },
        { type: 'input_value', name: 'LO',  check: 'Number' },
        { type: 'input_value', name: 'HI',  check: 'Number' },
      ],
      output: 'Boolean', colour: C.operators,
      inputsInline: true,
    },
    {
      type: 'op_text_contains',
      message0: '%1 contains %2 ?',
      args0: [
        { type: 'input_value', name: 'TEXT' },
        { type: 'input_value', name: 'SUB' },
      ],
      output: 'Boolean', colour: C.operators,
      inputsInline: true,
    },
  ]);

  // ---------------- Générateurs Python ----------------
  const P = Blockly.Python;
  const val = (b, n, def='0') => P.valueToCode(b, n, P.ORDER_ATOMIC) || def;
  const stmt = (b, n) => P.statementToCode(b, n) || (P.INDENT + 'pass\n');

  P.event_when_started = b => '';

  // Movement (style app SPIKE) — appelle uniquement l'API publique motor_pair.
  // Utilise les variables locales `_mvmt_speed` et `_mvmt_dpr_mm` injectées par finish().
  const DIR_STEER = { FORWARD: '0', BACKWARD: '0', LEFT: '-100', RIGHT: '100' };
  const DIR_SIGN  = { FORWARD: '',  BACKWARD: '-', LEFT: '',     RIGHT: ''   };
  const VEL_EXPR     = '_mvmt_speed / 100 * 1100';
  const VEL_ABS_EXPR = `abs(${VEL_EXPR})`;

  // Convertit (amount, unit) en degrés moteur (référence : roue gauche).
  function amountToDegrees(amount, unit) {
    if (unit === 'rotations') return `int((${amount}) * 360)`;
    if (unit === 'degrees')   return `int(${amount})`;
    if (unit === 'cm')        return `int((${amount}) * 10 / _mvmt_dpr_mm * 360)`;
    if (unit === 'inches')    return `int((${amount}) * 25.4 / _mvmt_dpr_mm * 360)`;
    return `int((${amount}) * 360)`;
  }

  P.movement_set_motors = b =>
    `motor_pair.pair(motor_pair.PAIR_1, port.${b.getFieldValue('L')}, port.${b.getFieldValue('R')})\n`;
  P.movement_move_for_time = b =>
    `await motor_pair.move_for_time(motor_pair.PAIR_1, int((${val(b,'T')})*1000), ${val(b,'STEER')}, velocity=${val(b,'V')})\n`;
  P.movement_move_for_degrees = b =>
    `await motor_pair.move_for_degrees(motor_pair.PAIR_1, ${val(b,'D')}, ${val(b,'STEER')}, velocity=${val(b,'V')})\n`;
  P.movement_start = b =>
    `motor_pair.move(motor_pair.PAIR_1, ${val(b,'STEER')}, velocity=${val(b,'V')})\n`;
  P.movement_stop = b =>
    `motor_pair.stop(motor_pair.PAIR_1)\n`;
  P.movement_tank_for_time = b =>
    `await motor_pair.move_tank_for_time(motor_pair.PAIR_1, int((${val(b,'T')})*1000), ${val(b,'L')}, ${val(b,'R')})\n`;
  P.movement_tank_for_degrees = b =>
    `await motor_pair.move_tank_for_degrees(motor_pair.PAIR_1, ${val(b,'D')}, ${val(b,'L')}, ${val(b,'R')})\n`;

  P.movement_set_speed = b =>
    `_mvmt_speed = ${val(b,'PCT','50')}\n`;

  P.movement_set_distance_per_rotation = b => {
    const amount = val(b, 'AMOUNT', '17.5');
    const unit = b.getFieldValue('UNIT');
    const mm = unit === 'cm' ? `(${amount}) * 10` : `(${amount}) * 25.4`;
    return `_mvmt_dpr_mm = ${mm}\n`;
  };

  P.movement_move_dir_for = b => {
    const dir = b.getFieldValue('DIR');
    const n = val(b, 'N', '1');
    const unit = b.getFieldValue('UNIT');
    const steer = DIR_STEER[dir];
    const sign = DIR_SIGN[dir];
    const velArg = `velocity=${sign}${VEL_ABS_EXPR}`;
    if (unit === 'seconds') {
      return `await motor_pair.move_for_time(motor_pair.PAIR_1, int((${n}) * 1000), ${steer}, ${velArg})\n`;
    }
    return `await motor_pair.move_for_degrees(motor_pair.PAIR_1, ${amountToDegrees(n, unit)}, ${steer}, ${velArg})\n`;
  };

  P.movement_move_steer_for = b => {
    const steer = val(b, 'STEER', '0');
    const n = val(b, 'N', '1');
    const unit = b.getFieldValue('UNIT');
    const velArg = `velocity=${VEL_ABS_EXPR}`;
    if (unit === 'seconds') {
      return `await motor_pair.move_for_time(motor_pair.PAIR_1, int((${n}) * 1000), ${steer}, ${velArg})\n`;
    }
    return `await motor_pair.move_for_degrees(motor_pair.PAIR_1, ${amountToDegrees(n, unit)}, ${steer}, ${velArg})\n`;
  };

  P.movement_start_dir = b => {
    const dir = b.getFieldValue('DIR');
    return `motor_pair.move(motor_pair.PAIR_1, ${DIR_STEER[dir]}, velocity=${DIR_SIGN[dir]}${VEL_ABS_EXPR})\n`;
  };

  P.movement_start_steer = b =>
    `motor_pair.move(motor_pair.PAIR_1, ${val(b,'STEER','0')}, velocity=${VEL_ABS_EXPR})\n`;

  P.movement_stop = b =>
    `motor_pair.stop(motor_pair.PAIR_1)\n`;

  // Motor (style SPIKE) — la vitesse par défaut par moteur est stockée dans
  // le dict module-level `_motor_speed` (% 0..100). On la convertit en deg/s
  // au moment de l'appel.
  function motorVelExpr(port) {
    return `abs(int(_motor_speed['${port}'] / 100 * 1100))`;
  }

  P.spike_motor_run_for = b => {
    const port = b.getFieldValue('PORT');
    const portRef = `port.${port}`;
    // CW = sens horaire vu de l'arrière de la roue → sens "marche arrière"
    // côté simulateur (la cinématique applique le miroir physique du moteur).
    const sign = b.getFieldValue('DIR') === 'CW' ? '-' : '';
    const n = val(b, 'N', '1');
    const unit = b.getFieldValue('UNIT');
    const vel = motorVelExpr(port);
    if (unit === 'rotations') {
      return `await motor.run_for_degrees(${portRef}, int(${sign}((${n}) * 360)), ${vel})\n`;
    }
    if (unit === 'degrees') {
      return `await motor.run_for_degrees(${portRef}, int(${sign}(${n})), ${vel})\n`;
    }
    // seconds
    return `await motor.run_for_time(${portRef}, int((${n}) * 1000), ${sign}${vel})\n`;
  };

  P.spike_motor_go_to_position = b => {
    const port = b.getFieldValue('PORT');
    const portRef = `port.${port}`;
    const path = b.getFieldValue('PATH');
    const pos = val(b, 'POS', '0');
    return `await motor.run_to_absolute_position(${portRef}, ${pos}, ${motorVelExpr(port)}, direction=motor.${path})\n`;
  };

  P.spike_motor_start = b => {
    const port = b.getFieldValue('PORT');
    const portRef = `port.${port}`;
    const sign = b.getFieldValue('DIR') === 'CW' ? '-' : '';
    return `motor.run(${portRef}, ${sign}${motorVelExpr(port)})\n`;
  };

  P.spike_motor_stop = b =>
    `motor.stop(port.${b.getFieldValue('PORT')})\n`;

  P.spike_motor_set_speed = b =>
    `_motor_speed['${b.getFieldValue('PORT')}'] = ${val(b,'PCT','50')}\n`;

  P.spike_motor_get_speed = b =>
    [`_motor_speed['${b.getFieldValue('PORT')}']`, P.ORDER_ATOMIC];

  P.spike_motor_position = b =>
    [`motor.absolute_position(port.${b.getFieldValue('PORT')})`, P.ORDER_FUNCTION_CALL];

  // Light (style app SPIKE)
  P.light_turn_on_image = b =>
    `light_matrix.show_image(light_matrix.${b.getFieldValue('IMG')})\n`;

  P.light_turn_on_image_for = b => {
    const img = b.getFieldValue('IMG');
    const t = val(b, 'T', '2');
    return (
      `light_matrix.show_image(light_matrix.${img})\n` +
      `await runloop.sleep_ms(int((${t}) * 1000))\n` +
      `light_matrix.clear()\n`
    );
  };

  P.light_turn_off = b => `light_matrix.clear()\n`;

  P.light_write = b => {
    const txt = (b.getFieldValue('TXT') || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `light_matrix.write('${txt}')\n`;
  };

  P.light_set_pixel = b => {
    const x = b.getFieldValue('X');
    const y = b.getFieldValue('Y');
    const pct = val(b, 'PCT', '100');
    // L'app SPIKE utilise des coords 1..5 ; light_matrix.set_pixel attend 0..4.
    return `light_matrix.set_pixel(${parseInt(x,10)-1}, ${parseInt(y,10)-1}, ${pct})\n`;
  };

  P.light_set_orientation = b => {
    const ori = b.getFieldValue('OR');
    return `light_matrix.set_orientation(orientation.${ori})\n`;
  };

  P.light_power_button = b => {
    const lightId = b.getFieldValue('LIGHT');  // 'POWER' ou 'CONNECT'
    const colorId = b.getFieldValue('COLOR');  // 'RED', 'BLUE', etc.
    return `light.color(light.${lightId}, color.${colorId})\n`;
  };


  // Son
  P.sound_beep = b =>
    `sound.beep(${val(b,'F','440')}, ${val(b,'D','200')})\n`;

  // Capteurs (API SPIKE pure : color_sensor / motion_sensor / button + time module).
  P.sensor_is_color = b =>
    [`color_sensor.color(port.${b.getFieldValue('PORT')}) == color.${b.getFieldValue('COLOR')}`, P.ORDER_RELATIONAL];

  P.sensor_color = b =>
    [`color_sensor.color(port.${b.getFieldValue('PORT')})`, P.ORDER_FUNCTION_CALL];

  P.sensor_reflection_compare = b => {
    const op = { LT: '<', EQ: '==', GT: '>' }[b.getFieldValue('OP')] || '<';
    const n = val(b, 'N', '50');
    return [`color_sensor.reflection(port.${b.getFieldValue('PORT')}) ${op} ${n}`, P.ORDER_RELATIONAL];
  };

  P.sensor_reflected_light = b =>
    [`color_sensor.reflection(port.${b.getFieldValue('PORT')})`, P.ORDER_FUNCTION_CALL];

  // Timer : on s'appuie sur _time.monotonic() + _program_start_t déjà déclarés
  // dans definitions_['_state_vars'] (Python time module, pas l'API SPIKE).
  P.sensor_timer = b =>
    [`(_time.monotonic() - _program_start_t)`, P.ORDER_ADDITIVE];

  P.sensor_reset_timer = b =>
    `_program_start_t = _time.monotonic()\n`;

  P.sensor_set_yaw_zero = b =>
    `motion_sensor.reset_yaw(0)\n`;

  P.sensor_tilt_angle = b => {
    // tilt_angles() retourne (yaw, pitch, roll) en déci-degrés (SPIKE 3 :
    // 900 = 90°). Côté blocs on travaille en degrés, donc on divise par 10.
    const idx = { YAW: 0, PITCH: 1, ROLL: 2 }[b.getFieldValue('AXIS')] || 0;
    return [`(motion_sensor.tilt_angles()[${idx}] / 10)`, P.ORDER_MULTIPLICATIVE];
  };

  P.sensor_button_pressed = b => {
    const btn = b.getFieldValue('BTN');           // LEFT / RIGHT
    const state = b.getFieldValue('STATE');       // PRESSED / RELEASED
    const op = state === 'PRESSED' ? '>' : '==';
    return [`button.pressed(button.${btn}) ${op} 0`, P.ORDER_RELATIONAL];
  };

  // Contrôle
  P.control_wait_seconds = b =>
    `await runloop.sleep_ms(int((${val(b,'T')})*1000))\n`;

  P.control_wait_until = b => {
    const cond = P.valueToCode(b, 'COND', P.ORDER_NONE) || 'False';
    return `await runloop.until(lambda: (${cond}))\n`;
  };

  P.control_repeat = b => {
    const times = val(b, 'TIMES', '10');
    const body = stmt(b, 'BODY');
    return `for _ in range(int(${times})):\n${body}`;
  };

  P.control_repeat_until = b => {
    const cond = P.valueToCode(b, 'COND', P.ORDER_NONE) || 'False';
    const body = stmt(b, 'BODY');
    return `while not (${cond}):\n${body}`;
  };

  P.control_if = b => {
    const cond = P.valueToCode(b, 'COND', P.ORDER_NONE) || 'False';
    const body = stmt(b, 'BODY');
    return `if (${cond}):\n${body}`;
  };

  P.control_if_else = b => {
    const cond = P.valueToCode(b, 'COND', P.ORDER_NONE) || 'False';
    const thenBody = stmt(b, 'THEN');
    const elseBody = stmt(b, 'ELSE');
    return `if (${cond}):\n${thenBody}else:\n${elseBody}`;
  };

  P.control_forever = b =>
    `while True:\n${stmt(b,'BODY')}`;

  P.control_stop_other_stacks = b =>
    `import asyncio as _asyncio\n` +
    `for _t in list(_asyncio.all_tasks()):\n` +
    `    if _t is not _asyncio.current_task():\n` +
    `        _t.cancel()\n`;

  // Lists (style SPIKE → opérations Python sur des variables typées 'List')
  function listVarName(b) {
    const id = b.getFieldValue('LIST');
    const v = b.workspace ? b.workspace.getVariableById(id) : null;
    const raw = v ? v.name : id;
    return P.nameDB_.getName(raw, Blockly.Names.NameType.VARIABLE);
  }

  P.data_addtolist = b => {
    const v = val(b, 'VALUE', '0');
    return `${listVarName(b)}.append(${v})\n`;
  };

  P.data_deleteoflist = b => {
    const i = val(b, 'INDEX', '1');
    const n = listVarName(b);
    return `del ${n}[int(${i}) - 1]\n`;
  };

  P.data_deletealloflist = b =>
    `${listVarName(b)}.clear()\n`;

  P.data_insertatlist = b => {
    const v = val(b, 'VALUE', '0');
    const i = val(b, 'INDEX', '1');
    return `${listVarName(b)}.insert(int(${i}) - 1, ${v})\n`;
  };

  P.data_replaceitemoflist = b => {
    const v = val(b, 'VALUE', '0');
    const i = val(b, 'INDEX', '1');
    return `${listVarName(b)}[int(${i}) - 1] = ${v}\n`;
  };

  P.data_itemoflist = b => {
    const i = val(b, 'INDEX', '1');
    return [`${listVarName(b)}[int(${i}) - 1]`, P.ORDER_MEMBER];
  };

  P.data_itemnumoflist = b => {
    const v = val(b, 'VALUE', '0');
    const n = listVarName(b);
    return [`((${n}.index(${v}) + 1) if (${v}) in ${n} else 0)`, P.ORDER_CONDITIONAL];
  };

  P.data_lengthoflist = b =>
    [`len(${listVarName(b)})`, P.ORDER_FUNCTION_CALL];

  P.data_listcontainsitem = b => {
    const v = val(b, 'VALUE', '0');
    return [`(${v}) in ${listVarName(b)}`, P.ORDER_RELATIONAL];
  };

  // Operators (custom)
  P.op_in_between = b => {
    const v  = val(b, 'VAL', '0');
    const lo = val(b, 'LO',  '0');
    const hi = val(b, 'HI',  '0');
    return [`(${lo}) <= (${v}) <= (${hi})`, P.ORDER_RELATIONAL];
  };

  P.op_text_contains = b => {
    const t = P.valueToCode(b, 'TEXT', P.ORDER_RELATIONAL) || "''";
    const s = P.valueToCode(b, 'SUB',  P.ORDER_RELATIONAL) || "''";
    return [`(${s}) in (${t})`, P.ORDER_RELATIONAL];
  };

  P.control_stop = b => {
    const target = b.getFieldValue('TARGET');
    if (target === 'THIS') {
      return `return\n`;
    }
    // ALL : signale stop au runner (arrête moteurs) + annule toutes les tâches
    return (
      `_sim_bridge.requestStop()\n` +
      `import asyncio as _asyncio\n` +
      `for _t in list(_asyncio.all_tasks()):\n` +
      `    _t.cancel()\n`
    );
  };

  // --- My Blocks (procédures) : async def + await partout ---
  // Le corps d'une procédure peut contenir des blocs SPIKE awaitables
  // (motor.run_for_*, runloop.sleep_ms, …), donc la procédure doit être
  // async, et les appels doivent utiliser `await`.

  // Les overrides de procedures_def/call sont installés APRÈS Blockly.inject
  // dans setupBlockly(), via applyProcedureGeneratorOverrides(). Si on les
  // pose ici, Blockly les écrase pendant inject quand il populate forBlock.
}

// Asyncify-helper : transforme `def name(...):\n  body` en
// `async def name(...):\n  global ...\n  body`. Idempotent (skip si déjà async).
function asyncifyProcedureCode(code) {
  const P = Blockly.Python;
  if (!code || typeof code !== 'string') return code;
  if (!/^def /m.test(code)) return code;
  if (/^async def /m.test(code)) return code;
  let out = code.replace(/^def /m, 'async def ');
  out = out.replace(
    /^(async def [^\n]+:\n)/m,
    `$1${P.INDENT}global _mvmt_speed, _mvmt_dpr_mm, _motor_speed, _program_start_t\n`
  );
  return out;
}

// Override des générateurs procedures_call* (le call doit utiliser `await`).
// Le def, lui, sera asyncifié en post-process dans workspaceToCode car Blockly
// stocke la définition dans this.definitions_['%' + funcName] et n'expose
// pas d'API simple pour wrapper proprement le générateur stock.
function applyProcedureGeneratorOverrides() {
  const P = Blockly.Python;
  const getGen = (name) => (P.forBlock && P.forBlock[name]) || P[name];
  const setGen = (name, fn) => { if (P.forBlock) P.forBlock[name] = fn; P[name] = fn; };

  const origCallNoReturn = getGen('procedures_callnoreturn');
  if (!origCallNoReturn) return;

  setGen('procedures_callnoreturn', function(block, generator) {
    const code = origCallNoReturn.call(this, block, generator);
    return 'await ' + String(code);
  });
}


// Force la couleur SPIKE des blocs de procédure et de leurs helpers de mutator,
// désactive les variants return/ifreturn (inutiles pour l'équivalent SPIKE),
// et retire la case « autoriser les ordres » du mutator (le corps est toujours là).
function styleProcedureBlocks() {
  // Couleur appliquée au bloc define + au bloc d'appel + aux helpers du mutator.
  const types = [
    'procedures_defnoreturn',
    'procedures_callnoreturn',
    'procedures_mutatorcontainer',
    'procedures_mutatorarg',
  ];
  for (const t of types) {
    const def = Blockly.Blocks[t];
    if (!def || !def.init) continue;
    const origInit = def.init;
    def.init = function() {
      origInit.call(this);
      this.setColour(C.myblocks);
    };
  }

  // Mutator container : on enlève le DummyInput "STATEMENT_INPUT" (case à
  // cocher "autoriser les ordres") qui n'a pas de sens chez nous puisque
  // les procédures ont toujours un corps.
  const mc = Blockly.Blocks['procedures_mutatorcontainer'];
  if (mc) {
    mc.init = function() {
      this.appendDummyInput()
        .appendField(Blockly.Msg['PROCEDURES_MUTATORCONTAINER_TITLE'] || 'inputs');
      this.appendStatementInput('STACK');
      this.setColour(C.myblocks);
      this.contextMenu = false;
    };
  }

  // Pas besoin de fonction qui retourne ni de "si ... retourner" : on
  // supprime carrément ces types de blocs.
  delete Blockly.Blocks['procedures_defreturn'];
  delete Blockly.Blocks['procedures_callreturn'];
  delete Blockly.Blocks['procedures_ifreturn'];
}

// Force la couleur SPIKE sur les blocs stock Blockly utilisés dans la
// catégorie Operators (logic / math / text). Sans ça ils gardent leur
// teinte par défaut (bleu/vert Blockly), incohérente avec la catégorie.
function styleOperatorBlocks() {
  const stock = [
    'logic_compare', 'logic_operation', 'logic_negate', 'logic_boolean',
    'math_arithmetic', 'math_single', 'math_modulo', 'math_round',
    'math_number', 'math_random_int',
    'text', 'text_join', 'text_charAt', 'text_length',
  ];
  for (const t of stock) {
    const def = Blockly.Blocks[t];
    if (!def || !def.init) continue;
    const origInit = def.init;
    def.init = function() {
      origInit.call(this);
      this.setColour(C.operators);
    };
  }
}

// Idem pour les blocs stock liés aux variables scalaires.
function styleVariableBlocks() {
  const stock = ['variables_get', 'variables_set', 'math_change'];
  for (const t of stock) {
    const def = Blockly.Blocks[t];
    if (!def || !def.init) continue;
    const origInit = def.init;
    def.init = function() {
      origInit.call(this);
      this.setColour(C.vars);
    };
  }
}

// Override de quelques libellés stock Blockly pour matcher le phrasing
// SPIKE app (qui n'est pas tout à fait celui de Blockly anglais par défaut).
function applySpikeMessageOverrides() {
  if (typeof Blockly === 'undefined' || !Blockly.Msg) return;
  Blockly.Msg['MATH_MODULO_TITLE']         = '%1 mod %2';
  Blockly.Msg['MATH_RANDOM_INT_TITLE']     = 'pick random %1 to %2';
  Blockly.Msg['MATH_SINGLE_OP_ABSOLUTE']   = 'abs';
  Blockly.Msg['MATH_SINGLE_OP_ROOT']       = 'sqrt';
  Blockly.Msg['TEXT_JOIN_TITLE_CREATEWITH'] = 'join';
  Blockly.Msg['TEXT_LENGTH_TITLE']         = 'length of %1';
  Blockly.Msg['TEXT_CHARAT_FROM_START']    = 'letter %1 of';
  Blockly.Msg['TEXT_CHARAT_FROM_END']      = 'letter %1 of (from end)';
}

export function setupBlockly(container) {
  applySpikeMessageOverrides();
  defineBlocks();
  styleProcedureBlocks();
  styleOperatorBlocks();
  styleVariableBlocks();

  const ws = Blockly.inject(container, {
    toolbox: TOOLBOX,
    theme: Blockly.Themes.Dark,
    grid: { spacing: 20, length: 1, colour: '#2d3540', snap: true },
    zoom: { controls: true, wheel: true, startScale: 1.0 },
    trashcan: true,
    renderer: 'zelos',  // rendu rond style SPIKE/Scratch
  });

  Blockly.Python.addReservedWords(
    'motor,motor_pair,color,color_sensor,distance_sensor,force_sensor,hub,port,light_matrix,button,motion_sensor,sound,runloop'
  );

  // Override des générateurs procedures_*. Doit être après Blockly.inject :
  // celui-ci peuple forBlock avec les générateurs stock qui écraseraient
  // nos versions si on les installait en amont.
  applyProcedureGeneratorOverrides();

  // --- Catégorie Variables custom : variables normales + listes nommées ---
  ws.registerToolboxCategoryCallback('VARIABLE_AND_LIST', function(workspace) {
    const xml = [];

    // 1) Make a Variable (type vide = variable scalaire)
    const btnVar = document.createElement('button');
    btnVar.setAttribute('text', 'Make a Variable');
    btnVar.setAttribute('callbackKey', 'CREATE_VAR_PLAIN');
    xml.push(btnVar);

    // Pour chaque variable scalaire : get / set / change
    const plainVars = (workspace.getVariablesOfType('') || []).slice().sort((a, b) => a.name.localeCompare(b.name));
    if (plainVars.length > 0) {
      const first = plainVars[0];
      const mkVarBlock = (type, fields = {}) => {
        const el = document.createElement('block');
        el.setAttribute('type', type);
        el.setAttribute('gap', '8');
        const fld = document.createElement('field');
        fld.setAttribute('name', 'VAR');
        fld.setAttribute('id', first.getId());
        fld.setAttribute('variabletype', '');
        fld.textContent = first.name;
        el.appendChild(fld);
        for (const [n, v] of Object.entries(fields)) {
          const i = document.createElement('value');
          i.setAttribute('name', n);
          i.innerHTML = `<shadow type="math_number"><field name="NUM">${v}</field></shadow>`;
          el.appendChild(i);
        }
        return el;
      };
      // Le bloc d'affichage (variables_get) pour chaque variable
      for (const v of plainVars) {
        const el = document.createElement('block');
        el.setAttribute('type', 'variables_get');
        const fld = document.createElement('field');
        fld.setAttribute('name', 'VAR');
        fld.setAttribute('id', v.getId());
        fld.setAttribute('variabletype', '');
        fld.textContent = v.name;
        el.appendChild(fld);
        xml.push(el);
      }
      xml.push(mkVarBlock('variables_set', { VALUE: 0 }));
      xml.push(mkVarBlock('math_change',  { DELTA: 1 }));
    }

    // 2) Make a List (type 'List')
    const btnList = document.createElement('button');
    btnList.setAttribute('text', 'Make a List');
    btnList.setAttribute('callbackKey', 'CREATE_VAR_LIST');
    xml.push(btnList);

    // Blocs liste pour le 1er item de la palette : Blockly choisira automatiquement
    // la 1ère List existante via defaultType='List'.
    const lists = workspace.getVariablesOfType('List') || [];
    if (lists.length > 0) {
      const listBlocks = [
        'data_addtolist',
        'data_deleteoflist',
        'data_deletealloflist',
        'data_insertatlist',
        'data_replaceitemoflist',
        'data_itemoflist',
        'data_itemnumoflist',
        'data_lengthoflist',
        'data_listcontainsitem',
      ];
      for (const t of listBlocks) {
        const el = document.createElement('block');
        el.setAttribute('type', t);
        el.setAttribute('gap', '8');
        xml.push(el);
      }
    }

    return xml;
  });

  ws.registerButtonCallback('CREATE_VAR_PLAIN', function(button) {
    Blockly.Variables.createVariableButtonHandler(button.getTargetWorkspace(), null, '');
  });
  ws.registerButtonCallback('CREATE_VAR_LIST', function(button) {
    Blockly.Variables.createVariableButtonHandler(button.getTargetWorkspace(), null, 'List');
  });

  // --- Shadow math_number sur chaque argument d'un appel de procédure ---
  // Sans ça, les slots ARGn restent vides et on ne peut pas taper de valeur
  // directement (il faut d'abord poser un bloc number dessus).
  function addShadowsToProcCall(block) {
    if (!block || !block.arguments_) return;
    const shadowXml = '<shadow type="math_number"><field name="NUM">0</field></shadow>';
    for (let i = 0; i < block.arguments_.length; i++) {
      const input = block.getInput('ARG' + i);
      if (!input || !input.connection) continue;
      if (input.connection.targetBlock()) continue;          // déjà connecté
      if (input.connection.getShadowDom()) continue;         // shadow déjà posé
      input.connection.setShadowDom(Blockly.utils.xml.textToDom(shadowXml));
    }
  }

  ws.addChangeListener(function(event) {
    if (!event) return;
    const tryBlock = (id) => {
      const b = ws.getBlockById(id);
      if (b && b.type === 'procedures_callnoreturn') addShadowsToProcCall(b);
    };
    if (event.type === Blockly.Events.BLOCK_CREATE) {
      (event.ids || []).forEach(tryBlock);
    } else if (event.type === Blockly.Events.BLOCK_CHANGE && event.element === 'mutation') {
      tryBlock(event.blockId);
    }
  });

  // Imports SPIKE 3 en préface du code généré
  const origInit = Blockly.Python.init;
  Blockly.Python.init = function(workspace) {
    origInit.call(this, workspace);
    this.definitions_['import_motor']           = 'import motor';
    this.definitions_['import_motor_pair']      = 'import motor_pair';
    this.definitions_['import_color']           = 'import color';
    this.definitions_['import_orientation']     = 'import orientation';
    this.definitions_['import_color_sensor']    = 'import color_sensor';
    this.definitions_['import_distance_sensor'] = 'import distance_sensor';
    this.definitions_['import_force_sensor']    = 'import force_sensor';
    this.definitions_['import_hub']             = 'from hub import port, light_matrix, button, motion_sensor, sound, light';
    this.definitions_['import_runloop']         = 'import runloop';
    this.definitions_['import_sim_bridge']      = 'import _sim_bridge';

    // Initialise chaque variable typée 'List' à [] au préambule.
    const lists = workspace.getVariablesOfType ? workspace.getVariablesOfType('List') : [];
    for (const v of lists) {
      const name = this.nameDB_.getName(v.name, Blockly.Names.NameType.VARIABLE);
      this.definitions_['list_var_' + v.getId()] = `${name} = []`;
    }
  };

  // Ne génère du code que pour les piles accrochées à un bloc événement
  // (event_when_*). Chaque event devient une coroutine async indépendante.
  // Les blocs orphelins sont ignorés.
  Blockly.Python.workspaceToCode = function(workspace) {
    if (!workspace) return '';
    this.init(workspace);

    // Variables d'état partagées (vitesses, distance par tour) au niveau module.
    this.definitions_['_state_vars'] =
      "_mvmt_speed = 50\n" +
      "_mvmt_dpr_mm = 175.929\n" +
      "_motor_speed = {'A': 50, 'B': 50, 'C': 50, 'D': 50, 'E': 50, 'F': 50}\n" +
      "import time as _time\n" +
      "_program_start_t = _time.monotonic()";

    const coros = [];
    let counter = 0;

    for (const block of workspace.getTopBlocks(true)) {
      if (block.disabled || (block.isEnabled && !block.isEnabled())) continue;

      // 1) Procédures (My Blocks) → async def au niveau module.
      if (block.type === 'procedures_defnoreturn') {
        const out = this.blockToCode(block);
        const procCode = Array.isArray(out) ? out[0] : out;
        this.definitions_['proc_' + block.id] = procCode;
        continue;
      }

      // 2) Événements → coroutine async + ajout à runloop.run(...).
      if (!block.type.startsWith('event_')) continue;

      const next = block.getNextBlock();
      let body = '';
      if (next) {
        const out = this.blockToCode(next);
        body = Array.isArray(out) ? out[0] : out;
      }

      const funcName = `_evt_${counter++}`;
      const wrapped = wrapEventCoro(this, block, funcName, body);
      this.definitions_['evt_' + funcName] = wrapped;
      coros.push(`${funcName}()`);
    }

    const code = coros.length > 0
      ? `runloop.run(${coros.join(', ')})\n`
      : '';

    // POST-PROCESS : Blockly stocke chaque procédure dans this.definitions_
    // sous la forme « def name(): body ». On les transforme en `async def`
    // + injection du `global ...`. Filet de sécurité indépendant des
    // overrides de générateurs (qui peuvent être bypassés selon la version
    // de Blockly).
    for (const k of Object.keys(this.definitions_)) {
      this.definitions_[k] = asyncifyProcedureCode(this.definitions_[k]);
    }

    return this.finish(code);
  };

  // Le code passé ici est juste l'appel runloop.run(...) (généré par
  // workspaceToCode). Les variables d'état + les coroutines des events
  // ont déjà été ajoutées dans this.definitions_.
  const origFinish = Blockly.Python.finish;
  Blockly.Python.finish = function(code) {
    return origFinish.call(this, code);
  };

  return ws;
}
