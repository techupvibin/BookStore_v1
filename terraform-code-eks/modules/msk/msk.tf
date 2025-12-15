resource "aws_msk_cluster" "this" {
  cluster_name = var.name
  kafka_version = "3.5.1"
  number_of_broker_nodes = var.broker_count

  broker_node_group_info {
    instance_type   = "kafka.m5.large"
    client_subnets  = var.subnet_ids
    security_groups = var.security_groups
  }
}

variable "name" {}
variable "broker_count" { default = 3 }
variable "subnet_ids" { type = list(string) }
variable "security_groups" { type = list(string) }
