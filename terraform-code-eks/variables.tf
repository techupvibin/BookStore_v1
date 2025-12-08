variable "aws_region" {
  type    = string
  default = "us-east-2"
}

variable "cluster_name" {
  type    = string
  default = "bookstore-eks"
}

variable "account_id" {
  type    = string
  default = "430006376054"
}

variable "node_group_desired" {
  type    = number
  default = 2
}

variable "node_instance_type" {
  type    = string
  default = "t3.medium"
}
