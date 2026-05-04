# Test complet du module motor_pair (SPIKE App 3).
# À lancer après avoir chargé un robot avec deux moteurs sur les ports
# définis ci-dessous (LEFT / RIGHT). Pour le robot "advanced-base" par
# défaut : LEFT=port.A, RIGHT=port.E.

import motor
import motor_pair
import runloop
from hub import port


async def main():
    LEFT = port.A
    RIGHT = port.E

    # --- Constantes ---
    print("--- Constantes ---")
    print(f"PAIR_1={motor_pair.PAIR_1} PAIR_2={motor_pair.PAIR_2} PAIR_3={motor_pair.PAIR_3}")

    # --- pair / unpair ---
    print("\n--- pair(PAIR_1, LEFT, RIGHT) ---")
    motor_pair.pair(motor_pair.PAIR_1, LEFT, RIGHT)
    print("paire configurée OK")

    # --- move (non bloquant) ---
    print("\n--- move(PAIR_1, 0, velocity=400) pendant 1s (tout droit) ---")
    motor_pair.move(motor_pair.PAIR_1, 0, velocity=400)
    await runloop.sleep_ms(500)
    print(f"velocity gauche = {motor.velocity(LEFT)} (attendu ~400)")
    print(f"velocity droit  = {motor.velocity(RIGHT)} (attendu ~-400, miroir)")
    await runloop.sleep_ms(500)
    motor_pair.stop(motor_pair.PAIR_1)
    print(f"après stop : velL={motor.velocity(LEFT)}, velR={motor.velocity(RIGHT)}")

    # --- move avec steering positif (pivot droite) ---
    print("\n--- move(PAIR_1, 100, velocity=400) pendant 0.5s (pivot droite) ---")
    motor_pair.move(motor_pair.PAIR_1, 100, velocity=400)
    await runloop.sleep_ms(500)
    print(f"velL={motor.velocity(LEFT)} velR={motor.velocity(RIGHT)} (attendu velL>0, velR>0 car miroir)")
    motor_pair.stop(motor_pair.PAIR_1)

    # --- move avec steering négatif (pivot gauche) ---
    print("\n--- move(PAIR_1, -100, velocity=400) pendant 0.5s (pivot gauche) ---")
    motor_pair.move(motor_pair.PAIR_1, -100, velocity=400)
    await runloop.sleep_ms(500)
    print(f"velL={motor.velocity(LEFT)} velR={motor.velocity(RIGHT)} (attendu velL<0, velR<0)")
    motor_pair.stop(motor_pair.PAIR_1)

    # --- move_for_time ---
    print("\n--- move_for_time(PAIR_1, 1000, 0, velocity=400) ---")
    pos_before = motor.relative_position(LEFT)
    await motor_pair.move_for_time(motor_pair.PAIR_1, 1000, 0, velocity=400)
    pos_after = motor.relative_position(LEFT)
    print(f"delta gauche : {pos_after - pos_before}° (attendu ~400°)")
    print(f"velocity après : L={motor.velocity(LEFT)} R={motor.velocity(RIGHT)} (attendu 0)")

    # --- move_for_degrees ---
    print("\n--- move_for_degrees(PAIR_1, 360, 0, velocity=400) ---")
    pos_before = motor.relative_position(LEFT)
    await motor_pair.move_for_degrees(motor_pair.PAIR_1, 360, 0, velocity=400)
    pos_after = motor.relative_position(LEFT)
    print(f"delta gauche : {pos_after - pos_before}° (attendu ~360°)")

    # --- move_for_degrees négatif (sens inverse) ---
    print("\n--- move_for_degrees(PAIR_1, -180, 0, velocity=400) ---")
    pos_before = motor.relative_position(LEFT)
    await motor_pair.move_for_degrees(motor_pair.PAIR_1, -180, 0, velocity=400)
    pos_after = motor.relative_position(LEFT)
    print(f"delta gauche : {pos_after - pos_before}° (attendu ~180° en valeur absolue)")

    # --- move_tank (vitesses identiques = tout droit) ---
    print("\n--- move_tank(PAIR_1, 300, 300) pendant 0.5s (tout droit) ---")
    motor_pair.move_tank(motor_pair.PAIR_1, 300, 300)
    await runloop.sleep_ms(500)
    print(f"velL={motor.velocity(LEFT)} (attendu ~300) velR={motor.velocity(RIGHT)} (attendu ~-300, miroir)")
    motor_pair.stop(motor_pair.PAIR_1)

    # --- move_tank (vitesses opposées = pivot sur place) ---
    print("\n--- move_tank(PAIR_1, 300, -300) pendant 0.5s (pivot) ---")
    motor_pair.move_tank(motor_pair.PAIR_1, 300, -300)
    await runloop.sleep_ms(500)
    print(f"velL={motor.velocity(LEFT)} velR={motor.velocity(RIGHT)}")
    motor_pair.stop(motor_pair.PAIR_1)

    # --- move_tank une seule roue ---
    print("\n--- move_tank(PAIR_1, 400, 0) pendant 0.5s (rotation autour roue droite) ---")
    motor_pair.move_tank(motor_pair.PAIR_1, 400, 0)
    await runloop.sleep_ms(500)
    print(f"velL={motor.velocity(LEFT)} (attendu ~400) velR={motor.velocity(RIGHT)} (attendu 0)")
    motor_pair.stop(motor_pair.PAIR_1)

    # --- move_tank_for_time ---
    print("\n--- move_tank_for_time(PAIR_1, 1000, 300, 300) ---")
    pos_before = motor.relative_position(LEFT)
    await motor_pair.move_tank_for_time(motor_pair.PAIR_1, 1000, 300, 300)
    pos_after = motor.relative_position(LEFT)
    print(f"delta gauche : {pos_after - pos_before}° (attendu ~300°)")

    # --- move_tank_for_degrees ---
    print("\n--- move_tank_for_degrees(PAIR_1, 720, 400, 400) ---")
    pos_before = motor.relative_position(LEFT)
    await motor_pair.move_tank_for_degrees(motor_pair.PAIR_1, 720, 400, 400)
    pos_after = motor.relative_position(LEFT)
    print(f"delta gauche : {pos_after - pos_before}° (attendu ~720°)")

    # --- stop avec mode explicite ---
    print("\n--- stop(PAIR_1, stop=motor.BRAKE) ---")
    motor_pair.move(motor_pair.PAIR_1, 0, velocity=300)
    await runloop.sleep_ms(300)
    motor_pair.stop(motor_pair.PAIR_1, stop=motor.BRAKE)
    print(f"après stop BRAKE : velL={motor.velocity(LEFT)} velR={motor.velocity(RIGHT)} (attendu 0)")

    # --- unpair ---
    print("\n--- unpair(PAIR_1) ---")
    motor_pair.unpair(motor_pair.PAIR_1)
    print("paire libérée OK")

    # --- vérification : appel après unpair doit lever ---
    print("\n--- move(PAIR_1, ...) après unpair (doit lever ValueError) ---")
    try:
        motor_pair.move(motor_pair.PAIR_1, 0, velocity=200)
        print("ERREUR : aucune exception levée !")
    except ValueError as e:
        print(f"OK, exception attendue : {e}")

    # --- multi-paires : PAIR_2 sur les deux mêmes moteurs (pour le test) ---
    print("\n--- pair(PAIR_2, LEFT, RIGHT) puis move ---")
    motor_pair.pair(motor_pair.PAIR_2, LEFT, RIGHT)
    motor_pair.move(motor_pair.PAIR_2, 0, velocity=200)
    await runloop.sleep_ms(300)
    print(f"velL={motor.velocity(LEFT)} velR={motor.velocity(RIGHT)} (attendu ~200 / ~-200)")
    motor_pair.stop(motor_pair.PAIR_2)
    motor_pair.unpair(motor_pair.PAIR_2)

    print("\nTerminé.")


runloop.run(main())
