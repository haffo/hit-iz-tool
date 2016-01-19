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
import gov.nist.hit.core.domain.TestStep;
import gov.nist.hit.core.domain.Transaction;
import gov.nist.hit.core.domain.TransportConfig;
import gov.nist.hit.core.domain.TransportMessage;
import gov.nist.hit.core.domain.TransportRequest;
import gov.nist.hit.core.domain.User;
import gov.nist.hit.core.domain.util.XmlUtil;
import gov.nist.hit.core.service.TestStepService;
import gov.nist.hit.core.service.TransactionService;
import gov.nist.hit.core.service.TransportConfigService;
import gov.nist.hit.core.service.TransportMessageService;
import gov.nist.hit.core.service.UserService;
import gov.nist.hit.core.service.exception.DuplicateTokenIdException;
import gov.nist.hit.core.service.exception.TestCaseException;
import gov.nist.hit.core.service.exception.TransportException;
import gov.nist.hit.core.service.exception.UserNotFoundException;
import gov.nist.hit.core.service.exception.UserTokenIdNotFoundException;
import gov.nist.hit.core.transport.exception.TransportClientException;
import gov.nist.hit.iz.service.util.ConnectivityUtil;
import gov.nist.hit.iz.web.utils.Utils;
import gov.nist.hit.iz.ws.client.IZSOAPWebServiceClient;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

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
  protected UserService userService;

  @Autowired
  protected TransactionService transactionService;

  @Autowired
  protected TransportMessageService transportMessageService;

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
  @RequestMapping(value = "/taInitiator", method = RequestMethod.POST)
  public Map<String, String> taInitiatorConfig(HttpSession session) throws UserNotFoundException {
    logger.info("Fetching user ta initiator information ... ");
    Long userId = SessionContext.getCurrentUserId(session);
    User user = null;
    TransportConfig transportConfig = null;
    if (userId == null || (user = userService.findOne(userId)) == null) {
      throw new UserNotFoundException();
    }
    transportConfig = transportConfigService.findOneByUserAndProtocol(user.getId(), PROTOCOL);
    if (transportConfig == null) {
      transportConfig = transportConfigService.create(PROTOCOL);
      user.addConfig(transportConfig);
      userService.save(user);
      transportConfigService.save(transportConfig);
    }
    Map<String, String> config = transportConfig.getTaInitiator();
    return config;
  }

  @Transactional()
  @RequestMapping(value = "/sutInitiator", method = RequestMethod.POST)
  public Map<String, String> sutInitiatorConfig(HttpSession session, HttpServletRequest request)
      throws UserNotFoundException {
    logger.info("Fetching user information ... ");
    Long userId = SessionContext.getCurrentUserId(session);
    User user = null;
    if (userId == null || (user = userService.findOne(userId)) == null) {
      throw new UserNotFoundException();
    }

    TransportConfig transportConfig =
        transportConfigService.findOneByUserAndProtocol(userId, PROTOCOL);
    if (transportConfig == null) {
      transportConfig = transportConfigService.create(PROTOCOL);
      user.addConfig(transportConfig);
      userService.save(user);
    }
    Map<String, String> config = transportConfig.getSutInitiator();
    if (config == null) {
      config = new HashMap<String, String>();
      transportConfig.setSutInitiator(config);
    }

    int token = new Random().nextInt(999);
    if (config.get("password") == null && config.get("username") == null) {
      config.put("username", "vendor_" + user.getId() + "_" + token);
      config.put("password", "vendor_" + user.getId() + "_" + token);
      config.put("facilityID", "vendor_" + user.getId() + "_" + token);
    }
    if (config.get("faultPassword") == null && config.get("faultUsername") == null) {
      config.put("faultUsername", "fault_vendor_" + user.getId() + "_" + token);
      config.put("faultPassword", "fault_vendor_" + user.getId() + "_" + token);
    }
    if (config.get("endpoint") == null) {
      config.put("endpoint", Utils.getUrl(request) + "/ws/iisService");
    }
    transportConfigService.save(transportConfig);
    return config;
  }

  @Transactional
  @RequestMapping(value = "/startListener", method = RequestMethod.POST)
  public boolean startListener(@RequestBody TransportRequest request, HttpSession session)
      throws UserNotFoundException {
    logger.info("Starting listener");
    Long userId = SessionContext.getCurrentUserId(session);
    if (userId == null || (userService.findOne(userId)) == null) {
      throw new UserNotFoundException();
    }
    if (request.getResponseMessageId() == null)
      throw new gov.nist.hit.core.service.exception.TransportException("Response message not found");
    removeUserTransaction(userId);

    TransportMessage transportMessage = new TransportMessage();
    transportMessage.setMessageId(request.getResponseMessageId());
    Map<String, String> config = new HashMap<String, String>();
    config.putAll(getSutInitiatorConfig(userId));
    transportMessage.setProperties(config);
    transportMessageService.save(transportMessage);
    return true;
  }

  @Transactional
  @RequestMapping(value = "/stopListener", method = RequestMethod.POST)
  public boolean stopListener(@RequestBody TransportRequest request, HttpSession session)
      throws UserNotFoundException {
    logger.info("Stopping listener ");
    Long userId = SessionContext.getCurrentUserId(session);
    if (userId == null || (userService.findOne(userId)) == null) {
      throw new UserNotFoundException();
    }
    removeUserTransaction(userId);
    return true;
  }

  @Transactional
  private boolean removeUserTransaction(Long userId) {
    Map<String, String> config = getSutInitiatorConfig(userId);
    List<TransportMessage> transportMessages = transportMessageService.findAllByProperties(config);
    if (transportMessages != null) {
      transportMessageService.delete(transportMessages);
    }
    List<Transaction> transactions = transactionService.findAllByProperties(config);
    if (transactions != null) {
      transactionService.delete(transactions);
    }
    return true;
  }

  private Map<String, String> getSutInitiatorConfig(Long userId) {
    TransportConfig config = transportConfigService.findOneByUserAndProtocol(userId, PROTOCOL);
    Map<String, String> sutInitiator = config != null ? config.getSutInitiator() : null;
    if (sutInitiator == null || sutInitiator.isEmpty())
      throw new gov.nist.hit.core.service.exception.TransportException(
          "No System Under Test configuration info found");
    return sutInitiator;
  }

  @RequestMapping(value = "/searchTransaction", method = RequestMethod.POST)
  public Transaction searchTransaction(@RequestBody TransportRequest request) {
    logger.info("Searching transaction...");
    Map<String, String> criteria = new HashMap<String, String>();
    criteria.put("username", request.getConfig().get("username"));
    criteria.put("password", request.getConfig().get("password"));
    criteria.put("facilityID", request.getConfig().get("facilityID"));
    Transaction transaction = transactionService.findOneByProperties(criteria);
    return transaction;
  }

  @Transactional()
  @RequestMapping(value = "/send", method = RequestMethod.POST)
  public Transaction send(@RequestBody TransportRequest request, HttpSession session)
      throws TransportClientException {
    logger.info("Sending message");
    try {

      if (request.getConfig().get("endpoint") == null
          || "".equals(request.getConfig().get("endpoint"))) {
        throw new TransportException("No endpoint specified");
      }

      Long userId = SessionContext.getCurrentUserId(session);
      Long testStepId = request.getTestStepId();
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
      transaction.setOutgoing(outgoingMessage);
      transaction.setIncoming(incomingMessage);

      return transaction;
    } catch (Exception e1) {
      throw new TransportException("Failed to send the message." + e1.getMessage());
    }
  }

  public TestStepService getTestStepService() {
    return testStepService;
  }


  public void setTestStepService(TestStepService testStepService) {
    this.testStepService = testStepService;
  }



  public UserService getUserService() {
    return userService;
  }


  public void setUserService(UserService userService) {
    this.userService = userService;
  }


  public TransportMessageService getTransportMessageService() {
    return transportMessageService;
  }


  public void setTransportMessageService(TransportMessageService transportMessageService) {
    this.transportMessageService = transportMessageService;
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
