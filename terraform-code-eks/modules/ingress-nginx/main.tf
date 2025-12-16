############################
# Ingress NGINX Module
############################

provider "kubernetes" {
  host                   = var.cluster_endpoint
  cluster_ca_certificate = base64decode(var.cluster_ca)
  token                  = var.token
}

provider "helm" {
  kubernetes {
    host                   = var.cluster_endpoint
    cluster_ca_certificate = base64decode(var.cluster_ca)
    token                  = var.token
  }
}

############################
# Ingress NGINX Helm Release
############################
resource "helm_release" "nginx" {
  name       = "ingress-nginx"
  repository = "https://kubernetes.github.io/ingress-nginx"
  chart      = "ingress-nginx"
  version    = "4.14.1"

  namespace        = "ingress-nginx"
  create_namespace = false

  values = [
    <<-EOT
controller:
  service:
    type: LoadBalancer
EOT
  ]

  wait = true
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
  value       = "ingress-nginx"
}

############################
# Variables
############################
variable "cluster_endpoint" {
  description = "EKS cluster endpoint"
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
