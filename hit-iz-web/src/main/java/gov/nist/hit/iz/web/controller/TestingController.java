/**
 * This software was developed at the National Institute of Standards and Technology by employees
 * of the Federal Government in the course of their official duties. Pursuant to title 17 Section 105 of the
 * United States Code this software is not subject to copyright protection and is in the public domain.
 * This is an experimental system. NIST assumes no responsibility whatsoever for its use by other parties,
 * and makes no guarantees, expressed or implied, about its quality, reliability, or any other characteristic.
 * We would appreciate acknowledgement if the software is used. This software can be redistributed and/or
 * modified freely provided that any derivative works bear some notice that they are derived from it, and any
 * modified versions bear some notice that they have been modified.
 */

package gov.nist.hit.iz.web.controller;

import gov.nist.healthcare.core.validation.message.MessageValidationException;
import gov.nist.healthcare.tools.core.repo.SoapEnvelopeTestCaseRepository;
import gov.nist.healthcare.tools.core.repo.SoapEnvelopeTestPlanRepository;
import gov.nist.healthcare.tools.core.repo.UserRepository;
import gov.nist.healthcare.tools.core.services.exception.MessageParserException;
import gov.nist.healthcare.tools.core.services.exception.SoapValidationException;
import gov.nist.healthcare.tools.core.services.exception.TestCaseException;
import gov.nist.healthcare.tools.core.services.exception.ValidationException;
import gov.nist.healthcare.tools.core.services.exception.ValidationReportException;
import gov.nist.healthcare.tools.core.services.hl7.v2.message.Er7MessageParser;
import gov.nist.healthcare.tools.core.transport.TransportClientException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * @author Harold Affo (NIST)
 * 
 */
public abstract class TestingController {
	static final Logger logger = LoggerFactory
			.getLogger(TestingController.class);

	public TestingController() {
		super();
		// TODO Auto-generated constructor stub
	}

	@Autowired
	protected SoapEnvelopeTestCaseRepository testCaseRepository;

	@Autowired
	protected SoapEnvelopeTestPlanRepository testPlanRepository;

	@Autowired
	protected Er7MessageParser er7MessageParser;

	@Autowired
	protected UserRepository userRepository;

	public SoapEnvelopeTestCaseRepository getTestCaseRepository() {
		return testCaseRepository;
	}

	public void setTestCaseRepository(
			SoapEnvelopeTestCaseRepository testCaseRepository) {
		this.testCaseRepository = testCaseRepository;
	}

	public Er7MessageParser getEr7MessageParser() {
		return er7MessageParser;
	}

	public void setEr7MessageParser(Er7MessageParser er7MessageParser) {
		this.er7MessageParser = er7MessageParser;
	}

	public SoapEnvelopeTestPlanRepository getTestPlanRepository() {
		return testPlanRepository;
	}

	public void setTestPlanRepository(
			SoapEnvelopeTestPlanRepository testPlanRepository) {
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
		return "Sorry, an error occurred:" + ex.getMessage();
	}

	@ExceptionHandler(ValidationException.class)
	@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
	public String validationException(ValidationException ex) {
		logger.debug(ex.getMessage());
		ex.printStackTrace();
		return "Sorry, Message Validation Failed \n";
	}

	@ExceptionHandler(MessageValidationException.class)
	@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
	public String validationFailed(MessageValidationException ex) {
		logger.debug(ex.getMessage());
		return "Sorry, Message Validation Failed\n";
	}

	@ExceptionHandler(MessageParserException.class)
	@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
	public String MessageParserException(ValidationException ex) {
		logger.debug(ex.getMessage());
		return "Sorry, Message Parsing Failed: \n";
	}

	@ExceptionHandler(ValidationReportException.class)
	@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
	public String reportException(ValidationReportException ex) {
		logger.debug(ex.getMessage());
		return "Sorry, Exporting the report Failed.\n";
	}

	@ExceptionHandler(SoapValidationException.class)
	@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
	public String reportException(SoapValidationException ex) {
		logger.debug(ex.getMessage());
		return "Sorry, Validation Failed.\n";
	}

	@ExceptionHandler(TransportClientException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public String reportException(TransportClientException ex) {
		logger.debug(ex.getMessage());
		return "Sorry, connection failed: " + ex.getMessage();
	}

	/**
	 * Returns a Sort object which sorts persons in ascending order by using the
	 * last name.
	 * 
	 * @return
	 */
	protected Sort sortByNameAsc() {
		return new Sort(Sort.Direction.ASC, "name");
	}

}
