// src/editor/blockly-config.js — Blocs visuels pour l'API SPIKE App 3.
// Génère un programme structuré : `async def main(): ...; runloop.run(main())`.

const TOOLBOX = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category', name: 'Mouvement', colour: '#ffb627', contents: [
        { kind: 'block', type: 'spike_motor_pair_init' },
        { kind: 'block', type: 'spike_move_tank' },
        { kind: 'block', type: 'spike_move_for_seconds' },
        { kind: 'block', type: 'spike_move_for_degrees' },
        { kind: 'block', type: 'spike_stop_motors' },
      ]
    },
    {
      kind: 'category', name: 'Capteurs', colour: '#4dd2ff', contents: [
        { kind: 'block', type: 'spike_color_init' },
        { kind: 'block', type: 'spike_color_get' },
        { kind: 'block', type: 'spike_distance_init' },
        { kind: 'block', type: 'spike_distance_get' },
      ]
    },
    {
      kind: 'category', name: 'Hub', colour: '#5cdb95', contents: [
        { kind: 'block', type: 'spike_light_matrix_write' },
        { kind: 'block', type: 'spike_print' },
        { kind: 'block', type: 'spike_wait' },
      ]
    },
    {
      kind: 'category', name: 'Logique', colour: '#a17fe0', contents: [
        { kind: 'block', type: 'controls_if' },
        { kind: 'block', type: 'logic_compare' },
        { kind: 'block', type: 'logic_operation' },
        { kind: 'block', type: 'logic_boolean' },
      ]
    },
    {
      kind: 'category', name: 'Boucles', colour: '#ff7e6b', contents: [
        { kind: 'block', type: 'controls_repeat_ext' },
        { kind: 'block', type: 'controls_whileUntil' },
        { kind: 'block', type: 'controls_for' },
      ]
    },
    {
      kind: 'category', name: 'Math', colour: '#5b8def', contents: [
        { kind: 'block', type: 'math_number' },
        { kind: 'block', type: 'math_arithmetic' },
        { kind: 'block', type: 'math_single' },
      ]
    },
    {
      kind: 'category', name: 'Variables', colour: '#888fa3', custom: 'VARIABLE'
    },
  ]
};

const PORT_OPTIONS = [['A','A'],['B','B'],['C','C'],['D','D'],['E','E'],['F','F']];

function defineBlocks() {
  Blockly.defineBlocksWithJsonArray([
    {
      type: 'spike_motor_pair_init',
      message0: 'configurer paire moteurs : gauche port %1, droite port %2',
      args0: [
        { type: 'field_dropdown', name: 'L', options: PORT_OPTIONS },
        { type: 'field_dropdown', name: 'R', options: PORT_OPTIONS },
      ],
      previousStatement: null, nextStatement: null, colour: '#ffb627',
    },
    {
      type: 'spike_move_tank',
      message0: 'rouler gauche %1 deg/s, droite %2 deg/s',
      args0: [
        { type: 'input_value', name: 'L', check: 'Number' },
        { type: 'input_value', name: 'R', check: 'Number' },
      ],
      previousStatement: null, nextStatement: null, colour: '#ffb627',
      inputsInline: true,
    },
    {
      type: 'spike_move_for_seconds',
      message0: 'avancer pendant %1 s à %2 deg/s',
      args0: [
        { type: 'input_value', name: 'T', check: 'Number' },
        { type: 'input_value', name: 'V', check: 'Number' },
      ],
      previousStatement: null, nextStatement: null, colour: '#ffb627',
      inputsInline: true,
    },
    {
      type: 'spike_move_for_degrees',
      message0: 'avancer %1 ° à %2 deg/s',
      args0: [
        { type: 'input_value', name: 'D', check: 'Number' },
        { type: 'input_value', name: 'V', check: 'Number' },
      ],
      previousStatement: null, nextStatement: null, colour: '#ffb627',
      inputsInline: true,
    },
    {
      type: 'spike_stop_motors',
      message0: 'arrêter moteurs',
      previousStatement: null, nextStatement: null, colour: '#ffb627',
    },
    {
      type: 'spike_color_init',
      message0: 'capteur couleur port %1 dans %2',
      args0: [
        { type: 'field_dropdown', name: 'PORT', options: PORT_OPTIONS },
        { type: 'field_variable', name: 'VAR', variable: 'color' },
      ],
      previousStatement: null, nextStatement: null, colour: '#4dd2ff',
    },
    {
      type: 'spike_color_get',
      message0: 'couleur %1',
      args0: [{ type: 'field_variable', name: 'VAR', variable: 'color' }],
      output: 'Number', colour: '#4dd2ff',
    },
    {
      type: 'spike_distance_init',
      message0: 'capteur distance port %1 dans %2',
      args0: [
        { type: 'field_dropdown', name: 'PORT', options: PORT_OPTIONS },
        { type: 'field_variable', name: 'VAR', variable: 'dist' },
      ],
      previousStatement: null, nextStatement: null, colour: '#4dd2ff',
    },
    {
      type: 'spike_distance_get',
      message0: 'distance %1 (mm)',
      args0: [{ type: 'field_variable', name: 'VAR', variable: 'dist' }],
      output: 'Number', colour: '#4dd2ff',
    },
    {
      type: 'spike_light_matrix_write',
      message0: 'matrice afficher %1',
      args0: [{ type: 'input_value', name: 'V' }],
      previousStatement: null, nextStatement: null, colour: '#5cdb95',
    },
    {
      type: 'spike_print',
      message0: 'afficher %1',
      args0: [{ type: 'input_value', name: 'V' }],
      previousStatement: null, nextStatement: null, colour: '#5cdb95',
    },
    {
      type: 'spike_wait',
      message0: 'attendre %1 s',
      args0: [{ type: 'input_value', name: 'T', check: 'Number' }],
      previousStatement: null, nextStatement: null, colour: '#5cdb95',
    },
  ]);

  // --- Générateurs Python (SPIKE App 3) ---
  const v = (b, n) => Blockly.Python.nameDB_.getName(b.getFieldValue(n), Blockly.Names.NameType.VARIABLE);
  const val = (b, n, def='0') => Blockly.Python.valueToCode(b, n, Blockly.Python.ORDER_ATOMIC) || def;

  Blockly.Python.spike_motor_pair_init = b =>
    `motor_pair.pair(motor_pair.PAIR_1, port.${b.getFieldValue('L')}, port.${b.getFieldValue('R')})\n`;

  Blockly.Python.spike_move_tank = b =>
    `motor_pair.move_tank(motor_pair.PAIR_1, ${val(b,'L')}, ${val(b,'R')})\n`;

  Blockly.Python.spike_move_for_seconds = b =>
    `await motor_pair.move_for_time(motor_pair.PAIR_1, int((${val(b,'T')})*1000), 0, velocity=${val(b,'V')})\n`;

  Blockly.Python.spike_move_for_degrees = b =>
    `await motor_pair.move_for_degrees(motor_pair.PAIR_1, ${val(b,'D')}, 0, velocity=${val(b,'V')})\n`;

  Blockly.Python.spike_stop_motors = b =>
    `motor_pair.stop(motor_pair.PAIR_1)\n`;

  Blockly.Python.spike_color_init = b =>
    `${v(b,'VAR')} = port.${b.getFieldValue('PORT')}\n`;

  Blockly.Python.spike_color_get = b =>
    [`color_sensor.color(${v(b,'VAR')})`, Blockly.Python.ORDER_FUNCTION_CALL];

  Blockly.Python.spike_distance_init = b =>
    `${v(b,'VAR')} = port.${b.getFieldValue('PORT')}\n`;

  Blockly.Python.spike_distance_get = b =>
    [`distance_sensor.distance(${v(b,'VAR')})`, Blockly.Python.ORDER_FUNCTION_CALL];

  Blockly.Python.spike_light_matrix_write = b =>
    `light_matrix.write(str(${val(b,'V',"''")}))\n`;

  Blockly.Python.spike_print = b =>
    `print(${val(b,'V',"''")})\n`;

  Blockly.Python.spike_wait = b =>
    `await runloop.sleep_ms(int((${val(b,'T')})*1000))\n`;
}

export function setupBlockly(container) {
  defineBlocks();
  const ws = Blockly.inject(container, {
    toolbox: TOOLBOX,
    theme: Blockly.Themes.Dark,
    grid: { spacing: 20, length: 1, colour: '#2d3540', snap: true },
    zoom: { controls: true, wheel: true, startScale: 1.0 },
    trashcan: true,
  });

  Blockly.Python.addReservedWords(
    'motor,motor_pair,color,color_sensor,distance_sensor,force_sensor,hub,port,light_matrix,button,motion_sensor,sound,runloop'
  );

  // Ajouter les imports SPIKE 3 en préface du code généré
  const origInit = Blockly.Python.init;
  Blockly.Python.init = function(workspace) {
    origInit.call(this, workspace);
    this.definitions_['import_motor'] = 'import motor';
    this.definitions_['import_motor_pair'] = 'import motor_pair';
    this.definitions_['import_color_sensor'] = 'import color_sensor';
    this.definitions_['import_distance_sensor'] = 'import distance_sensor';
    this.definitions_['import_hub'] = 'from hub import port, light_matrix, button, motion_sensor, sound';
    this.definitions_['import_runloop'] = 'import runloop';
  };

  // Envelopper le code généré dans `async def main(): ...; runloop.run(main())`
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
