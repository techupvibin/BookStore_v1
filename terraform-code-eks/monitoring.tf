provider "kubernetes" {
  host                   = aws_eks_cluster.this.endpoint
  cluster_ca_certificate = base64decode(aws_eks_cluster.this.certificate_authority[0].data)
  token                  = data.aws_eks_cluster_auth.this.token
}

data "aws_eks_cluster_auth" "this" {
  name = aws_eks_cluster.this.name
}

resource "kubernetes_namespace" "monitoring" {
  metadata {
    name = "monitoring"
  }
}


#######################
# ConfigMaps for Prometheus & Alertmanager
#######################
resource "kubernetes_config_map" "prometheus_config" {
  metadata {
    name      = "prometheus-config"
    namespace = kubernetes_namespace.monitoring.metadata[0].name
  }

  data = {
    "prometheus.yml"  = file("../monitoring/prometheus.yml")
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


#######################
# Prometheus Deployment
#######################
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
          image = "prom/prometheus:latest"

          args = [
            "--config.file=/etc/prometheus/prometheus.yml"
          ]

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


#######################
# Prometheus Service
#######################
resource "kubernetes_service_v1" "prometheus" {
  metadata {
    name      = "prometheus-service"
    namespace = kubernetes_namespace.monitoring.metadata[0].name
  }

  spec {
    selector = { app = "prometheus" }
    type     = "LoadBalancer"

    port {
      port        = 9090
      target_port = 9090
    }
  }
}


#######################
# Alertmanager Deployment
#######################
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
          image = "prom/alertmanager:latest"

          args = [
            "--config.file=/etc/alertmanager/alertmanager.yml"
          ]

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

#######################
# Alertmanager Service
#######################
resource "kubernetes_service_v1" "alertmanager" {
  metadata {
    name      = "alertmanager-service"
    namespace = kubernetes_namespace.monitoring.metadata[0].name
  }

  spec {
    selector = { app = "alertmanager" }
    type     = "LoadBalancer"

    port {
      port        = 9093
      target_port = 9093
    }
  }
}

