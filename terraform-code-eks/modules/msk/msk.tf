############################
# MSK Cluster
############################
resource "aws_msk_cluster" "this" {
  cluster_name           = var.cluster_name
  kafka_version          = var.kafka_version
  number_of_broker_nodes = var.broker_count

  broker_node_group_info {
    instance_type   = var.instance_type
    client_subnets  = var.subnet_ids
    security_groups = var.security_groups
  }

  encryption_info {
    encryption_in_transit {
      client_broker = "TLS"
      in_cluster    = true
    }
  }

  logging_info {
    broker_logs {
      cloudwatch_logs {
        enabled   = true
        log_group = var.cloudwatch_log_group
      }
    }
  }

  tags = {
    Name        = var.cluster_name
    Environment = var.environment
  }
}

############################
# CloudWatch Log Group for MSK
############################
resource "aws_cloudwatch_log_group" "msk" {
  name              = var.cloudwatch_log_group
  retention_in_days = 14
  tags = {
    Name = var.cloudwatch_log_group
  }
}

############################
# Outputs
############################
output "msk_cluster_arn" {
  description = "ARN of the MSK cluster"
  value       = aws_msk_cluster.this.arn
}

output "msk_cluster_bootstrap_brokers" {
  description = "Bootstrap brokers for MSK cluster"
  value       = aws_msk_cluster.this.bootstrap_brokers_tls
}

output "msk_cluster_name" {
  description = "Name of the MSK cluster"
  value       = aws_msk_cluster.this.cluster_name
}
variable "cluster_name" {
  description = "Name of the MSK cluster"
  type        = string
}

variable "subnet_ids" {
  description = "List of private subnet IDs for MSK brokers"
  type        = list(string)
}

variable "security_groups" {
  description = "Security groups for MSK brokers"
  type        = list(string)
}

variable "broker_count" {
  description = "Number of broker nodes"
  type        = number
  default     = 3
}

variable "instance_type" {
  description = "EC2 instance type for MSK brokers"
  type        = string
  default     = "kafka.m5.large"
}

variable "kafka_version" {
  description = "Kafka version"
  type        = string
  default     = "3.5.1"
}

variable "cloudwatch_log_group" {
  description = "CloudWatch log group name for MSK broker logs"
  type        = string
  default     = "/msk/bookstore"
}

variable "environment" {
  description = "Environment tag (dev/staging/prod)"
  type        = string
  default     = "prod"
}
