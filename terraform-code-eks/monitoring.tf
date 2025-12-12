#############################
# Monitoring - Prometheus & Alertmanager
# No provider blocks here!
#############################

# --------------------------
# Prometheus ConfigMap
# --------------------------
resource "kubernetes_config_map" "prometheus_config" {
  metadata {
    name      = "prometheus-config"
    namespace = "default"
  }

  data = {
    "prometheus.yml"  = file("${path.module}/../monitoring/prometheus.yml")
    "alert_rules.yml" = file("${path.module}/../monitoring/alert_rules.yml")
  }
}

# --------------------------
# Alertmanager ConfigMap
# --------------------------
resource "kubernetes_config_map" "alertmanager_config" {
  metadata {
    name      = "alertmanager-config"
    namespace = "default"
  }

  data = {
    "alertmanager.yml" = file("${path.module}/../monitoring/alertmanager.yml")
  }
}

# --------------------------
# Prometheus Deployment
# --------------------------
resource "kubernetes_deployment_v1" "prometheus" {
  metadata {
    name      = "prometheus"
    namespace = "default"
  }

  spec {
    replicas = 1

    selector {
      match_labels = { app = "prometheus" }
    }

    template {
      metadata {
        labels = { app = "prometheus" }
      }

      spec {
        container {
          name  = "prometheus"
          image = "prom/prometheus:latest"

          port {
            container_port = 9090
          }

          volume_mount {
            name       = "config-volume"
            mount_path = "/etc/prometheus"
          }
        }

        volume {
          name = "config-volume"

          config_map {
            name = kubernetes_config_map.prometheus_config.metadata[0].name
          }
        }
      }
    }
  }
}

# --------------------------
# Prometheus Service
# --------------------------
resource "kubernetes_service_v1" "prometheus" {
  metadata {
    name      = "prometheus-service"
    namespace = "default"
  }

  spec {
    type = "LoadBalancer"
    selector = { app = "prometheus" }

    port {
      port        = 9090
      target_port = 9090
    }
  }
}

# --------------------------
# Alertmanager Deployment
# --------------------------
resource "kubernetes_deployment_v1" "alertmanager" {
  metadata {
    name      = "alertmanager"
    namespace = "default"
  }

  spec {
    replicas = 1

    selector {
      match_labels = { app = "alertmanager" }
    }

    template {
      metadata {
        labels = { app = "alertmanager" }
      }

      spec {
        container {
          name  = "alertmanager"
          image = "prom/alertmanager:latest"

          port {
            container_port = 9093
          }

          volume_mount {
            name       = "config-volume"
            mount_path = "/etc/alertmanager"
          }
        }

        volume {
          name = "config-volume"

          config_map {
            name = kubernetes_config_map.alertmanager_config.metadata[0].name
          }
        }
      }
    }
  }
}

# --------------------------
# Alertmanager Service
# --------------------------
resource "kubernetes_service_v1" "alertmanager" {
  metadata {
    name      = "alertmanager-service"
    namespace = "default"
  }

  spec {
    type     = "LoadBalancer"
    selector = { app = "alertmanager" }

    port {
      port        = 9093
      target_port = 9093
    }
  }
}
