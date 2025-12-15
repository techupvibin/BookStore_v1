################################
# DATA SOURCES
################################

data "aws_availability_zones" "available" {}

data "aws_eks_cluster_auth" "this" {
  name = module.eks.cluster_name
}

################################
# VPC MODULE
################################

module "vpc" {
  source = "./modules/vpc"

  vpc_name = "bookstore-vpc"
  cidr     = "10.0.0.0/16"
  azs      = slice(data.aws_availability_zones.available.names, 0, 2)
}

################################
# ECR MODULE
################################

module "ecr" {
  source = "./modules/ecr"

  frontend_repo_name = "bookstore-frontend"
  backend_repo_name  = "bookstore-backend"
}

################################
# EKS MODULE
################################

module "eks" {
  source = "./modules/eks"

  cluster_name    = "bookstore-eks"
  cluster_version = "1.29"

  vpc_id          = module.vpc.vpc_id
  private_subnets = module.vpc.private_subnets
}

################################
# K8S APP DEPLOYMENT
################################

module "k8s_setup" {
  source = "./modules/k8s-setup"

  k8s_cluster_endpoint = module.eks.cluster_endpoint
  k8s_cluster_ca       = module.eks.cluster_ca
  k8s_auth_token       = data.aws_eks_cluster_auth.this.token

  frontend_image_url = "${module.ecr.frontend_repository_url}:latest"
  backend_image_url  = "${module.ecr.backend_repository_url}:latest"
}

################################
# INGRESS NGINX
################################

module "ingress_nginx" {
  source = "./modules/ingress-nginx"

  cluster_endpoint = module.eks.cluster_endpoint
  cluster_ca       = module.eks.cluster_ca
  token            = data.aws_eks_cluster_auth.this.token
}

################################
# MONITORING (PROM + GRAFANA)
################################

module "monitoring" {
  source = "./modules/monitoring"

  cluster_endpoint = module.eks.cluster_endpoint
  cluster_ca       = module.eks.cluster_ca
  token            = data.aws_eks_cluster_auth.this.token
}
