provider "aws" {
  region = "eu-central-1"
}

variable "aws_instance_type" {
    description = "wert des instance typen"
    type = string
    default = "t3.small"
}

resource "aws_instance" "app_server" {
  instance_type = var.aws_instance_type
  ami = "ami-0a116fa7c861dd5f9"
  key_name = var.key_name
  subnet_id = aws_subnet.public_subnet.id

  tags = {
    Name = "app_server"
  }

  vpc_security_group_ids = [
    aws_security_group.sg-frontend.id
  ]
}

resource "aws_security_group" "sg-frontend" {
  name = "securitygroup_from_tf"

  vpc_id = aws_vpc.my_vpc.id

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

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = -1
    cidr_blocks = ["0.0.0.0/0"]
  }
}      

resource "aws_vpc" "my_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = { Name = "main_vpc" }
}

resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.my_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "eu-central-1a"
  tags = { Name = "public_subnet" }
}


output "public_ip" {
    description = " Public IP EC2 instance"
    value = aws_instance.app_server.public_ip
}