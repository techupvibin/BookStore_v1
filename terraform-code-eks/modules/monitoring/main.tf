############################
# Helm Provider for Monitoring
############################
provider "helm" {
  kubernetes {
    host                   = var.k8s_cluster_endpoint
    cluster_ca_certificate = base64decode(var.k8s_cluster_ca)
    token                  = var.k8s_auth_token
  }
}

############################
# Prometheus Helm Release
############################
resource "helm_release" "prometheus" {
  name       = "prometheus"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "prometheus"
  version    = "27.50.1"

  namespace        = "monitoring"
  create_namespace = true

  wait = true
}

############################
# Grafana Helm Release
############################
resource "helm_release" "grafana" {
  name       = "grafana"
  repository = "https://grafana.github.io/helm-charts"
  chart      = "grafana"
  version    = "10.3.1"

  namespace        = "monitoring"
  create_namespace = true

  values = [
    <<-EOT
adminUser: admin
adminPassword: admin123
service:
  type: LoadBalancer
EOT
  ]

  wait = true
}

############################
# Outputs
############################
output "prometheus_release_name" {
  value = helm_release.prometheus.name
}

output "grafana_release_name" {
  value = helm_release.grafana.name
}

output "monitoring_namespace" {
  value = "monitoring"
}

############################
# Variables
############################
variable "k8s_cluster_endpoint" {
  description = "EKS cluster endpoint"
  type        = string
}

variable "k8s_cluster_ca" {
  description = "EKS cluster CA certificate"
  type        = string
}

variable "k8s_auth_token" {
  description = "EKS authentication token"
  type        = string
}
