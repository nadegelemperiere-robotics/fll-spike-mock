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
    """API stricte SPIKE App 3 : clear, get_orientation, get_pixel, set_orientation,
    set_pixel, show, show_image, write."""

    # Constantes images officielles SPIKE App 3 (entiers 1..67)
    IMAGE_HEART          = 1
    IMAGE_HEART_SMALL    = 2
    IMAGE_HAPPY          = 3
    IMAGE_SMILE          = 4
    IMAGE_SAD            = 5
    IMAGE_CONFUSED       = 6
    IMAGE_ANGRY          = 7
    IMAGE_ASLEEP         = 8
    IMAGE_SURPRISED      = 9
    IMAGE_SILLY          = 10
    IMAGE_FABULOUS       = 11
    IMAGE_MEH            = 12
    IMAGE_YES            = 13
    IMAGE_NO             = 14
    IMAGE_CLOCK12        = 15
    IMAGE_CLOCK1         = 16
    IMAGE_CLOCK2         = 17
    IMAGE_CLOCK3         = 18
    IMAGE_CLOCK4         = 19
    IMAGE_CLOCK5         = 20
    IMAGE_CLOCK6         = 21
    IMAGE_CLOCK7         = 22
    IMAGE_CLOCK8         = 23
    IMAGE_CLOCK9         = 24
    IMAGE_CLOCK10        = 25
    IMAGE_CLOCK11        = 26
    IMAGE_ARROW_N        = 27
    IMAGE_ARROW_NE       = 28
    IMAGE_ARROW_E        = 29
    IMAGE_ARROW_SE       = 30
    IMAGE_ARROW_S        = 31
    IMAGE_ARROW_SW       = 32
    IMAGE_ARROW_W        = 33
    IMAGE_ARROW_NW       = 34
    IMAGE_GO_RIGHT       = 35
    IMAGE_GO_LEFT        = 36
    IMAGE_GO_UP          = 37
    IMAGE_GO_DOWN        = 38
    IMAGE_TRIANGLE       = 39
    IMAGE_TRIANGLE_LEFT  = 40
    IMAGE_CHESSBOARD     = 41
    IMAGE_DIAMOND        = 42
    IMAGE_DIAMOND_SMALL  = 43
    IMAGE_SQUARE         = 44
    IMAGE_SQUARE_SMALL   = 45
    IMAGE_RABBIT         = 46
    IMAGE_COW            = 47
    IMAGE_MUSIC_CROTCHET = 48
    IMAGE_MUSIC_QUAVER   = 49
    IMAGE_MUSIC_QUAVERS  = 50
    IMAGE_PITCHFORK      = 51
    IMAGE_XMAS           = 52
    IMAGE_PACMAN         = 53
    IMAGE_TARGET         = 54
    IMAGE_TSHIRT         = 55
    IMAGE_ROLLERSKATE    = 56
    IMAGE_DUCK           = 57
    IMAGE_HOUSE          = 58
    IMAGE_TORTOISE       = 59
    IMAGE_BUTTERFLY      = 60
    IMAGE_STICKFIGURE    = 61
    IMAGE_GHOST          = 62
    IMAGE_SWORD          = 63
    IMAGE_GIRAFFE        = 64
    IMAGE_SKULL          = 65
    IMAGE_UMBRELLA       = 66
    IMAGE_SNAKE          = 67

    def __init__(self):
        # État interne (5×5 intensités 0..100). Le bridge JS a aussi son état
        # pour l'affichage ; on garde une copie ici pour get_pixel/show.
        self._pixels = [0] * 25
        self._orientation = 0  # = orientation.UP

    def clear(self):
        for i in range(25):
            self._pixels[i] = 0
        _b.hubMatrixClear()

    def get_orientation(self):
        return self._orientation

    def get_pixel(self, x, y):
        if 0 <= x < 5 and 0 <= y < 5:
            return self._pixels[y * 5 + x]
        return 0

    def set_orientation(self, orientation):
        self._orientation = int(orientation)
        _b.hubMatrixOrientation(int(orientation))

    def set_pixel(self, x, y, intensity=100):
        if 0 <= x < 5 and 0 <= y < 5:
            self._pixels[y * 5 + x] = int(intensity)
        _b.hubMatrixSetPixel(int(x), int(y), int(intensity))

    def show(self, pixels):
        for i in range(min(25, len(pixels))):
            v = int(pixels[i])
            self._pixels[i] = v
            _b.hubMatrixSetPixel(i % 5, i // 5, v)

    def show_image(self, image):
        _b.hubMatrixShow(image)

    def write(self, text):
        _b.hubMatrixWrite(str(text))


light_matrix = _LightMatrix()


class _Button:
    LEFT = 1
    RIGHT = 2
    POWER = 0

    def pressed(self, button):
        return 0


button = _Button()


class _HubLight:
    """hub.light — API stricte SPIKE App 3 : color(light, color)."""

    # Constantes officielles
    POWER = 0      # bouton power (entre les boutons gauche/droite)
    CONNECT = 1    # LED autour du bouton Bluetooth Connect

    def color(self, light, color):
        _b.hubLightColor(int(light), int(color))


light = _HubLight()


class _MotionSensor:
    """hub.motion_sensor — API stricte SPIKE App 3.

    Fonctions exposées : acceleration, angular_velocity, gesture, get_yaw_face,
    quaternion, reset_tap_count, reset_yaw, set_yaw_face, stable, tap_count,
    tilt_angles, up_face.
    """

    # Gestes (retournés par gesture())
    TAPPED        = 0
    DOUBLE_TAPPED = 1
    SHAKEN        = 2
    FALLING       = 3
    UNKNOWN       = -1

    # Faces du hub (retournés par up_face / get_yaw_face / set_yaw_face)
    TOP    = 0  # face avec la matrice
    FRONT  = 1  # face avec le haut-parleur
    RIGHT  = 2  # côté droit en regardant la face FRONT
    BOTTOM = 3  # face avec la batterie
    BACK   = 4  # face avec le port USB
    LEFT   = 5  # côté gauche en regardant la face FRONT

    def __init__(self):
        # Notre simulateur 2D ne fait tourner le robot qu'autour de l'axe
        # vertical, c'est-à-dire l'axe TOP-BOTTOM du hub (qui est à plat).
        # On stocke un offset pour cet axe — les autres (FRONT-BACK, LEFT-RIGHT)
        # n'accumulent aucune rotation dans le sim, donc pas besoin d'offset.
        self._tb_offset_rad = 0.0
        self._yaw_face = self.TOP
        self._tap_count = 0

    def _tb_rotation_rad(self):
        """Rotation cumulée autour de l'axe TOP-BOTTOM (avec offset),
        normalisée dans [-π, π]. Convention SPIKE : positif = horaire vu de dessus."""
        rad = -_b.getHeading() - self._tb_offset_rad
        return math.atan2(math.sin(rad), math.cos(rad))

    def acceleration(self, raw_unfiltered=False):
        """Accélération sur (x, y, z) en mm/s². Robot à plat → seul Z (gravité)."""
        return (0, 0, -9810)

    def _route_to_axes(self, value):
        """Place la rotation du robot (autour du vertical mondial = axe TOP-BOTTOM
        du hub) sur la composante (yaw, pitch, roll) qui correspond à l'axe
        perpendiculaire à `_yaw_face`.

        Convention :
          - yaw_face TOP/BOTTOM    : rotation = yaw  (axe TOP-BOTTOM est l'axe yaw)
          - yaw_face FRONT/BACK    : rotation = roll (axe TOP-BOTTOM devient le roll)
          - yaw_face LEFT/RIGHT    : rotation = pitch (axe TOP-BOTTOM devient le pitch)
        """
        if self._yaw_face == self.TOP:    return (value, 0, 0)
        if self._yaw_face == self.BOTTOM: return (-value, 0, 0)
        if self._yaw_face == self.FRONT:  return (0, 0, value)
        if self._yaw_face == self.BACK:   return (0, 0, -value)
        if self._yaw_face == self.RIGHT:  return (0, value, 0)
        if self._yaw_face == self.LEFT:   return (0, -value, 0)
        return (value, 0, 0)

    def angular_velocity(self):
        """Vitesse angulaire (yaw_rate, pitch_rate, roll_rate) en décidegrés/s.
        Robot à plat : seul l'axe vertical bouge ; la face active détermine
        sur quelle composante elle apparaît."""
        omega_rad_s = -_b.getAngularVelocity()
        rate_dds = int(omega_rad_s * 180 / math.pi * 10)
        return self._route_to_axes(rate_dds)

    def gesture(self):
        """Geste détecté : TAPPED, DOUBLE_TAPPED, SHAKEN, FALLING, UNKNOWN."""
        return self.UNKNOWN

    def get_yaw_face(self):
        """Face actuellement utilisée comme axe yaw."""
        return self._yaw_face

    def quaternion(self):
        """Orientation absolue (w, x, y, z). Robot à plat → rotation autour
        de l'axe vertical uniquement."""
        half = self._tb_rotation_rad() / 2
        # Rotation autour de l'axe Y (vertical) : (cos(θ/2), 0, sin(θ/2), 0)
        return (math.cos(half), 0.0, math.sin(half), 0.0)

    def reset_tap_count(self):
        self._tap_count = 0

    def reset_yaw(self, angle=0):
        """Définit la lecture courante du yaw (composante [0] de tilt_angles)
        à `angle` degrés. N'affecte QUE l'axe yaw (perpendiculaire à yaw_face)
        — pitch et roll restent inchangés.

        Dans notre sim 2D, seul l'axe TOP-BOTTOM accumule de la rotation. Donc
        reset_yaw n'a un effet observable que si yaw_face vaut TOP ou BOTTOM
        (les autres faces ont un yaw structurellement nul)."""
        target_rad = angle * math.pi / 180
        if self._yaw_face == self.TOP:
            self._tb_offset_rad = -_b.getHeading() - target_rad
            _b.setMotionTBOffset(self._tb_offset_rad)
        elif self._yaw_face == self.BOTTOM:
            # BOTTOM inverse le signe : tilt_angles[0] = -tb_rotation
            # On veut tilt_angles[0] == target_rad, donc tb_rotation == -target_rad.
            self._tb_offset_rad = -_b.getHeading() + target_rad
            _b.setMotionTBOffset(self._tb_offset_rad)
        # Pour FRONT/BACK/LEFT/RIGHT : l'axe yaw n'a pas de rotation à reset,
        # et le roll/pitch (qui contient la rotation TOP-BOTTOM) ne doit pas
        # être touché — donc no-op, conformément à la sémantique SPIKE.

    def set_yaw_face(self, face):
        self._yaw_face = int(face)
        _b.setMotionYawFace(int(face))

    def stable(self):
        """True si le hub est immobile."""
        return True

    def tap_count(self):
        return self._tap_count

    def tilt_angles(self):
        """(yaw, pitch, roll) en décidegrés (1° = 10). Selon la face active
        (set_yaw_face), la rotation autour du vertical apparaît sur la
        composante yaw, pitch ou roll."""
        yaw_dd = int(self._tb_rotation_rad() * 180 / math.pi * 10)
        return self._route_to_axes(yaw_dd)

    def up_face(self):
        """Face du hub orientée vers le haut. Robot à plat → TOP."""
        return self.TOP


motion_sensor = _MotionSensor()


class _Sound:
    """API stricte SPIKE App 3 : beep, stop, volume."""

    def __init__(self):
        self._volume = 100

    def beep(self, freq=440, duration=200, attenuation=100):
        _b.log(f"[sound] beep {freq}Hz {duration}ms")

    def stop(self):
        _b.log("[sound] stop")

    def volume(self, value=None):
        """Sans argument : retourne le volume courant. Avec argument (0..100) : le règle."""
        if value is None:
            return self._volume
        self._volume = max(0, min(100, int(value)))


sound = _Sound()
