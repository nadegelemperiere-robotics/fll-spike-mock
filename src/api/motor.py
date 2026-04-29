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


def _vel_to_pct(velocity):
    return max(-100, min(100, int(round(velocity * 100 / _MAX_DPS))))


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
    # Le simulateur ne distingue pas position absolue/relative.
    await run_to_relative_position(p, position, velocity, stop=stop)


def stop(p, *, stop=BRAKE):
    _b.stopMotor(_to_letter(p))


def velocity(p):
    return 0


def relative_position(p):
    return int(_b.getMotorPosition(_to_letter(p)))


def absolute_position(p):
    return int(_b.getMotorPosition(_to_letter(p)) % 360)


def reset_relative_position(p, position):
    pass
