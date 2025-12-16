############################
# k8s-apps module (Ingress + Monitoring)
############################

# Kubernetes provider
provider "kubernetes" {
  host                   = var.k8s_cluster_endpoint
  cluster_ca_certificate = base64decode(var.k8s_cluster_ca)
  token                  = var.k8s_auth_token
}

# Helm provider
provider "helm" {
  kubernetes {
    host                   = var.k8s_cluster_endpoint
    cluster_ca_certificate = base64decode(var.k8s_cluster_ca)
    token                  = var.k8s_auth_token
  }
}

############################
# Kubernetes Namespaces
############################
resource "kubernetes_namespace" "ingress" {
  metadata {
    name = "ingress-nginx"
  }

  depends_on = [var.cluster_ready]
}

resource "kubernetes_namespace" "monitoring" {
  metadata {
    name = "monitoring"
  }

  depends_on = [var.cluster_ready]
}

############################
# Ingress NGINX Helm Release
############################
resource "helm_release" "nginx" {
  name             = "ingress-nginx"
  repository       = "https://kubernetes.github.io/ingress-nginx"
  chart            = "ingress-nginx"
  version          = "4.14.1"
  namespace        = kubernetes_namespace.ingress.metadata[0].name
  create_namespace = false

  values = [
    <<-EOT
    controller:
      service:
        type: LoadBalancer
    EOT
  ]

  wait = true
  depends_on = [kubernetes_namespace.ingress]
}

############################
# Prometheus Helm Release
############################
resource "helm_release" "prometheus" {
  name             = "prometheus"
  repository       = "https://prometheus-community.github.io/helm-charts"
  chart            = "prometheus"
  version          = "27.50.1"
  namespace        = kubernetes_namespace.monitoring.metadata[0].name
  create_namespace = false

  wait = true
  depends_on = [kubernetes_namespace.monitoring]
}

############################
# Grafana Helm Release
############################
resource "helm_release" "grafana" {
  name             = "grafana"
  repository       = "https://grafana.github.io/helm-charts"
  chart            = "grafana"
  version          = "10.3.1"
  namespace        = kubernetes_namespace.monitoring.metadata[0].name
  create_namespace = false

  values = [
    <<-EOT
    adminUser: admin
    adminPassword: admin123
    service:
      type: LoadBalancer
    EOT
  ]

  wait = true
  depends_on = [kubernetes_namespace.monitoring]
}

############################
# Outputs
############################
output "nginx_release_name" {
  value = helm_release.nginx.name
}

output "prometheus_release_name" {
  value = helm_release.prometheus.name
}

output "grafana_release_name" {
  value = helm_release.grafana.name
}

output "ingress_namespace" {
  value = kubernetes_namespace.ingress.metadata[0].name
}

output "monitoring_namespace" {
  value = kubernetes_namespace.monitoring.metadata[0].name
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

variable "cluster_ready" {
  description = "Set to true once EKS cluster is ready"
  type        = bool
  default     = true
}
