package gov.nist.hit.iz.repo;

import gov.nist.hit.iz.domain.SecurityFaultCredentials;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SecurityFaultCredentialsRepository extends
		JpaRepository<SecurityFaultCredentials, Long> {

	@Query("select securityFaultCredentials from SecurityFaultCredentials securityFaultCredentials where securityFaultCredentials.user.id = :userId")
	SecurityFaultCredentials findOneByUserId(@Param("userId") Long userId);

}
