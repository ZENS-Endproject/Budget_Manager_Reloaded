############################################
# variables.tf - Defines shared variables
############################################

variable "region" {
  default = "eu-central-1"
}

variable "availability_zone" {
  description = "Must match the EC2 instance AZ"
  default = "eu-central-1a"
}

variable "key_name" {
  description = "Your AWS EC2 key pair name for SSH"
  type        = string
}

variable "db_password" {
  description = "password for PostgreSQL RDS"
  type        = string
  sensitive   = true
}