variable "name" {
  type        = string
  description = "Name prefix for VPC resources"
}

variable "cidr" {
  type        = string
  description = "CIDR block for the VPC"
}

variable "azs" {
  type        = list(string)
  description = "Availability zones for public subnets"
}
