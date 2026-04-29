"""Helpers internes pour l'API SPIKE 3 simulée.

Expose le bridge JS (_sim_bridge) et la conversion port enum -> lettre.
"""
import _sim_bridge as _b

_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']


def _to_letter(p):
    """Accepte un port enum (int 0-5) ou une lettre ('A'-'F')."""
    if isinstance(p, str):
        return p
    return _LETTERS[int(p)]
