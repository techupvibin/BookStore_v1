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
    labels = {
      app = "frontend"
    }
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
# Frontend Service
############################
resource "kubernetes_service" "frontend" {
  metadata {
    name      = "frontend-svc"
    namespace = kubernetes_namespace.bookstore.metadata[0].name
  }

  spec {
    selector = {
      app = "frontend"
    }

    port {
      port        = 80
      target_port = 80
    }

    type = "ClusterIP"
  }
}

############################
# Backend Deployment
############################
resource "kubernetes_deployment" "backend" {
  metadata {
    name      = "backend"
    namespace = kubernetes_namespace.bookstore.metadata[0].name
    labels = {
      app = "backend"
    }
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
# Backend Service
############################
resource "kubernetes_service" "backend" {
  metadata {
    name      = "backend-svc"
    namespace = kubernetes_namespace.bookstore.metadata[0].name
  }

  spec {
    selector = {
      app = "backend"
    }

    port {
      port        = 8080
      target_port = 8080
    }

    type = "ClusterIP"
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

output "frontend_service_name" {
  value = kubernetes_service.frontend.metadata[0].name
}

output "backend_service_name" {
  value = kubernetes_service.backend.metadata[0].name
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

variable "frontend_image_url" {
  description = "ECR image URL for frontend"
  type        = string
}

variable "backend_image_url" {
  description = "ECR image URL for backend"
  type        = string
}
