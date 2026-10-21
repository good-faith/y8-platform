output "connection_string" {
  value     = "postgresql://y8user:${random_password.db.result}@${google_sql_database_instance.main.private_ip_address}/y8"
  sensitive = true
}
output "instance_name"      { value = google_sql_database_instance.main.name }
output "jwt_secret_id"      { value = google_secret_manager_secret.jwt.id }
output "nextauth_secret_id" { value = google_secret_manager_secret.nextauth.id }
