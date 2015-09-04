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

import gov.nist.hit.core.domain.Command;
import gov.nist.hit.core.service.MessageParser;
import gov.nist.hit.core.service.ValidationReportGenerator;
import gov.nist.hit.core.service.exception.MessageException;
import gov.nist.hit.core.service.exception.SoapValidationReportException;
import gov.nist.hit.iz.web.exception.EnvelopeException;

import java.io.IOException;
import java.io.InputStream;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Callable;

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
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * @author Harold Affo (NIST)
 * 
 */
@RequestMapping("/soap")
@RestController
public class SOAPController extends TestingController {

  static final Logger logger = LoggerFactory.getLogger(SOAPController.class);

  @Autowired
  @Qualifier("soapMessageParser")
  private MessageParser soapParser;

  @Autowired
  @Qualifier("soapReportGenerator")
  private ValidationReportGenerator reportService;

  public ValidationReportGenerator getReportService() {
    return reportService;
  }

  public void setReportService(ValidationReportGenerator reportService) {
    this.reportService = reportService;
  }

  private String createHtml(String xmlReport) {
    String htmlReport = reportService.toHTML(xmlReport);
    return htmlReport;
  }

  @RequestMapping(value = "/report/download/{format}", method = RequestMethod.POST,
      consumes = "application/x-www-form-urlencoded; charset=UTF-8")
  public String download(@PathVariable String format, @RequestParam("xmlReport") String xmlReport,
      HttpServletRequest request, HttpServletResponse response) {
    try {
      logger.info("Downloading validation report in " + format);
      if (xmlReport == null) {
        throw new SoapValidationReportException("No xml report found in the request");
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
        throw new SoapValidationReportException("Unsupported Message Validation Report format "
            + format);
      }
      FileCopyUtils.copy(content, response.getOutputStream());
    } catch (SoapValidationReportException | IOException e) {
      logger.debug("Failed to download the validation report ");
      throw new SoapValidationReportException("Cannot download the validation report");
    }
    return null;
  }

  @RequestMapping(value = "/report/generate/{format}", method = RequestMethod.POST,
      consumes = "application/x-www-form-urlencoded; charset=UTF-8")
  public Callable<Map<String, String>> generate(@PathVariable final String format,
      @RequestParam("xmlReport") final String xmlReport) {
    return new Callable<Map<String, String>>() {
      @Override
      public Map<String, String> call() throws Exception {
        logger.info("Generating validation report in " + format);
        if (xmlReport == null) {
          throw new SoapValidationReportException("No xml report found in the request");
        }
        if ("HTML".equalsIgnoreCase(format)) {
          HashMap<String, String> map = new HashMap<String, String>();
          map.put("htmlReport", createHtml(xmlReport));
          logger.info("Validation report in " + format + " Generated");
          return map;
        } else {
          throw new SoapValidationReportException("Unsupported Soap Validation Report format "
              + format);
        }
      }
    };
  }

  @RequestMapping(value = "/upload", method = RequestMethod.POST,
      consumes = {"multipart/form-data"})
  public Command upload(@RequestPart("file") MultipartFile xmlPart) {
    try {
      // Validate that it is an xml file
      return new Command(IOUtils.toString(xmlPart.getInputStream()));
    } catch (IOException e) {
      throw new EnvelopeException("Cannot upload the file provided");
    }
  }

  @RequestMapping(value = "/download", method = RequestMethod.POST,
      consumes = "application/x-www-form-urlencoded; charset=UTF-8")
  public String download(@RequestParam("envelope") String envelope, HttpServletRequest request,
      HttpServletResponse response) throws MessageException {
    try {
      logger.info("Downloading the envelope");
      InputStream content = IOUtils.toInputStream(envelope, "UTF-8");
      response.setContentType("text/plain");
      response.setHeader("Content-disposition",
          "attachment;filename=UserMessage" + new Date().getTime() + ".txt");
      FileCopyUtils.copy(content, response.getOutputStream());
    } catch (IOException e) {
      logger.debug("Failed to download the soapEnvelope ");
      throw new MessageException("Cannot download the content " + e.getMessage());
    }
    return null;
  }

}
