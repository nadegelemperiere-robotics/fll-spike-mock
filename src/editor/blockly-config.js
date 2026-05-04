// src/editor/blockly-config.js
// Palette Blockly inspirée de l'app LEGO SPIKE Prime 3.
// Génère du Python qui cible nos modules /lib/* (motor, motor_pair, color_sensor, ...).

const C = {
  motor:     '#3f8eee',  // Bleu SPIKE
  events:    '#FFBF00',
  movement:  '#9966FF',
  light:     '#0FBD8C',
  sound:     '#CF63CF',
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
      kind: 'category', name: 'Events', colour: C.events, contents: [
        tb('event_when_started'),
      ]
    },
    {
      kind: 'category', name: 'Movement', colour: C.movement, contents: [
        tb('movement_set_motors'),
        tb('movement_move_for_time',    { T: 2, STEER: 0, V: 360 }),
        tb('movement_move_for_degrees', { D: 360, STEER: 0, V: 360 }),
        tb('movement_start',            { STEER: 0, V: 360 }),
        tb('movement_stop'),
        tb('movement_tank_for_time',    { T: 2, L: 360, R: 360 }),
        tb('movement_tank_for_degrees', { D: 360, L: 360, R: 360 }),
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

    // === Movement (motor_pair) ===
    {
      type: 'movement_set_motors',
      message0: 'set movement motors to left %1 right %2',
      args0: [
        { type: 'field_dropdown', name: 'L', options: PORT_OPTIONS },
        { type: 'field_dropdown', name: 'R', options: PORT_OPTIONS },
      ],
      previousStatement: null, nextStatement: null, colour: C.movement,
    },
    {
      type: 'movement_move_for_time',
      message0: 'move for %1 seconds, steering %2, at %3 deg/s',
      args0: [
        { type: 'input_value', name: 'T', check: 'Number' },
        { type: 'input_value', name: 'STEER', check: 'Number' },
        { type: 'input_value', name: 'V', check: 'Number' },
      ],
      previousStatement: null, nextStatement: null, colour: C.movement,
      inputsInline: true,
    },
    {
      type: 'movement_move_for_degrees',
      message0: 'move %1 ° (left motor), steering %2, at %3 deg/s',
      args0: [
        { type: 'input_value', name: 'D', check: 'Number' },
        { type: 'input_value', name: 'STEER', check: 'Number' },
        { type: 'input_value', name: 'V', check: 'Number' },
      ],
      previousStatement: null, nextStatement: null, colour: C.movement,
      inputsInline: true,
    },
    {
      type: 'movement_start',
      message0: 'start moving steering %1 at %2 deg/s',
      args0: [
        { type: 'input_value', name: 'STEER', check: 'Number' },
        { type: 'input_value', name: 'V', check: 'Number' },
      ],
      previousStatement: null, nextStatement: null, colour: C.movement,
      inputsInline: true,
    },
    {
      type: 'movement_stop',
      message0: 'stop moving',
      previousStatement: null, nextStatement: null, colour: C.movement,
    },
    {
      type: 'movement_tank_for_time',
      message0: 'tank for %1 seconds: left %2, right %3 deg/s',
      args0: [
        { type: 'input_value', name: 'T', check: 'Number' },
        { type: 'input_value', name: 'L', check: 'Number' },
        { type: 'input_value', name: 'R', check: 'Number' },
      ],
      previousStatement: null, nextStatement: null, colour: C.movement,
      inputsInline: true,
    },
    {
      type: 'movement_tank_for_degrees',
      message0: 'tank for %1 °: left %2, right %3 deg/s',
      args0: [
        { type: 'input_value', name: 'D', check: 'Number' },
        { type: 'input_value', name: 'L', check: 'Number' },
        { type: 'input_value', name: 'R', check: 'Number' },
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

  // Mouvement
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

  // Moteur (style SPIKE)
  P.spike_motor_run_for = b => {
    const portRef = `port.${b.getFieldValue('PORT')}`;
    const sign = b.getFieldValue('DIR') === 'CW' ? '' : '-';
    const n = val(b, 'N', '1');
    const unit = b.getFieldValue('UNIT');
    if (unit === 'rotations') {
      return `await motor.run_for_degrees(${portRef}, int(${sign}((${n})*360)), motor.get_speed_dps(${portRef}))\n`;
    }
    if (unit === 'degrees') {
      return `await motor.run_for_degrees(${portRef}, int(${sign}(${n})), motor.get_speed_dps(${portRef}))\n`;
    }
    // seconds
    return `await motor.run_for_time(${portRef}, int((${n})*1000), ${sign}motor.get_speed_dps(${portRef}))\n`;
  };

  P.spike_motor_go_to_position = b => {
    const portRef = `port.${b.getFieldValue('PORT')}`;
    const path = b.getFieldValue('PATH');
    const pos = val(b, 'POS', '0');
    return `await motor.run_to_absolute_position(${portRef}, ${pos}, motor.get_speed_dps(${portRef}), direction=motor.${path})\n`;
  };

  P.spike_motor_start = b => {
    const portRef = `port.${b.getFieldValue('PORT')}`;
    const sign = b.getFieldValue('DIR') === 'CW' ? '' : '-';
    return `motor.run(${portRef}, ${sign}motor.get_speed_dps(${portRef}))\n`;
  };

  P.spike_motor_stop = b =>
    `motor.stop(port.${b.getFieldValue('PORT')})\n`;

  P.spike_motor_set_speed = b =>
    `motor.set_speed(port.${b.getFieldValue('PORT')}, ${val(b,'PCT','75')})\n`;

  P.spike_motor_get_speed = b =>
    [`motor.get_speed(port.${b.getFieldValue('PORT')})`, P.ORDER_FUNCTION_CALL];

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

  // Wrap dans `async def main():` + `runloop.run(main())`
  const origFinish = Blockly.Python.finish;
  Blockly.Python.finish = function(code) {
    const lines = code.split('\n');
    const indented = lines.map(l => l.length ? '    ' + l : l).join('\n');
    const body = indented.trim() ? indented : '    pass';
    const wrapped = `\nasync def main():\n${body}\n\nrunloop.run(main())\n`;
    return origFinish.call(this, wrapped);
  };

  return ws;
}
