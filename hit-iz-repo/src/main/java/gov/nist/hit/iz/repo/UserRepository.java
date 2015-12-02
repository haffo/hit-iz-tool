package gov.nist.hit.iz.repo;

import gov.nist.hit.iz.domain.IZTransportUser;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<IZTransportUser, Long> {

  @Query("select user from User user where user.username = :username and user.password = :password")
  IZTransportUser findOneByUsernameAndPassword(@Param("username") String username,
      @Param("password") String password);


  @Query("select user.responseMessageId from User user where user.username = :username and user.password = :password")
  Long getResponseMessageIdByUsernameAndPassword(@Param("username") String username,
      @Param("password") String password);

}
