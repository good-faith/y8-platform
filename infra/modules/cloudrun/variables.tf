variable "project_id"       { type = string }
variable "region"           { type = string }
variable "environment"      { type = string }
variable "name"             { type = string }
variable "image"            { type = string }
variable "port"             { type = number }
variable "vpc_connector_id" { type = string }
variable "database_url"     { type = string; default = "" }
variable "redis_url"        { type = string; default = ""; sensitive = true }
variable "min_instances"    { type = number; default = 0 }
variable "max_instances"    { type = number; default = 3 }
variable "cpu"              { type = string; default = "1" }
variable "memory"           { type = string; default = "512Mi" }
variable "env_vars"         { type = map(string); default = {} }
variable "secret_env_vars"  { type = map(string); default = {} }
