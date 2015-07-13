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

import gov.nist.hit.core.service.ValidationReportGenerator;
import gov.nist.hit.core.service.exception.ValidationReportException;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Harold Affo (NIST)
 * 
 */
@RequestMapping("/report")
@RestController
public class ReportController {

  static final Logger logger = LoggerFactory.getLogger(ReportController.class);

  @Autowired
  @Qualifier("er7ReportGenerator")
  private ValidationReportGenerator reportService;

  @RequestMapping(value = "/generateAs/{format}", method = RequestMethod.POST,
      consumes = "application/x-www-form-urlencoded; charset=UTF-8")
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
      throw new ValidationReportException("Unsupported validation report format " + format);
    }
  }

  private String createHtml(String xmlReport) {
    String htmlReport = reportService.toHTML(xmlReport);
    return htmlReport;
  }

  @RequestMapping(value = "/downloadAs/{format}", method = RequestMethod.POST,
      consumes = "application/x-www-form-urlencoded; charset=UTF-8")
  public String download(@PathVariable String format, @RequestParam("xmlReport") String xmlReport,
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
        response
            .setHeader("Content-disposition", "attachment;filename=MessageValidationReport.doc");
      } else if ("XML".equalsIgnoreCase(format)) {
        content = IOUtils.toInputStream(xmlReport, "UTF-8");
        response.setContentType("application/xml");
        response
            .setHeader("Content-disposition", "attachment;filename=MessageValidationReport.xml");
      } else if ("PDF".equalsIgnoreCase(format)) {
        content = reportService.toPDF(xmlReport);
        response.setContentType("application/pdf");
        response
            .setHeader("Content-disposition", "attachment;filename=MessageValidationReport.pdf");
      } else {
        throw new ValidationReportException("Unsupported validation report format " + format);
      }
      FileCopyUtils.copy(content, response.getOutputStream());
    } catch (ValidationReportException | IOException e) {
      logger.debug("Failed to download the validation report ");
      throw new ValidationReportException("Failed to download the validation report");
    }
    return null;
  }

}
