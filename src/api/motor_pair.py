"""motor_pair — pilotage en paire (drive base) (SPIKE App 3)."""
from _sim import _b, _to_letter
import motor as _motor

PAIR_1 = 0
PAIR_2 = 1
PAIR_3 = 2

_pairs = {}


def pair(pair_id, left_motor, right_motor):
    _pairs[pair_id] = (_to_letter(left_motor), _to_letter(right_motor))


def unpair(pair_id):
    _pairs.pop(pair_id, None)


def _get(pair_id):
    if pair_id not in _pairs:
        raise ValueError(f"Pair {pair_id} non configurée ; appelez motor_pair.pair() d'abord.")
    return _pairs[pair_id]


def _steering_to_velocities(velocity, steering):
    """steering -100..100. 0 = tout droit, +100 = pivot droite, -100 = pivot gauche."""
    s = max(-100, min(100, steering))
    if s >= 0:
        l = velocity
        r = velocity * (1 - 2 * s / 100)
    else:
        l = velocity * (1 + 2 * s / 100)
        r = velocity
    return l, r


def _stop_pair(pair_id, mode):
    lp, rp = _get(pair_id)
    _motor.stop(lp, stop=mode)
    _motor.stop(rp, stop=mode)


def move(pair_id, steering, *, velocity=360, acceleration=1000):
    lp, rp = _get(pair_id)
    lv, rv = _steering_to_velocities(velocity, steering)
    _motor.run(lp, lv)
    # Moteur droit monté en miroir : on envoie l'opposé pour que les deux
    # roues tournent dans le même sens physique.
    _motor.run(rp, -rv)


async def move_for_time(pair_id, duration, steering=0, *, velocity=360, stop=_motor.BRAKE, acceleration=1000, deceleration=1000):
    move(pair_id, steering, velocity=velocity)
    await _b.sleep(duration / 1000)
    if stop != _motor.CONTINUE:
        _stop_pair(pair_id, stop)


async def move_for_degrees(pair_id, degrees, steering=0, *, velocity=360, stop=_motor.BRAKE, acceleration=1000, deceleration=1000):
    lp, rp = _get(pair_id)
    start = _b.getMotorPosition(lp)
    move(pair_id, steering, velocity=velocity if degrees >= 0 else -velocity)
    target = abs(degrees)
    while abs(_b.getMotorPosition(lp) - start) < target:
        if _b.isStopped():
            break
        await _b.sleep(0.02)
    if stop != _motor.CONTINUE:
        _stop_pair(pair_id, stop)


def move_tank(pair_id, left_velocity, right_velocity):
    lp, rp = _get(pair_id)
    _motor.run(lp, left_velocity)
    # Moteur droit monté en miroir : voir move().
    _motor.run(rp, -right_velocity)


async def move_tank_for_time(pair_id, duration, left_velocity, right_velocity, *, stop=_motor.BRAKE, acceleration=1000, deceleration=1000):
    move_tank(pair_id, left_velocity, right_velocity)
    await _b.sleep(duration / 1000)
    if stop != _motor.CONTINUE:
        _stop_pair(pair_id, stop)


async def move_tank_for_degrees(pair_id, degrees, left_velocity, right_velocity, *, stop=_motor.BRAKE, acceleration=1000, deceleration=1000):
    lp, rp = _get(pair_id)
    start = _b.getMotorPosition(lp)
    move_tank(pair_id, left_velocity, right_velocity)
    while abs(_b.getMotorPosition(lp) - start) < abs(degrees):
        if _b.isStopped():
            break
        await _b.sleep(0.02)
    if stop != _motor.CONTINUE:
        _stop_pair(pair_id, stop)


def stop(pair_id, *, stop=_motor.BRAKE):
    _stop_pair(pair_id, stop)
