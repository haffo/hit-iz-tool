#Quick Installation Guide: 
- Link: http://svn.code.sf.net/p/nist-healthcare/nht-files/nht-files/trunk/cf/cf-validator.zip 
- Clear/Create the cf_validator DB
- Configure JNDI: Under $TOMCAT_HOME/conf/context.xml, place the following block of code:
  
  <Resource name="jdbc/cf_validator_jndi" auth="Container" type="javax.sql.DataSource" maxActive="100" maxIdle="30" maxWait="10000" username="XXXX" password="XXXX" driverClassName="com.mysql.jdbc.Driver" url="jdbc:mysql://localhost:3306/cf_validator"/>

  Replace username and password by their correct value. 

- Restart your server.
