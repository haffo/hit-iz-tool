package gov.nist.hit.iz.repo;

import gov.nist.hit.iz.domain.SoapConnectivityTestContext;
import gov.nist.hit.iz.domain.SoapTestPlan;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SoapConnectivityTestContextRepository extends
		JpaRepository<SoapConnectivityTestContext, Long> {

//	@Query("select testContext.message from SoapConnectivityTestContext testContext where testContext.testCase.id = :testCaseId")
//	String getMessageByTestCaseId(@Param("testCaseId") Long testCaseId);

	@Query("select testContext.message from SoapConnectivityTestContext testContext where testContext.id = :testContextId")
	String getMessageByTestContextId(@Param("testContextId") Long testContextId);

//	@Query("select testContext from SoapConnectivityTestContext testContext where testContext.testCase.id = :testCaseId")
//	SoapConnectivityTestContext findOneByTestCaseId(
//			@Param("testCaseId") Long testCaseId);

//	@Query("select distinct testContext.testCase.testPlan from SoapConnectivityTestContext testContext order by testContext.testCase.testPlan.name ASC")
//	List<SoapTestPlan> findAllTestPlans();
	//
	// @Query("select distinct testContext.testCase.sutType from ConnectivityTestContext testContext")
	// List<SutType> findAllSutTypes();

	// @Query("select testContext.testCase from ConnectivityTestContext testContext where testContext.testCase.sutType = :sutType")
	// List<TestCase> findAllBySutType(@Param("sutType") SutType sutType);

}
