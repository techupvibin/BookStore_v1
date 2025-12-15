resource "kubernetes_namespace" "monitoring" {
  metadata {
    name = "monitoring"
  }
}

resource "kubernetes_config_map" "prometheus_config" {
  metadata {
    name      = "prometheus-config"
    namespace = kubernetes_namespace.monitoring.metadata[0].name
  }

  data = {
    "prometheus.yml"  = file("../monitoring-terraform/prometheus.yml")
    "alert_rules.yml" = file("../monitoring/alert_rules.yml")
  }
}

resource "kubernetes_config_map" "alertmanager_config" {
  metadata {
    name      = "alertmanager-config"
    namespace = kubernetes_namespace.monitoring.metadata[0].name
  }

  data = {
    "alertmanager.yml" = file("../monitoring/alertmanager.yml")
  }
}
resource "kubernetes_deployment_v1" "prometheus" {
  metadata {
    name      = "prometheus"
    namespace = kubernetes_namespace.monitoring.metadata[0].name
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
          image = "prom/prometheus:v2.52.0"

          args = [
            "--config.file=/etc/prometheus/prometheus.yml"
          ]

          port {
            container_port = 9090
          }

          volume_mount {
            name       = "config"
            mount_path = "/etc/prometheus"
          }
        }

        volume {
          name = "config"

          config_map {
            name = kubernetes_config_map.prometheus_config.metadata[0].name
          }
        }
      }
    }
  }
}
resource "kubernetes_service_v1" "prometheus" {
  metadata {
    name      = "prometheus"
    namespace = kubernetes_namespace.monitoring.metadata[0].name
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
resource "kubernetes_deployment_v1" "alertmanager" {
  metadata {
    name      = "alertmanager"
    namespace = kubernetes_namespace.monitoring.metadata[0].name
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
          image = "prom/alertmanager:v0.27.0"

          args = [
            "--config.file=/etc/alertmanager/alertmanager.yml"
          ]

          port {
            container_port = 9093
          }

          volume_mount {
            name       = "config"
            mount_path = "/etc/alertmanager"
          }
        }

        volume {
          name = "config"

          config_map {
            name = kubernetes_config_map.alertmanager_config.metadata[0].name
          }
        }
      }
    }
  }
}


resource "kubernetes_deployment_v1" "blackbox_exporter" {
  metadata {
    name      = "blackbox-exporter"
    namespace = kubernetes_namespace.monitoring.metadata[0].name
  }

  spec {
    replicas = 1

    selector {
      match_labels = { app = "blackbox-exporter" }
    }

    template {
      metadata {
        labels = { app = "blackbox-exporter" }
      }

      spec {
        container {
          name  = "blackbox-exporter"
          image = "prom/blackbox-exporter:v0.25.0"

          args = [
            "--config.file=/etc/blackbox/blackbox.yml"
          ]

          port {
            container_port = 9115
          }

          volume_mount {
            name       = "config"
            mount_path = "/etc/blackbox"
          }
        }

        volume {
          name = "config"

          config_map {
            name = "blackbox-config"
          }
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "blackbox_exporter" {
  metadata {
    name      = "blackbox-exporter"
    namespace = kubernetes_namespace.monitoring.metadata[0].name
  }

  spec {
    type = "ClusterIP"
    selector = { app = "blackbox-exporter" }

    port {
      port        = 9115
      target_port = 9115
    }
  }
}

resource "kubernetes_config_map" "blackbox_config" {
  metadata {
    name      = "blackbox-config"
    namespace = kubernetes_namespace.monitoring.metadata[0].name
  }

  data = {
    "blackbox.yml" = <<EOT
modules:
  http_2xx:
    prober: http
    timeout: 5s
    http:
      valid_status_codes: [200]
EOT
  }
}

