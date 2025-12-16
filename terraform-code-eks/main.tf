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
      version = "~> 2.7"
    }
  }

  backend "s3" {
    bucket  = "bookstore-eks-terraform-state-vibin"
    key     = "terraform.tfstate"
    region  = "us-east-2"
    encrypt = true
  }
}

provider "aws" {
  region = "us-east-2"
}

############################
# Data Source for AZs
############################
data "aws_availability_zones" "available" {}

############################
# VPC Module
############################
module "vpc" {
  source       = "./modules/vpc"
  cluster_name = var.cluster_name
  cidr         = "10.0.0.0/16"
  azs          = slice(data.aws_availability_zones.available.names, 0, 2)
  environment  = var.environment
}

############################
# ECR Module
############################
module "ecr" {
  source        = "./modules/ecr"
  frontend_repo = "bookstore-frontend"
  backend_repo  = "bookstore-backend"
}

############################
# IAM Roles for EKS
############################
resource "aws_iam_role" "eks_cluster_role" {
  name = "${var.cluster_name}-cluster-role"

  assume_role_policy = jsonencode({
    Version   = "2012-10-17"
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
    Version   = "2012-10-17"
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


# ecr.tf in root module
resource "aws_ecr_repository" "frontend" {
  name                 = "bookstore-frontend"
  image_tag_mutability = "MUTABLE"
}

resource "aws_ecr_repository" "backend" {
  name                 = "bookstore-backend"
  image_tag_mutability = "MUTABLE"
}


############################
# EKS Module
############################
module "eks" {
  source              = "./modules/eks"
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
  source               = "./modules/k8s-setup"
  k8s_cluster_endpoint = module.eks.cluster_endpoint
  k8s_cluster_ca       = module.eks.cluster_ca
  k8s_auth_token       = data.aws_eks_cluster_auth.this.token
  frontend_image_url   = var.frontend_image
  backend_image_url    = var.backend_image
}

############################
# Ingress NGINX
############################
module "ingress_nginx" {
  source           = "./modules/ingress-nginx"
  cluster_endpoint = module.eks.cluster_endpoint
  cluster_ca       = module.eks.cluster_ca
  token            = data.aws_eks_cluster_auth.this.token
}

############################
# Monitoring (Prometheus + Grafana)
############################
module "monitoring" {
  source               = "./modules/monitoring"
  k8s_cluster_endpoint = module.eks.cluster_endpoint
  k8s_cluster_ca       = module.eks.cluster_ca
  k8s_auth_token       = data.aws_eks_cluster_auth.this.token
}

############################
# RDS Module
############################
module "rds" {
  source           = "./modules/rds"
  db_name          = var.db_name
  username         = var.db_username
  password         = var.db_password
  instance_class   = var.db_instance_class
  storage          = var.db_storage
  subnet_group     = var.db_subnet_group
  security_groups  = var.db_security_groups
  multi_az         = false
  skip_final_snapshot = true
  deletion_protection  = false
}

############################
# MSK Module
############################
module "msk" {
  source              = "./modules/msk"
  cluster_name        = "${var.cluster_name}-msk"
  subnet_ids          = module.vpc.private_subnet_ids
  security_groups     = var.msk_security_groups
  broker_count        = 3
  instance_type       = "kafka.m5.large"
  kafka_version       = "3.5.1"
  cloudwatch_log_group = "/msk/${var.cluster_name}"
  environment         = var.environment
}

############################
# Outputs
############################
output "vpc_id" {
  value = module.vpc.vpc_id
}

output "public_subnets" {
  value = module.vpc.public_subnet_ids
}

output "private_subnets" {
  value = module.vpc.private_subnet_ids
}

output "frontend_ecr" {
  value = module.ecr.frontend_repo_url
}

output "backend_ecr" {
  value = module.ecr.backend_repo_url
}

output "eks_cluster_name" {
  value = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "frontend_deployment_name" {
  value = module.k8s_setup.frontend_deployment_name
}

output "backend_deployment_name" {
  value = module.k8s_setup.backend_deployment_name
}

output "prometheus_release_name" {
  value = module.monitoring.prometheus_release_name
}

output "grafana_release_name" {
  value = module.monitoring.grafana_release_name
}

output "rds_endpoint" {
  value = module.rds.db_instance_endpoint
}

output "msk_bootstrap_brokers" {
  value = module.msk.msk_cluster_bootstrap_brokers
}

variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
  default     = "bookstore-cluster"
}

variable "desired_nodes" {
  description = "Number of EKS worker nodes"
  type        = number
  default     = 2
}

variable "node_instance_type" {
  description = "EKS worker node instance type"
  type        = string
  default     = "t3.medium"
}

variable "frontend_image" {
  description = "Frontend ECR image URL"
  type        = string
  default     = "430006376054.dkr.ecr.us-east-2.amazonaws.com/bookstore-frontend:latest"
}

variable "backend_image" {
  description = "Backend ECR image URL"
  type        = string
  default     = "430006376054.dkr.ecr.us-east-2.amazonaws.com/bookstore-backend:latest"
}

variable "environment" {
  description = "Environment tag"
  type        = string
  default     = "prod"
}

# RDS variables
variable "db_name" {}
variable "db_username" {}
variable "db_password" { sensitive = true }
variable "db_instance_class" { default = "db.t3.medium" }
variable "db_storage" { default = 20 }
variable "db_subnet_group" {}
variable "db_security_groups" { type = list(string) }

# MSK variables
variable "msk_security_groups" { type = list(string) }
