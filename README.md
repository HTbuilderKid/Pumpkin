# HM_repo comment cleanup

Based on the supplied `HM_repo-upload.zip`.

- [Download the full cleaned source](downloads/HM_repo-cleaned.zip?raw=true).
- [Download only the 36 edited files](downloads/HM_repo-comment-changes.zip?raw=true).

151 redundant comments removed; eight longer comments shortened. Retains model attribution, licensing notices,
rendering workarounds, database migration notes, and data/API contracts. Third-party Three.js code and Maven wrapper
files are untouched. All strings, UI text, shaders, model assets and executable code are preserved.

## Apply

Extract the changed-files ZIP directly into your existing HM_repo checkout, alongside `pom.xml`, and replace the
matching files. Or copy the contents of `HM_repo-upload` in the full-source ZIP into your checkout. These archives
exclude `.git`, build output and your local database; keep your existing ones. The changes ZIP contains existing
project paths directly, without an enclosing directory.

From PowerShell in your existing checkout:

```powershell
git diff --stat
git diff
git add .
git commit -m "Remove redundant code comments"
git push
```

## Verification

- 21 main-app tests passed.
- Three standalone viewer tests passed (native runtime profile disabled for these asset/server unit tests).
- Comparison with the upload found only comment/whitespace edits across 36 files. String literals were preserved.
- Viewer geometry, font, Three.js and shader hash checks passed.

This branch provides downloadable files. It does not modify or push to the team's HM_repo.
