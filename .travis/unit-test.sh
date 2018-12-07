#!/bin/bash

set -e
errors=0

# Run unit tests
python mmrproteffect/mmrproteffect_test.py || {
    echo "'python python/mmrproteffect/mmrproteffect_test.py' failed"
    let errors+=1
}

# Check program style
pylint -E mmrproteffect/*.py || {
    echo 'pylint -E mmrproteffect/*.py failed'
    let errors+=1
}

[ "$errors" -gt 0 ] && {
    echo "There were $errors errors found"
    exit 1
}

echo "Ok : Python specific tests"
