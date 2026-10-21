output "web_url"     { value = module.web.url }
output "api_url"     { value = module.server.url }
output "premier_url" { value = module.premier.url }
output "beach_url"   { value = module.beach.url }
output "registry"    { value = module.registry.repository_url }
output "github_sa"   { value = module.github_oidc.service_account_email }
