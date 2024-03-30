#!/bin/bash

# Prompt for username
read -p "Enter the username: " USERNAME

# Create user and add to sudoers
adduser $USERNAME
usermod -aG sudo $USERNAME

# Remove sudo prompt when invoking sudo
echo "$USERNAME ALL=(ALL:ALL) NOPASSWD: ALL" | sudo tee /etc/sudoers.d/$USERNAME >/dev/null

# Copy authorized keys to the new user
sudo mkdir -p /home/$USERNAME/.ssh
sudo cp /root/.ssh/authorized_keys /home/$USERNAME/.ssh/
sudo chown -R $USERNAME:$USERNAME /home/$USERNAME/.ssh

