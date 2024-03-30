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

# Install Zsh and Oh My Zsh for the new user
sudo -u $USERNAME bash -c '
sudo apt install -y zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
'

# Change oh my zsh theme to candy
sed -i 's/ZSH_THEME="robbyrussell"/ZSH_THEME="candy"/' /home/$USERNAME/.zshrc

# install nginx
su - $USERNAME -c "sudo apt install nginx"

# Download and install Java for the new user
sudo -u $USERNAME bash -c '
wget https://download.java.net/java/GA/jdk21.0.1/415e3f918a1f4062a0074a2794853d0d/12/GPL/openjdk-21.0.1_linux-x64_bin.tar.gz
tar xvf openjdk-21.0.1_linux-x64_bin.tar.gz
sudo mv jdk-21.0.1 /usr/local/
echo "export JAVA_HOME=/usr/local/jdk-21.0.1" >> ~/.bashrc
echo "export PATH=\$PATH:\$JAVA_HOME/bin" >> ~/.bashrc
source /etc/profile.d/jdk21.sh
'
