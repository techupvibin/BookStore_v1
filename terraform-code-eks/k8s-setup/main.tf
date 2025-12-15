provider "kubernetes" {
  host                   = var.cluster_endpoint
  cluster_ca_certificate = base64decode(var.cluster_ca)
  token                  = var.token
}

# Backend Deployment
resource "kubernetes_deployment_v1" "backend" {
  metadata { name = "bookstore-backend" }

  spec {
    replicas = 2
    selector { match_labels = { app = "bookstore-backend" } }

    template {
      metadata { labels = { app = "bookstore-backend" } }

      spec {
        container {
          name  = "backend"
          image = var.backend_image
          port { container_port = 8080 }

          env { name = "SPRING_DATASOURCE_URL" value = "jdbc:postgresql://postgres-db:5432/BookStore" }
          env { name = "SPRING_DATASOURCE_USERNAME" value = "postgres" }
          env { name = "SPRING_DATASOURCE_PASSWORD" value = "Wrong123" }
          env { name = "SPRING_REDIS_HOST" value = "redis-cache" }
          env { name = "SPRING_KAFKA_BOOTSTRAP_SERVERS" value = "kafka:29092" }
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "backend_service" {
  metadata { name = "bookstore-backend" }

  spec {
    selector = { app = "bookstore-backend" }
    port { port = 8080 target_port = 8080 }
    type = "ClusterIP"
  }
}

# Frontend Deployment
resource "kubernetes_deployment_v1" "frontend" {
  metadata { name = "bookstore-frontend" }

  spec {
    replicas = 2
    selector { match_labels = { app = "bookstore-frontend" } }

    template {
      metadata { labels = { app = "bookstore-frontend" } }

      spec {
        container {
          name  = "frontend"
          image = var.frontend_image
          port { container_port = 80 }

          env { name = "BACKEND_URL" value = "http://bookstore-backend.default.svc.cluster.local:8080" }
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "frontend_service" {
  metadata { name = "bookstore-frontend" }

  spec {
    selector = { app = "bookstore-frontend" }
    port { port = 80 target_port = 80 }
    type = "LoadBalancer"
  }
}

output "frontend_service_url" {
  value = kubernetes_service_v1.frontend_service.status[0].load_balancer[0].ingress[0].hostname
}
