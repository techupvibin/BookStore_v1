resource "aws_db_instance" "this" {
  identifier         = var.db_name
  engine             = "postgres"
  instance_class     = var.instance_class
  username           = var.username
  password           = var.password
  allocated_storage  = var.storage
  skip_final_snapshot = true
  vpc_security_group_ids = var.security_groups
  db_subnet_group_name   = var.subnet_group
}

variable "db_name" {}
variable "username" {}
variable "password" {}
variable "instance_class" {}
variable "storage" { type = number }
variable "security_groups" { type = list(string) }
variable "subnet_group" {}
