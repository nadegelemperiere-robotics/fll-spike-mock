from hub import light_matrix
import orientation
import runloop

async def main():

    for i in range(68) :
        light_matrix.show_image(i)
        await runloop.sleep_ms(50)
        light_matrix.clear()

    light_matrix.write("Hello")

    light_matrix.show_image(i)

    for i in range(5) :
        for j in range(5) :
            light_matrix.clear()
            light_matrix.set_pixel(i,j,50)

            for k in range(5) :
                for l in range(5) :
                    if k != i or l != j :
                        assert (light_matrix.get_pixel(k,l) == 0)
                    else :
                        assert (light_matrix.get_pixel(k,l) == 50)


    light_matrix.clear()
    pixels = [100] * 25 
    light_matrix.show(pixels)


    light_matrix.set_orientation(orientation.UP)
    light_matrix.show_image(1)
    await runloop.sleep_ms(50)
    light_matrix.set_orientation(orientation.RIGHT)
    light_matrix.show_image(1)
    await runloop.sleep_ms(50)
    light_matrix.set_orientation(orientation.DOWN)
    light_matrix.show_image(1)
    await runloop.sleep_ms(50)
    light_matrix.set_orientation(orientation.LEFT)
    light_matrix.show_image(1)
    await runloop.sleep_ms(50)


runloop.run(main())
