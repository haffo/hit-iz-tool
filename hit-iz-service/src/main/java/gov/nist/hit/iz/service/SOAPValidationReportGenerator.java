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
package gov.nist.hit.iz.service;

import gov.nist.hit.core.service.exception.ValidationReportException;
import gov.nist.hit.core.service.util.HtmlUtil;
import gov.nist.hit.iz.service.exception.SoapValidationReportException;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.StringReader;

import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.TransformerFactoryConfigurationError;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;

import org.apache.commons.io.IOUtils;
import org.apache.log4j.Logger;
import org.xhtmlrenderer.pdf.ITextRenderer;

/**
 * @author Harold Affo (NIST)
 */

public abstract class SOAPValidationReportGenerator {

  private final static Logger logger = Logger.getLogger(SOAPValidationReportGenerator.class);

  private static final String HTML_XSL = "/xslt/SOAPHTML.xsl";

  private static final String PDF_XSL = "/xslt/SOAPHTML.xsl";

  public SOAPValidationReportGenerator() {

  }

  /**
   * @param htmlReport
   * @return
   */
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

  public String getPdfConversionXslt() {
    try {
      return IOUtils.toString(SOAPValidationReportGenerator.class.getResourceAsStream(PDF_XSL));
    } catch (IOException e) {
      logger.error(e, e);
      throw new SoapValidationReportException(e.getMessage());
    }
  }

  public String getHtmlConversionXslt() {
    try {
      return IOUtils.toString(SOAPValidationReportGenerator.class.getResourceAsStream(HTML_XSL));
    } catch (IOException e) {
      logger.error(e, e);
      throw new SoapValidationReportException(e.getMessage());
    }
  }


  /**
   * convert xml to pdf
   * 
   * @param xmlReport
   * @return
   */
  public InputStream toPDF(String xml) throws ValidationReportException {
    try {
      String xhtml = toXHTML(xml).replaceAll("<br>", "<br/>");
      ITextRenderer renderer = new ITextRenderer();
      renderer.setDocumentFromString(xhtml);
      renderer.layout();
      File temp = File.createTempFile("MessageValidationReport", ".pdf");
      temp.deleteOnExit();
      OutputStream os;
      os = new FileOutputStream(temp);
      renderer.createPDF(os);
      os.close();
      return new FileInputStream(temp);
    } catch (Exception e) {
      throw new ValidationReportException(e);
    } catch (TransformerFactoryConfigurationError e) {
      throw new ValidationReportException(e.getMessage());
    }
  }

  /**
   * convert xml to html report
   * 
   * @param validationReport
   * @return
   * @throws Exception
   */
  public String toHTML(String xml) throws ValidationReportException {
    try {
      Transformer transformer =
          TransformerFactory.newInstance().newTransformer(
              new StreamSource(new StringReader(getHtmlConversionXslt())));
      StreamSource source = new StreamSource(new StringReader(xml));
      ByteArrayOutputStream resultStream = new ByteArrayOutputStream();
      StreamResult result = new StreamResult(resultStream);
      transformer.transform(source, result);
      String htmlReport = HtmlUtil.repairStyle(new String(resultStream.toByteArray()));
      logger.info("HTML validation report generated");
      return addStyleSheet(htmlReport);
    } catch (Exception e) {
      throw new ValidationReportException(e);
    } catch (TransformerFactoryConfigurationError e) {
      throw new ValidationReportException(e.getMessage());
    }
  }

  /**
   * convert xml to xhtml report
   * 
   * @param xmlReport
   * @return
   * @throws Exception
   */
  public String toXHTML(String xml) throws ValidationReportException {
    try {
      StringBuffer bf = new StringBuffer();
      bf.append("<?xml version='1.0' encoding='UTF-8'?>");
      bf.append(xml);
      Transformer transformer =
          TransformerFactory.newInstance().newTransformer(
              new StreamSource(new StringReader(getPdfConversionXslt())));
      StreamSource source = new StreamSource(new StringReader(bf.toString()));
      ByteArrayOutputStream resultStream = new ByteArrayOutputStream();
      StreamResult result = new StreamResult(resultStream);
      transformer.transform(source, result);
      String html = HtmlUtil.repairStyle(new String(resultStream.toByteArray()));
      logger.info("XHTML validation report generated");
      return addStyleSheet(html);
    } catch (Exception e) {
      throw new ValidationReportException(e);
    } catch (TransformerFactoryConfigurationError e) {
      throw new ValidationReportException(e.getMessage());
    }
  }

}
