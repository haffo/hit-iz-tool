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

import gov.nist.hit.core.repo.UserRepository;
import gov.nist.hit.core.service.ResourcebundleLoader;
import gov.nist.hit.core.service.exception.ProfileParserException;
import gov.nist.hit.iz.domain.ConnectivityTestPlan;
import gov.nist.hit.iz.domain.EnvelopeTestPlan;
import gov.nist.hit.iz.repo.ConnectivityTestPlanRepository;
import gov.nist.hit.iz.repo.EnvelopeTestPlanRepository;
import gov.nist.hit.iz.service.SoapConnectivityTestPlanParser;
import gov.nist.hit.iz.service.SoapEnvelopeTestPlanParser;
import gov.nist.hit.iz.web.controller.SOAPController;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class Bootstrap implements InitializingBean {

  static final Logger logger = LoggerFactory.getLogger(SOAPController.class);

  @Autowired
  EnvelopeTestPlanRepository soapEnvTestPlanRepository;

  @Autowired
  ConnectivityTestPlanRepository soapConnTestPlanRepository;

  @Autowired
  UserRepository userRepository;

  @Autowired
  ResourcebundleLoader resourcebundleLoader;



  @Override
  @Transactional()
  public void afterPropertiesSet() throws Exception {
    System.setProperty("javax.xml.parsers.SAXParserFactory",
        "com.sun.org.apache.xerces.internal.jaxp.SAXParserFactoryImpl");

    logger.info("Bootstrapping data...");
    resourcebundleLoader.appInfo();
    resourcebundleLoader.constraints();
    resourcebundleLoader.vocabularyLibraries();
    resourcebundleLoader.integrationProfiles();
    resourcebundleLoader.cf();
    resourcebundleLoader.cb();
    resourcebundleLoader.isolated();
    soapEnv();
    soapConn();
    logger.info("...Bootstrapping completed");
  }


  /**
   * 
   * @throws IOException
   * @throws ProfileParserException
   * @throws URISyntaxException
   */
  private void soapEnv() throws IOException, ProfileParserException, URISyntaxException {
    SoapEnvelopeTestPlanParser parser = new SoapEnvelopeTestPlanParser();
    List<EnvelopeTestPlan> testPlans = parser.create();
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
    List<ConnectivityTestPlan> testPlans = parser.create();
    for (int i = 0; i < testPlans.size(); i++) {
      soapConnTestPlanRepository.save(testPlans.get(i));
    }
  }

}
