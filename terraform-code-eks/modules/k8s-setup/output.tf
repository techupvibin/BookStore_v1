output "frontend_deployment_name" {
  value = kubernetes_deployment.frontend.metadata[0].name
}

output "backend_deployment_name" {
  value = kubernetes_deployment.backend.metadata[0].name
}
