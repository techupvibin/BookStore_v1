#################### Postgres ####################
resource "kubernetes_deployment_v1" "postgres" {
  metadata { name = "postgres-db" }

  spec {
    replicas = 1

    selector {
      match_labels = { app = "postgres-db" }
    }

    template {
      metadata { labels = { app = "postgres-db" } }

      spec {
        container {
          name  = "postgres"
          image = "postgres:14"
          port { container_port = 5432 }

          env {
            name  = "POSTGRES_DB"
            value = "BookStore"
          }
          env {
            name  = "POSTGRES_USER"
            value = "postgres"
          }
          env {
            name  = "POSTGRES_PASSWORD"
            value = "Wrong123"
          }
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "postgres" {
  metadata { name = "postgres-db" }

  spec {
    selector = { app = "postgres-db" }
    port {
      port        = 5432
      target_port = 5432
    }
    type = "ClusterIP"
  }
}

#################### Redis ####################
resource "kubernetes_deployment_v1" "redis" {
  metadata { name = "redis-cache" }

  spec {
    replicas = 1
    selector { match_labels = { app = "redis-cache" } }

    template {
      metadata { labels = { app = "redis-cache" } }

      spec {
        container {
          name  = "redis"
          image = "redis:7"
          port { container_port = 6379 }
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "redis" {
  metadata { name = "redis-cache" }

  spec {
    selector = { app = "redis-cache" }
    port {
      port        = 6379
      target_port = 6379
    }
    type = "ClusterIP"
  }
}

#################### Zookeeper ####################
resource "kubernetes_deployment_v1" "zookeeper" {
  metadata { name = "zookeeper" }

  spec {
    replicas = 1
    selector { match_labels = { app = "zookeeper" } }

    template {
      metadata { labels = { app = "zookeeper" } }

      spec {
        container {
          name  = "zookeeper"
          image = "confluentinc/cp-zookeeper:7.4.0"
          port { container_port = 2181 }

          env {
            name  = "ZOOKEEPER_CLIENT_PORT"
            value = "2181"
          }
          env {
            name  = "ZOOKEEPER_TICK_TIME"
            value = "2000"
          }
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "zookeeper" {
  metadata { name = "zookeeper" }

  spec {
    selector = { app = "zookeeper" }
    port {
      port        = 2181
      target_port = 2181
    }
    type = "ClusterIP"
  }
}

#################### Kafka ####################
resource "kubernetes_deployment_v1" "kafka" {
  metadata { name = "kafka" }

  spec {
    replicas = 1
    selector { match_labels = { app = "kafka" } }

    template {
      metadata { labels = { app = "kafka" } }

      spec {
        container {
          name  = "kafka"
          image = "confluentinc/cp-kafka:7.4.0"
          port { container_port = 9092 }

          env {
            name  = "KAFKA_BROKER_ID"
            value = "1"
          }
          env {
            name  = "KAFKA_ZOOKEEPER_CONNECT"
            value = "zookeeper:2181"
          }
          env {
            name  = "KAFKA_ADVERTISED_LISTENERS"
            value = "PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092"
          }
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "kafka" {
  metadata { name = "kafka" }

  spec {
    selector = { app = "kafka" }
    port {
      port        = 9092
      target_port = 9092
    }
    type = "ClusterIP"
  }
}

#################### Backend ####################
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

          env {
            name  = "SPRING_DATASOURCE_URL"
            value = "jdbc:postgresql://postgres-db:5432/BookStore"
          }
          env {
            name  = "SPRING_DATASOURCE_USERNAME"
            value = "postgres"
          }
          env {
            name  = "SPRING_DATASOURCE_PASSWORD"
            value = "Wrong123"
          }
          env {
            name  = "SPRING_REDIS_HOST"
            value = "redis-cache"
          }
          env {
            name  = "SPRING_KAFKA_BOOTSTRAP_SERVERS"
            value = "kafka:29092"
          }
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "backend_service" {
  metadata { name = "bookstore-backend" }

  spec {
    selector = { app = "bookstore-backend" }
    port {
      port        = 8080
      target_port = 8080
    }
    type = "ClusterIP"
  }
}

#################### Frontend ####################
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

          env {
            name  = "BACKEND_URL"
            value = "http://bookstore-backend.default.svc.cluster.local:8080"
          }
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "frontend_service" {
  metadata {
    name = "bookstore-frontend"
  }

  spec {
    selector = { app = "bookstore-frontend" }
    port {
      port        = 80
      target_port = 80
    }
    type = "LoadBalancer"
  }
}

#################### Outputs ####################
output "frontend_url" {
  value = kubernetes_service_v1.frontend_service.status[0].load_balancer[0].ingress[0].hostname
}
