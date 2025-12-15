terraform {
  required_version = ">= 1.5.0"
  backend "s3" {
    bucket  = "bookstore-eks-terraform-state-vibin"
    key     = "terraform.tfstate"
    region  = "us-east-2"
    encrypt = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.27"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.8"
    }
  }
}

provider "aws" {
  region = "us-east-2"
}

provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_ca)
  token                  = data.aws_eks_cluster_auth.this.token
}

provider "helm" {
  kubernetes {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_ca)
    token                  = data.aws_eks_cluster_auth.this.token
  }
}


variable "frontend_image" {
  type = string
}

variable "backend_image" {
  type = string
}




data "aws_availability_zones" "available" {}

# VPC Module
module "vpc" {
  source = "./modules/vpc"

  cidr = "10.0.0.0/16"
  azs  = slice(data.aws_availability_zones.available.names, 0, 2)
}

# ECR Module
module "ecr" {
  source = "./modules/ecr"

  frontend_repo = "bookstore-frontend"
  backend_repo  = "bookstore-backend"
}

# IAM Roles for EKS
resource "aws_iam_role" "eks_cluster_role" {
  name = "bookstore-eks-cluster-role"

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
  name = "bookstore-eks-node-role"

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

# EKS Cluster
module "eks" {
  source = "./modules/eks"

  cluster_name        = "bookstore-eks"
  subnet_ids          = module.vpc.public_subnet_ids
  cluster_role_arn    = aws_iam_role.eks_cluster_role.arn
  node_group_role_arn = aws_iam_role.node_role.arn
  desired_nodes       = 2
  instance_type       = "t3.medium"
}

# EKS Auth
data "aws_eks_cluster_auth" "this" {
  name = module.eks.cluster_name
}

# Kubernetes App Setup
module "k8s_setup" {
  source = "./modules/k8s-setup"

  cluster_endpoint = module.eks.cluster_endpoint
  cluster_ca       = module.eks.cluster_ca
  token            = data.aws_eks_cluster_auth.this.token

  frontend_image = "430006376054.dkr.ecr.us-east-2.amazonaws.com/bookstore-frontend:latest"
  backend_image  = "430006376054.dkr.ecr.us-east-2.amazonaws.com/bookstore-backend:latest"
}

# Ingress NGINX
module "ingress_nginx" {
  source = "./modules/ingress-nginx"

  cluster_endpoint = module.eks.cluster_endpoint
  cluster_ca       = module.eks.cluster_ca
  token            = data.aws_eks_cluster_auth.this.token
}

# Monitoring
module "monitoring" {
  source = "./modules/monitoring"

  cluster_endpoint = module.eks.cluster_endpoint
  cluster_ca       = module.eks.cluster_ca
  token            = data.aws_eks_cluster_auth.this.token
}

# Outputs
output "cluster_name" {
  value = module.eks.cluster_name
}

output "frontend_ecr" {
  value = module.ecr.frontend_repo_url
}

output "backend_ecr" {
  value = module.ecr.backend_repo_url
}
