variable "cluster_name" {}
variable "subnet_ids" { type = list(string) }
variable "cluster_role_arn" {}
variable "node_group_role_arn" {}
variable "desired_nodes" { type = number }
variable "instance_type" { type = string }
