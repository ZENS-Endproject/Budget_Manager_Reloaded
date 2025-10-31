# both GitHub Actions workflows (apply and destroy) will read/write to the 
# same S3 state file — and destroy will correctly find the existing resources.

terraform {
  backend "s3" {
    bucket         = "tf-bud-relo-state-bucket_f"
    key            = "infra/terraform.tfstate"
    region         = "eu-central-1"
    encrypt        = true
    use_lockfile   = true
  }
}
