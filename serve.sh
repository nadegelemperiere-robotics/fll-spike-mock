#!/usr/bin/env bash
# Lance le simulateur en local
set -e
PORT=${1:-8000}
echo "Démarrage du serveur sur http://localhost:${PORT}"
echo "Ctrl+C pour arrêter."
python3 -m http.server "$PORT"
