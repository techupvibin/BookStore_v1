#####################################################
# Root Terraform Configuration for Bookstore EKS
#####################################################

terraform {
  required_version = ">= 1.5.0"

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
      version = "~> 2.10"
    }
  }

  backend "s3" {
    bucket = "bookstore-eks-terraform-state-vibin"
    key    = "terraform.tfstate"
    region = "us-east-2"
    encrypt = true
  }
}

#####################################################
# Providers
#####################################################
provider "aws" {
  region = "us-east-2"
}

data "aws_availability_zones" "available" {}

#####################################################
# Variables
#####################################################
variable "cluster_name" {
  type    = string
  default = "bookstore-eks"
}

variable "desired_nodes" {
  type    = number
  default = 2
}

variable "node_instance_type" {
  type    = string
  default = "t3.medium"
}

variable "frontend_image" {
  type    = string
  default = "430006376054.dkr.ecr.us-east-2.amazonaws.com/bookstore-frontend:latest"
}

variable "backend_image" {
  type    = string
  default = "430006376054.dkr.ecr.us-east-2.amazonaws.com/bookstore-backend:latest"
}

#####################################################
# Modules
#####################################################

# VPC Module
module "vpc" {
  source = "./vpc"

  cidr = "10.0.0.0/16"
  azs  = slice(data.aws_availability_zones.available.names, 0, 2)
}

# ECR Module
module "ecr" {
  source = "./ecr"

  frontend_repo = "bookstore-frontend"
  backend_repo  = "bookstore-backend"
}

#####################################################
# IAM Roles
#####################################################
# EKS Cluster Role
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

# Node Group Role
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

#####################################################
# EKS Cluster Module
#####################################################
module "eks" {
  source = "./eks"

  cluster_name        = var.cluster_name
  subnet_ids          = module.vpc.public_subnet_ids
  cluster_role_arn    = aws_iam_role.eks_cluster_role.arn
  node_group_role_arn = aws_iam_role.node_role.arn
  desired_nodes       = var.desired_nodes
  instance_type       = var.node_instance_type
}

#####################################################
# EKS Auth
#####################################################
data "aws_eks_cluster_auth" "this" {
  name = module.eks.cluster_name
}

#####################################################
# Kubernetes App Setup
#####################################################
module "k8s_setup" {
  source = "./k8s-setup"

  cluster_endpoint = module.eks.cluster_endpoint
  cluster_ca       = module.eks.cluster_ca
  token            = data.aws_eks_cluster_auth.this.token

  frontend_image = var.frontend_image
  backend_image  = var.backend_image
}

#####################################################
# Ingress NGINX Module (Helm)
#####################################################
module "ingress_nginx" {
  source = "./ingress-nginx"

  cluster_endpoint = module.eks.cluster_endpoint
  cluster_ca       = module.eks.cluster_ca
  token            = data.aws_eks_cluster_auth.this.token
}

#####################################################
# Monitoring Module (Prometheus/Grafana)
#####################################################
module "monitoring" {
  source = "./monitoring"

  cluster_endpoint = module.eks.cluster_endpoint
  cluster_ca       = module.eks.cluster_ca
  token            = data.aws_eks_cluster_auth.this.token
}

#####################################################
# Providers for Kubernetes & Helm
#####################################################
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

#####################################################
# Outputs
#####################################################
output "cluster_name" {
  value = var.cluster_name
}

output "frontend_ecr" {
  value = module.ecr.frontend_repo_url
}

output "backend_ecr" {
  value = module.ecr.backend_repo_url
}
