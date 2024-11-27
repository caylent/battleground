# Define provider and region
provider "aws" {
  region = "us-west-2"

  default_tags {
    tags = {
      Terraform = "true"
      CreatedBy = "Vlad Patoka"
      Project   = "vpatoka-ai-poc"
    }
  }
}

terraform {
  backend "s3" {
    bucket         = "genai-tf-state"
    key            = "terraform.tfstate"
    region         = "us-west-2"
  }
  required_version = "~> 1.5"
}
