provider "aws" {
  region = "eu-central-1"
}

variable "aws_instance_type" {
  description = "Type of EC2 instance"
  type        = string
  default     = "t3.small"
}


# EC2 Instance

resource "aws_instance" "app_server" {
  instance_type = var.aws_instance_type
  ami           = "ami-0a116fa7c861dd5f9"
  key_name      = var.key_name
  subnet_id     = aws_subnet.public_subnet.id

  tags = {
    Name = "${var.branch_name}-app_server"
  }

  vpc_security_group_ids = [
    aws_security_group.sg_frontend.id
  ]
}

# Security Group for EC2

resource "aws_security_group" "sg_frontend" {
  name   = "${var.branch_name}-sg_frontend"
  vpc_id = aws_vpc.my_vpc.id

  # Allow SSH
  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
  }

  # Allow HTTP
  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
  }

  # Allow app port (5005)
  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = 5005
    to_port     = 5005
    protocol    = "tcp"
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = -1
    cidr_blocks = ["0.0.0.0/0"]
  }
}


# VPC

resource "aws_vpc" "my_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = { Name = "${var.branch_name}-main_vpc" }
}


# Subnets

resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.my_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "eu-central-1a"
  tags = { Name = "${var.branch_name}-public_subnet" }
}

resource "aws_subnet" "private_subnet_a" {
  vpc_id                  = aws_vpc.my_vpc.id
  cidr_block              = "10.0.2.0/24"
  map_public_ip_on_launch = false
  availability_zone       = "eu-central-1a"
  tags = { Name = "${var.branch_name}-private_subnet_a" }
}

resource "aws_subnet" "private_subnet_b" {
  vpc_id                  = aws_vpc.my_vpc.id
  cidr_block              = "10.0.3.0/24"
  map_public_ip_on_launch = false
  availability_zone       = "eu-central-1b"
  tags = { Name = "${var.branch_name}-private_subnet_b" }
}


# Internet Gateway for Public Subnet

resource "aws_internet_gateway" "internet_gateway" {
  vpc_id = aws_vpc.my_vpc.id
  tags   = { Name = "${var.branch_name}-Project_VPC_IG" }
}


# Public Route Table

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.my_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.internet_gateway.id
  }

  tags = { Name = "${var.branch_name}-Public_Route_Table" }
}

resource "aws_route_table_association" "public_subnet_assoc" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_rt.id
}


# Security Group for RDS

resource "aws_security_group" "sg_rds" {
  name   = "${var.branch_name}-sg_rds"
  vpc_id = aws_vpc.my_vpc.id

  # Allow Postgres traffic only from EC2 security group
  ingress {
    description     = "Postgres from EC2"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.sg_frontend.id]
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = -1
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.branch_name}-sg_rds" }
}


# RDS Instance (in private subnets)

resource "aws_db_instance" "postgres_rds" {
  identifier            = "${var.branch_name}-postgres-db"
  engine                = "postgres"
  engine_version        = "16.6"
  instance_class        = "db.t3.micro"
  allocated_storage     = 20
  username              = "postgres"
  password              = var.db_password
  # db_name               = "budget"
  publicly_accessible   = false
  skip_final_snapshot   = true
  vpc_security_group_ids = [aws_security_group.sg_rds.id]
  db_subnet_group_name  = aws_db_subnet_group.subnet_group.name
}

resource "aws_db_subnet_group" "subnet_group" {
  name       = "${var.branch_name}-subnet-group"
  subnet_ids = [
    aws_subnet.private_subnet_a.id,
    aws_subnet.private_subnet_b.id
  ]
  tags = { Name = "${var.branch_name}-Main_DB_Subnet_Group" }
}


# Outputs

output "public_ip" {
  description = "Public IP of EC2 instance"
  value       = aws_instance.app_server.public_ip
}

output "private_ip" {
  description = "Private IP of EC2 instance"
  value = aws_instance.app_server.private_ip
}

output "rds_endpoint" {
  description = "RDS endpoint (host)"
  value       = aws_db_instance.postgres_rds.endpoint
}

output "rds_port" {
  description = "RDS port"
  value       = aws_db_instance.postgres_rds.port
}
