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
package gov.nist.hit.iz.service.soap;

import gov.nist.hit.core.service.exception.SoapValidationReportException;
import gov.nist.hit.iz.service.SOAPValidationReportGenerator;

import java.io.IOException;

import org.apache.commons.io.IOUtils;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Service;

/**
 * @author Harold Affo (NIST)
 */

@Service
public class SOAPValidationReportGeneratorImpl extends SOAPValidationReportGenerator {

  private final static Logger logger = Logger.getLogger(SOAPValidationReportGeneratorImpl.class);

  private static final String HTML_XSL = "/xslt/SOAPHTML.xsl";

  private static final String PDF_XSL = "/xslt/SOAPHTML.xsl";

  public SOAPValidationReportGeneratorImpl() {

  }

  /**
   * @param htmlReport
   * @return
   */
  @Override
  public String addStyleSheet(String htmlReport) {
    StringBuffer sb = new StringBuffer();
    sb.append("<html xmlns='http://www.w3.org/1999/xhtml'>");
    sb.append("<head>");
    sb.append("<title>Message Validation Report</title>");
    sb.append("<meta http-equiv='Content-Type' content='text/html; charset=utf-8' />");
    sb.append("<style>.row4 a, .row3 a {color: #003399; text-decoration: underline;}");
    sb.append(".row4 a:hover, .row3 a:hover { color: #000000; text-decoration: underline;}");
    sb.append(".headerReport {width: 250px;}");
    sb.append(".row1 {vertical-align: top;background-color: #EFEFEF;width: 100px;}");
    sb.append(".row2 {background-color: #DEE3E7;width: 100px;}");
    sb.append(".row3 {background-color: #D1D7DC;vertical-align: top;}");
    sb.append(".row4 { background-color: #EFEFEF;vertical-align: top;}");
    sb.append(".row5 { background-color: #FFEC9D;vertical-align: top;}");
    sb.append(".forumline { background-color:#FFFFFF;border: 2px #006699 solid;width: 700px;}");
    sb.append(".maintitle {font-weight: bold;font-size: 22px;"
        + "font-family: Georgia, Verdana;text-decoration: none;line-height : 120%;color : #000000;}");
    sb.append("</style></head><body>");
    sb.append(htmlReport);
    sb.append("</body></html>");
    return sb.toString();
  }

  @Override
  public String getPdfConversionXslt() {
    try {
      return IOUtils.toString(SOAPValidationReportGeneratorImpl.class.getResourceAsStream(PDF_XSL));
    } catch (IOException e) {
      logger.error(e, e);
      throw new SoapValidationReportException(e.getMessage());
    }
  }

  @Override
  public String getHtmlConversionXslt() {
    try {
      return IOUtils
          .toString(SOAPValidationReportGeneratorImpl.class.getResourceAsStream(HTML_XSL));
    } catch (IOException e) {
      logger.error(e, e);
      throw new SoapValidationReportException(e.getMessage());
    }
  }

}
