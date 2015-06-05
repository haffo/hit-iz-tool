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
import gov.nist.healthcare.tools.core.models.Json;
import gov.nist.healthcare.tools.core.models.TestContext;
import gov.nist.healthcare.tools.core.repo.DataInstanceTestStepRepository;
import gov.nist.healthcare.tools.core.repo.TestContextRepository;
import gov.nist.healthcare.tools.core.services.exception.MessageException;
import gov.nist.healthcare.tools.core.services.exception.MessageParserException;
import gov.nist.healthcare.tools.core.services.exception.ValidationException;
import gov.nist.healthcare.tools.core.services.exception.ValidationReportException;
import gov.nist.healthcare.tools.core.services.hl7.v2.message.Er7MessageValidator;
import gov.nist.healthcare.tools.core.services.hl7.v2.message.Er7ValidationReportGenerator;
import gov.nist.hit.iz.service.exception.TestCaseException;
import gov.nist.hit.iz.web.model.Er7MessageCommand;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Harold Affo (NIST)
 * 
 */
@RequestMapping("datainstance")
@RestController
public class DataInstanceController extends TestingController {

	static final Logger logger = LoggerFactory
			.getLogger(DataInstanceController.class);

	@Autowired
	private TestContextRepository testContextRepository;

	@Autowired
	private DataInstanceTestStepRepository testStepRepository;

	@Autowired
	private Er7MessageValidator messageValidator;

	@Autowired
	private Er7ValidationReportGenerator reportService;

	public Er7ValidationReportGenerator getReportService() {
		return reportService;
	}

	public Er7MessageValidator getMessageValidator() {
		return messageValidator;
	}

	public void setMessageValidator(Er7MessageValidator messageValidator) {
		this.messageValidator = messageValidator;
	}

	public void setReportService(Er7ValidationReportGenerator reportService) {
		this.reportService = reportService;
	}

	@RequestMapping(value = "/message/parse", method = RequestMethod.POST)
	public List<gov.nist.healthcare.tools.core.models.MessageElement> parse(
			@RequestBody final Er7MessageCommand command)
			throws MessageParserException {
		try {
			logger.info("Parsing message");
			TestContext testContext = testContext(command.getTestCaseId());
			String er7Message = getMessageContent(command);
			return er7MessageParser.parse(er7Message,
					testContext.getProfile().getProfileXml()).getElements();
		} catch (MessageException e) {
			throw new MessageParserException(e.getMessage());
		}

	}

	private TestContext testContext(Long testContextId) {
		logger.info("Fetching testContext from testCaseId=" + testContextId);
		TestContext testContext = testContextRepository.findOne(testContextId);
		if (testContext == null)
			throw new TestCaseException(testContextId);
		return testContext;
	}

	@RequestMapping(value = "/message/validate", method = RequestMethod.POST)
	public Json validate(@RequestBody final Er7MessageCommand command)
			throws MessageValidationException {
		try {
			TestContext testContext = testContext(command.getTestCaseId());
			String res = messageValidator.validatetoJson(command.getName(),
					getMessageContent(command), testContext.getProfile()
							.getProfileXml(), testContext.getConstraints()
							.getConstraintContent(), testContext
							.getValueSetLibrary().getValueSetXml());
			return new Json(res);
		} catch (MessageException e) {
			throw new MessageValidationException(e.getMessage());
		} catch (ValidationException e) {
			throw new MessageValidationException(e.getMessage());
		}
	}

	// @RequestMapping(value = "/message/dqaValidate", method =
	// RequestMethod.POST)
	// public CompactReportModel dqaValidate(
	// @RequestBody final Er7MessageCommand command) {
	// CompactReportModel crm = ProcessMessageHL7.process(
	// command.getEr7Message(), command.getFacilityId());
	// return crm;
	// }

	public static String getMessageContent(Er7MessageCommand command)
			throws MessageException {
		String message = command.getEr7Message();
		if (message == null) {
			throw new MessageException("No message provided");
		}
		return message;
	}

	@RequestMapping(value = "/report/generate/{format}", method = RequestMethod.POST, consumes = "application/x-www-form-urlencoded; charset=UTF-8")
	public Map<String, String> generate(@PathVariable final String format,
			@RequestParam("xmlReport") final String xmlReport) {
		logger.info("Generating validation report in " + format);
		if (xmlReport == null) {
			throw new ValidationReportException("No xml report provided");
		}
		if ("HTML".equalsIgnoreCase(format)) {
			HashMap<String, String> map = new HashMap<String, String>();
			map.put("htmlReport", createHtml(xmlReport));
			logger.info(format + " validation report generated!");
			return map;
		} else {
			throw new ValidationReportException(
					"Unsupported validation report format " + format);
		}
	}

	private String createHtml(String xmlReport) {
		String htmlReport = reportService.toHTML(xmlReport);
		return htmlReport;
	}

	@RequestMapping(value = "/report/download/{format}", method = RequestMethod.POST, consumes = "application/x-www-form-urlencoded; charset=UTF-8")
	public String download(@PathVariable String format,
			@RequestParam("xmlReport") String xmlReport,
			HttpServletRequest request, HttpServletResponse response) {
		try {
			logger.info("Downloading validation report in " + format);
			if (xmlReport == null) {
				throw new ValidationReportException("No report generated");
			}
			InputStream content = null;

			if ("HTML".equalsIgnoreCase(format)) {
				content = IOUtils.toInputStream(createHtml(xmlReport), "UTF-8");
				response.setContentType("text/html");
				response.setHeader("Content-disposition",
						"attachment;filename=MessageValidationReport.html");
			} else if ("DOC".equalsIgnoreCase(format)) {
				content = IOUtils.toInputStream(createHtml(xmlReport), "UTF-8");
				response.setContentType("application/msword");
				response.setHeader("Content-disposition",
						"attachment;filename=MessageValidationReport.doc");
			} else if ("XML".equalsIgnoreCase(format)) {
				content = IOUtils.toInputStream(xmlReport, "UTF-8");
				response.setContentType("application/xml");
				response.setHeader("Content-disposition",
						"attachment;filename=MessageValidationReport.xml");
			} else if ("PDF".equalsIgnoreCase(format)) {
				content = reportService.toPDF(xmlReport);
				response.setContentType("application/pdf");
				response.setHeader("Content-disposition",
						"attachment;filename=MessageValidationReport.pdf");
			} else {
				throw new ValidationReportException(
						"Unsupported validation report format " + format);
			}
			FileCopyUtils.copy(content, response.getOutputStream());
		} catch (ValidationReportException | IOException e) {
			logger.debug("Failed to download the validation report ");
			throw new ValidationReportException(
					"Failed to download the validation report");
		}
		return null;
	}

}
