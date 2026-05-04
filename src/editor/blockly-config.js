// src/editor/blockly-config.js
// Palette Blockly inspirée de l'app LEGO SPIKE Prime 3.
// Génère du Python qui cible nos modules /lib/* (motor, motor_pair, color_sensor, ...).

const C = {
  motor:     '#3f8eee',  // Bleu SPIKE
  events:    '#FFBF00',
  movement:  '#EC5AC8',  // Rose SPIKE
  light:     '#0FBD8C',
  sound:     '#E665A4',
  sensors:   '#5CB1D6',
  control:   '#FFAB19',
  operators: '#59C059',
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
  ['heart',     'IMAGE_HEART'],
  ['happy',     'IMAGE_HAPPY'],
  ['sad',       'IMAGE_SAD'],
  ['surprised', 'IMAGE_SURPRISED'],
  ['asleep',    'IMAGE_ASLEEP'],
  ['yes',       'IMAGE_YES'],
  ['no',        'IMAGE_NO'],
  ['arrow ↑',   'IMAGE_ARROW_N'],
  ['arrow ↓',   'IMAGE_ARROW_S'],
  ['arrow ←',   'IMAGE_ARROW_W'],
  ['arrow →',   'IMAGE_ARROW_E'],
];

// Helper : crée un bloc de toolbox avec des shadow blocks pour ses entrées numériques/texte.
// num(spec) où spec est un nombre crée un math_number shadow. Une chaîne crée un text shadow.
function tb(type, shadows = {}) {
  const inputs = {};
  for (const [name, value] of Object.entries(shadows)) {
    if (typeof value === 'number') {
      inputs[name] = { shadow: { type: 'math_number', fields: { NUM: value } } };
    } else if (typeof value === 'string') {
      inputs[name] = { shadow: { type: 'text', fields: { TEXT: value } } };
    }
  }
  return Object.keys(inputs).length ? { kind: 'block', type, inputs } : { kind: 'block', type };
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
      kind: 'category', name: 'Events', colour: C.events, contents: [
        tb('event_when_started'),
      ]
    },
    {
      kind: 'category', name: 'Light', colour: C.light, contents: [
        tb('light_write',       { TXT: 'Hi' }),
        tb('light_show_image'),
        tb('light_clear'),
      ]
    },
    {
      kind: 'category', name: 'Sound', colour: C.sound, contents: [
        tb('sound_beep', { F: 440, D: 200 }),
      ]
    },
    {
      kind: 'category', name: 'Sensors', colour: C.sensors, contents: [
        tb('sensor_is_color'),
        tb('sensor_color'),
        tb('sensor_reflection'),
        tb('sensor_distance_mm'),
        tb('sensor_force_pressed'),
        tb('sensor_force'),
        tb('sensor_yaw'),
        tb('sensor_reset_yaw', { A: 0 }),
      ]
    },
    {
      kind: 'category', name: 'Control', colour: C.control, contents: [
        tb('control_wait_seconds', { T: 1 }),
        tb('control_wait_until'),
        tb('controls_repeat_ext'),
        tb('controls_whileUntil'),
        tb('controls_if'),
        tb('control_forever'),
      ]
    },
    {
      kind: 'category', name: 'Operators', colour: C.operators, contents: [
        tb('math_number'),
        tb('math_arithmetic'),
        tb('math_single'),
        tb('math_modulo'),
        tb('logic_compare'),
        tb('logic_operation'),
        tb('logic_negate'),
        tb('logic_boolean'),
        tb('text'),
      ]
    },
    { kind: 'category', name: 'Variables', colour: '#FF8C1A', custom: 'VARIABLE' },
    { kind: 'category', name: 'My Blocks', colour: '#FF6680', custom: 'PROCEDURE' },
  ]
};


function defineBlocks() {
  Blockly.defineBlocksWithJsonArray([

    // === Events ===
    {
      type: 'event_when_started',
      message0: 'when program starts',
      nextStatement: null,
      colour: C.events,
      tooltip: 'Program entry point.',
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
    {
      type: 'spike_motor_position',
      message0: '%1 %2 position',
      args0: [
        MOTOR_ICON,
        { type: 'field_dropdown', name: 'PORT', options: PORT_OPTIONS },
      ],
      output: 'Number', colour: C.motor,
    },

    // === Light (matrix) ===
    {
      type: 'light_write',
      message0: 'write %1',
      args0: [{ type: 'input_value', name: 'TXT' }],
      previousStatement: null, nextStatement: null, colour: C.light,
    },
    {
      type: 'light_show_image',
      message0: 'show image %1',
      args0: [{ type: 'field_dropdown', name: 'IMG', options: IMAGE_OPTIONS }],
      previousStatement: null, nextStatement: null, colour: C.light,
    },
    {
      type: 'light_clear',
      message0: 'turn off pixels',
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
      message0: 'is color on port %1 %2 ?',
      args0: [
        { type: 'field_dropdown', name: 'PORT', options: PORT_OPTIONS },
        { type: 'field_dropdown', name: 'COLOR', options: COLOR_OPTIONS },
      ],
      output: 'Boolean', colour: C.sensors,
    },
    {
      type: 'sensor_color',
      message0: 'color on port %1',
      args0: [{ type: 'field_dropdown', name: 'PORT', options: PORT_OPTIONS }],
      output: 'Number', colour: C.sensors,
    },
    {
      type: 'sensor_reflection',
      message0: 'reflected light port %1 (%%)',
      args0: [{ type: 'field_dropdown', name: 'PORT', options: PORT_OPTIONS }],
      output: 'Number', colour: C.sensors,
    },
    {
      type: 'sensor_distance_mm',
      message0: 'distance port %1 (mm)',
      args0: [{ type: 'field_dropdown', name: 'PORT', options: PORT_OPTIONS }],
      output: 'Number', colour: C.sensors,
    },
    {
      type: 'sensor_force_pressed',
      message0: 'is force port %1 pressed ?',
      args0: [{ type: 'field_dropdown', name: 'PORT', options: PORT_OPTIONS }],
      output: 'Boolean', colour: C.sensors,
    },
    {
      type: 'sensor_force',
      message0: 'force port %1 (deci-N)',
      args0: [{ type: 'field_dropdown', name: 'PORT', options: PORT_OPTIONS }],
      output: 'Number', colour: C.sensors,
    },
    {
      type: 'sensor_yaw',
      message0: 'yaw angle (°)',
      output: 'Number', colour: C.sensors,
      tooltip: 'Current yaw in degrees (positive = clockwise from above).',
    },
    {
      type: 'sensor_reset_yaw',
      message0: 'set yaw angle to %1 °',
      args0: [{ type: 'input_value', name: 'A', check: 'Number' }],
      previousStatement: null, nextStatement: null, colour: C.sensors,
    },

    // === Control ===
    {
      type: 'control_wait_seconds',
      message0: 'wait %1 seconds',
      args0: [{ type: 'input_value', name: 'T', check: 'Number' }],
      previousStatement: null, nextStatement: null, colour: C.control,
    },
    {
      type: 'control_wait_until',
      message0: 'wait until %1',
      args0: [{ type: 'input_value', name: 'COND', check: 'Boolean' }],
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
  ]);

  // ---------------- Générateurs Python ----------------
  const P = Blockly.Python;
  const val = (b, n, def='0') => P.valueToCode(b, n, P.ORDER_ATOMIC) || def;
  const stmt = (b, n) => P.statementToCode(b, n) || '    pass\n';

  P.event_when_started = b => '';

  // Movement (style app SPIKE) — appelle uniquement l'API publique motor_pair.
  // Utilise les variables locales `_mvmt_speed` et `_mvmt_dpr_mm` injectées par finish().
  const DIR_STEER = { FORWARD: '0', BACKWARD: '0', LEFT: '-100', RIGHT: '100' };
  const DIR_SIGN  = { FORWARD: '',  BACKWARD: '-', LEFT: '',     RIGHT: ''   };
  const VEL_EXPR     = '_mvmt_speed / 100 * 600';
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

  // Motor (style SPIKE) — appelle uniquement l'API publique du module motor.
  // Utilise la variable locale `_motor_speed` injectée par finish().
  function motorVelExpr(port) {
    return `abs(int(_motor_speed['${port}'] / 100 * 600))`;
  }

  P.spike_motor_run_for = b => {
    const port = b.getFieldValue('PORT');
    const portRef = `port.${port}`;
    const sign = b.getFieldValue('DIR') === 'CW' ? '' : '-';
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
    const sign = b.getFieldValue('DIR') === 'CW' ? '' : '-';
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

  // Lumière
  P.light_write = b =>
    `light_matrix.write(str(${val(b,'TXT',"''")}))\n`;
  P.light_show_image = b =>
    `light_matrix.show_image(light_matrix.${b.getFieldValue('IMG')})\n`;
  P.light_clear = b =>
    `light_matrix.clear()\n`;

  // Son
  P.sound_beep = b =>
    `sound.beep(${val(b,'F','440')}, ${val(b,'D','200')})\n`;

  // Capteurs
  P.sensor_is_color = b =>
    [`color_sensor.color(port.${b.getFieldValue('PORT')}) == color.${b.getFieldValue('COLOR')}`, P.ORDER_RELATIONAL];
  P.sensor_color = b =>
    [`color_sensor.color(port.${b.getFieldValue('PORT')})`, P.ORDER_FUNCTION_CALL];
  P.sensor_reflection = b =>
    [`color_sensor.reflection(port.${b.getFieldValue('PORT')})`, P.ORDER_FUNCTION_CALL];
  P.sensor_distance_mm = b =>
    [`distance_sensor.distance(port.${b.getFieldValue('PORT')})`, P.ORDER_FUNCTION_CALL];
  P.sensor_force_pressed = b =>
    [`force_sensor.pressed(port.${b.getFieldValue('PORT')})`, P.ORDER_FUNCTION_CALL];
  P.sensor_force = b =>
    [`force_sensor.force(port.${b.getFieldValue('PORT')})`, P.ORDER_FUNCTION_CALL];
  P.sensor_yaw = b =>
    [`(motion_sensor.yaw_pitch_roll()[0])`, P.ORDER_ATOMIC];
  P.sensor_reset_yaw = b =>
    `motion_sensor.reset_yaw(${val(b,'A','0')})\n`;

  // Contrôle
  P.control_wait_seconds = b =>
    `await runloop.sleep_ms(int((${val(b,'T')})*1000))\n`;
  P.control_wait_until = b => {
    const cond = P.valueToCode(b, 'COND', P.ORDER_NONE) || 'False';
    return `await runloop.until(lambda: (${cond}))\n`;
  };
  P.control_forever = b =>
    `while True:\n${stmt(b,'BODY')}    await runloop.sleep_ms(10)\n`;
}


export function setupBlockly(container) {
  defineBlocks();

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

  // Imports SPIKE 3 en préface du code généré
  const origInit = Blockly.Python.init;
  Blockly.Python.init = function(workspace) {
    origInit.call(this, workspace);
    this.definitions_['import_motor']           = 'import motor';
    this.definitions_['import_motor_pair']      = 'import motor_pair';
    this.definitions_['import_color']           = 'import color';
    this.definitions_['import_color_sensor']    = 'import color_sensor';
    this.definitions_['import_distance_sensor'] = 'import distance_sensor';
    this.definitions_['import_force_sensor']    = 'import force_sensor';
    this.definitions_['import_hub']             = 'from hub import port, light_matrix, button, motion_sensor, sound';
    this.definitions_['import_runloop']         = 'import runloop';
  };

  // Ne génère du code que pour les piles accrochées à un bloc événement
  // (event_when_started, etc). Les blocs orphelins sont ignorés.
  Blockly.Python.workspaceToCode = function(workspace) {
    if (!workspace) return '';
    this.init(workspace);
    let code = '';
    const topBlocks = workspace.getTopBlocks(true);
    for (const block of topBlocks) {
      if (!block.type.startsWith('event_')) continue;
      if (block.disabled || (block.isEnabled && !block.isEnabled())) continue;
      const out = this.blockToCode(block);
      code += Array.isArray(out) ? out[0] : out;
    }
    return this.finish(code);
  };

  // Wrap dans `async def main():` + `runloop.run(main())`.
  // Prélude : variables locales utilisées par les blocs Movement
  // (vitesse par défaut + distance par tour de roue).
  const origFinish = Blockly.Python.finish;
  Blockly.Python.finish = function(code) {
    const lines = code.split('\n');
    const indented = lines.map(l => l.length ? '    ' + l : l).join('\n');
    const body = indented.trim() ? indented : '    pass';
    const prelude =
      '    _mvmt_speed = 50\n' +
      '    _mvmt_dpr_mm = 175.929\n' +
      "    _motor_speed = {'A': 50, 'B': 50, 'C': 50, 'D': 50, 'E': 50, 'F': 50}\n";
    const wrapped = `\nasync def main():\n${prelude}${body}\n\nrunloop.run(main())\n`;
    return origFinish.call(this, wrapped);
  };

  return ws;
}
