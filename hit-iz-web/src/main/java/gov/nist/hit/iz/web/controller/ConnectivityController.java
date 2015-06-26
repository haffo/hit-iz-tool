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

package gov.nist.hit.iz.web.controller;

import gov.nist.hit.core.domain.Command;
import gov.nist.hit.core.domain.User;
import gov.nist.hit.core.domain.ValidationResult;
import gov.nist.hit.core.domain.util.XmlUtil;
import gov.nist.hit.core.service.exception.SoapValidationException;
import gov.nist.hit.core.service.exception.TestCaseException;
import gov.nist.hit.core.service.exception.UserTokenIdNotFoundException;
import gov.nist.hit.core.service.exception.MessageValidationException;
import gov.nist.hit.core.transport.TransportClient;
import gov.nist.hit.core.transport.TransportClientException;
import gov.nist.hit.iz.domain.IZTestType;
import gov.nist.hit.iz.domain.SoapConnectivityCommand;
import gov.nist.hit.iz.domain.SoapConnectivityTestCase;
import gov.nist.hit.iz.domain.SoapConnectivityTestContext;
import gov.nist.hit.iz.domain.SoapConnectivityTestPlan;
import gov.nist.hit.iz.domain.SoapConnectivityTransaction;
import gov.nist.hit.iz.repo.SoapConnectivityTestCaseRepository;
import gov.nist.hit.iz.repo.SoapConnectivityTestContextRepository;
import gov.nist.hit.iz.repo.SoapConnectivityTestPlanRepository;
import gov.nist.hit.iz.repo.SoapConnectivityTransactionRepository;
import gov.nist.hit.iz.service.SoapValidationReportGenerator;
import gov.nist.hit.iz.service.soap.SoapMessageParser;
import gov.nist.hit.iz.service.soap.SoapMessageValidator;
import gov.nist.hit.iz.service.util.ConnectivityUtil;
import gov.nist.hit.iz.web.utils.Utils;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Harold Affo (NIST)
 * 
 */

@RestController
@RequestMapping("/connectivity")
public class ConnectivityController extends TestingController {

  static final Logger logger = LoggerFactory.getLogger(ConnectivityController.class);

  @Autowired
  private SoapMessageValidator soapValidator;

  @Autowired
  private TransportClient transportClient;

  @Autowired
  private SoapConnectivityTestContextRepository testContextRepository;

  @Autowired
  private SoapConnectivityTestPlanRepository testPlanRepository;

  @Autowired
  private SoapConnectivityTestCaseRepository testCaseRepository;

  @Autowired
  private SoapMessageParser soapParser;

  @Autowired
  private SoapValidationReportGenerator reportService;

  @Autowired
  protected SoapConnectivityTransactionRepository transactionRepository;

  public SoapConnectivityTransactionRepository getTransactionRepository() {
    return transactionRepository;
  }

  public void setTransactionRepository(SoapConnectivityTransactionRepository transactionRepository) {
    this.transactionRepository = transactionRepository;
  }

  public SoapMessageParser getSoapParser() {
    return soapParser;
  }

  public void setSoapParser(SoapMessageParser soapParser) {
    this.soapParser = soapParser;
  }

  @RequestMapping(value = "/testcases", method = RequestMethod.GET)
  public List<SoapConnectivityTestPlan> testCases() {
    logger.info("Fetching all testPlans...");
    return testPlanRepository.findAll();

  }

  @RequestMapping(value = "/testcases/{testCaseId}", method = RequestMethod.GET)
  public SoapConnectivityTestCase testCase(@PathVariable final Long testCaseId) {
    SoapConnectivityTestCase testCase = testCaseRepository.findOne(testCaseId);
    if (testCase == null)
      throw new TestCaseException("Unknown testCase with id=" + testCaseId);
    return testCase;
  }

  // @RequestMapping(value = "/testcases/{testCaseId}/testContext", method =
  // RequestMethod.GET)
  // public SoapConnectivityTestContext testContext(
  // @PathVariable final Long testCaseId) {
  // logger.info("Fetching testContext from testCaseId=" + testCaseId);
  // SoapConnectivityTestContext found = testContextRepository
  // .findOneByTestCaseId(testCaseId);
  // if (found == null)
  // throw new TestCaseException("Unknown testCase with id="
  // + testCaseId);
  // return found;
  // }

  @RequestMapping(value = "/validate", method = RequestMethod.POST)
  public ValidationResult validate(@RequestBody final Command command)
      throws SoapValidationException {
    try {
      logger.info("Validating connectivity response message " + command);
      String type = command.getType();
      Long testCaseId = command.getTestCaseId();
      SoapConnectivityTestCase testCase = testCaseRepository.findOne(testCaseId);
      if (testCase == null)
        throw new TestCaseException("No testcase found. Invalid testCase id=" + testCaseId);
      SoapConnectivityTestContext context = testCase.getTestContext();
      if ("req".equals(type)) {
        if (testCase.getTestType().equals(IZTestType.RECEIVER_UNSUPPORTED_OPERATION.toString())
            || testCase.getTestType().equals(IZTestType.SENDER_UNSUPPORTED_OPERATION.toString())) {
          // skip validation for this
          return new ValidationResult();
        } else {
          return soapValidator.validate(Utils.getContent(command), testCase.getName(),
              context.getRequestValidationPhase());

        }
      } else if ("resp".equals(type)) {
        return soapValidator.validate(Utils.getContent(command), testCase.getName(),
            context.getResponseValidationPhase(), command.getRequestMessage());
      }
      return null;
    } catch (MessageValidationException e) {
      throw new SoapValidationException(e);
    }

  }

  @RequestMapping(value = "/send", method = RequestMethod.POST)
  public Command sendRequest(@RequestBody SoapConnectivityCommand command)
      throws TransportClientException {
    logger.info("Sending ... " + command);
    try {
      Long testCaseId = command.getTestCaseId();
      SoapConnectivityTestCase testCase = testCaseRepository.findOne(testCaseId);
      if (testCase == null)
        throw new TestCaseException("Unknown testcase with id=" + testCaseId);
      String request = command.getContent();
      String req = testCase.getTestContext().getMessage();
      if (!IZTestType.RECEIVER_CONNECTIVITY.toString().equals(testCase.getTestType())) {
        request =
            ConnectivityUtil.updateSubmitSingleMessageRequest(req, command.getU(), command.getP(),
                command.getFacilityId());
      } else if (IZTestType.RECEIVER_CONNECTIVITY.toString().equals(testCase.getTestType())) {
        request = ConnectivityUtil.updateConnectivityRequest(req);
      }
      String response = transportClient.send(request, command.getEndpoint());
      String tmp = response;
      try {
        response = XmlUtil.prettyPrint(response);
      } catch (Exception e) {
        response = tmp;
      }
      return new SoapConnectivityCommand(request, response);
    } catch (Exception e1) {
      throw new TransportClientException("Failed to send the message." + e1.getMessage());
    }

  }

  @Transactional()
  @RequestMapping(value = "/transaction/open", method = RequestMethod.POST)
  public boolean initIncoming(@RequestBody final User user) throws UserTokenIdNotFoundException {
    logger.info("Initializing transaction for username ... " + user.getUsername());
    SoapConnectivityTransaction transaction = transaction(user);
    if (transaction != null) {
      transaction.init();
      transactionRepository.saveAndFlush(transaction);
      return true;
    }
    return false;
  }

  @Transactional()
  @RequestMapping(value = "/transaction/close", method = RequestMethod.POST)
  public boolean clearIncoming(@RequestBody final User user) {
    logger.info("Closing transaction for username... " + user.getUsername());
    SoapConnectivityTransaction transaction = transaction(user);
    if (transaction != null) {
      transaction.close();
      transactionRepository.saveAndFlush(transaction);
    }
    return true;
  }

  @RequestMapping(value = "/transaction", method = RequestMethod.POST)
  public SoapConnectivityTransaction transaction(@RequestBody final User user) {
    logger.info("Get transaction of username ... " + user.getUsername());
    SoapConnectivityTransaction transaction =
        transactionRepository.findByUsernameAndPasswordAndFacilityID(user.getUsername(),
            user.getPassword(), user.getFacilityID());
    return transaction != null ? transaction : new SoapConnectivityTransaction();
  }

}
