terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.27"
    }
  }
  required_version = ">= 1.5.0"
}

provider "aws" {
  region = "us-east-2"
}

####################
# Variables
####################
variable "cluster_name" {
  type    = string
  default = "bookstore-eks"
}

variable "node_group_desired" {
  type    = number
  default = 2
}

variable "node_instance_type" {
  type    = string
  default = "t3.medium"
}

variable "account_id" {
  type    = string
  default = "430006376054"
}

variable "ecr_image" {
  type    = string
  default = "430006376054.dkr.ecr.us-east-2.amazonaws.com/bookstore-frontend:latest"
}

####################
# VPC & Networking
####################
data "aws_availability_zones" "available" {}

resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  tags = { Name = "${var.cluster_name}-vpc" }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
}

resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(aws_vpc.main.cidr_block, 8, count.index)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  tags = { Name = "${var.cluster_name}-public-${count.index}" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
}

resource "aws_route_table_association" "public_assoc" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

####################
# Security Groups
####################
# ELB SG
resource "aws_security_group" "eks_elb_sg" {
  name        = "${var.cluster_name}-elb-sg"
  description = "Allow HTTP from Internet"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "Allow HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.cluster_name}-elb-sg" }
}

# Node SG
resource "aws_security_group" "eks_nodes_sg" {
  name        = "${var.cluster_name}-nodes-sg"
  description = "Allow traffic from ELB"
  vpc_id      = aws_vpc.main.id

  # Allow traffic from ELB SG
  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_elb_sg.id]
  }

  # Allow all traffic within SG (for node communication)
  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    self      = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.cluster_name}-nodes-sg" }
}

####################
# IAM Roles
####################
# Cluster Role
data "aws_iam_policy_document" "eks_cluster_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["eks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "eks_cluster" {
  name               = "${var.cluster_name}-cluster-role"
  assume_role_policy = data.aws_iam_policy_document.eks_cluster_assume.json
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  role       = aws_iam_role.eks_cluster.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

# Node Role
data "aws_iam_policy_document" "node_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "node_group" {
  name               = "${var.cluster_name}-node-role"
  assume_role_policy = data.aws_iam_policy_document.node_assume.json
}

resource "aws_iam_role_policy_attachment" "node_worker" {
  role       = aws_iam_role.node_group.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
}

resource "aws_iam_role_policy_attachment" "node_ecr" {
  role       = aws_iam_role.node_group.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_role_policy_attachment" "node_cni" {
  role       = aws_iam_role.node_group.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
}

####################
# EKS Cluster
####################
resource "aws_eks_cluster" "this" {
  name     = var.cluster_name
  role_arn = aws_iam_role.eks_cluster.arn

  vpc_config {
    subnet_ids             = aws_subnet.public[*].id
    endpoint_public_access = true
    public_access_cidrs    = ["0.0.0.0/0"]
  }

  depends_on = [aws_iam_role_policy_attachment.eks_cluster_policy]
}

resource "aws_eks_node_group" "this" {
  cluster_name    = aws_eks_cluster.this.name
  node_group_name = "${var.cluster_name}-nodes"
  node_role_arn   = aws_iam_role.node_group.arn
  subnet_ids      = aws_subnet.public[*].id

  scaling_config {
    desired_size = var.node_group_desired
    min_size     = 1
    max_size     = 3
  }

  instance_types = [var.node_instance_type]

  depends_on = [
    aws_iam_role_policy_attachment.node_worker,
    aws_iam_role_policy_attachment.node_ecr,
    aws_iam_role_policy_attachment.node_cni
  ]
}

####################
# IAM Policy for AWS Load Balancer Controller
####################
resource "aws_iam_policy" "aws_lb_controller_policy" {
  name        = "${var.cluster_name}-aws-lb-controller-policy"
  description = "IAM policy for AWS Load Balancer Controller"

  policy = data.aws_iam_policy_document.lb_controller_policy.json
}

data "aws_iam_policy_document" "lb_controller_policy" {
  statement {
    effect    = "Allow"
    actions   = [
      "acm:DescribeCertificate",
      "acm:ListCertificates",
      "acm:GetCertificate",
      "ec2:AuthorizeSecurityGroupIngress",
      "ec2:RevokeSecurityGroupIngress",
      "ec2:CreateSecurityGroup",
      "ec2:DeleteSecurityGroup",
      "ec2:DescribeSecurityGroups",
      "ec2:DescribeSubnets",
      "ec2:DescribeVpcs",
      "ec2:DescribeInstances",
      "ec2:ModifyInstanceAttribute",
      "ec2:DescribeTags",
      "elasticloadbalancing:*",
      "iam:CreateServiceLinkedRole",
      "iam:GetServerCertificate",
      "iam:ListServerCertificates",
      "tag:GetResources",
      "shield:GetSubscriptionState",
      "shield:DescribeProtection",
      "shield:CreateProtection",
      "shield:DeleteProtection"
    ]
    resources = ["*"]
  }
}

####################
# IAM Role for AWS Load Balancer Controller
####################
resource "aws_iam_role" "aws_lb_controller_sa_role" {
  name = "${var.cluster_name}-aws-lb-controller-sa"
  assume_role_policy = data.aws_iam_policy_document.lb_controller_sa_assume.json
}

data "aws_iam_policy_document" "lb_controller_sa_assume" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["eks.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
    condition {
      test     = "StringEquals"
      variable = "eks.amazonaws.com/role-arn"
      values   = [aws_eks_cluster.this.arn]
    }
  }
}

resource "aws_iam_role_policy_attachment" "aws_lb_controller_attach" {
  role       = aws_iam_role.aws_lb_controller_sa_role.name
  policy_arn = aws_iam_policy.aws_lb_controller_policy.arn
}

####################
# Helm provider
####################
provider "helm" {
  kubernetes = {
    host                   = aws_eks_cluster.this.endpoint
    cluster_ca_certificate = base64decode(aws_eks_cluster.this.certificate_authority[0].data)
    token                  = data.aws_eks_cluster_auth.this.token
  }
}


####################
# AWS Load Balancer Controller Helm Release
####################
resource "helm_release" "aws_lb_controller" {
  name       = "aws-load-balancer-controller"
  repository = "https://aws.github.io/eks-charts"
  chart      = "aws-load-balancer-controller"
  namespace  = "kube-system"

  set = [
    { name = "clusterName", value = aws_eks_cluster.this.name },
    { name = "serviceAccount.create", value = "false" },
    { name = "serviceAccount.name", value = "aws-load-balancer-controller" },
    { name = "region", value = "us-east-2" },
    { name = "vpcId", value = aws_vpc.main.id }
  ]

  depends_on = [aws_iam_role_policy_attachment.aws_lb_controller_attach]
}


####################
# Kubernetes Provider
####################
data "aws_eks_cluster_auth" "this" {
  name = aws_eks_cluster.this.name
}

provider "kubernetes" {
  host                   = aws_eks_cluster.this.endpoint
  cluster_ca_certificate = base64decode(aws_eks_cluster.this.certificate_authority[0].data)
  token                  = data.aws_eks_cluster_auth.this.token
}

####################
# Kubernetes Deployment
####################
resource "kubernetes_deployment_v1" "bookstore" {
  metadata {
    name = "bookstore"
    labels = { app = "bookstore" }
  }

  spec {
    replicas = 2

    selector {
      match_labels = { app = "bookstore" }
    }

    template {
      metadata {
        labels = { app = "bookstore" }
      }

      spec {
        container {
          name  = "bookstore"
          image = var.ecr_image
          port {
            container_port = 8080
          }
        }
      }
    }
  }
}

####################
# Kubernetes Service (LoadBalancer)
####################
resource "kubernetes_service_v1" "bookstore_service" {
  metadata {
    name = "bookstore-service"
    annotations = {
      "service.beta.kubernetes.io/aws-load-balancer-security-groups" = aws_security_group.eks_elb_sg.id
    }
  }

  spec {
    selector = { app = "bookstore" }
    type     = "LoadBalancer"

    port {
      port        = 80
      target_port = 8080
    }
  }
}


####################
# Outputs
####################
output "cluster_name" {
  value = aws_eks_cluster.this.name
}

output "cluster_endpoint" {
  value = aws_eks_cluster.this.endpoint
}

output "frontend_url" {
  value = kubernetes_service_v1.bookstore_service.status[0].load_balancer[0].ingress[0].hostname
}

