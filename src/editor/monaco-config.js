// src/editor/monaco-config.js
// Charge Monaco depuis CDN et configure l'autocomplete pour l'API SPIKE.

const STARTER = `# SPIKE Prime program (SPIKE App 3)
# Pick a robot and a mat, then click Run.

import motor_pair
import color_sensor
import distance_sensor
from hub import port, light_matrix
import runloop


async def main():
    motor_pair.pair(motor_pair.PAIR_1, port.A, port.E)

    # Drive straight 2 s at 360 deg/s (steering=0)
    await motor_pair.move_for_time(motor_pair.PAIR_1, 2000, 0, velocity=360)

    # Pivot right 0.8 s
    await motor_pair.move_tank_for_time(motor_pair.PAIR_1, 800, 360, -360)

    motor_pair.stop(motor_pair.PAIR_1)
    light_matrix.write("OK")
    print("Program finished")


runloop.run(main())
`;

const SPIKE_COMPLETIONS = [
  { label: 'motor_pair.pair', kind: 2, insertText: 'motor_pair.pair(motor_pair.PAIR_1, port.${1:A}, port.${2:E})', insertTextRules: 4 },
  { label: 'motor_pair.move_for_time', kind: 2, insertText: 'await motor_pair.move_for_time(motor_pair.PAIR_1, ${1:1000}, ${2:0}, velocity=${3:360})', insertTextRules: 4, detail: '(pair, duration_ms, steering, velocity)' },
  { label: 'motor_pair.move_for_degrees', kind: 2, insertText: 'await motor_pair.move_for_degrees(motor_pair.PAIR_1, ${1:360}, ${2:0}, velocity=${3:360})', insertTextRules: 4 },
  { label: 'motor_pair.move_tank_for_time', kind: 2, insertText: 'await motor_pair.move_tank_for_time(motor_pair.PAIR_1, ${1:1000}, ${2:360}, ${3:360})', insertTextRules: 4 },
  { label: 'motor_pair.move_tank', kind: 2, insertText: 'motor_pair.move_tank(motor_pair.PAIR_1, ${1:360}, ${2:360})', insertTextRules: 4 },
  { label: 'motor_pair.stop', kind: 2, insertText: 'motor_pair.stop(motor_pair.PAIR_1)', insertTextRules: 4 },
  { label: 'motor.run', kind: 2, insertText: 'motor.run(port.${1:A}, ${2:360})', insertTextRules: 4 },
  { label: 'motor.run_for_time', kind: 2, insertText: 'await motor.run_for_time(port.${1:A}, ${2:1000}, ${3:360})', insertTextRules: 4 },
  { label: 'motor.run_for_degrees', kind: 2, insertText: 'await motor.run_for_degrees(port.${1:A}, ${2:360}, ${3:360})', insertTextRules: 4 },
  { label: 'color_sensor.color', kind: 2, insertText: 'color_sensor.color(port.${1:C})', insertTextRules: 4 },
  { label: 'color_sensor.reflection', kind: 2, insertText: 'color_sensor.reflection(port.${1:C})', insertTextRules: 4 },
  { label: 'distance_sensor.distance', kind: 2, insertText: 'distance_sensor.distance(port.${1:D})', insertTextRules: 4, detail: 'Distance in mm' },
  { label: 'force_sensor.force', kind: 2, insertText: 'force_sensor.force(port.${1:E})', insertTextRules: 4 },
  { label: 'force_sensor.pressed', kind: 2, insertText: 'force_sensor.pressed(port.${1:E})', insertTextRules: 4 },
  { label: 'runloop.sleep_ms', kind: 2, insertText: 'await runloop.sleep_ms(${1:1000})', insertTextRules: 4 },
  { label: 'runloop.run', kind: 2, insertText: 'runloop.run(${1:main}())', insertTextRules: 4 },
  { label: 'light_matrix.write', kind: 2, insertText: "light_matrix.write('${1:Hi}')", insertTextRules: 4 },
];

export async function setupMonaco(container) {
  // Charger Monaco depuis CDN
  await new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js';
    s.onload = resolve;
    document.head.appendChild(s);
  });

  return new Promise((resolve) => {
    require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });
    require(['vs/editor/editor.main'], () => {
      const editor = monaco.editor.create(container, {
        value: STARTER,
        language: 'python',
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 13,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        tabSize: 4,
      });

      // Autocomplete simple
      monaco.languages.registerCompletionItemProvider('python', {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };
          return { suggestions: SPIKE_COMPLETIONS.map(s => ({ ...s, range })) };
        }
      });

      resolve(editor);
    });
  });
}
