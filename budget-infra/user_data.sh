#!/bin/bash
# Enable debug logging
exec > >(tee /var/log/user_data_debug.log|logger -t user_data -s 2>/dev/console) 2>&1
set -xe

# Find attached EBS volume that is *not* the root
DEVICE=$(lsblk -d -n -o NAME,TYPE | awk '$2=="disk"{print "/dev/"$1}' | grep -v "nvme0n1" | head -n1)

echo "Detected device: $DEVICE"

MOUNTPOINT=/mnt/pgdata

echo "=== Waiting for EBS device to be attached at $DEVICE ==="

# Wait up to 2 minutes for the volume to appear
for i in {1..24}; do
  if [ -b "$DEVICE" ]; then
    echo "Device $DEVICE is available."
    break
  fi
  echo "Device $DEVICE not yet available, waiting 5s..."
  sleep 5
  DEVICE=$(lsblk -d -n -o NAME,TYPE | awk '$2=="disk"{print "/dev/"$1}' | grep -v "nvme0n1" | head -n1)
done

if [ ! -b "$DEVICE" ]; then
  echo "ERROR: $DEVICE did not appear after waiting. Exiting."
  exit 1
fi

# Check if filesystem already exists
if ! file -s $DEVICE | grep -q ext4; then
  echo "Formatting $DEVICE as ext4..."
  mkfs -t ext4 $DEVICE
else
  echo "$DEVICE already formatted."
fi

mkdir -p $MOUNTPOINT
mount $DEVICE $MOUNTPOINT

UUID=$(blkid -s UUID -o value $DEVICE)
echo "UUID=${UUID} ${MOUNTPOINT} ext4 defaults,nofail 0 2" >> /etc/fstab
mount -a

chown -R ubuntu:ubuntu $MOUNTPOINT

echo "=== EBS volume mounted successfully at $MOUNTPOINT ==="

# Create subdirectories only if missing
for DIR in data backups logs; do
  if [ ! -d "$MOUNTPOINT/$DIR" ]; then
    echo "Creating $MOUNTPOINT/$DIR ..."
    sudo mkdir -p "$MOUNTPOINT/$DIR"
  fi
done

# Set ownership to the postgres user inside Docker (UID 999)
#echo "Fixing permissions..."
#sudo chown -R 999:999 "$MOUNTPOINT"
#sudo chmod 700 "$MOUNTPOINT/data"

echo "✅ /mnt/pgdata directory structure ready."

# Install Docker and dependencies (optional)
apt-get update -y
apt-get install -y docker.io docker-compose