terraform {
  backend "s3" {
    bucket = "bookstore-terraform-state"
    key    = "app/terraform.tfstate"
    region = "us-east-2"
    encrypt      = true
  }
}
