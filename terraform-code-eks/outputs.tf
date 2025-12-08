output "cluster_name" {
  value = module.eks.cluster_name
}

output "ecr_repo_url" {
  value = aws_ecr_repository.java_app.repository_url
}

output "vpc_id" {
  value = module.vpc.vpc_id
}
