from hub import port
from hub import motion_sensor
import motor_pair
import runloop

async def main():


    motor_pair.pair(motor_pair.PAIR_1,port.A,port.E)

    motion_sensor.set_yaw_face(motion_sensor.TOP)

    motion_sensor.reset_yaw()
    while motion_sensor.tilt_angles()[0] < 900 :
        motor_pair.move(motor_pair.PAIR_1,100,velocity=50)
        print(motion_sensor.acceleration())
        print(motion_sensor.angular_velocity())
        print(motion_sensor.gesture())
        print(motion_sensor.get_yaw_face())
        print(motion_sensor.quaternion())
        print(motion_sensor.stable())
        print(motion_sensor.tap_count())
        print(motion_sensor.tilt_angles())
        print(motion_sensor.up_face())

        await runloop.sleep_ms(100)

    motor_pair.stop(motor_pair.PAIR_1)


    motion_sensor.set_yaw_face(motion_sensor.BOTTOM)

    motion_sensor.reset_yaw()
    while motion_sensor.tilt_angles()[0] > -900 :
        motor_pair.move(motor_pair.PAIR_1,100,velocity=50)
        await runloop.sleep_ms(100)

    motor_pair.stop(motor_pair.PAIR_1)

    motion_sensor.reset_yaw()
    motion_sensor.set_yaw_face(motion_sensor.FRONT)
    while motion_sensor.tilt_angles()[2] < 900 :
        motor_pair.move(motor_pair.PAIR_1,100,velocity=50)
        await runloop.sleep_ms(100)

    motor_pair.stop(motor_pair.PAIR_1)


    motion_sensor.set_yaw_face(motion_sensor.TOP)
    motion_sensor.reset_yaw()
    motion_sensor.set_yaw_face(motion_sensor.BACK)

    while motion_sensor.tilt_angles()[2] > -900 :
        motor_pair.move(motor_pair.PAIR_1,100,velocity=50)
        await runloop.sleep_ms(100)

    motor_pair.stop(motor_pair.PAIR_1)

    motion_sensor.set_yaw_face(motion_sensor.TOP)
    motion_sensor.reset_yaw()
    motion_sensor.set_yaw_face(motion_sensor.LEFT)

    while motion_sensor.tilt_angles()[1] > -900 :
        motor_pair.move(motor_pair.PAIR_1,100,velocity=50)
        await runloop.sleep_ms(100)

    motor_pair.stop(motor_pair.PAIR_1)


    motion_sensor.set_yaw_face(motion_sensor.TOP)
    motion_sensor.reset_yaw()
    motion_sensor.set_yaw_face(motion_sensor.RIGHT)

    while motion_sensor.tilt_angles()[1] < 900 :
        motor_pair.move(motor_pair.PAIR_1,100,velocity=50)
        await runloop.sleep_ms(100)

    motor_pair.stop(motor_pair.PAIR_1)

runloop.run(main())
