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

import gov.nist.hit.core.api.SessionContext;
import gov.nist.hit.core.domain.Command;
import gov.nist.hit.core.domain.Transaction;
import gov.nist.hit.core.domain.TransportConfig;
import gov.nist.hit.core.domain.TransportRequest;
import gov.nist.hit.core.domain.ValidationResult;
import gov.nist.hit.core.domain.util.XmlUtil;
import gov.nist.hit.core.service.TransportConfigService;
import gov.nist.hit.core.service.UserService;
import gov.nist.hit.core.service.exception.DuplicateTokenIdException;
import gov.nist.hit.core.service.exception.MessageValidationException;
import gov.nist.hit.core.service.exception.TestCaseException;
import gov.nist.hit.core.service.exception.UserNotFoundException;
import gov.nist.hit.core.service.exception.UserTokenIdNotFoundException;
import gov.nist.hit.core.transport.exception.TransportClientException;
import gov.nist.hit.iz.domain.ConnectivityTestCase;
import gov.nist.hit.iz.domain.ConnectivityTestContext;
import gov.nist.hit.iz.domain.ConnectivityTestPlan;
import gov.nist.hit.iz.domain.IZTestType;
import gov.nist.hit.iz.repo.SOAPConnectivityTestCaseRepository;
import gov.nist.hit.iz.repo.SOAPConnectivityTestContextRepository;
import gov.nist.hit.iz.repo.SOAPConnectivityTestPlanRepository;
import gov.nist.hit.iz.service.SOAPValidationReportGenerator;
import gov.nist.hit.iz.service.exception.SoapValidationException;
import gov.nist.hit.iz.service.soap.SOAPMessageParser;
import gov.nist.hit.iz.service.soap.SOAPMessageValidator;
import gov.nist.hit.iz.service.util.ConnectivityUtil;
import gov.nist.hit.iz.web.utils.Utils;
import gov.nist.hit.iz.ws.client.IZSOAPWebServiceClient;

import java.util.List;

import javax.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Harold Affo (NIST)
 * 
 */

@RestController
@RequestMapping("/connectivity")
public class SOAPConnectivityController {

  static final Logger logger = LoggerFactory.getLogger(SOAPConnectivityController.class);

  @Autowired
  private SOAPMessageValidator soapValidator;

  @Autowired
  private IZSOAPWebServiceClient webServiceClient;

  @Autowired
  private SOAPConnectivityTestContextRepository testContextRepository;

  @Autowired
  private SOAPConnectivityTestPlanRepository testPlanRepository;

  @Autowired
  private SOAPConnectivityTestCaseRepository testCaseRepository;

  @Autowired
  private SOAPMessageParser soapMessageParser;

  @Autowired
  private SOAPValidationReportGenerator reportService;

  @Autowired
  protected TransportConfigService transportConfigService;

  @Autowired
  protected UserService userService;


  public SOAPMessageParser getSoapParser() {
    return soapMessageParser;
  }

  public void setSoapMessageParser(SOAPMessageParser soapMessageParser) {
    this.soapMessageParser = soapMessageParser;
  }

  @Cacheable(value = "testCaseCache", key = "'conn-testcases'")
  @RequestMapping(value = "/testcases", method = RequestMethod.GET)
  public List<ConnectivityTestPlan> testCases() {
    logger.info("Fetching all testPlans...");
    return testPlanRepository.findAll();

  }

  @RequestMapping(value = "/testcases/{testCaseId}", method = RequestMethod.GET)
  public ConnectivityTestCase testCase(@PathVariable final Long testCaseId) {
    ConnectivityTestCase testCase = testCaseRepository.findOne(testCaseId);
    if (testCase == null)
      throw new TestCaseException("Unknown testCase with id=" + testCaseId);
    return testCase;
  }


  @RequestMapping(value = "/validate", method = RequestMethod.POST)
  public ValidationResult validate(@RequestBody final Command command)
      throws SoapValidationException {
    try {
      logger.info("Validating connectivity response message " + command);
      String type = command.getType();
      Long testCaseId = command.getTestCaseId();
      ConnectivityTestCase testCase = testCaseRepository.findOne(testCaseId);
      if (testCase == null)
        throw new TestCaseException("No testcase found. Invalid testCase id=" + testCaseId);
      ConnectivityTestContext context = testCase.getTestContext();
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

  @RequestMapping(value = "/transport/send", method = RequestMethod.POST)
  public Transaction send(@RequestBody TransportRequest requ, HttpSession session)
      throws TransportClientException {
    logger.info("Sending message  with user id=" + requ.getUserId() + " and test step with id="
        + requ.getTestStepId());
    try {
      Long userId = SessionContext.getCurrentUserId(session);
      if (userId == null || (userService.findOne(userId)) == null) {
        throw new UserNotFoundException();
      }
      Long testCaseId = requ.getTestStepId();
      TransportConfig config = transportConfigService.findOneByUserAndProtocol(userId, "soap");
      config.setTaInitiator(requ.getConfig());
      transportConfigService.save(config);
      ConnectivityTestCase testCase = testCaseRepository.findOne(testCaseId);
      if (testCase == null)
        throw new TestCaseException("Unknown testcase with id=" + testCaseId);
      // String outgoingMessage = requ.getMessage();
      String outgoingMessage = testCase.getTestContext().getMessage();
      if (!IZTestType.RECEIVER_CONNECTIVITY.toString().equals(testCase.getTestType())) {
        outgoingMessage =
            ConnectivityUtil.updateSubmitSingleMessageRequest(outgoingMessage, null, requ
                .getConfig().get("username"), requ.getConfig().get("password"), requ.getConfig()
                .get("facilityID"));

      } else if (IZTestType.RECEIVER_CONNECTIVITY.toString().equals(testCase.getTestType())) {
        outgoingMessage = ConnectivityUtil.updateConnectivityRequest(outgoingMessage);
      }
      String incomingMessage =
          webServiceClient.send(outgoingMessage, requ.getConfig().get("endpoint"));
      String tmp = incomingMessage;
      try {
        incomingMessage = XmlUtil.prettyPrint(incomingMessage);
      } catch (Exception e) {
        incomingMessage = tmp;
      }

      Transaction transaction = new Transaction();
      transaction.setOutgoing(outgoingMessage);
      transaction.setIncoming(incomingMessage);

      return transaction;
    } catch (Exception e1) {
      throw new TransportClientException("Failed to send the message." + e1.getMessage());
    }
  }


  // @Transactional()
  // @RequestMapping(value = "/send", method = RequestMethod.POST)
  // public Transaction send(@RequestBody SendRequest request) throws TransportClientException {
  // logger.info("Sending message  with user id=" + request.getUserId() + " and test step with id="
  // + request.getTestStepId());
  // try {
  // Long testStepId = request.getTestStepId();
  // Long userId = request.getUserId();
  // TransportConfig config = transportConfigService.findOneByUserAndProtocol(userId, PROTOCOL);
  // config.setTaInitiator(request.getConfig());
  // transportConfigService.save(config);
  // TestStep testStep = testStepService.findOne(testStepId);
  // if (testStep == null)
  // throw new TestCaseException("Unknown test step with id=" + testStepId);
  // String outgoingMessage = request.getMessage();
  // outgoingMessage =
  // ConnectivityUtil.updateSubmitSingleMessageRequest(SUMBIT_SINGLE_MESSAGE_TEMPLATE,
  // request.getMessage(), request.getConfig().get("username"),
  // request.getConfig().get("password"), request.getConfig().get("facilityID"));
  // String incomingMessage =
  // webServiceClient.send(outgoingMessage, request.getConfig().get("endpoint"));
  // String tmp = incomingMessage;
  // try {
  // incomingMessage = XmlUtil.prettyPrint(incomingMessage);
  // } catch (Exception e) {
  // incomingMessage = tmp;
  // }
  //
  // Transaction transaction = new Transaction();
  // transaction.setTestStep(testStepService.findOne(testStepId));
  // transaction.setUser(userRepository.findOne(userId));
  // transaction.setOutgoing(outgoingMessage);
  // transaction.setIncoming(incomingMessage);
  //
  // return transaction;
  // } catch (Exception e1) {
  // throw new TransportClientException("Failed to send the message." + e1.getMessage());
  // }
  // }


  // @Transactional()
  // @RequestMapping(value = "/transport/open", method = RequestMethod.POST)
  // public boolean initIncoming(@RequestBody final ConnectivityUser user)
  // throws UserTokenIdNotFoundException {
  // logger.info("Initializing transaction for username ... " + user.getUsername());
  // ConnectivityTransaction transaction = transaction(user);
  // if (transaction != null) {
  // setResponseMessageId(transaction.getUser(), user.getResponseMessageId());
  // transaction.init();;
  // transactionRepository.saveAndFlush(transaction);
  // return true;
  // }
  // return false;
  // }

  // private void setResponseMessageId(ConnectivityUser user, Long messageId) {
  // user.setResponseMessageId(messageId);
  // userRepository.save(user);
  // }

  //
  // @Transactional()
  // @RequestMapping(value = "/transport/close", method = RequestMethod.POST)
  // public boolean clearIncoming(@RequestBody final ConnectivityUser user) {
  // logger.info("Closing transaction for username... " + user.getUsername());
  // ConnectivityTransaction transaction = transaction(user);
  // if (transaction != null) {
  // setResponseMessageId(transaction.getUser(), null);
  // transaction.close();
  // transactionRepository.saveAndFlush(transaction);
  // }
  // return true;
  // }

  // @RequestMapping(method = RequestMethod.POST)
  // public ConnectivityTransaction transaction(@RequestBody final ConnectivityUser user) {
  // logger.info("Get transaction of username ... " + user.getUsername());
  // ConnectivityTransaction transaction =
  // transactionRepository.findByUsernameAndPasswordAndFacilityID(user.getUsername(),
  // user.getPassword(), user.getFacilityID());
  // return transaction != null ? transaction : new ConnectivityTransaction();
  // }



  @ResponseBody
  @ExceptionHandler(UserTokenIdNotFoundException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public String facilityIdNotFound(UserTokenIdNotFoundException ex) {
    logger.debug(ex.getMessage());
    return ex.getMessage();
  }

  @ResponseBody
  @ExceptionHandler(DuplicateTokenIdException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public String DuplicateFacilityIdException(DuplicateTokenIdException ex) {
    logger.debug(ex.getMessage());
    return ex.getMessage();
  }

  // @Transactional()
  // @RequestMapping(value = "/transport/initUser", method = RequestMethod.POST)
  // public ConnectivityUserCommand initUser(@RequestBody final ConnectivityUser userCommand,
  // HttpServletRequest request) {
  // logger.info("Fetching user information ... ");
  // ConnectivityUser user = null;
  // Long id = userCommand.getId();
  //
  // if (id == null) {
  // user = new ConnectivityUser();
  // userRepository.saveAndFlush(user);
  // } else {
  // user = userRepository.findOne(id);
  // }
  //
  // // create a guest user if no token found
  // if (user.getPassword() == null && user.getUsername() == null) { // Guest
  // user.setUsername("vendor_" + user.getId());
  // user.setPassword("vendor_" + user.getId());
  // user.setFacilityID("vendor_" + user.getId());
  // userRepository.saveAndFlush(user);
  // }
  //
  // Long userId = user.getId();
  // FaultAccount faultCredentials =
  // securityFaultCredentialsRepository.findOneByUserId(user.getId());
  // if (faultCredentials == null) {
  // faultCredentials = new FaultAccount();
  // faultCredentials.setUsername("faultUser_" + userId);
  // faultCredentials.setPassword("faultPwd_" + userId);
  // faultCredentials.setUser(user);
  // securityFaultCredentialsRepository.saveAndFlush(faultCredentials);
  // }
  //
  // ConnectivityTransaction transaction = transactionRepository.findOneByUserId(userId);
  // if (transaction == null) {
  // transaction = new ConnectivityTransaction();
  // transaction.setUser(user);
  // }
  // transaction.setStatus(TransactionStatus.CLOSE);
  // transactionRepository.saveAndFlush(transaction);
  //
  // // User user = null;
  // // List<User> users = userRepository.findAll();
  // // if (users == null || users.isEmpty()) {
  // // user = new User();
  // // user.setUsername("pilot");
  // // user.setPassword("pilot");
  // // user.setFacilityID("pilot");
  // // userRepository.saveAndFlush(user);
  // // } else {
  // // user = users.get(0);
  // // }
  // // Long userId = user.getId();
  // // SecurityFaultCredentials faultCredentials =
  // // securityFaultCredentialsRepository.findOneByUserId(user.getId());
  // // if (faultCredentials == null) {
  // // faultCredentials = new SecurityFaultCredentials();
  // // faultCredentials.setFaultUsername("pilot");
  // // faultCredentials.setFaultPassword("pilot");
  // // faultCredentials.setUser(user);
  // // securityFaultCredentialsRepository.saveAndFlush(faultCredentials);
  // // }
  // // ConnectivityTransaction transaction = transactionRepository.findOneByUserId(userId);
  // // if (transaction == null) {
  // // transaction = new ConnectivityTransaction();
  // // transaction.setUser(user);
  // // }
  // // transaction.setStatus(ConnectivityTransactionStatus.CLOSE);
  // // transactionRepository.saveAndFlush(transaction);
  // return new ConnectivityUserCommand(user.getUsername(), user.getPassword(),
  // faultCredentials.getUsername(), faultCredentials.getPassword(), user.getFacilityID(),
  // Utils.getUrl(request) + "/ws/iisService");
  // }

}
