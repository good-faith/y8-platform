resource "random_password" "db" {
  length  = 32
  special = false
}

resource "random_password" "jwt" {
  length  = 64
  special = false
}

resource "random_password" "nextauth" {
  length  = 64
  special = false
}

resource "google_sql_database_instance" "main" {
  name                = "y8-${var.environment}"
  project             = var.project_id
  region              = var.region
  database_version    = "POSTGRES_16"
  deletion_protection = var.environment == "prod"

  settings {
    tier              = var.db_tier
    availability_type = var.environment == "prod" ? "REGIONAL" : "ZONAL"
    disk_autoresize   = true
    disk_size         = 10

    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = var.environment == "prod"
      backup_retention_settings {
        retained_backups = var.environment == "prod" ? 7 : 2
      }
    }

    ip_configuration {
      ipv4_enabled    = false
      private_network = var.network_id
      enable_private_path_for_google_cloud_services = true
    }
  }
}

resource "google_sql_database" "y8" {
  name     = "y8"
  project  = var.project_id
  instance = google_sql_database_instance.main.name
}

resource "google_sql_user" "y8" {
  name     = "y8user"
  project  = var.project_id
  instance = google_sql_database_instance.main.name
  password = random_password.db.result
}

resource "google_secret_manager_secret" "jwt" {
  secret_id = "y8-${var.environment}-jwt-secret"
  project   = var.project_id
  replication { auto {} }
}

resource "google_secret_manager_secret_version" "jwt" {
  secret      = google_secret_manager_secret.jwt.id
  secret_data = random_password.jwt.result
}

resource "google_secret_manager_secret" "nextauth" {
  secret_id = "y8-${var.environment}-nextauth-secret"
  project   = var.project_id
  replication { auto {} }
}

resource "google_secret_manager_secret_version" "nextauth" {
  secret      = google_secret_manager_secret.nextauth.id
  secret_data = random_password.nextauth.result
}
