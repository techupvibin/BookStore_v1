provider "kubernetes" {
  host                   = var.cluster_endpoint
  cluster_ca_certificate = base64decode(var.cluster_ca)
  token                  = var.token
}




resource "kubernetes_namespace" "bookstore" {
  metadata {
    name = "bookstore"
  }
}

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
          image = var.frontend_image
          port {
            container_port = 80
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "frontend_svc" {
  metadata {
    name      = "frontend"
    namespace = kubernetes_namespace.bookstore.metadata[0].name
  }

  spec {
    selector = {
      app = "frontend"
    }
    type = "LoadBalancer"
    port {
      port        = 80
      target_port = 80
    }
  }
}

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
          image = var.backend_image
          port {
            container_port = 5000
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "backend_svc" {
  metadata {
    name      = "backend"
    namespace = kubernetes_namespace.bookstore.metadata[0].name
  }

  spec {
    selector = {
      app = "backend"
    }
    type = "ClusterIP"
    port {
      port        = 5000
      target_port = 5000
    }
  }
}
