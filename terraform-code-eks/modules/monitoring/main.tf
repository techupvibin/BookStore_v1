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
# Kubernetes Namespace
############################
resource "kubernetes_namespace" "monitoring" {
  metadata {
    name = "monitoring"
  }
}

############################
# Prometheus Helm Release
############################
resource "helm_release" "prometheus" {
  name             = "prometheus"
  repository       = "https://prometheus-community.github.io/helm-charts"
  chart            = "prometheus"
  namespace        = kubernetes_namespace.monitoring.metadata[0].name
  create_namespace = true
}

############################
# Grafana Helm Release
############################
resource "helm_release" "grafana" {
  name             = "grafana"
  repository       = "https://grafana.github.io/helm-charts"
  chart            = "grafana"
  namespace        = kubernetes_namespace.monitoring.metadata[0].name
  create_namespace = true

  values = [
    <<EOF
adminUser: admin
adminPassword: admin123
service:
  type: LoadBalancer
EOF
  ]

  depends_on = [kubernetes_namespace.monitoring]
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
  value = kubernetes_namespace.monitoring.metadata[0].name
}


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
