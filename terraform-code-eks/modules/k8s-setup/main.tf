############################
# Kubernetes Provider
############################
provider "kubernetes" {
  host                   = var.k8s_cluster_endpoint
  cluster_ca_certificate = base64decode(var.k8s_cluster_ca)
  token                  = var.k8s_auth_token
}

############################
# Namespace
############################
resource "kubernetes_namespace" "bookstore" {
  metadata {
    name = "bookstore"
  }
}

############################
# Frontend Deployment
############################
resource "kubernetes_deployment" "frontend" {
  metadata {
    name      = "frontend"
    namespace = kubernetes_namespace.bookstore.metadata[0].name
  }

  spec {
    replicas = 2

    selector {
      match_labels = {
        app = "frontend"
      }
    }

    template {
      metadata {
        labels = {
          app = "frontend"
        }
      }

      spec {
        container {
          name  = "frontend"
          image = var.frontend_image_url

          port {
            container_port = 80
          }
        }
      }
    }
  }
}

############################
# Backend Deployment
############################
resource "kubernetes_deployment" "backend" {
  metadata {
    name      = "backend"
    namespace = kubernetes_namespace.bookstore.metadata[0].name
  }

  spec {
    replicas = 2

    selector {
      match_labels = {
        app = "backend"
      }
    }

    template {
      metadata {
        labels = {
          app = "backend"
        }
      }

      spec {
        container {
          name  = "backend"
          image = var.backend_image_url

          port {
            container_port = 8080
          }
        }
      }
    }
  }
}

############################
# Outputs
############################
output "frontend_deployment_name" {
  value = kubernetes_deployment.frontend.metadata[0].name
}

output "backend_deployment_name" {
  value = kubernetes_deployment.backend.metadata[0].name
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

variable "frontend_image_url" {
  description = "Docker image URL for frontend"
  type        = string
}

variable "backend_image_url" {
  description = "Docker image URL for backend"
  type        = string
}
