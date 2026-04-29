# Format Mat

Un mat est composé de **deux fichiers** : un JSON de config et une image.

## JSON de configuration

```json
{
  "name": "FLL Submerged 2024",
  "image": "fll-submerged-2024.png",
  "width_mm": 2362,
  "height_mm": 1143,
  "start_zone": {
    "x_mm": 100,
    "y_mm": 100,
    "rotation_deg": 0
  },
  "obstacles": []
}
```

| Champ | Type | Description |
|---|---|---|
| `name` | string | Affiché dans l'UI |
| `image` | string | Chemin relatif vers l'image (PNG, JPG ou SVG) |
| `width_mm` | number | Largeur réelle du mat en millimètres |
| `height_mm` | number | Hauteur réelle |
| `start_zone` | objet | Position de spawn du robot (x/y depuis coin haut-gauche, rotation en degrés) |
| `obstacles` | array | Réservé pour future extension (modèles 3D d'obstacles) |

## Conventions de coordonnées

- Origine = centre du mat dans la scène 3D
- L'axe X (rouge) est horizontal, l'axe Z (bleu) est vertical (top-down)
- L'angle 0° = robot orienté vers +X
- Rotations positives = sens trigonométrique (anti-horaire vu de dessus)

## Dimensions standards

- **FIRST LEGO League** : 2362 × 1143 mm
- **WRO** (World Robot Olympiad) : 2362 × 1143 mm aussi pour la plupart
- **Petit mat scolaire** : ~1200 × 900 mm

## Résolution recommandée

Pour la lecture du capteur couleur :
- Minimum : 1 pixel = 5 mm (≈ 470 × 230 px pour FLL)
- Conseillé : 1 pixel = 2 mm (≈ 1180 × 570 px)
- Maximum utile : 1 pixel = 1 mm (2362 × 1143 px) — au-delà, performance dégradée pour aucun gain

## Lecture par le capteur couleur

Le capteur couleur lit le pixel central sous sa position. Le simulateur applique un nearest-neighbor sur 6 couleurs LEGO : `red`, `green`, `blue`, `yellow`, `white`, `black`.

Pour `get_reflected_light()`, le simulateur calcule la luminance perçue (formule Rec. 709) du pixel et la convertit en pourcentage 0-100.
