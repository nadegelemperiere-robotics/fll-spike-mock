"""motor — pilotage individuel d'un moteur (SPIKE App 3).

Vélocités exprimées en deg/s (comme l'API officielle).
Le simulateur considère qu'un moteur tourne au plus à 600 deg/s à fond.
"""
from _sim import _b, _to_letter

# Stop modes
COAST = 0
BRAKE = 1
HOLD = 2
CONTINUE = 3
SMART_COAST = 4
SMART_BRAKE = 5

# Directions
SHORTEST_PATH = 0
LONGEST_PATH = 1
CLOCKWISE = 2
COUNTERCLOCKWISE = 3

_MAX_DPS = 600

# Vitesse par défaut stockée par moteur (en % comme dans l'app SPIKE).
# Utilisée par les blocs SPIKE qui ne prennent pas de vitesse explicite.
_default_pct = {}


def _vel_to_pct(velocity):
    return max(-100, min(100, int(round(velocity * 100 / _MAX_DPS))))


def set_speed(p, pct):
    """Stocke la vitesse par défaut (%) pour le moteur p (utilisée par les blocs SPIKE sans vitesse explicite)."""
    letter = _to_letter(p)
    _default_pct[letter] = max(-100, min(100, int(pct)))


def get_speed(p):
    """Retourne la vitesse par défaut stockée pour le moteur p (%)."""
    letter = _to_letter(p)
    return _default_pct.get(letter, 50)


def get_speed_dps(p):
    """Vitesse par défaut en deg/s (positive)."""
    return abs(int((get_speed(p) / 100) * _MAX_DPS))


def run(p, velocity, *, acceleration=1000):
    _b.setMotor(_to_letter(p), _vel_to_pct(velocity))


async def run_for_time(p, duration, velocity, *, stop=BRAKE, acceleration=1000, deceleration=1000):
    letter = _to_letter(p)
    _b.setMotor(letter, _vel_to_pct(velocity))
    await _b.sleep(duration / 1000)
    if stop != CONTINUE:
        _b.stopMotor(letter)


async def run_for_degrees(p, degrees, velocity, *, stop=BRAKE, acceleration=1000, deceleration=1000):
    letter = _to_letter(p)
    start = _b.getMotorPosition(letter)
    direction = 1 if degrees >= 0 else -1
    _b.setMotor(letter, _vel_to_pct(direction * abs(velocity)))
    target = abs(degrees)
    while abs(_b.getMotorPosition(letter) - start) < target:
        if _b.isStopped():
            break
        await _b.sleep(0.02)
    if stop != CONTINUE:
        _b.stopMotor(letter)


async def run_to_relative_position(p, position, velocity, *, stop=BRAKE, acceleration=1000, deceleration=1000):
    letter = _to_letter(p)
    cur = _b.getMotorPosition(letter)
    if cur == position:
        return
    direction = 1 if position > cur else -1
    _b.setMotor(letter, _vel_to_pct(direction * abs(velocity)))
    while True:
        cur = _b.getMotorPosition(letter)
        if (direction > 0 and cur >= position) or (direction < 0 and cur <= position):
            break
        if _b.isStopped():
            break
        await _b.sleep(0.02)
    if stop != CONTINUE:
        _b.stopMotor(letter)


async def run_to_absolute_position(p, position, velocity, *, direction=SHORTEST_PATH, stop=BRAKE, acceleration=1000, deceleration=1000):
    """Va à une position angulaire absolue (0..359). `direction` choisit le sens de rotation."""
    letter = _to_letter(p)
    cur_raw = _b.getMotorPosition(letter)
    cur_abs = cur_raw % 360
    target_abs = position % 360

    if direction == CLOCKWISE:
        delta = (target_abs - cur_abs) % 360
    elif direction == COUNTERCLOCKWISE:
        delta = -((cur_abs - target_abs) % 360)
    elif direction == LONGEST_PATH:
        delta = (target_abs - cur_abs) % 360
        if delta == 0:
            delta = 360
        elif delta < 180:
            delta -= 360
    else:  # SHORTEST_PATH (défaut)
        delta = (target_abs - cur_abs) % 360
        if delta > 180:
            delta -= 360

    if delta == 0:
        return

    target_raw = cur_raw + delta
    sign = 1 if delta > 0 else -1
    _b.setMotor(letter, _vel_to_pct(sign * abs(velocity)))
    while True:
        cur = _b.getMotorPosition(letter)
        if (delta > 0 and cur >= target_raw) or (delta < 0 and cur <= target_raw):
            break
        if _b.isStopped():
            break
        await _b.sleep(0.02)
    if stop != CONTINUE:
        _b.stopMotor(letter)


def stop(p, *, stop=BRAKE):
    _b.stopMotor(_to_letter(p))


def velocity(p):
    """Vitesse instantanée du moteur en deg/s."""
    pct = _b.getMotorVelocity(_to_letter(p))
    return int((pct / 100) * _MAX_DPS)


def relative_position(p):
    return int(_b.getMotorPosition(_to_letter(p)))


def absolute_position(p):
    return int(_b.getMotorPosition(_to_letter(p)) % 360)


def reset_relative_position(p, position):
    pass


def set_duty_cycle(p, duty_cycle):
    """Pilote le moteur en boucle ouverte (PWM brut). duty_cycle: -10000..10000."""
    dc = max(-10000, min(10000, int(duty_cycle)))
    pct = dc / 100  # -100..100
    _b.setMotor(_to_letter(p), pct)


def get_duty_cycle(p):
    """Duty cycle courant (-10000..10000)."""
    pct = _b.getMotorVelocity(_to_letter(p))
    return int(pct * 100)
