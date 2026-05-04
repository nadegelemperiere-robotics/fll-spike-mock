from hub import button, light
import color
import runloop

async def main():

    while button.pressed(button.LEFT) == 0:
        light.color(light.POWER, color.RED)
        await runloop.sleep_ms(100)
        
    light.color(light.POWER, color.BLUE)

    while button.pressed(button.RIGHT) == 0:
        light.color(light.POWER, color.GREEN)
        await runloop.sleep_ms(100)
    
    light.color(light.POWER, color.PURPLE)

runloop.run(main())
