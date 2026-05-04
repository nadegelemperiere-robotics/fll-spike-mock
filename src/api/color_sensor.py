"""color_sensor — API stricte SPIKE App 3 : color, reflection, rgbi.

Le capteur reconnaît uniquement ces 9 couleurs :
red, green, blue, magenta, yellow, orange, azure, black, white.
"""
from _sim import _b, _to_letter
import color as _color

_NAME_TO_ID = {
    "black":   _color.BLACK,
    "magenta": _color.MAGENTA,
    "blue":    _color.BLUE,
    "azure":   _color.AZURE,
    "green":   _color.GREEN,
    "yellow":  _color.YELLOW,
    "orange":  _color.ORANGE,
    "red":     _color.RED,
    "white":   _color.WHITE,
}


def color(p):
    """Retourne l'identifiant de la couleur détectée (constante du module color)."""
    name = _b.getColor(_to_letter(p))
    if name is None:
        return _color.UNKNOWN
    return _NAME_TO_ID.get(name, _color.UNKNOWN)


def reflection(p):
    """Intensité de la lumière réfléchie (0..100 %)."""
    return int(_b.getReflectedLight(_to_letter(p)))


def rgbi(p):
    """(r, g, b, i) — chaque composant 0..1024."""
    return tuple(_b.getColorRGBI(_to_letter(p)))
