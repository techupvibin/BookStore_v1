resource "aws_ecr_repository" "frontend" {
  name = var.frontend_repo
}

resource "aws_ecr_repository" "backend" {
  name = var.backend_repo
}

output "frontend_repo_url" {
  value = aws_ecr_repository.frontend.repository_url
}

output "backend_repo_url" {
  value = aws_ecr_repository.backend.repository_url
}
