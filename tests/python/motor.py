# Test complet du module motor (SPIKE App 3).
# À lancer après avoir chargé un robot avec un moteur sur le port A.

import motor
import runloop
from hub import port


async def main():
    P = port.A

    # --- Constantes ---
    print("--- Constantes ---")
    print(f"READY={motor.READY} RUNNING={motor.RUNNING} STALLED={motor.STALLED}")
    print(f"CANCELLED={motor.CANCELLED} ERROR={motor.ERROR} DISCONNECTED={motor.DISCONNECTED}")
    print(f"COAST={motor.COAST} BRAKE={motor.BRAKE} HOLD={motor.HOLD}")
    print(f"CONTINUE={motor.CONTINUE} SMART_COAST={motor.SMART_COAST} SMART_BRAKE={motor.SMART_BRAKE}")
    print(f"CLOCKWISE={motor.CLOCKWISE} COUNTERCLOCKWISE={motor.COUNTERCLOCKWISE}")
    print(f"SHORTEST_PATH={motor.SHORTEST_PATH} LONGEST_PATH={motor.LONGEST_PATH}")

    # --- État initial ---
    print("\n--- État initial ---")
    print(f"relative_position = {motor.relative_position(P)}")
    print(f"absolute_position = {motor.absolute_position(P)}")
    print(f"velocity          = {motor.velocity(P)}")
    print(f"get_duty_cycle    = {motor.get_duty_cycle(P)}")

    # --- run / stop ---
    print("\n--- run(P, 500) pendant 1s ---")
    motor.run(P, 500)
    await runloop.sleep_ms(500)
    print(f"velocity (mid)    = {motor.velocity(P)}")
    print(f"duty_cycle (mid)  = {motor.get_duty_cycle(P)}")
    await runloop.sleep_ms(500)
    motor.stop(P)
    print(f"après stop : rel={motor.relative_position(P)}, abs={motor.absolute_position(P)}, vel={motor.velocity(P)}")

    # --- set_duty_cycle / get_duty_cycle ---
    print("\n--- set_duty_cycle(P, 5000) pendant 0.5s ---")
    motor.set_duty_cycle(P, 5000)
    await runloop.sleep_ms(500)
    print(f"duty_cycle = {motor.get_duty_cycle(P)} (attendu ~5000)")
    motor.stop(P)

    # --- run_for_time ---
    print("\n--- run_for_time(P, 1000ms, 600 deg/s) ---")
    rel_before = motor.relative_position(P)
    await motor.run_for_time(P, 1000, 600)
    rel_after = motor.relative_position(P)
    print(f"delta position : {rel_after - rel_before}° (attendu ~600°)")

    # --- run_for_degrees ---
    print("\n--- run_for_degrees(P, 360, 500) ---")
    rel_before = motor.relative_position(P)
    await motor.run_for_degrees(P, 360, 500)
    rel_after = motor.relative_position(P)
    print(f"delta position : {rel_after - rel_before}° (attendu ~360°)")

    # --- reset_relative_position ---
    print("\n--- reset_relative_position(P, 0) ---")
    motor.reset_relative_position(P, 0)
    print(f"relative_position après reset = {motor.relative_position(P)} (attendu 0)")

    # --- run_to_relative_position ---
    print("\n--- run_to_relative_position(P, 720, 400) ---")
    await motor.run_to_relative_position(P, 720, 400)
    print(f"position finale : rel={motor.relative_position(P)} (attendu ~720)")

    # --- run_to_absolute_position : SHORTEST_PATH ---
    print("\n--- run_to_absolute_position(P, 0, 400, SHORTEST_PATH) ---")
    await motor.run_to_absolute_position(P, 0, 400, direction=motor.SHORTEST_PATH)
    print(f"abs={motor.absolute_position(P)} (attendu ~0)")

    # --- run_to_absolute_position : CLOCKWISE ---
    print("\n--- run_to_absolute_position(P, 90, 400, CLOCKWISE) ---")
    await motor.run_to_absolute_position(P, 90, 400, direction=motor.CLOCKWISE)
    print(f"abs={motor.absolute_position(P)} (attendu ~90)")

    # --- run_to_absolute_position : COUNTERCLOCKWISE ---
    print("\n--- run_to_absolute_position(P, 270, 400, COUNTERCLOCKWISE) ---")
    await motor.run_to_absolute_position(P, 270, 400, direction=motor.COUNTERCLOCKWISE)
    print(f"abs={motor.absolute_position(P)} (attendu ~270)")

    # --- run_to_absolute_position : LONGEST_PATH ---
    print("\n--- run_to_absolute_position(P, 90, 400, LONGEST_PATH) ---")
    await motor.run_to_absolute_position(P, 90, 400, direction=motor.LONGEST_PATH)
    print(f"abs={motor.absolute_position(P)} (attendu ~90, après gros tour)")

    # --- vitesse négative ---
    print("\n--- run_for_degrees(P, -180, 400) (sens inverse) ---")
    rel_before = motor.relative_position(P)
    await motor.run_for_degrees(P, -180, 400)
    rel_after = motor.relative_position(P)
    print(f"delta position : {rel_after - rel_before}° (attendu ~-180)")

    motor.stop(P)
    print("\nTerminé.")


runloop.run(main())
