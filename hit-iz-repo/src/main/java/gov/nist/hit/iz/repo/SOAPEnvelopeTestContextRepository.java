package gov.nist.hit.iz.repo;

import gov.nist.hit.core.domain.SutType;
import gov.nist.hit.iz.domain.EnvelopeTestContext;
import gov.nist.hit.iz.domain.SoapTestCase;
import gov.nist.hit.iz.domain.SoapTestPlan;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SOAPEnvelopeTestContextRepository extends
		JpaRepository<EnvelopeTestContext, Long> {
//
//	@Query("select testContext from EnvelopeTestContext testContext where testContext.testCase.id = :testCaseId")
//	EnvelopeTestContext findOneByTestCaseId(@Param("testCaseId") Long testCaseId);

//	@Query("select distinct testContext.testCase.testPlan from EnvelopeTestContext testContext order by testContext.testCase.testPlan.name ASC")
//	List<SoapTestPlan> findAllTestPlans();

//	@Query("select testContext.testCase from EnvelopeTestContext testContext where testContext.testCase.sutType = :sutType")
//	List<SoapTestCase> findAllBySutType(@Param("sutType") SutType sutType);

}