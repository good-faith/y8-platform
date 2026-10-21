# Y8 Platform — GCP Infrastructure

Terraform modules for deploying the Y8 platform on Google Cloud.

## Architecture

```
GitHub Actions
    │
    ├─ build & push ──→ Artifact Registry
    └─ terraform apply
                │
                ├─ Cloud Run: y8-server    (API + WebSockets)
                ├─ Cloud Run: the-beach   (XR + Socket.IO)
                ├─ Cloud Run: y8-app      (Next.js SSR)
                ├─ Cloud Run: y8-premier  (Vite dashboard)
                ├─ Cloud SQL: PostgreSQL  (user data)
                └─ Memorystore: Redis     (sessions + pub/sub)
```

## Prerequisites
- GCP account with billing enabled
- `gcloud` CLI installed and authenticated
- Terraform >= 1.7.0

## One-time bootstrap
```bash
bash infra/bootstrap.sh YOUR_GCP_PROJECT_ID
```

## Deploy staging
```bash
cd infra/environments/staging
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars
terraform init
terraform plan
terraform apply
```

## Deploy production
```bash
cd infra/environments/prod
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan -var="app_image_tag=v1.0.0"
terraform apply -var="app_image_tag=v1.0.0"
```

## Modules
| Module | Purpose |
|--------|---------|
| `networking` | VPC, subnet, VPC connector |
| `registry` | Artifact Registry repository |
| `database` | Cloud SQL PostgreSQL + secrets |
| `cache` | Memorystore Redis |
| `cloudrun` | Reusable Cloud Run service |
| `github-oidc` | Workload Identity Federation |
