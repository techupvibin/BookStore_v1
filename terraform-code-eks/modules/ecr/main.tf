############################
# ECR Repositories (Existing)
############################
data "aws_ecr_repository" "frontend" {
  name = var.frontend_repo
}

data "aws_ecr_repository" "backend" {
  name = var.backend_repo
}

############################
# Lifecycle Policies (optional, still managed by Terraform)
############################
resource "aws_ecr_lifecycle_policy" "frontend" {
  repository = data.aws_ecr_repository.frontend.name
  policy     = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Expire images older than 30 days"
        selection = {
          tagStatus     = "any"
          countType     = "sinceImagePushed"
          countUnit     = "days"
          countNumber   = 30
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

resource "aws_ecr_lifecycle_policy" "backend" {
  repository = data.aws_ecr_repository.backend.name
  policy     = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Expire images older than 30 days"
        selection = {
          tagStatus     = "any"
          countType     = "sinceImagePushed"
          countUnit     = "days"
          countNumber   = 30
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

############################
# Outputs
############################
output "frontend_repo_url" {
  description = "URL of the frontend ECR repository"
  value       = data.aws_ecr_repository.frontend.repository_url
}

output "backend_repo_url" {
  description = "URL of the backend ECR repository"
  value       = data.aws_ecr_repository.backend.repository_url
}

############################
# Variables
############################
variable "frontend_repo" {
  description = "Name of the frontend ECR repository"
  type        = string
  default     = "bookstore-frontend"
}

variable "backend_repo" {
  description = "Name of the backend ECR repository"
  type        = string
  default     = "bookstore-backend"
}

variable "environment" {
  description = "Environment tag (dev/staging/prod)"
  type        = string
  default     = "prod"
}
