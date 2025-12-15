variable "backend_image" {
  type        = string
  description = "Backend Docker image URL"
}

variable "frontend_image" {
  type        = string
  description = "Frontend Docker image URL"
}

variable "cluster_endpoint" {
  type        = string
  description = "EKS cluster endpoint"
}

variable "cluster_ca" {
  type        = string
  description = "EKS cluster CA data"
}

variable "token" {
  type        = string
  description = "EKS auth token"
}
