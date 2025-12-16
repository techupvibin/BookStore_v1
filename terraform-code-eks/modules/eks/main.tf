############################
# Providers
############################
provider "aws" {
  region = var.aws_region
}

provider "kubernetes" {
  host                   = aws_eks_cluster.this.endpoint
  cluster_ca_certificate = base64decode(aws_eks_cluster.this.certificate_authority[0].data)
  token                  = data.aws_eks_cluster_auth.this.token
}

############################
# EKS Cluster
############################
resource "aws_eks_cluster" "this" {
  name     = var.cluster_name
  role_arn = var.cluster_role_arn
  version  = "1.29"

  vpc_config {
    subnet_ids = var.subnet_ids
  }

  tags = {
    Name = var.cluster_name
  }
}

############################
# Node Group
############################
resource "aws_eks_node_group" "this" {
  cluster_name    = aws_eks_cluster.this.name
  node_group_name = "${var.cluster_name}-nodes"
  node_role_arn   = var.node_group_role_arn
  subnet_ids      = var.subnet_ids

  scaling_config {
    desired_size = var.desired_nodes
    max_size     = var.desired_nodes + 2
    min_size     = 1
  }

  instance_types = [var.instance_type]
  ami_type       = "AL2_x86_64"

  tags = {
    Name = "${var.cluster_name}-nodes"
  }
}

############################
# Data for EKS Auth
############################
data "aws_eks_cluster_auth" "this" {
  name = aws_eks_cluster.this.name
}

############################
# Kubernetes Namespaces
############################
resource "kubernetes_namespace" "ingress" {
  metadata {
    name = "ingress-nginx"
  }

  depends_on = [aws_eks_cluster.this]
}

resource "kubernetes_namespace" "monitoring" {
  metadata {
    name = "monitoring"
  }

  depends_on = [aws_eks_cluster.this]
}

############################
# Outputs
############################
output "cluster_name" {
  value = aws_eks_cluster.this.name
}

output "cluster_endpoint" {
  value = aws_eks_cluster.this.endpoint
}

output "cluster_ca" {
  value = aws_eks_cluster.this.certificate_authority[0].data
}

output "node_group_name" {
  value = aws_eks_node_group.this.node_group_name
}

output "kubeconfig" {
  value = <<EOT
apiVersion: v1
clusters:
- cluster:
    server: ${aws_eks_cluster.this.endpoint}
    certificate-authority-data: ${aws_eks_cluster.this.certificate_authority[0].data}
  name: ${aws_eks_cluster.this.name}
contexts:
- context:
    cluster: ${aws_eks_cluster.this.name}
    user: ${aws_eks_cluster.this.name}
  name: ${aws_eks_cluster.this.name}
current-context: ${aws_eks_cluster.this.name}
kind: Config
preferences: {}
users:
- name: ${aws_eks_cluster.this.name}
  user:
    token: ${data.aws_eks_cluster_auth.this.token}
EOT
}

############################
# Variables
############################
variable "aws_region" {
  type    = string
  default = "us-east-2"
}

variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for EKS"
  type        = list(string)
}

variable "cluster_role_arn" {
  description = "IAM role ARN for the EKS cluster"
  type        = string
}

variable "node_group_role_arn" {
  description = "IAM role ARN for the EKS worker nodes"
  type        = string
}

variable "desired_nodes" {
  description = "Number of nodes in the EKS node group"
  type        = number
  default     = 2
}

variable "instance_type" {
  description = "EC2 instance type for the worker nodes"
  type        = string
  default     = "t3.medium"
}
