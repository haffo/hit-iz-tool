package gov.nist.hit.iz.repo;

import gov.nist.hit.core.domain.User;
import gov.nist.hit.iz.domain.ConnectivityUser;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SOAPConnectivityUserRepository extends JpaRepository<ConnectivityUser, Long> {

  @Query("select user from ConnectivityUser user where user.username = :username and user.password = :password")
  User findOneByUsernameAndPassword(@Param("username") String username,
      @Param("password") String password);


  @Query("select user.responseMessageId from ConnectivityUser user where user.username = :username and user.password = :password")
  Long getResponseMessageIdByUsernameAndPassword(@Param("username") String username,
      @Param("password") String password);

}
