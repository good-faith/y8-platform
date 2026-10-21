terraform {
  required_version = ">= 1.7.0"
  backend "gcs" {
    bucket = "y8-terraform-state"
    prefix = "environments/prod"
  }
}

module "y8_prod" {
  source        = "../../"
  project_id    = var.project_id
  region        = "us-central1"
  environment   = "prod"
  app_image_tag = var.app_image_tag
  github_org    = var.github_org
  github_repo   = var.github_repo
  db_tier       = "db-g1-small"
}

variable "project_id"    { type = string }
variable "github_org"    { type = string }
variable "github_repo"   { type = string; default = "y8-platform" }
variable "app_image_tag" { type = string }

output "prod_urls" {
  value = {
    web     = module.y8_prod.web_url
    api     = module.y8_prod.api_url
    premier = module.y8_prod.premier_url
    beach   = module.y8_prod.beach_url
  }
}
