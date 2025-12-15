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
  description = "Docker image URL for frontend"
  type        = string
}

variable "backend_image_url" {
  description = "Docker image URL for backend"
  type        = string
}
