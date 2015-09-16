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

import gov.nist.healthcare.core.validation.message.MessageValidationException;
import gov.nist.hit.core.repo.UserRepository;
import gov.nist.hit.core.service.exception.MessageParserException;
import gov.nist.hit.core.service.exception.ProfileParserException;
import gov.nist.hit.core.service.exception.SoapValidationException;
import gov.nist.hit.core.service.exception.SoapValidationReportException;
import gov.nist.hit.core.service.exception.TestCaseException;
import gov.nist.hit.core.service.exception.ValidationReportException;
import gov.nist.hit.core.service.exception.XmlFormatterException;
import gov.nist.hit.core.service.exception.XmlParserException;
import gov.nist.hit.core.transport.TransportClientException;
import gov.nist.hit.iz.repo.SOAPEnvelopeTestCaseRepository;
import gov.nist.hit.iz.repo.SOAPEnvelopeTestPlanRepository;
import gov.nist.hit.iz.web.exception.SOAPEnvelopeException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * @author Harold Affo (NIST)
 * 
 */
public abstract class TestingController {
  static final Logger logger = LoggerFactory.getLogger(TestingController.class);

  public TestingController() {
    super();
    // TODO Auto-generated constructor stub
  }

  @Autowired
  protected SOAPEnvelopeTestCaseRepository testCaseRepository;

  @Autowired
  protected SOAPEnvelopeTestPlanRepository testPlanRepository;

  @Autowired
  protected UserRepository userRepository;

  public SOAPEnvelopeTestCaseRepository getTestCaseRepository() {
    return testCaseRepository;
  }

  public void setTestCaseRepository(SOAPEnvelopeTestCaseRepository testCaseRepository) {
    this.testCaseRepository = testCaseRepository;
  }



  public SOAPEnvelopeTestPlanRepository getTestPlanRepository() {
    return testPlanRepository;
  }

  public void setTestPlanRepository(SOAPEnvelopeTestPlanRepository testPlanRepository) {
    this.testPlanRepository = testPlanRepository;
  }

  public UserRepository getUserRepository() {
    return userRepository;
  }

  public void setUserRepository(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @ExceptionHandler(Exception.class)
  @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
  public String exception(Exception ex) {
    logger.debug(ex.getMessage());
    return "Sorry, an error occurred";
  }

  @ExceptionHandler(TestCaseException.class)
  @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
  public String exception(TestCaseException ex) {
    logger.debug(ex.getMessage());
    return "Sorry, an error occurred";
  }

  @ExceptionHandler(MessageValidationException.class)
  @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
  public String messageValidationException(MessageValidationException ex) {
    logger.debug(ex.getMessage());
    ex.printStackTrace();
    return "Sorry, Message validation failed \n";
  }

  @ExceptionHandler(MessageParserException.class)
  @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
  public String MessageParserException(MessageValidationException ex) {
    logger.debug(ex.getMessage());
    return "Sorry, message parsing failed: \n";
  }

  @ExceptionHandler(ValidationReportException.class)
  @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
  public String reportException(ValidationReportException ex) {
    logger.debug(ex.getMessage());
    return "Sorry, exporting the report Failed.\n";
  }

  @ExceptionHandler(SoapValidationException.class)
  @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
  public String reportException(SoapValidationException ex) {
    logger.debug(ex.getMessage());
    return "Sorry, validation Failed.\n";
  }

  @ExceptionHandler(TransportClientException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public String reportException(TransportClientException ex) {
    logger.debug(ex.getMessage());
    return "Sorry, connection failed.";
  }

  @ExceptionHandler(ProfileParserException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public String profileParserExeption(ProfileParserException ex) {
    logger.debug(ex.getMessage());
    return "Sorry, integrationProfile cannot be parsed.\n";
  }

  @ExceptionHandler(SoapValidationReportException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  @ResponseBody
  public String reportException(SoapValidationReportException ex) {
    logger.debug(ex.getMessage());
    return "Sorry, validation failed.\n";
  }

  @ExceptionHandler(SOAPEnvelopeException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public String soapException(SOAPEnvelopeException ex) {
    logger.debug(ex.getMessage());
    return "Sorry, an issue occured";
  }

  @ExceptionHandler(XmlParserException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public String xmlParserException(XmlParserException ex) {
    logger.debug(ex.getMessage());
    return "Malformed xml content.";
  }

  @ExceptionHandler(XmlFormatterException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public String xmlFormatterException(XmlFormatterException ex) {
    logger.debug(ex.getMessage());
    return "Malformed xml content.";
  }

  /**
   * Returns a Sort object which sorts persons in ascending order by using the last name.
   * 
   * @return
   */
  protected Sort sortByNameAsc() {
    return new Sort(Sort.Direction.ASC, "name");
  }

}
