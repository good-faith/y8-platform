# Enable required GCP APIs
resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "redis.googleapis.com",
    "artifactregistry.googleapis.com",
    "secretmanager.googleapis.com",
    "vpcaccess.googleapis.com",
    "compute.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "cloudresourcemanager.googleapis.com"
  ])

  service            = each.value
  disable_on_destroy = false
}

module "networking" {
  source      = "./modules/networking"
  project_id  = var.project_id
  region      = var.region
  environment = var.environment
  depends_on  = [google_project_service.apis]
}

module "registry" {
  source      = "./modules/registry"
  project_id  = var.project_id
  region      = var.region
  environment = var.environment
  depends_on  = [google_project_service.apis]
}

module "database" {
  source      = "./modules/database"
  project_id  = var.project_id
  region      = var.region
  environment = var.environment
  network_id  = module.networking.network_id
  db_tier     = var.db_tier
  depends_on  = [module.networking]
}

module "cache" {
  source      = "./modules/cache"
  project_id  = var.project_id
  region      = var.region
  environment = var.environment
  network_id  = module.networking.network_id
  depends_on  = [module.networking]
}

module "github_oidc" {
  source      = "./modules/github-oidc"
  project_id  = var.project_id
  environment = var.environment
  github_org  = var.github_org
  github_repo = var.github_repo
  registry_id = module.registry.repository_id
  depends_on  = [google_project_service.apis]
}

module "server" {
  source           = "./modules/cloudrun"
  project_id       = var.project_id
  region           = var.region
  environment      = var.environment
  name             = "server"
  image            = "${module.registry.repository_url}/server:${var.app_image_tag}"
  port             = 3001
  vpc_connector_id = module.networking.vpc_connector_id
  database_url     = module.database.connection_string
  redis_url        = module.cache.connection_string
  min_instances    = var.environment == "prod" ? 1 : 0
  max_instances    = var.environment == "prod" ? 10 : 3
  env_vars = {
    NODE_ENV = "production"
    PORT     = "3001"
  }
  secret_env_vars = {
    JWT_SECRET      = module.database.jwt_secret_id
    NEXTAUTH_SECRET = module.database.nextauth_secret_id
  }
  depends_on = [module.registry, module.database, module.cache]
}

module "beach" {
  source           = "./modules/cloudrun"
  project_id       = var.project_id
  region           = var.region
  environment      = var.environment
  name             = "beach"
  image            = "${module.registry.repository_url}/beach:${var.app_image_tag}"
  port             = 3003
  vpc_connector_id = module.networking.vpc_connector_id
  redis_url        = module.cache.connection_string
  min_instances    = var.environment == "prod" ? 1 : 0
  max_instances    = var.environment == "prod" ? 5 : 2
  env_vars = {
    NODE_ENV = "production"
    PORT     = "3003"
  }
  depends_on = [module.registry, module.cache]
}

module "web" {
  source           = "./modules/cloudrun"
  project_id       = var.project_id
  region           = var.region
  environment      = var.environment
  name             = "web"
  image            = "${module.registry.repository_url}/web:${var.app_image_tag}"
  port             = 3000
  vpc_connector_id = module.networking.vpc_connector_id
  min_instances    = var.environment == "prod" ? 1 : 0
  max_instances    = var.environment == "prod" ? 10 : 3
  env_vars = {
    NODE_ENV               = "production"
    PORT                   = "3000"
    NEXT_PUBLIC_Y8_API_URL = module.server.url
  }
  secret_env_vars = {
    NEXTAUTH_SECRET = module.database.nextauth_secret_id
  }
  depends_on = [module.server]
}

module "premier" {
  source           = "./modules/cloudrun"
  project_id       = var.project_id
  region           = var.region
  environment      = var.environment
  name             = "premier"
  image            = "${module.registry.repository_url}/premier:${var.app_image_tag}"
  port             = 3002
  vpc_connector_id = module.networking.vpc_connector_id
  min_instances    = var.environment == "prod" ? 1 : 0
  max_instances    = var.environment == "prod" ? 5 : 2
  env_vars = {
    NODE_ENV   = "production"
    PORT       = "3002"
    Y8_API_URL = module.server.url
  }
  depends_on = [module.server]
}
