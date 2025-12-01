variable "region" {
  type    = string
  default = "eu-west-2"
}

variable "project_name" {
  type    = string
  default = "bookstore"
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "tags" {
  type = map(string)
  default = {
    Environment = "dev"
    ManagedBy   = "terraform"
  }
}

variable "tf_backend_s3_bucket" {
  type = string
  description = "S3 bucket for terraform backend"
}

variable "tf_backend_dynamodb_table" {
  type = string
  description = "DynamoDB table for terraform state lock"
}

variable "db_name" {
  type    = string
  default = "bookstoredb"
}
variable "db_username" {
  type    = string
  default = "bookuser"
}
variable "db_password" {
  type      = string
  sensitive = true
}

variable "db_instance_class" {
  type    = string
  default = "db.t3.micro"
}

variable "redis_node_type" {
  type    = string
  default = "cache.t3.micro"
}

variable "frontend_desired_count" {
  type    = number
  default = 1
}
variable "backend_desired_count" {
  type    = number
  default = 1
}
