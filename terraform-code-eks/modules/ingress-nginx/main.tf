############################
# Helm Provider for NGINX
############################
provider "helm" {
  kubernetes {
    host                   = var.cluster_endpoint
    cluster_ca_certificate = base64decode(var.cluster_ca)
    token                  = var.token
  }
}

############################
# Kubernetes Namespace
############################
resource "kubernetes_namespace" "ingress" {
  metadata {
    name = "ingress-nginx"
  }
}

############################
# Ingress NGINX Helm Release
############################
resource "helm_release" "nginx" {
  name             = "ingress-nginx"
  repository       = "https://kubernetes.github.io/ingress-nginx"
  chart            = "ingress-nginx"
  namespace        = kubernetes_namespace.ingress.metadata[0].name
  create_namespace = true

  values = [
    <<EOF
controller:
  service:
    type: LoadBalancer
EOF
  ]

  depends_on = [kubernetes_namespace.ingress]
}

############################
# Outputs
############################
output "nginx_release_name" {
  description = "Helm release name of Ingress NGINX"
  value       = helm_release.nginx.name
}

output "nginx_namespace" {
  description = "Namespace where NGINX is deployed"
  value       = kubernetes_namespace.ingress.metadata[0].name
}
variable "cluster_endpoint" {
  description = "EKS cluster endpoint for Kubernetes provider"
  type        = string
}

variable "cluster_ca" {
  description = "EKS cluster CA certificate"
  type        = string
}

variable "token" {
  description = "EKS authentication token"
  type        = string
}
