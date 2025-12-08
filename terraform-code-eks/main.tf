data "aws_caller_identity" "current" {}

resource "aws_ecr_repository" "bookstore-frontend" {
  name = "bookstore-app"
}
