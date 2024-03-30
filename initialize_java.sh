
# Install Zsh and Oh My Zsh for the new user
sudo -u $USERNAME bash -c '
sudo apt install -y zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
'

# Check if the user has a .zshrc file, if not create one
if [ ! -f /home/$USERNAME/.zshrc ]; then
    sudo -u $USERNAME touch /home/$USERNAME/.zshrc
fi

# Change oh my zsh theme to candy
sed -i 's/ZSH_THEME="robbyrussell"/ZSH_THEME="candy"/' /home/$USERNAME/.zshrc

## install nginx
# Install nginx for the new user
sudo -u $USERNAME bash -c '
sudo apt install -y nginx
'

# Install Java for the new user
sudo -u $USERNAME bash -c '
wget https://download.java.net/java/GA/jdk21.0.1/415e3f918a1f4062a0074a2794853d0d/12/GPL/openjdk-21.0.1_linux-x64_bin.tar.gz -O /tmp/openjdk-21.0.1_linux-x64_bin.tar.gz
tar xvf /tmp/openjdk-21.0.1_linux-x64_bin.tar.gz -C /tmp/
sudo mv /tmp/jdk-21.0.1 /usr/local/
echo "export JAVA_HOME=/usr/local/jdk-21.0.1" >> /home/$USERNAME/.bashrc
echo "export PATH=\$PATH:\$JAVA_HOME/bin" >> /home/$USERNAME/.bashrc
'

#Source the environment for the new user
source /etc/profile.d/jdk21.sh
