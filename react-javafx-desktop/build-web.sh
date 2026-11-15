#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
pushd web >/dev/null
npx --yes pnpm@9.15.9 install --frozen-lockfile
npx --yes pnpm@9.15.9 build
popd >/dev/null
node tools/sync-export.mjs
