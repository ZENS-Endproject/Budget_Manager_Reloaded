############################################
# ebs.tf
############################################

variable "volume_name" {
  default = "tf_zak_budget_manager_pg_vol"
}

variable "volume_size" {
  default = 1
}

# Try to find an existing EBS volume with that tag
data "aws_ebs_volumes" "existing" {
  filter {
    name   = "tag:Name"
    values = [var.volume_name]
  }

  filter {
    name   = "availability-zone"
    values = [var.availability_zone]
  }
}

#
# Create one only if none found
# prevent from being deleted with "terraform destroy"
#
resource "aws_ebs_volume" "postgres_data" {
  count             = length(data.aws_ebs_volumes.existing.ids) == 0 ? 1 : 0
  availability_zone = var.availability_zone
  size              = var.volume_size
  type              = "gp3"

  tags = {
    Name = var.volume_name
  }

  lifecycle {
    prevent_destroy = false
  }
}

# Pick the volume ID (existing or new)
# Notice: A conditional expression must be entirely on one line
locals {
  postgres_volume_id = length(data.aws_ebs_volumes.existing.ids) > 0 ? data.aws_ebs_volumes.existing.ids[0] : aws_ebs_volume.postgres_data[0].id
}

# Attach it to the EC2 instance
resource "aws_volume_attachment" "postgres_attach" {
  device_name = "/dev/xvdf"
  instance_id =  aws_instance.app_server.id
  volume_id   = local.postgres_volume_id
  force_detach = true
}

