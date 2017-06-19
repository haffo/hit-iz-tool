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

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import gov.nist.hit.core.service.Streamer;
import gov.nist.hit.iz.service.SOAPValidationReportGenerator;
import gov.nist.hit.iz.service.exception.SoapValidationReportException;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;

/**
 * @author Harold Affo (NIST)
 * 
 */
@RestController
@RequestMapping("/iz/report")
@Api(value = "Immunization SOAP Validation Report API", tags = "SOAP Validation Report")
public class SOAPReportController {

	static final Logger logger = LoggerFactory.getLogger(SOAPReportController.class);

	@Autowired
	private SOAPValidationReportGenerator reportService;

	@Autowired
	private Streamer streamer;

	private String createHtml(String xmlReport) {
		String htmlReport = reportService.toHTML(xmlReport);
		return htmlReport;
	}

	// @ApiOperation(value = "Download a SOAP validation report", nickname =
	// "downloadReport",
	// produces =
	// "application/msword,text/html,application/xml,application/pdf")
	@RequestMapping(value = "/download", method = RequestMethod.POST, consumes = "application/x-www-form-urlencoded; charset=UTF-8")
	public void downloadReport(
			@ApiParam(value = "the targeted format of the report", required = true) @RequestParam("format") String format,
			@ApiParam(value = "the title of the downloaded report", required = true) @RequestParam("title") String title,
			@ApiParam(value = "the xml validation report", required = true) @RequestParam("content") String xmlReport,
			HttpServletRequest request, HttpServletResponse response) {
		try {
			logger.info("Downloading validation report in " + format);
			if (format == null)
				throw new SoapValidationReportException("No format specified");
			if (xmlReport == null) {
				throw new SoapValidationReportException("No xml report found in the request");
			}
			InputStream content = null;
			String ext = format.toLowerCase();
			if ("HTML".equalsIgnoreCase(format)) {
				content = IOUtils.toInputStream(createHtml(xmlReport), "UTF-8");
				response.setContentType("text/html");
			} else if ("DOC".equalsIgnoreCase(format)) {
				content = IOUtils.toInputStream(createHtml(xmlReport), "UTF-8");
				response.setContentType("application/msword");
			} else if ("XML".equalsIgnoreCase(format)) {
				content = IOUtils.toInputStream(xmlReport, "UTF-8");
				response.setContentType("application/xml");
			} else if ("PDF".equalsIgnoreCase(format)) {
				content = reportService.toPDF(xmlReport);
				response.setContentType("application/pdf");
			} else {
				throw new SoapValidationReportException("Unsupported Message Validation Report format " + format);
			}
			response.setHeader("Content-disposition", "attachment;filename=" + title + "-ValidationReport." + ext);
			streamer.stream(response.getOutputStream(), content);
		} catch (SoapValidationReportException | IOException e) {
			logger.debug("Failed to download the validation report ");
			throw new SoapValidationReportException("Cannot download the validation report");
		}
	}

	@ApiOperation(value = "Generate an html SOAP validation report", nickname = "generateHTML")
	@RequestMapping(value = "/generate", method = RequestMethod.POST, consumes = "application/x-www-form-urlencoded; charset=UTF-8")
	public void generateHTML(HttpServletResponse response,
			@ApiParam(value = "the xml validation report", required = true) @RequestParam("content") final String xmlReport)
			throws IOException {
		logger.info("Generating HTML Validation report");
		if (xmlReport == null) {
			throw new SoapValidationReportException("No xml report found in the request");
		}
		HashMap<String, String> map = new HashMap<String, String>();
		map.put("htmlReport", createHtml(xmlReport));
		streamer.streamMap(response.getOutputStream(), map);

	}

}
