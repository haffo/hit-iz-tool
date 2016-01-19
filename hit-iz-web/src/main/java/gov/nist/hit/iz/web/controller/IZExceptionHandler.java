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

import gov.nist.hit.core.transport.exception.TransportClientException;
import gov.nist.hit.iz.service.exception.SoapValidationException;
import gov.nist.hit.iz.service.exception.SoapValidationReportException;
import gov.nist.hit.iz.web.exception.SOAPEnvelopeException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * @author Harold Affo (NIST)
 * 
 */
@ControllerAdvice
public class IZExceptionHandler {
  static final Logger logger = LoggerFactory.getLogger(IZExceptionHandler.class);

  public IZExceptionHandler() {
    super();
  }

  @ResponseBody
  @ExceptionHandler(SoapValidationException.class)
  @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
  public String soapValidationException(SoapValidationException ex) {
    logger.debug(ex.getMessage());
    return "Sorry, validation Failed.\n";
  }

  @ResponseBody
  @ExceptionHandler(TransportClientException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public String transportClientException(TransportClientException ex) {
    logger.debug(ex.getMessage());
    return "Sorry, connection failed.";
  }

  @ResponseBody
  @ExceptionHandler(SoapValidationReportException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public String reportException(SoapValidationReportException ex) {
    logger.debug(ex.getMessage());
    return "Sorry, validation failed.\n";
  }

  @ResponseBody
  @ExceptionHandler(SOAPEnvelopeException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public String soapException(SOAPEnvelopeException ex) {
    logger.debug(ex.getMessage());
    return "Sorry, an issue occured";
  }


}
