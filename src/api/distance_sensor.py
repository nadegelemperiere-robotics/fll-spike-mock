"""distance_sensor — capteur ToF (SPIKE App 3). Distances en millimètres."""
from _sim import _b, _to_letter


def distance(p):
    """Distance en mm, ou -1 si rien détecté."""
    cm = _b.getDistance(_to_letter(p))
    if cm is None:
        return -1
    return int(cm * 10)


def get_distance_short(p):
    return distance(p)


def get_distance_medium(p):
    return distance(p)


def get_distance_long(p):
    return distance(p)


def get_distance_inf(p):
    return distance(p)


def light_up_all(p, intensity=100):
    pass


def light_up(p, *intensities):
    pass
