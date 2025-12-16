############################
# Frontend ECR Repository
############################
resource "aws_ecr_repository" "frontend" {
  name                 = var.frontend_repo
  image_tag_mutability = "MUTABLE"
  tags = {
    Name        = var.frontend_repo
    Environment = var.environment
  }
}

############################
# Backend ECR Repository
############################
resource "aws_ecr_repository" "backend" {
  name                 = var.backend_repo
  image_tag_mutability = "MUTABLE"
  tags = {
    Name        = var.backend_repo
    Environment = var.environment
  }
}

############################
# Optional: Lifecycle policy to remove old images
############################
resource "aws_ecr_lifecycle_policy" "frontend" {
  repository = aws_ecr_repository.frontend.name
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
  repository = aws_ecr_repository.backend.name
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
  value       = aws_ecr_repository.frontend.repository_url
}

output "backend_repo_url" {
  description = "URL of the backend ECR repository"
  value       = aws_ecr_repository.backend.repository_url
}

variable "frontend_repo" {
  description = "Name of the frontend ECR repository"
  type        = string
}

variable "backend_repo" {
  description = "Name of the backend ECR repository"
  type        = string
}

variable "environment" {
  description = "Environment tag (dev/staging/prod)"
  type        = string
  default     = "prod"
}
