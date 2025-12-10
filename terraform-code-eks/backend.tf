
terraform {

  backend "s3" {

    bucket       = "bookstore-eks-terraform-state-vibin"

    key          = "terraform.tfstate"

    region       = "us-east-2"

    encrypt      = true

    use_lockfile = true

  }

}
 