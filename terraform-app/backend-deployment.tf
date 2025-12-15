resource "kubernetes_deployment_v1" "backend" {
  metadata {
    name      = "bookstore-backend"
    namespace = "default"
    labels = { app = "bookstore-backend" }
  }

  spec {
    replicas = 2

    selector {
      match_labels = { app = "bookstore-backend" }
    }

    template {
      metadata {
        labels = { app = "bookstore-backend" }
      }

      spec {
        container {
          name  = "backend"
          image = "430006376054.dkr.ecr.us-east-2.amazonaws.com/bookstore-backend:latest"

          port {
            container_port = 8080
          }
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "backend" {
  metadata {
    name = "bookstore-backend"
  }

  spec {
    type     = "ClusterIP"
    selector = { app = "bookstore-backend" }

    port {
      port        = 8080
      target_port = 8080
    }
  }
}
