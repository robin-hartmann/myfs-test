#!/bin/bash

scriptDir=$(dirname "$0")

pushd "$scriptDir/../myfs-test" > /dev/null
npm run test-only --silent
popd > /dev/null
