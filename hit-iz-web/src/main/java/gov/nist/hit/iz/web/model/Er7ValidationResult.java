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
package gov.nist.hit.iz.web.model;

import gov.nist.healthcare.core.validation.message.v2.MessageValidationResultV2;
import gov.nist.healthcare.validation.message.ReportHeader;
import gov.nist.healthcare.validation.message.hl7.v2.report.HL7V2MessageReport.MetaData;
import gov.nist.healthcare.validation.message.hl7.v2.report.HL7V2MessageReport.MetaData.TestCase;
import gov.nist.healthcare.validation.message.hl7.v2.report.HL7V2MessageValidationReportDocument;
import gov.nist.hit.core.domain.ValidationResultItem;

import java.util.ArrayList;
import java.util.Iterator;

import org.apache.log4j.Logger;

/**
 * Represents the data associated to a message validation.
 * 
 * @author Harold Affo (NIST)
 */
public class Er7ValidationResult extends
		gov.nist.hit.core.domain.ValidationResult {

	private static Logger logger = Logger.getLogger(Er7ValidationResult.class);

	public Er7ValidationResult() {
	}

	public Er7ValidationResult(MessageValidationResultV2 result, String title) {
		if (result != null) {
			xml = generateXml(title, result.getReport());
			errors = new ArrayList<ValidationResultItem>();
			Iterator<gov.nist.healthcare.core.validation.message.v2.MessageFailureV2> it = result
					.getErrors();
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
	private String generateXml(String title,
			HL7V2MessageValidationReportDocument report) {
		MetaData metaData = report.getHL7V2MessageValidationReport()
				.getSpecificReport().getMetaData();
		TestCase tc = metaData.addNewTestCase();
		tc.setName(title);
		ReportHeader header = report.getHL7V2MessageValidationReport()
				.getHeaderReport();
		header.setServiceProvider("NIST HL7 V2 Validation tool");
		xml = report.toString();
		return xml;
	}

	public ValidationResultItem getValidationResultItem(
			gov.nist.healthcare.core.validation.message.v2.MessageFailureV2 failure) {

		String description = failure.getDescription();
		int column = failure.getColumn();
		int line = failure.getLine();
		String path = failure.getPath();
		String failureSeverity = failure.getFailureSeverity() != null ? failure
				.getFailureSeverity().toString() : null;
		String elementContent = failure.getElementContent();
		String assertionDeclaration = failure.getAssertionDeclaration();
		String userComment = failure.getUserComment();
		String assertionResult = failure.getAssertionResult() != null ? failure
				.getAssertionResult().toString() : null;
		String failureType = failure.getFailureType() != null ? failure
				.getFailureType().toString() : null;

		return new ValidationResultItem(description, column, line, path,
				failureSeverity, elementContent, assertionDeclaration,
				userComment, assertionResult, failureType);
	}

}
