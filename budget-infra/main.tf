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

resource "aws_internet_gateway" "internet_gateway" {
 vpc_id = aws_vpc.my_vpc.id
 
 tags = {
   Name = "Project VPC IG"
 }
}

resource "aws_route_table" "route_table" {
 vpc_id = aws_vpc.my_vpc.id
 
 route {
   cidr_block = "0.0.0.0/0"
   gateway_id = aws_internet_gateway.internet_gateway.id
 }
 
 tags = {
   Name = "Route Table"
 }
}

resource "aws_route_table_association" "public_subnet_asso" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.route_table.id
}
resource "aws_db_instance" "postgres_rds" {
  identifier          = "my-postgres-db"
  engine              = "postgres"
  engine_version      = "16.4"
  instance_class      = "db.t3.micro"
  allocated_storage   = 20
  username            = "postgres"
  password            = var.db_password
  db_name             = "Budget"
  publicly_accessible = true
  skip_final_snapshot = true
  vpc_security_group_ids = [aws_security_group.sg-frontend.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
}

resource "aws_db_subnet_group" "subnet_group" {
  name       = "main-subnet-group"
  subnet_ids = [aws_subnet.public_subnet.id]  

  tags = {
    Name = "Main DB Subnet Group"
  }
}


output "public_ip" {
    description = " Public IP EC2 instance"
    value = aws_instance.app_server.public_ip
}