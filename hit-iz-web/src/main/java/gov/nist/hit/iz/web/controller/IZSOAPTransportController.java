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

import gov.nist.hit.core.domain.KeyValuePair;
import gov.nist.hit.core.domain.SendRequest;
import gov.nist.hit.core.domain.TestStep;
import gov.nist.hit.core.domain.TestStepTestingType;
import gov.nist.hit.core.domain.Transaction;
import gov.nist.hit.core.domain.TransportConfig;
import gov.nist.hit.core.domain.User;
import gov.nist.hit.core.domain.util.XmlUtil;
import gov.nist.hit.core.repo.TransactionRepository;
import gov.nist.hit.core.repo.UserRepository;
import gov.nist.hit.core.service.TestStepService;
import gov.nist.hit.core.service.TransportConfigService;
import gov.nist.hit.core.service.exception.DuplicateTokenIdException;
import gov.nist.hit.core.service.exception.TestCaseException;
import gov.nist.hit.core.service.exception.UserNotFoundException;
import gov.nist.hit.core.service.exception.UserTokenIdNotFoundException;
import gov.nist.hit.core.transport.exception.TransportClientException;
import gov.nist.hit.iz.repo.SOAPSecurityFaultCredentialsRepository;
import gov.nist.hit.iz.service.util.ConnectivityUtil;
import gov.nist.hit.iz.web.utils.Utils;
import gov.nist.hit.iz.ws.client.IZSOAPWebServiceClient;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Harold Affo (NIST)
 * 
 */

@RestController
@RequestMapping("/transport/iz/soap")
public class IZSOAPTransportController {

  static final Logger logger = LoggerFactory.getLogger(IZSOAPTransportController.class);

  @Autowired
  protected TestStepService testStepService;

  @Autowired
  protected UserRepository userRepository;

  @Autowired
  protected TransactionRepository transactionRepository;

  @Autowired
  protected TransportConfigService transportConfigService;

  @Autowired
  private IZSOAPWebServiceClient webServiceClient;


  private final static String DOMAIN = "iz";
  private final static String PROTOCOL = "soap";



  @Autowired
  protected SOAPSecurityFaultCredentialsRepository securityFaultCredentialsRepository;

  String SUMBIT_SINGLE_MESSAGE_TEMPLATE = null;

  public IZSOAPTransportController() throws IOException {
    SUMBIT_SINGLE_MESSAGE_TEMPLATE =
        IOUtils.toString(IsolatedTestingController.class
            .getResourceAsStream("/templates/SubmitSingleMessage.xml"));
  }

  @Transactional()
  @RequestMapping(value = "/configListener", method = RequestMethod.POST)
  public TransportConfig config(@RequestParam("userId") final Long userId,
      HttpServletRequest request) throws UserNotFoundException {
    logger.info("Fetching user information ... ");
    User user = null;
    TransportConfig config = null;
    if (userId == null || (user = userRepository.findOne(userId)) == null) {
      throw new UserNotFoundException();
    }
    config =
        transportConfigService.findOneByUserAndProtocolAndDomain(user.getId(), PROTOCOL, DOMAIN);
    if (config == null) {
      config = transportConfigService.create("soap");
      user.addConfig(config);
    }
    if (config.getSutInitiator().get("password") == null
        && config.getSutInitiator().get("username") == null) {
      List<KeyValuePair> pairs = new ArrayList<KeyValuePair>();
      pairs.add(new KeyValuePair("username", "vendor_" + config.getId()));
      pairs.add(new KeyValuePair("password", "vendor_" + config.getId()));
      pairs.add(new KeyValuePair("facilityID", "vendor_" + config.getId()));
      transportConfigService.set(pairs, TestStepTestingType.SUT_INITIATOR, config);
    }

    if (config.getSutInitiator().get("faultPassword") == null
        && config.getSutInitiator().get("faultUsername") == null) {
      List<KeyValuePair> pairs = new ArrayList<KeyValuePair>();
      pairs.add(new KeyValuePair("faultUsername", "faultUser_" + config.getId()));
      pairs.add(new KeyValuePair("faultPassword", "faultUser_" + config.getId()));
      transportConfigService.set(pairs, TestStepTestingType.SUT_INITIATOR, config);
    }

    if (config.getSutInitiator().get("endpoint") == null) {
      List<KeyValuePair> pairs = new ArrayList<KeyValuePair>();
      pairs.add(new KeyValuePair("endpoint", Utils.getUrl(request) + "/ws/iisService"));
      transportConfigService.set(pairs, TestStepTestingType.SUT_INITIATOR, config);
    }
    userRepository.save(user);
    return config;
  }

  @Transactional()
  @RequestMapping(value = "/startListener", method = RequestMethod.POST)
  public boolean open(@RequestBody SendRequest request) {
    logger.info("Open transaction for user with id=" + request.getUserId()
        + " and of test step with id=" + request.getTestStepId());
    Transaction transaction = fetchTaInitiorTransaction(request);
    if (transaction != null) {
      transaction.init();;
      transactionRepository.saveAndFlush(transaction);
      return true;
    }
    return false;
  }

  // private void setResponseMessageId(TransportAccount transportAccount, String messageId) {
  // transportAccount.getInfo().put("responseMessageId", messageId);
  // transportAccountRepository.save(transportAccount);
  // }

  @Transactional()
  @RequestMapping(value = "/stopListener", method = RequestMethod.POST)
  public boolean close(@RequestBody SendRequest request) {
    logger.info("Closing transaction for user with id=" + request.getUserId()
        + " and of test step with id=" + request.getTestStepId());
    Transaction transaction = fetchTaInitiorTransaction(request);
    if (transaction != null) {
      // setResponseMessageId(transaction.getTransportAccount(), null);
      transaction.close();
      transactionRepository.saveAndFlush(transaction);
    }
    return true;
  }

  @RequestMapping(value = "/fetchTaInitiorTransaction", method = RequestMethod.POST)
  public Transaction fetchTaInitiorTransaction(@RequestBody SendRequest request) {
    logger.info("Get transaction of user with id=" + request.getUserId()
        + " and of testStep with id=" + request.getTestStepId());
    Transaction transaction =
        transactionRepository
            .findOneByUserAndTestStep(request.getUserId(), request.getTestStepId());
    if (transaction == null) { // can't find by user and teststep Id
      List<KeyValuePair> criteria = new ArrayList<KeyValuePair>();
      criteria.add(new KeyValuePair("username", request.getConfig().get("username")));
      criteria.add(new KeyValuePair("password", request.getConfig().get("password")));
      criteria.add(new KeyValuePair("facilityID", request.getConfig().get("facilityID")));
      transaction = transactionRepository.findOneByCriteria(criteria);
      if (transaction == null) {
        transaction = new Transaction();
      }
      transaction.setTestStep(testStepService.findOne(request.getTestStepId()));
      transaction.setUser(userRepository.findOne(request.getUserId()));
      transaction.setConfig(request.getConfig());
      transaction.setResponseMessageId(request.getResponseMessageId());
      transactionRepository.save(transaction);
    }
    return transaction;
  }

  @Transactional()
  @RequestMapping(value = "/send", method = RequestMethod.POST)
  public Transaction send(@RequestBody SendRequest request) throws TransportClientException {
    logger.info("Sending message  with user id=" + request.getUserId() + " and test step with id="
        + request.getTestStepId());
    try {
      Long testStepId = request.getTestStepId();
      Long userId = request.getUserId();
      TransportConfig config =
          transportConfigService.findOneByUserAndProtocolAndDomain(userId, PROTOCOL, DOMAIN);
      config.setTaInitiator(request.getConfig());
      transportConfigService.save(config);
      TestStep testStep = testStepService.findOne(testStepId);
      if (testStep == null)
        throw new TestCaseException("Unknown test step with id=" + testStepId);
      String outgoingMessage = request.getMessage();
      outgoingMessage =
          ConnectivityUtil.updateSubmitSingleMessageRequest(SUMBIT_SINGLE_MESSAGE_TEMPLATE,
              request.getMessage(), request.getConfig().get("username"),
              request.getConfig().get("password"), request.getConfig().get("facilityID"));
      String incomingMessage =
          webServiceClient.send(outgoingMessage, request.getConfig().get("endpoint"));
      String tmp = incomingMessage;
      try {
        incomingMessage = XmlUtil.prettyPrint(incomingMessage);
      } catch (Exception e) {
        incomingMessage = tmp;
      }

      Transaction transaction = transactionRepository.findOneByUserAndTestStep(userId, testStepId);
      if (transaction == null) {
        transaction = new Transaction();
        transaction.setTestStep(testStepService.findOne(testStepId));
        transaction.setUser(userRepository.findOne(userId));
        transaction.setConfig(request.getConfig());
        transaction.setOutgoing(outgoingMessage);
        transaction.setIncoming(incomingMessage);
        transactionRepository.save(transaction);
      }
      return transaction;
    } catch (Exception e1) {
      throw new TransportClientException("Failed to send the message." + e1.getMessage());
    }
  }

  public TransactionRepository getTransactionRepository() {
    return transactionRepository;
  }

  public void setTransactionRepository(TransactionRepository transactionRepository) {
    this.transactionRepository = transactionRepository;
  }

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

}
