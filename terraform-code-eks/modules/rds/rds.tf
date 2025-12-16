############################
# RDS PostgreSQL Instance
############################
resource "aws_db_instance" "this" {
  identifier              = var.db_name
  engine                  = "postgres"
  engine_version          = var.engine_version
  instance_class          = var.instance_class
  allocated_storage       = var.storage
  storage_type            = "gp3"
  username                = var.username
  password                = var.password
  db_subnet_group_name    = var.subnet_group
  vpc_security_group_ids  = var.security_groups
  multi_az                = var.multi_az
  publicly_accessible     = false
  skip_final_snapshot     = var.skip_final_snapshot
  backup_retention_period = var.backup_retention_days
  deletion_protection     = var.deletion_protection

  tags = {
    Name        = var.db_name
    Environment = var.environment
  }
}

############################
# Outputs
############################
output "db_instance_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.this.endpoint
}

output "db_instance_arn" {
  description = "RDS instance ARN"
  value       = aws_db_instance.this.arn
}

output "db_instance_id" {
  description = "RDS instance ID"
  value       = aws_db_instance.this.id
}

variable "db_name" {
  description = "RDS database name"
  type        = string
}

variable "username" {
  description = "Master username for RDS"
  type        = string
}

variable "password" {
  description = "Master password for RDS"
  type        = string
  sensitive   = true
}

variable "instance_class" {
  description = "EC2 instance class for RDS"
  type        = string
  default     = "db.t3.medium"
}

variable "storage" {
  description = "Allocated storage in GB"
  type        = number
  default     = 20
}

variable "subnet_group" {
  description = "RDS DB subnet group"
  type        = string
}

variable "security_groups" {
  description = "VPC security groups for RDS"
  type        = list(string)
}

variable "engine_version" {
  description = "PostgreSQL version"
  type        = string
  default     = "15.3"
}

variable "multi_az" {
  description = "Enable Multi-AZ for high availability"
  type        = bool
  default     = false
}

variable "backup_retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 7
}

variable "skip_final_snapshot" {
  description = "Skip final snapshot on deletion"
  type        = bool
  default     = true
}

variable "deletion_protection" {
  description = "Enable deletion protection"
  type        = bool
  default     = false
}

variable "environment" {
  description = "Environment tag (dev/staging/prod)"
  type        = string
  default     = "prod"
}
