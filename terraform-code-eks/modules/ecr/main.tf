############################
# Variables
############################
variable "frontend_repo" {
  description = "430006376054.dkr.ecr.us-east-2.amazonaws.com/bookstore-frontend:latest"
  type        = string
}

variable "backend_repo" {
  description = "430006376054.dkr.ecr.us-east-2.amazonaws.com/bookstore-backend:latest"
  type        = string
}

variable "environment" {
  description = "Environment tag (dev/staging/prod)"
  type        = string
  default     = "prod"
}

############################
# Check if frontend repo exists
############################
data "aws_ecr_repository" "frontend" {
  count = length([for r in aws_ecr_repository.frontend.*.name : r if r == var.frontend_repo]) > 0 ? 0 : 1
  name  = var.frontend_repo
}

############################
# Check if backend repo exists
############################
data "aws_ecr_repository" "backend" {
  count = length([for r in aws_ecr_repository.backend.*.name : r if r == var.backend_repo]) > 0 ? 0 : 1
  name  = var.backend_repo
}

############################
# Frontend ECR Repository
############################
resource "aws_ecr_repository" "frontend" {
  count                = length(data.aws_ecr_repository.frontend) > 0 ? 0 : 1
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
  count                = length(data.aws_ecr_repository.backend) > 0 ? 0 : 1
  name                 = var.backend_repo
  image_tag_mutability = "MUTABLE"
  tags = {
    Name        = var.backend_repo
    Environment = var.environment
  }
}

############################
# Lifecycle Policies
############################
resource "aws_ecr_lifecycle_policy" "frontend" {
  repository = coalesce(aws_ecr_repository.frontend[0].name, data.aws_ecr_repository.frontend[0].name)
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
  repository = coalesce(aws_ecr_repository.backend[0].name, data.aws_ecr_repository.backend[0].name)
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
  value       = coalesce(aws_ecr_repository.frontend[0].repository_url, data.aws_ecr_repository.frontend[0].repository_url)
}

output "backend_repo_url" {
  description = "URL of the backend ECR repository"
  value       = coalesce(aws_ecr_repository.backend[0].repository_url, data.aws_ecr_repository.backend[0].repository_url)
}
