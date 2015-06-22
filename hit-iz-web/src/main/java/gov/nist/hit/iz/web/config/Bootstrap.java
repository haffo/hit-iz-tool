/**
 * This software was developed at the National Institute of Standards and Technology by employees of
 * the Federal Government in the course of their official duties. Pursuant to title 17 Section 105
 * of the United States Code this software is not subject to copyright protection and is in the
 * public domain. This is an experimental system. NIST assumes no responsibility whatsoever for its
 * use by other parties, and makes no guarantees, expressed or implied, about its quality,
 * reliability, or any other characteristic. We would appreciate acknowledgement if the software is
 * used. This software can be redistributed and/or modified freely provided that any derivative
 * works bear some notice that they are derived from it, and any modified versions bear some notice
 * that they have been modified.
 */

package gov.nist.hit.iz.web.config;

import gov.nist.hit.core.domain.TestPlan;
import gov.nist.hit.core.domain.TestStep;
import gov.nist.hit.core.hl7v2.service.profile.ProfileParserImpl;
import gov.nist.hit.core.repo.TestPlanRepository;
import gov.nist.hit.core.repo.TestStepRepository;
import gov.nist.hit.core.repo.UserRepository;
import gov.nist.hit.core.service.ProfileParser;
import gov.nist.hit.core.service.exception.ProfileParserException;
import gov.nist.hit.core.service.impl.ValueSetLibrarySerializerImpl;
import gov.nist.hit.iz.domain.SoapConnectivityTestPlan;
import gov.nist.hit.iz.domain.SoapEnvelopeTestPlan;
import gov.nist.hit.iz.repo.SoapConnectivityTestPlanRepository;
import gov.nist.hit.iz.repo.SoapEnvelopeTestPlanRepository;
import gov.nist.hit.iz.service.CBTestPlanParser;
import gov.nist.hit.iz.service.CFTestPlanParser;
import gov.nist.hit.iz.service.SoapConnectivityTestPlanParser;
import gov.nist.hit.iz.service.SoapEnvelopeTestPlanParser;
import gov.nist.hit.iz.web.controller.SoapController;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class Bootstrap implements InitializingBean {

  static final Logger logger = LoggerFactory.getLogger(SoapController.class);

  @Autowired
  SoapEnvelopeTestPlanRepository soapEnvTestPlanRepository;

  @Autowired
  SoapConnectivityTestPlanRepository soapConnTestPlanRepository;

  @Autowired
  TestPlanRepository testPlanRepository;

  @Autowired
  TestStepRepository testStepRepository;

  @Autowired
  UserRepository userRepository;

  ProfileParser profileParser = new ProfileParserImpl();

  ObjectMapper obm = new ObjectMapper();

  ValueSetLibrarySerializerImpl tableSerializer = new ValueSetLibrarySerializerImpl();

  @Override
  @Transactional()
  public void afterPropertiesSet() throws Exception {
    logger.info("Bootstrapping data...");
    obm.setSerializationInclusion(Include.NON_NULL);
    cf();
    cb();
    soapEnv();
    soapConn();
    logger.info("...Bootstrapping completed");
  }

  /**
   * 
   * @throws IOException
   * @throws ProfileParserException
   */
  private void cf() throws IOException, ProfileParserException {
    CFTestPlanParser parser = new CFTestPlanParser(profileParser, tableSerializer);
    List<TestStep> testSteps = parser.create("/bundle/contextfree");
    for (int i = 0; i < testSteps.size(); i++) {
      testStepRepository.save(testSteps.get(i));
    }
  }

  /**
   * 
   * @throws IOException
   * @throws ProfileParserException
   * @throws URISyntaxException
   */
  private void cb() throws IOException, ProfileParserException, URISyntaxException {
    CBTestPlanParser parser = new CBTestPlanParser(profileParser, tableSerializer);
    List<TestPlan> testPlans = parser.create("/bundle/contextbased");
    for (int i = 0; i < testPlans.size(); i++) {
      testPlanRepository.save(testPlans.get(i));
    }
  }

  /**
   * 
   * @throws IOException
   * @throws ProfileParserException
   * @throws URISyntaxException
   */
  private void soapEnv() throws IOException, ProfileParserException, URISyntaxException {
    SoapEnvelopeTestPlanParser parser = new SoapEnvelopeTestPlanParser();
    List<SoapEnvelopeTestPlan> testPlans = parser.create();
    for (int i = 0; i < testPlans.size(); i++) {
      soapEnvTestPlanRepository.save(testPlans.get(i));
    }
  }

  /**
   * 
   * @throws IOException
   * @throws URISyntaxException
   */
  private void soapConn() throws IOException, URISyntaxException {
    SoapConnectivityTestPlanParser parser = new SoapConnectivityTestPlanParser();
    List<SoapConnectivityTestPlan> testPlans = parser.create();
    for (int i = 0; i < testPlans.size(); i++) {
      soapConnTestPlanRepository.save(testPlans.get(i));
    }
  }

}
