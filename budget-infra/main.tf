terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  required_version = ">= 1.6.0"
}

provider "aws" {
  region = var.region
}

resource "aws_instance" "app_server" {
  // this is the ID of the Amazon standard Ubuntu-Image: 
  ami               = "ami-0a116fa7c861dd5f9"
  key_name          = var.key_name
  instance_type     = "t3.small"
  
  # Override the default root volume size
  # (docker with three containers won't work with only 8GB)
  root_block_device {
    volume_size = 16          # in GB
    volume_type = "gp3"       # or "gp2", "io1", etc.
    delete_on_termination = true
  }

  availability_zone = var.availability_zone
  user_data         = file("user_data.sh")
  tags = {
    Name = "tf_budget_manager_reloaded"
  }

  vpc_security_group_ids = [
    aws_security_group.sg-frontend.id
  ]
}

resource "aws_security_group" "sg-frontend" {
  name = "securitygroup_from_tf"

  //vpc_id = "vpc-0e69cf4346ac204e3"

  ingress {
    cidr_blocks = [
      "0.0.0.0/0"
    ]
    from_port = 22
    to_port   = 22
    protocol  = "tcp"
  }

  ingress {
    cidr_blocks = [
      "0.0.0.0/0"
    ]
    from_port = 80
    to_port   = 80
    protocol  = "tcp"
  }

  // backend
  ingress {
    cidr_blocks = [
      "0.0.0.0/0"
    ]
    from_port = 5005
    to_port   = 5005
    protocol  = "tcp"
  }

  // postgres
  ingress {
    cidr_blocks = [
      "0.0.0.0/0"
    ]
    from_port = 5432
    to_port   = 5432
    protocol  = "tcp"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = -1
    cidr_blocks = ["0.0.0.0/0"]
  }
}      

output "public_ip" {
    description = "Hier findet sich der Wert der Public IP der ersten Instanz"
    value = aws_instance.app_server.public_ip
}