$ErrorActionPreference = 'Stop'
Push-Location $PSScriptRoot
try {
    Push-Location 'web'
    try {
        & npx.cmd --yes pnpm@9.15.9 install --frozen-lockfile
        if ($LASTEXITCODE -ne 0) { throw 'Frontend dependency installation failed.' }
        & npx.cmd --yes pnpm@9.15.9 build
        if ($LASTEXITCODE -ne 0) { throw 'Frontend static build failed.' }
    } finally { Pop-Location }
    & node 'tools/sync-export.mjs'
    if ($LASTEXITCODE -ne 0) { throw 'Desktop asset synchronization failed.' }
} finally { Pop-Location }
