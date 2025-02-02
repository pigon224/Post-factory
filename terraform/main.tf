resource "kubernetes_config_map" "backend-configmap" {
  metadata {
    name      = "backend-configmap"
    namespace = "default"
  }

  data = {
    bcknd-port = "32000"
    bcknd-host = "192.168.49.2"
  }
}

resource "kubernetes_service" "backend-service" {
  metadata {
    name      = "backend-service"
    namespace = "default"
  }

  spec {
    type = "LoadBalancer"
    selector = {
      app = "backend"
    }

    port {
      protocol    = "TCP"
      port        = 8000
      target_port = 8000
      node_port   = 32000
    }
  }
}

resource "kubernetes_deployment" "backend-deployment" {
  depends_on = [
    kubernetes_config_map.postgres-configmap,
    kubernetes_secret.postgres-secret
  ]

  metadata {
    name      = "backend-deployment"
    labels    = {
      app = "backend"
    }
    namespace = "default"
  }

  spec {
    replicas = 3

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
          name              = "backend"
          image             = "pigon224/backend:latest"
          image_pull_policy = "IfNotPresent"

          env {
            name = "DB_USER"
            value_from {
              secret_key_ref {
                name = "postgres-secret"
                key  = "postgres-username"
              }
            }
          }

          env {
            name = "DB_PASS"
            value_from {
              secret_key_ref {
                name = "postgres-secret"
                key  = "postgres-password"
              }
            }
          }

          env {
            name = "DB_HOST"
            value_from {
              config_map_key_ref {
                name = "postgres-configmap"
                key  = "db-host"
              }
            }
          }

          env {
            name = "DB_PORT"
            value_from {
              config_map_key_ref {
                name = "postgres-configmap"
                key  = "db-port"
              }
            }
          }

          env {
            name = "DB_NAME"
            value_from {
              config_map_key_ref {
                name = "postgres-configmap"
                key  = "db-name"
              }
            }
          }

          port {
            container_port = 8000
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "postgres-service" {
  metadata {
    name      = "postgres-service"
    namespace = "default"
  }

  spec {
    selector = {
      app = "database"
    }

    port {
      protocol    = "TCP"
      port        = 5432
      target_port = 5432
    }
  }
}

resource "kubernetes_deployment" "db-deployment" {
  depends_on = [
    kubernetes_secret.postgres-secret
  ]

  metadata {
    name      = "db-deployment"
    labels    = {
      app = "database"
    }
    namespace = "default"
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "database"
      }
    }

    template {
      metadata {
        labels = {
          app = "database"
        }
      }

      spec {
        container {
          name  = "postgres"
          image = "postgres:latest"

          env {
            name = "POSTGRES_PASSWORD"
            value_from {
              secret_key_ref {
                name = "postgres-secret"
                key  = "postgres-password"
              }
            }
          }

          port {
            container_port = 5432
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "frontend-service" {
  metadata {
    name      = "frontend-service"
    namespace = "default"
  }

  spec {
    type = "LoadBalancer"
    selector = {
      app = "frontend"
    }

    port {
      protocol    = "TCP"
      port        = 3000
      target_port = 80
      node_port   = 31000
    }
  }
}

resource "kubernetes_deployment" "frontend-deployment" {
  depends_on = [
    kubernetes_config_map.backend-configmap
  ]

  metadata {
    name      = "frontend-deployment"
    labels    = {
      app = "frontend"
    }
    namespace = "default"
  }

  spec {
    replicas = 3

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
          name              = "frontend"
          image             = "pigon224/frontend:latest"
          image_pull_policy = "IfNotPresent"

          env {
            name = "REACT_APP_BCKND_HOST"
            value_from {
              config_map_key_ref {
                name = "backend-configmap"
                key  = "bcknd-host"
              }
            }
          }

          env {
            name = "REACT_APP_BCKND_PORT"
            value_from {
              config_map_key_ref {
                name = "backend-configmap"
                key  = "bcknd-port"
              }
            }
          }

          port {
            container_port = 80
          }
        }
      }
    }
  }
}

resource "kubernetes_config_map" "postgres-configmap" {
  metadata {
    name      = "postgres-configmap"
    namespace = "default"
  }

  data = {
    db-name = "postgres"
    db-host = "postgres-service"
    db-port = "5432"
  }
}

resource "kubernetes_secret" "postgres-secret" {
  metadata {
    name      = "postgres-secret"
    namespace = "default"
  }

  data = {
    postgres-password = "pass123"  
    postgres-username = "postgres"  
  }
}
