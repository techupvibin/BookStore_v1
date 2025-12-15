############################
# Kubernetes Provider for Helm
############################
provider "helm" {
  kubernetes {
    host                   = var.cluster_endpoint
    cluster_ca_certificate = base64decode(var.cluster_ca)
    token                  = var.token
  }
}

############################
# Helm Release for Ingress NGINX
############################
resource "helm_release" "nginx" {
  name       = "ingress-nginx"
  repository = "https://kubernetes.github.io/ingress-nginx"
  chart      = "ingress-nginx"
  namespace  = "ingress-nginx"
  create_namespace = true

  values = [
    <<EOF
controller:
  service:
    type: LoadBalancer
EOF
  ]
}

############################
# Outputs
############################
output "nginx_release_name" {
  value = helm_release.nginx.name
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
