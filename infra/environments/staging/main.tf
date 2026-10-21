terraform {
  required_version = ">= 1.7.0"
  backend "gcs" {
    bucket = "y8-terraform-state"
    prefix = "environments/staging"
  }
}

module "y8_staging" {
  source        = "../../"
  project_id    = var.project_id
  region        = "us-central1"
  environment   = "staging"
  app_image_tag = var.app_image_tag
  github_org    = var.github_org
  github_repo   = var.github_repo
  db_tier       = "db-f1-micro"
}

variable "project_id"    { type = string }
variable "github_org"    { type = string }
variable "github_repo"   { type = string; default = "y8-platform" }
variable "app_image_tag" { type = string; default = "latest" }

output "staging_urls" {
  value = {
    web     = module.y8_staging.web_url
    api     = module.y8_staging.api_url
    premier = module.y8_staging.premier_url
    beach   = module.y8_staging.beach_url
  }
}
