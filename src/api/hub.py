"""hub — port, light_matrix, button, motion_sensor, sound (SPIKE App 3)."""
import math
from _sim import _b


class _PortEnum:
    A = 0
    B = 1
    C = 2
    D = 3
    E = 4
    F = 5


port = _PortEnum()


class _LightMatrix:
    IMAGE_HEART = "HEART"
    IMAGE_HEART_SMALL = "HEART_SMALL"
    IMAGE_HAPPY = "HAPPY"
    IMAGE_SAD = "SAD"
    IMAGE_CONFUSED = "CONFUSED"
    IMAGE_ANGRY = "ANGRY"
    IMAGE_ASLEEP = "ASLEEP"
    IMAGE_SURPRISED = "SURPRISED"
    IMAGE_YES = "YES"
    IMAGE_NO = "NO"
    IMAGE_CLOCK12 = "CLOCK12"
    IMAGE_ARROW_N = "ARROW_N"
    IMAGE_ARROW_S = "ARROW_S"
    IMAGE_ARROW_E = "ARROW_E"
    IMAGE_ARROW_W = "ARROW_W"

    def write(self, text):
        _b.log(f"[light_matrix] {text}")

    def show_image(self, image):
        _b.log(f"[light_matrix] image: {image}")

    def show(self, pixels):
        pass

    def set_pixel(self, x, y, intensity=100):
        pass

    def clear(self):
        pass

    def get_orientation(self):
        return 0

    def set_orientation(self, orientation):
        pass


light_matrix = _LightMatrix()


class _Button:
    LEFT = 1
    RIGHT = 2
    POWER = 0

    def pressed(self, button):
        return 0


button = _Button()


class _MotionSensor:
    """Capteur d'orientation simulé. Le mat est plat donc pitch et roll sont 0.
    Convention SPIKE : yaw positif = rotation horaire vue de dessus."""

    def __init__(self):
        self._yaw_offset_rad = 0.0  # offset radians retranché à la lecture

    def _yaw_rad(self):
        # Notre heading interne est CCW depuis -Z. Yaw SPIKE est CW => signe inverse.
        return -_b.getHeading() - self._yaw_offset_rad

    def tilt_angles(self):
        """Retourne (yaw, pitch, roll) en décidegrés (1° = 10)."""
        yaw_dd = int(self._yaw_rad() * 180 / math.pi * 10)
        return (yaw_dd, 0, 0)

    def yaw_pitch_roll(self):
        """Retourne (yaw, pitch, roll) en degrés."""
        return (int(self._yaw_rad() * 180 / math.pi), 0, 0)

    def acceleration(self, raw_unfiltered=False):
        return (0, 0, -9810)

    def angular_velocity(self):
        return (0, 0, 0)

    def gesture(self):
        return -1

    def up_face(self):
        return 0

    def reset_yaw(self, angle=0):
        """Définit la lecture courante du yaw à `angle` (en degrés)."""
        target_rad = angle * math.pi / 180
        # On veut : -heading - offset = target  =>  offset = -heading - target
        self._yaw_offset_rad = -_b.getHeading() - target_rad

    def stable(self):
        return True

    def quaternion(self):
        return (1.0, 0.0, 0.0, 0.0)


motion_sensor = _MotionSensor()


class _Sound:
    def beep(self, frequency=440, duration=200, attenuation=100):
        _b.log(f"[sound] {frequency}Hz {duration}ms")


sound = _Sound()
