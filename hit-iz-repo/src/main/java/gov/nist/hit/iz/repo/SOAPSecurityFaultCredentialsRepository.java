package gov.nist.hit.iz.repo;

import gov.nist.hit.iz.domain.FaultAccount;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SOAPSecurityFaultCredentialsRepository extends JpaRepository<FaultAccount, Long> {

  @Query("select account from FaultAccount account where account.user.id = :userId")
  FaultAccount findOneByUserId(@Param("userId") Long userId);

}
