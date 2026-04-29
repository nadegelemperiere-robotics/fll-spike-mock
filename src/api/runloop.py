"""runloop — boucle d'exécution asynchrone (SPIKE App 3).

Dans le simulateur, `run(coro)` enregistre la coroutine ; le runner JS
l'attend une fois le script chargé.
"""
import asyncio
from _sim import _b

_main_coro = None


async def sleep_ms(ms):
    await _b.sleep(ms / 1000)


async def sleep(seconds):
    await _b.sleep(seconds)


async def until(condition, timeout_ms=None):
    """Attend jusqu'à ce que condition() retourne True."""
    import time
    t0 = time.monotonic()
    while not condition():
        if timeout_ms is not None and (time.monotonic() - t0) * 1000 > timeout_ms:
            return False
        await sleep_ms(20)
    return True


def run(*coros):
    """Enregistre une (ou plusieurs) coroutine(s) à exécuter après le script."""
    global _main_coro
    if len(coros) == 1:
        _main_coro = coros[0]
    else:
        _main_coro = asyncio.gather(*coros)
