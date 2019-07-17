    
#!/usr/bin/env bash
set -e # fail on first error
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/.."
cd "${DIR}"

npm run do_test