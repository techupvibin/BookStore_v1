############################
# Data Sources
############################
data "aws_availability_zones" "available" {}

############################
# VPC Module
############################
module "vpc" {
  source = "./modules/vpc"

  cluster_name = var.cluster_name
  cidr         = "10.0.0.0/16"
  azs          = slice(data.aws_availability_zones.available.names, 0, 2)
}

############################
# ECR Module
############################
module "ecr" {
  source = "./modules/ecr"

  frontend_repo = "bookstore-frontend"
  backend_repo  = "bookstore-backend"
}

############################
# IAM Roles
############################
resource "aws_iam_role" "eks_cluster_role" {
  name = "${var.cluster_name}-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "eks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  role       = aws_iam_role.eks_cluster_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

resource "aws_iam_role" "node_role" {
  name = "${var.cluster_name}-node-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "node_policies" {
  for_each = toset([
    "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
    "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
    "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  ])

  role       = aws_iam_role.node_role.name
  policy_arn = each.value
}

############################
# EKS Cluster Module
############################
module "eks" {
  source = "./modules/eks"

  cluster_name        = var.cluster_name
  subnet_ids          = module.vpc.public_subnet_ids
  cluster_role_arn    = aws_iam_role.eks_cluster_role.arn
  node_group_role_arn = aws_iam_role.node_role.arn
  desired_nodes       = var.desired_nodes
  instance_type       = var.node_instance_type
}

############################
# EKS Auth
############################
data "aws_eks_cluster_auth" "this" {
  name = module.eks.cluster_name
}

############################
# Kubernetes App Setup
############################
module "k8s_setup" {
  source = "./modules/k8s-setup"

  cluster_endpoint = module.eks.cluster_endpoint
  cluster_ca       = module.eks.cluster_ca
  token            = data.aws_eks_cluster_auth.this.token

  frontend_image = var.frontend_image
  backend_image  = var.backend_image
}

############################
# Ingress NGINX (Helm)
############################
module "ingress_nginx" {
  source = "./modules/ingress-nginx"

  cluster_endpoint = module.eks.cluster_endpoint
  cluster_ca       = module.eks.cluster_ca
  token            = data.aws_eks_cluster_auth.this.token
}

############################
# Monitoring Module (Prometheus/Grafana)
############################
module "monitoring" {
  source = "./modules/monitoring"

  cluster_endpoint = module.eks.cluster_endpoint
  cluster_ca       = module.eks.cluster_ca
  token            = data.aws_eks_cluster_auth.this.token
}

############################
# Outputs
############################
output "cluster_name" {
  value = var.cluster_name
}

output "frontend_ecr" {
  value = module.ecr.frontend_repo_url
}

output "backend_ecr" {
  value = module.ecr.backend_repo_url
}

output "cluster_endpoint" {
  value = module.eks.cluster_endpoint
}
