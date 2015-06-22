package gov.nist.hit.iz.repo;

   
import gov.nist.hit.core.domain.TransactionStatus;
import gov.nist.hit.iz.domain.SoapConnectivityTransaction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SoapConnectivityTransactionRepository extends
		JpaRepository<SoapConnectivityTransaction, Long> {

	@Query("select incoming from SoapConnectivityTransaction transaction where transaction.user.id = :userId")
	String getIncomingMessageByUserId(@Param("userId") Long userId);
	
	@Query("select outgoing from SoapConnectivityTransaction transaction where transaction.user.id = :userId")
	String getOutgoingMessageByTokenId(@Param("userId") Long userId);
	
 	@Query("select transaction from SoapConnectivityTransaction transaction where transaction.user.username = :username and transaction.user.password = :password and transaction.user.facilityID = :facilityID")
 	SoapConnectivityTransaction findByUsernameAndPasswordAndFacilityID(@Param("username") String username, @Param("password") String password,@Param("facilityID") String facilityID );

	@Query("select transaction from SoapConnectivityTransaction transaction where transaction.user.id = :userId")
	SoapConnectivityTransaction findOneByUserId(@Param("userId") Long userId);
	
//	@Query("select transaction.user.tokenId from ConnectivityTransaction transaction where transaction.user.username = :username")
//	String findTokenIdByUsername(@Param("username") String username);
//	
//	
	@Query("select transaction.status from SoapConnectivityTransaction transaction where transaction.user.username = :username and transaction.user.password = :password")
	TransactionStatus getStatusByUsernameAndPassword(@Param("username") String username, @Param("password") String password);
	
	
	
}
