"""color_sensor — capteur couleur (SPIKE App 3)."""
from _sim import _b, _to_letter
import color as _color

_NAME_TO_ID = {
    "black": _color.BLACK,
    "magenta": _color.MAGENTA,
    "purple": _color.PURPLE,
    "blue": _color.BLUE,
    "azure": _color.AZURE,
    "turquoise": _color.TURQUOISE,
    "green": _color.GREEN,
    "yellow": _color.YELLOW,
    "orange": _color.ORANGE,
    "red": _color.RED,
    "white": _color.WHITE,
}


def color(p):
    """Retourne l'identifiant de la couleur détectée (voir module `color`)."""
    name = _b.getColor(_to_letter(p))
    if name is None:
        return _color.UNKNOWN
    return _NAME_TO_ID.get(name, _color.UNKNOWN)


def reflection(p):
    """Intensité réfléchie (0..100)."""
    return int(_b.getReflectedLight(_to_letter(p)))


def rgbi(p):
    """(r, g, b, i) chacun 0..1024 — non simulé fidèlement."""
    return (0, 0, 0, 0)


def light_up_all(p, intensity=100):
    """Allume les 3 LED autour du capteur à la même intensité (0..100 %)."""
    _b.log(f"[color_sensor port {_to_letter(p)}] light_up_all({intensity}%)")


def light_up(p, *intensities):
    """Allume chaque LED à l'intensité passée (typiquement 3 valeurs 0..100)."""
    _b.log(f"[color_sensor port {_to_letter(p)}] light_up({list(intensities)})")
