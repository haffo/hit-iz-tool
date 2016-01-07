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

import gov.nist.hit.core.domain.SendRequest;
import gov.nist.hit.core.domain.TestStep;
import gov.nist.hit.core.domain.Transaction;
import gov.nist.hit.core.domain.TransportConfig;
import gov.nist.hit.core.domain.User;
import gov.nist.hit.core.domain.util.XmlUtil;
import gov.nist.hit.core.repo.UserRepository;
import gov.nist.hit.core.service.TestStepService;
import gov.nist.hit.core.service.TransactionService;
import gov.nist.hit.core.service.TransportConfigService;
import gov.nist.hit.core.service.exception.DuplicateTokenIdException;
import gov.nist.hit.core.service.exception.TestCaseException;
import gov.nist.hit.core.service.exception.UserNotFoundException;
import gov.nist.hit.core.service.exception.UserTokenIdNotFoundException;
import gov.nist.hit.core.transport.exception.TransportClientException;
import gov.nist.hit.iz.service.util.ConnectivityUtil;
import gov.nist.hit.iz.web.utils.Utils;
import gov.nist.hit.iz.ws.client.IZSOAPWebServiceClient;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
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
@RequestMapping("/transport/iz/soap")
public class IZSOAPTransportController {

  static final Logger logger = LoggerFactory.getLogger(IZSOAPTransportController.class);

  @Autowired
  protected TestStepService testStepService;

  @Autowired
  protected UserRepository userRepository;

  @Autowired
  protected TransactionService transactionService;

  @Autowired
  protected TransportConfigService transportConfigService;

  @Autowired
  private IZSOAPWebServiceClient webServiceClient;


  private final static String PROTOCOL = "soap";

  String SUMBIT_SINGLE_MESSAGE_TEMPLATE = null;

  public IZSOAPTransportController() throws IOException {
    SUMBIT_SINGLE_MESSAGE_TEMPLATE =
        IOUtils.toString(IsolatedTestingController.class
            .getResourceAsStream("/templates/SubmitSingleMessage.xml"));
  }


  @Transactional()
  @RequestMapping(value = "/user/{userId}/taInitiator", method = RequestMethod.POST)
  public Map<String, String> taInitiatorConfig(@PathVariable("userId") final Long userId)
      throws UserNotFoundException {
    logger.info("Fetching user ta initiator information ... ");
    User user = null;
    TransportConfig transportConfig = null;
    if (userId == null || (user = userRepository.findOne(userId)) == null) {
      throw new UserNotFoundException();
    }
    transportConfig = transportConfigService.findOneByUserAndProtocol(user.getId(), PROTOCOL);
    if (transportConfig == null) {
      transportConfig = transportConfigService.create(PROTOCOL);
      user.addConfig(transportConfig);
      userRepository.save(user);
      transportConfigService.save(transportConfig);
    }
    Map<String, String> config = transportConfig.getTaInitiator();
    return config;
  }

  @Transactional()
  @RequestMapping(value = "/user/{userId}/sutInitiator", method = RequestMethod.POST)
  public Map<String, String> sutInitiatorConfig(@PathVariable("userId") final Long userId,
      HttpServletRequest request) throws UserNotFoundException {
    logger.info("Fetching user information ... ");
    User user = null;
    TransportConfig transportConfig = null;
    if (userId == null || (user = userRepository.findOne(userId)) == null) {
      throw new UserNotFoundException();
    }
    transportConfig = transportConfigService.findOneByUserAndProtocol(user.getId(), PROTOCOL);
    if (transportConfig == null) {
      transportConfig = transportConfigService.create(PROTOCOL);
      user.addConfig(transportConfig);
      userRepository.save(user);
    }
    Map<String, String> config = transportConfig.getSutInitiator();
    if (config == null) {
      config = new HashMap<String, String>();
      transportConfig.setSutInitiator(config);
    }

    if (config.get("password") == null && config.get("username") == null) {
      config.put("username", "vendor_" + user.getId());
      config.put("password", "vendor_" + user.getId());
      config.put("facilityID", "vendor_" + user.getId());
    }

    if (config.get("faultPassword") == null && config.get("faultUsername") == null) {
      config.put("faultUsername", "faultUser_" + user.getId());
      config.put("faultPassword", "faultUser_" + user.getId());
    }

    if (config.get("endpoint") == null) {
      config.put("endpoint", Utils.getUrl(request) + "/ws/iisService");
    }
    transportConfigService.save(transportConfig);
    return config;
  }



  @Transactional()
  @RequestMapping(value = "/startListener", method = RequestMethod.POST)
  public boolean open(@RequestBody SendRequest request) {
    logger.info("Open transaction for user with id=" + request.getUserId()
        + " and of test step with id=" + request.getTestStepId());
    // Transaction transaction = searchTransaction(request);
    // if (transaction != null) {
    // transaction.init();
    // transaction.setTestStep(testStepService.findOne(request.getTestStepId())); // not needed for
    // // iz
    // transaction.setUser(userRepository.findOne(request.getUserId())); // not needed for iz
    // transaction.setProperties(request.getConfig());
    // transaction.setResponseMessageId(request.getResponseMessageId());
    // transactionRepository.saveAndFlush(transaction);
    // }
    // if (transaction == null) {
    // transaction = new Transaction();
    // transaction.setTestStep(testStepService.findOne(request.getTestStepId())); // not needed for
    // // iz
    // transaction.setUser(userRepository.findOne(request.getUserId())); // not needed for iz
    // transaction.setProperties(request.getConfig());
    // transaction.setResponseMessageId(request.getResponseMessageId());
    // }
    // transaction.init();
    // transactionRepository.saveAndFlush(transaction);
    return true;
  }

  @Transactional()
  @RequestMapping(value = "/stopListener", method = RequestMethod.POST)
  public boolean close(@RequestBody SendRequest request) {
    logger.info("Closing transaction for user with id=" + request.getUserId()
        + " and of test step with id=" + request.getTestStepId());
    // Transaction transaction = searchTransaction(request);
    // if (transaction != null) {
    // transaction.close();
    // transactionRepository.saveAndFlush(transaction);
    // }
    return true;
  }

  @RequestMapping(value = "/searchTransaction", method = RequestMethod.POST)
  public Transaction searchTransaction(@RequestBody SendRequest request) {
    logger.info("Get transaction of user with id=" + request.getUserId()
        + " and of testStep with id=" + request.getTestStepId());
    Map<String, String> criteria = new HashMap<String, String>();
    criteria.put("username", request.getConfig().get("username"));
    criteria.put("password", request.getConfig().get("password"));
    criteria.put("facilityID", request.getConfig().get("facilityID"));
    Transaction transaction = transactionService.findOneByProperties(criteria);
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
      TransportConfig config = transportConfigService.findOneByUserAndProtocol(userId, PROTOCOL);
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

      Transaction transaction = new Transaction();
      transaction.setTestStep(testStepService.findOne(testStepId));
      transaction.setUser(userRepository.findOne(userId));
      transaction.setOutgoing(outgoingMessage);
      transaction.setIncoming(incomingMessage);

      return transaction;
    } catch (Exception e1) {
      throw new TransportClientException("Failed to send the message." + e1.getMessage());
    }
  }


  public TestStepService getTestStepService() {
    return testStepService;
  }


  public void setTestStepService(TestStepService testStepService) {
    this.testStepService = testStepService;
  }


  public UserRepository getUserRepository() {
    return userRepository;
  }


  public void setUserRepository(UserRepository userRepository) {
    this.userRepository = userRepository;
  }


  public TransactionService getTransactionService() {
    return transactionService;
  }


  public void setTransactionService(TransactionService transactionService) {
    this.transactionService = transactionService;
  }


  public TransportConfigService getTransportConfigService() {
    return transportConfigService;
  }


  public void setTransportConfigService(TransportConfigService transportConfigService) {
    this.transportConfigService = transportConfigService;
  }


  public IZSOAPWebServiceClient getWebServiceClient() {
    return webServiceClient;
  }


  public void setWebServiceClient(IZSOAPWebServiceClient webServiceClient) {
    this.webServiceClient = webServiceClient;
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
