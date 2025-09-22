terraform {
  backend "s3" {
    bucket         = "weather-driver-terraform-state-202505"
    key            = "weatherdriver/terraform.tfstate"
    region         = "us-east-2"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region     = "us-east-2"
}
