#!/usr/bin/env bash

##########################################
# Tools to support development
##########################################

cd /tmp
apt-get update

# tools to fetch the application
sudo apt-get install -y git

# tools to compile, test, deploy and run the application
sudo apt-get install -y icedtea-7-plugin openjdk-7-jre
sudo apt-get install -y openjdk-7-jdk
sudo update-java-alternatives -s java-1.7.0-openjdk-amd64


# tools
sudo apt-get install -y tomcat7
# disables tomcat7 autostart and stop it
sudo update-rc.d tomcat7 disable 
sudo service tomcat7 stop

# tools to build the front-end in app
sudo apt-get install -y make
sudo apt-get install -y g++

wget -N http://nodejs.org/dist/node-latest.tar.gz
tar xzvf node-latest.tar.gz && cd node-v*
./configure
make
sudo make install
cd /tmp

#sudo npm install -g yo
# For npm versions < 1.2.10.
# sudo npm install -g grunt-cli bower

sudo /opt/vagrant_ruby/bin/gem update --system
sudo /opt/vagrant_ruby/bin/gem install compass

# wget -N https://phantomjs.googlecode.com/files/phantomjs-1.9.2-linux-x86_64.tar.bz2
# tar -xvjpf phantomjs-1.9.2-linux-x86_64.tar.bz2
# cd /tmp


##########################################
# Setup environment and application
##########################################

#
# get nhit project from web. right now it is already in the directory
# switch to development branches

# setup front-end
cd /vagrant/hit-iz-web/client
vagrant npm install
vagrant bower install
grunt build
cd /tmp

#
sudo apt-get install -y maven

#sudo -u vagrant mvn install:install-file -Dfile=/vagrant/vagrant-tool/commons-lang-2.6.jar -DgroupId=org.apache.commons -DartifactId=commons-lang -Dversion=2.6 -Dpackaging=jar
#sudo -u vagrant mvn install:install-file -Dfile=/vagrant/vagrant-tool/spring-instrument-3.2.3.RELEASE.jar -DgroupId=org.springframework -DartifactId=spring-instrument -Dversion=3.2.3.RELEASE -Dpackaging=jar

# add MAVEN_OPTS for spring instrument javaagent to profile
#cat /home/vagrant/.profile | sed '$a\\n\export MAVEN_OPTS="-javaagent:/home/vagrant/.m2/repository/org/springframework/spring-instrument/3.2.3.RELEASE/spring-instrument-3.2.3.RELEASE.jar"' > /home/vagrant/tmp-profile
#mv /home/vagrant/tmp-profile /home/vagrant/.profile
#chown vagrant:vagrant /home/vagrant/.profile

# add phantomJS to PATH in profile
#cat /home/vagrant/.profile | sed '$a\\n\PATH="/vagrant/vagrant-tool:$PATH"' > /home/vagrant/tmp-profile
#mv /home/vagrant/tmp-profile /home/vagrant/.profile
#chown vagrant:vagrant /home/vagrant/.profile

# setup dummy smtp server
#mkdir /home/vagrant/mails
#mkdir /home/vagrant/mails/logs
#mkdir /home/vagrant/mails/outputs
#chown -R vagrant:vagrant /home/vagrant/mails


cd /vagrant/hit-iz-tool/

