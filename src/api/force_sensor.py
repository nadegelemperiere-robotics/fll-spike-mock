"""force_sensor — capteur de force (SPIKE App 3)."""
from _sim import _b, _to_letter


def force(p):
    """Force appliquée en déci-newtons (0..100)."""
    return int(_b.getForce(_to_letter(p)) * 10)


def pressed(p, force_threshold=0):
    return force(p) > force_threshold


def raw(p):
    return 0
