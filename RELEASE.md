# Y8 Platform Release & Branching Lifecycle

The Y8 Platform monorepo uses a **three-tier branch workflow** paired with **Semantic Versioning (SemVer)** so all four applications (`y8-app`, `the-beach`, `y8-server`, and `y8-premier`) and shared `@y8/*` packages can be developed together while maintaining strict separation of concerns.

---

## 1. Branching Strategy

| Branch | Environment / Stage | Version Format | CI / CD Behavior |
| :--- | :--- | :--- | :--- |
| **`development`** | Active Development | `X.Y.Z-dev.N` (e.g. `0.1.0-dev.1`) | Runs **CI Build & Type-Check** (`.github/workflows/ci.yml`) on every push and PR across all 4 apps. |
| **`staging`** | Pre-Release / QA | `X.Y.Z-rc.N` (e.g. `0.1.0-rc.1`) | Runs **CI Build & Type-Check** and deploys changed services to Fly.io (`.github/workflows/deploy.yml`). |
| **`main`** | Stable Production | `X.Y.Z` (e.g. `0.1.0`, `1.0.0`) | Deploys changed services to Fly.io (`y8-web-jason-sprouse`, `y8-beach-jason-sprouse`, `y8-server-jason-sprouse`, `y8-premier-jason-sprouse`). |
| **Tags (`v*`)** | GitHub Releases | `vX.Y.Z*` | Automatically generates release notes and publishes a GitHub **Pre-release** (`-dev.*`, `-rc.*`) or **Stable Release** (`vX.Y.Z`) via `.github/workflows/release.yml`. |

---

## 2. Standard Development → Staging → Stable Release Flow

### Step 1: Daily Development (`development` branch)
Work on `y8-app`, `the-beach`, `y8-server`, `y8-premier`, or `packages/*` on the `development` branch:
```powershell
git checkout development
# Make changes across one or more apps
git add <changed-files>
git commit -m "feat(y8-app): ..."
git push origin development
```

To cut a **Development Checkpoint Pre-Release** (`-dev.N`):
```powershell
npm run release:dev -- -Push
```

### Step 2: Promote to Staging (`staging` branch)
Merge `development` into `staging` and cut a **Release Candidate** (`-rc.N`):
```powershell
git checkout staging
git merge development
npm run release:rc -- -Push
```

### Step 3: Promote to Stable Production (`main` branch)
Once validated on `staging`, merge `staging` into `main` and cut a **Stable Release** (`patch`, `minor`, or `major`):
```powershell
git checkout main
git merge staging

# Finalize pre-release (e.g. 0.1.0-rc.1 -> 0.1.0) or bump patch:
npm run release:patch -- -Push

# Or bump minor (0.1.0 -> 0.2.0):
npm run release:minor -- -Push

# Or bump major (0.2.0 -> 1.0.0):
npm run release:major -- -Push
```
