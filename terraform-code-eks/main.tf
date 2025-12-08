data "aws_caller_identity" "current" {}

resource "aws_ecr_repository" "java_app" {
  name = "java-app"
}
