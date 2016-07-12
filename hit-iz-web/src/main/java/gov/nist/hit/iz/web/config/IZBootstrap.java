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

import gov.nist.auth.hit.core.repo.AccountRepository;
import gov.nist.hit.core.service.ResourcebundleLoader;
import gov.nist.hit.core.service.exception.ProfileParserException;
import gov.nist.hit.iz.domain.IZConnectivityTestPlan;
import gov.nist.hit.iz.domain.IZEnvelopeTestPlan;
import gov.nist.hit.iz.repo.IZConnectivityTestPlanRepository;
import gov.nist.hit.iz.repo.IZEnvelopeTestPlanRepository;
import gov.nist.hit.iz.service.SOAPConnectivityTestPlanParser;
import gov.nist.hit.iz.service.SOAPEnvelopeTestPlanParser;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.List;

import javax.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class IZBootstrap {

  static final Logger logger = LoggerFactory.getLogger(IZBootstrap.class);

  @Autowired
  IZEnvelopeTestPlanRepository envelopeTestPlanRepository;

  @Autowired
  IZConnectivityTestPlanRepository connectivityTestPlanRepository;

  @Autowired
  AccountRepository userRepository;


  @Autowired
  ResourcebundleLoader resourcebundleLoader;


  @PostConstruct
  @Transactional()
  public void init() throws Exception {
    System.setProperty("javax.xml.parsers.SAXParserFactory",
        "com.sun.org.apache.xerces.internal.jaxp.SAXParserFactoryImpl");
    logger.info("Bootstrapping data...");
    if (resourcebundleLoader.isNewResourcebundle()) {
      logger.info("clearing iz envelope testcases...");
      deleteEnvelopeTestCases();
      logger.info("clearing iz connectivity testcases...");
      deleteConnectivityTestCases();
      logger.info("loading iz envelope testcases...");
      loadEnvelopeTestCases();
      logger.info("loading iz connectivity testcases...");
      loadConnectivityTestCases();
    }
    resourcebundleLoader.load();
    logger.info("...Bootstrapping completed");
  }


  /**
   * 
   * @throws IOException
   * @throws ProfileParserException
   * @throws URISyntaxException
   */
  private void loadEnvelopeTestCases() throws IOException, ProfileParserException,
      URISyntaxException {
    SOAPEnvelopeTestPlanParser parser = new SOAPEnvelopeTestPlanParser("/soap");
    List<IZEnvelopeTestPlan> testPlans = parser.create();
    for (int i = 0; i < testPlans.size(); i++) {
      envelopeTestPlanRepository.save(testPlans.get(i));
    }
  }

  private void deleteEnvelopeTestCases() throws IOException, ProfileParserException,
      URISyntaxException {
    envelopeTestPlanRepository.deleteAll();
  }

  private void deleteConnectivityTestCases() throws IOException, ProfileParserException,
      URISyntaxException {
    connectivityTestPlanRepository.deleteAll();
  }


  /**
   * 
   * @throws IOException
   * @throws URISyntaxException
   */
  private void loadConnectivityTestCases() throws IOException, URISyntaxException {
    SOAPConnectivityTestPlanParser parser = new SOAPConnectivityTestPlanParser("/soap");
    List<IZConnectivityTestPlan> testPlans = parser.create();
    for (int i = 0; i < testPlans.size(); i++) {
      connectivityTestPlanRepository.save(testPlans.get(i));
    }
  }

}
