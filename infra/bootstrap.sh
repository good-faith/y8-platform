#!/bin/bash
# Run this ONCE before any terraform commands
# Usage: bash infra/bootstrap.sh your-gcp-project-id

PROJECT_ID=${1:?"Usage: $0 <project-id>"}
REGION="us-central1"
BUCKET="y8-terraform-state"

echo "Bootstrapping Y8 Terraform state for project: $PROJECT_ID"

gcloud config set project $PROJECT_ID

# Enable core APIs
gcloud services enable storage.googleapis.com cloudresourcemanager.googleapis.com

# Create state bucket
gsutil mb -p $PROJECT_ID -l $REGION -b on gs://$BUCKET
gsutil versioning set on gs://$BUCKET

echo ""
echo "Bootstrap complete. Now run:"
echo "  cd infra/environments/staging"
echo "  cp terraform.tfvars.example terraform.tfvars"
echo "  # Edit terraform.tfvars with your project ID"
echo "  terraform init"
echo "  terraform plan"
echo "  terraform apply"
