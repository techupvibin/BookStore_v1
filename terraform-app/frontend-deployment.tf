resource "kubernetes_deployment_v1" "frontend" {
  metadata {
    name      = "bookstore-frontend"
    namespace = "default"
    labels = { app = "bookstore-frontend" }
  }

  spec {
    replicas = 2

    selector {
      match_labels = { app = "bookstore-frontend" }
    }

    template {
      metadata {
        labels = { app = "bookstore-frontend" }
      }

      spec {
        container {
          name  = "frontend"
          image = "430006376054.dkr.ecr.us-east-2.amazonaws.com/bookstore-frontend:latest"

          port {
            container_port = 80
          }
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "frontend" {
  metadata {
    name = "bookstore-frontend"
  }

  spec {
    type     = "LoadBalancer"
    selector = { app = "bookstore-frontend" }

    port {
      port        = 80
      target_port = 80
    }
  }
}
