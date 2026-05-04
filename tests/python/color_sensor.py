import motor_pair
import color_sensor
import color
from hub import port
import runloop


async def main():

    speed = 100

    motor_pair.pair(motor_pair.PAIR_1, port.A, port.E)

    while color_sensor.color(port.B) != color.AZURE :
        if color_sensor.reflection(port.B) > 50 :
             motor_pair.move(motor_pair.PAIR_1,30, velocity=speed)
        if color_sensor.reflection(port.B) < 50 :
             motor_pair.move(motor_pair.PAIR_1,-30, velocity=speed)
        await runloop.sleep_ms(100)

    motor_pair.stop(motor_pair.PAIR_1)


runloop.run(main())
