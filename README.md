# SPIKE Prime Simulator

Simulateur web LEGO® SPIKE Prime avec éditeur Python et blocs visuels, import de modèles BrickLink Studio (`.io`) et de tapis (mats) avec dimensions réelles.

> Projet indépendant, non affilié à LEGO, BrickLink ou the LEGO Group.

## Fonctionnalités

- **Éditeur double** : Python (Monaco) ou blocs visuels (Blockly) avec conversion blocs → Python
- **Exécution Python dans le navigateur** via Pyodide (pas de serveur requis)
- **API compatible SPIKE Prime** : `Motor`, `MotorPair`, `ColorSensor`, `DistanceSensor`, `ForceSensor`, `Hub`
- **Import de robots** depuis fichiers `.io` (BrickLink Studio) ou `.ldr` (LDraw)
  - Détection automatique du Hub, moteurs et capteurs par numéro de pièce LEGO
  - Pièces chargées à la demande depuis le CDN LDraw (gkjohnson/ldraw-parts-library)
- **Import de mats** : image PNG/SVG + dimensions réelles en mm (compatible FLL)
- **Vue top-down 3D** comme l'application SPIKE officielle, avec orbite optionnelle pour debug
- **Physique** : moteurs avec couple/vitesse, friction des roues, capteurs réalistes (rayon de détection couleur, distance ToF)

## Démo rapide

```bash
git clone https://github.com/<votre-user>/spike-simulator.git
cd spike-simulator
# Servir en local (n'importe quel serveur statique)
python3 -m http.server 8000
# Ouvrir http://localhost:8000
```

## Architecture

```
spike-simulator/
├── index.html              # Point d'entrée
├── src/
│   ├── editor/             # UI : Blockly, Monaco, panneaux
│   │   ├── styles.css
│   │   ├── ui.js           # Layout, onglets, console
│   │   ├── blockly-config.js
│   │   ├── monaco-config.js
│   │   └── runner.js       # Exécution Pyodide
│   ├── simulator/          # Rendu 3D + physique
│   │   ├── scene.js        # Three.js scène, caméra top-down
│   │   ├── physics.js      # Cannon-es : châssis, roues, friction
│   │   ├── mat.js          # Chargement mat (PNG + JSON dimensions)
│   │   └── sensors.js      # Raycast couleur/distance
│   ├── robot/              # Parsing & assemblage robot
│   │   ├── io-parser.js    # .io → ZIP (pwd soho0909) → .ldr
│   │   ├── ldraw-loader.js # Wrap LDrawLoader Three.js
│   │   ├── part-ids.js     # Mapping pièces SPIKE → composants
│   │   └── robot-builder.js # .ldr → modèle physique simulé
│   └── api/                # API Python exposée à Pyodide
│       └── spike_api.py
├── mats/
│   ├── fll-2024.json       # Exemple : dimensions + image
│   └── fll-2024.png
├── examples/
│   ├── hello.py
│   ├── square.py           # Faire un carré
│   └── line-follow.py
└── docs/
    ├── ROBOT_FORMAT.md     # Comment Studio est parsé
    └── MAT_FORMAT.md       # Spec du format de mat
```

## Format de mat

Un mat = une image + un JSON :

```json
{
  "name": "FLL Submerged 2024",
  "image": "fll-2024.png",
  "width_mm": 2362,
  "height_mm": 1143,
  "start_zone": { "x_mm": 100, "y_mm": 100, "rotation_deg": 0 }
}
```

## Format de robot

Le simulateur accepte :
- `.io` (BrickLink Studio natif) — déchiffré côté navigateur
- `.ldr` / `.mpd` (LDraw)

Le builder identifie automatiquement par numéro de pièce :

| Pièce | Numéro LDraw | Rôle |
|---|---|---|
| Hub SPIKE Prime | `27843` | Centre du robot |
| Medium Angular Motor | `54675` | Moteur |
| Large Angular Motor | `54696` | Moteur |
| Color Sensor | `37308c01` | Capteur couleur |
| Distance Sensor | `37316c01` | Capteur ToF |
| Force Sensor | `37312c01` | Capteur force |

Voir `docs/ROBOT_FORMAT.md` pour les détails.

## API SPIKE compatible

```python
from spike import PrimeHub, Motor, MotorPair, ColorSensor, DistanceSensor

hub = PrimeHub()
left = Motor('A')
right = Motor('B')
pair = MotorPair('A', 'B')
color = ColorSensor('C')

pair.move_tank(seconds=2, left_velocity=50, right_velocity=50)
if color.get_color() == 'red':
    pair.stop()
```

## Roadmap

- [x] Squelette projet, parsing `.io`
- [x] API SPIKE de base (motors, color, distance)
- [x] Vue top-down + physique 2D simplifiée
- [ ] Conversion Blockly → Python complète (en cours)
- [ ] Bibliothèque de mats FLL officiels
- [ ] Mode pas-à-pas / debugger
- [ ] Export programme vers vrai Hub SPIKE (via WebBluetooth)

## Licence

MIT — voir `LICENSE`.

LDraw™ est une marque déposée. Ce projet utilise la LDraw Parts Library.
SPIKE™ et LEGO® sont des marques du groupe LEGO, qui ne sponsorise ni n'approuve ce projet.
