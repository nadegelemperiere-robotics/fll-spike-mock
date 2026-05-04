from hub import light
import color
import runloop

async def main():

    light.color(light.POWER, color.RED)
    light.color(light.CONNECT , color.AZURE)

runloop.run(main())
