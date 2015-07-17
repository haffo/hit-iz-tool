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

import gov.nist.hit.core.domain.Transaction;
import gov.nist.hit.core.domain.TransactionStatus;
import gov.nist.hit.core.domain.User;
import gov.nist.hit.core.repo.TransactionRepository;
import gov.nist.hit.core.service.exception.DuplicateTokenIdException;
import gov.nist.hit.core.service.exception.UserTokenIdNotFoundException;
import gov.nist.hit.core.transport.TransportClient;
import gov.nist.hit.iz.domain.SecurityFaultCredentials;
import gov.nist.hit.iz.repo.SecurityFaultCredentialsRepository;
import gov.nist.hit.iz.web.model.UserCommand;
import gov.nist.hit.iz.web.utils.Utils;

import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Harold Affo (NIST)
 * 
 */

@RestController
@RequestMapping("/transaction")
public class TransactionController extends TestingController {

  static final Logger logger = LoggerFactory.getLogger(TransactionController.class);

  @Autowired
  private TransportClient transportClient;


  @Transactional()
  @RequestMapping(value = "/open", method = RequestMethod.POST)
  public boolean initIncoming(@RequestBody final User user) throws UserTokenIdNotFoundException {
    logger.info("Initializing transaction for username ... " + user.getUsername());
    Transaction transaction = transaction(user);
    if (transaction != null) {
      transaction.init();
      transactionRepository.saveAndFlush(transaction);
      return true;
    }
    return false;
  }

  @Transactional()
  @RequestMapping(value = "/close", method = RequestMethod.POST)
  public boolean clearIncoming(@RequestBody final User user) {
    logger.info("Closing transaction for username... " + user.getUsername());
    Transaction transaction = transaction(user);
    if (transaction != null) {
      transaction.close();
      transactionRepository.saveAndFlush(transaction);
    }
    return true;
  }

  @RequestMapping(method = RequestMethod.POST)
  public Transaction transaction(@RequestBody final User user) {
    logger.info("Get transaction of username ... " + user.getUsername());
    Transaction transaction =
        transactionRepository.findByUsernameAndPasswordAndFacilityID(user.getUsername(),
            user.getPassword(), user.getFacilityID());
    return transaction != null ? transaction : new Transaction();
  }

  @Autowired
  protected TransactionRepository transactionRepository;

  @Autowired
  protected SecurityFaultCredentialsRepository securityFaultCredentialsRepository;

  public TransactionRepository getTransactionRepository() {
    return transactionRepository;
  }

  public void setTransactionRepository(TransactionRepository transactionRepository) {
    this.transactionRepository = transactionRepository;
  }

  @ExceptionHandler(UserTokenIdNotFoundException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public String facilityIdNotFound(UserTokenIdNotFoundException ex) {
    logger.debug(ex.getMessage());
    return ex.getMessage();
  }

  @ExceptionHandler(DuplicateTokenIdException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public String DuplicateFacilityIdException(DuplicateTokenIdException ex) {
    logger.debug(ex.getMessage());
    return ex.getMessage();
  }

  @Transactional()
  @RequestMapping(value = "/initUser", method = RequestMethod.POST)
  public UserCommand info(@RequestBody final User userCommand, HttpServletRequest request) {
    logger.info("Fetching user information ... ");
    // User user = null;
    // Long id = userCommand.getId();
    //
    // if (id == null) {
    // user = new User();
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
    // SecurityFaultCredentials faultCredentials =
    // securityFaultCredentialsRepository.findOneByUserId(user.getId());
    // if (faultCredentials == null) {
    // faultCredentials = new SecurityFaultCredentials();
    // faultCredentials.setFaultUsername("faultUser_" + userId);
    // faultCredentials.setFaultPassword("faultPwd_" + userId);
    // faultCredentials.setUser(user);
    // securityFaultCredentialsRepository.saveAndFlush(faultCredentials);
    // }
    //
    // Transaction transaction = transactionRepository.findOneByUserId(userId);
    // if (transaction == null) {
    // transaction = new Transaction();
    // transaction.setUser(user);
    // }
    // transaction.setStatus(TransactionStatus.CLOSE);
    // transactionRepository.saveAndFlush(transaction);

    User user = null;
    List<User> users = userRepository.findAll();
    if (users == null || users.isEmpty()) {
      user = new User();
      user.setUsername("pilot");
      user.setPassword("pilot");
      user.setFacilityID("pilot");
      userRepository.saveAndFlush(user);
    } else {
      user = users.get(0);
    }
    Long userId = user.getId();
    SecurityFaultCredentials faultCredentials =
        securityFaultCredentialsRepository.findOneByUserId(user.getId());
    if (faultCredentials == null) {
      faultCredentials = new SecurityFaultCredentials();
      faultCredentials.setFaultUsername("pilot");
      faultCredentials.setFaultPassword("pilot");
      faultCredentials.setUser(user);
      securityFaultCredentialsRepository.saveAndFlush(faultCredentials);
    }
    Transaction transaction = transactionRepository.findOneByUserId(userId);
    if (transaction == null) {
      transaction = new Transaction();
      transaction.setUser(user);
    }
    transaction.setStatus(TransactionStatus.CLOSE);
    transactionRepository.saveAndFlush(transaction);
    return new UserCommand(user.getUsername(), user.getPassword(),
        faultCredentials.getFaultUsername(), faultCredentials.getFaultPassword(),
        user.getFacilityID(), Utils.getUrl(request) + "/ws/iisService");
  }

}
