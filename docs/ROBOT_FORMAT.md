# Format Robot

Le simulateur accepte les fichiers `.io` (BrickLink Studio natif) ou `.ldr` / `.mpd` (LDraw standard).

## Fichiers .io

Un `.io` est une archive ZIP chiffrée avec le mot de passe public `soho0909`. Elle contient typiquement :
- `model.ldr` — le modèle 3D au format LDraw (c'est ce qu'utilise le simulateur)
- `Bricklink/` — métadonnées Studio
- des images de prévisualisation

Le simulateur extrait `model.ldr` et l'analyse comme un fichier LDraw standard.

## Détection automatique des composants SPIKE

Lors du chargement, le simulateur parcourt toutes les pièces du modèle et identifie les éléments SPIKE par leur numéro LDraw :

| Composant | Numéros LDraw | Rôle |
|---|---|---|
| Hub Technic | `27843` | Centre du robot, position de référence |
| Medium Angular Motor | `54675` | Moteur (assigné à un port A-F) |
| Large Angular Motor | `54696` | Moteur |
| Small Angular Motor | `6214085` | Moteur |
| Color Sensor | `37308` | Capteur couleur |
| Distance Sensor | `37316` | Capteur distance |
| Force Sensor | `37312` | Capteur force |

Les ports sont assignés automatiquement dans l'ordre de découverte (A, B, C, D, E, F).

## Détection moteur gauche / droit

Pour identifier les moteurs de propulsion, le simulateur :
1. Cherche les moteurs proches d'une roue (< 80 mm).
2. Trie les moteurs de propulsion selon l'axe X relatif au Hub.
3. Le moteur le plus à gauche → port gauche, le plus à droite → port droit.
4. L'empattement est calculé comme la distance entre les deux moteurs.
5. Le diamètre des roues détectées détermine la conversion degrés → distance.

## Cas non gérés (encore)

- Robots avec plus de deux moteurs de propulsion (chenilles 4 moteurs) : seuls les deux extrêmes sont utilisés.
- Pièces flexibles (chenilles, bandes en caoutchouc) : non simulées physiquement.
- Mécanismes secondaires (pince, levier) : les moteurs supplémentaires tournent en l'air, sans effet visible.

## Conseil pour les modèles Studio

Pour un meilleur résultat :
- Placez le Hub bien à l'horizontale (face plate vers le bas).
- Mettez les moteurs de propulsion **avant** les autres dans l'ordre de construction (ports A et B par convention).
- Utilisez les pièces officielles SPIKE (pas les variantes custom).
