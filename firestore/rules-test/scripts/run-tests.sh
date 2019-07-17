    
#!/usr/bin/env bash
set -e # fail on first error
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/."
cd "${DIR}"

firebase setup:emulators:firestore
firebase emulators:exec --token="$FIREBASE_EMULATOR_TOKEN" --only firestore "bash ./_exec-tests.sh"
