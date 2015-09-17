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

import gov.nist.healthcare.core.validation.message.v3.MessageFailureV3;
import gov.nist.healthcare.validation.message.ReportHeader;
import gov.nist.healthcare.validation.message.hl7.v3.report.HL7V3MessageValidationReportDocument;
import gov.nist.hit.core.domain.ValidationResult;
import gov.nist.hit.core.domain.ValidationResultItem;

import java.util.ArrayList;
import java.util.Iterator;

import org.apache.log4j.Logger;
import org.apache.xmlbeans.XmlException;

/**
 * 
 * @author Harold Affo (NIST)
 */
public class SOAPValidationResult extends ValidationResult {

  private static Logger logger = Logger.getLogger(SOAPValidationResult.class);


  public SOAPValidationResult() {}

  public SOAPValidationResult(gov.nist.healthcare.core.validation.soap.SoapValidationResult result,
      String title) {
    if (result != null) {

      xml = generateXml(title, result.getReport().toString());
      errors = new ArrayList<ValidationResultItem>();
      Iterator<gov.nist.healthcare.core.validation.message.v3.MessageFailureV3> it =
          result.getErrors();
      while (it.hasNext()) {
        errors.add(getValidationResultItem(it.next()));
      }

      alerts = new ArrayList<ValidationResultItem>();
      it = result.getAlerts();
      while (it.hasNext()) {
        alerts.add(getValidationResultItem(it.next()));
      }

      warnings = new ArrayList<ValidationResultItem>();
      it = result.getWarnings();
      while (it.hasNext()) {
        warnings.add(getValidationResultItem(it.next()));
      }

      affirmatives = new ArrayList<ValidationResultItem>();
      it = result.getAffirmatives();
      while (it.hasNext()) {
        affirmatives.add(getValidationResultItem(it.next()));
      }

      ignores = new ArrayList<ValidationResultItem>();
      it = result.getIgnores();
      while (it.hasNext()) {
        ignores.add(getValidationResultItem(it.next()));
      }
    }
  }



  /**
   * update testcase and testing tool meta data information
   */
  private String generateXml(String title, String xml) {
    try {
      HL7V3MessageValidationReportDocument report =
          HL7V3MessageValidationReportDocument.Factory.parse(xml);

      // gov.nist.healthcare.validation.message.hl7.v3.report.HL7V3MessageReport.MetaData
      // metaData = report
      // .getHL7V3MessageValidationReport().getSpecificReport()
      // .getMetaData();
      // metaData.set
      // metaData.setDescription("No context specified for this type of validation");

      ReportHeader header = report.getHL7V3MessageValidationReport().getHeaderReport();
      header.setServiceProvider("NIST SOAP Validation tool");

      xml = report.toString();
    } catch (XmlException e) {
      logger.error("Failed to get the test story xml content");
      logger.error(e, e);
    }
    return xml;
  }


  public ValidationResultItem getValidationResultItem(MessageFailureV3 failure) {

    String description = failure.getDescription();
    int column = failure.getColumn();
    int line = failure.getLine();
    String path = failure.getPath();
    String failureSeverity =
        failure.getFailureSeverity() != null ? failure.getFailureSeverity().toString() : null;
    String elementContent = failure.getElementContent();
    String assertionDeclaration = failure.getAssertionDeclaration();
    String userComment = failure.getUserComment();
    String assertionResult =
        failure.getAssertionResult() != null ? failure.getAssertionResult().toString() : null;
    String failureType =
        failure.getFailureType() != null ? failure.getFailureType().toString() : null;

    return new ValidationResultItem(description, column, line, path, failureSeverity,
        elementContent, assertionDeclaration, userComment, assertionResult, failureType);
  }



}
