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

import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;

import javax.xml.datatype.DatatypeConfigurationException;
import javax.xml.soap.SOAPException;

import org.apache.log4j.Logger;

import gov.nist.hit.core.domain.ValidationResult;
import gov.nist.hit.core.domain.ValidationResultItem;
import gov.nist.hit.iz.domain.MessageFailureV3;
import gov.nist.hit.iz.domain.soap.SoapValidationResult;

/**
 * 
 * @author Harold Affo (NIST)
 */
public class SOAPValidationResult extends ValidationResult {

	private static Logger logger = Logger.getLogger(SOAPValidationResult.class);

	public SOAPValidationResult() {
	}

	public SOAPValidationResult(SoapValidationResult result)
			throws DatatypeConfigurationException, SOAPException, IOException {
		if (result != null) {
			xml = result.toXml();
			errors = new ArrayList<ValidationResultItem>();
			Iterator<MessageFailureV3> it = result.getErrors();
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

	public ValidationResultItem getValidationResultItem(gov.nist.hit.iz.domain.MessageFailureV3 failure) {

		String description = failure.getDescription();
		int column = failure.getColumn();
		int line = failure.getLine();
		String path = failure.getPath();
		String failureSeverity = failure.getFailureSeverity() != null ? failure.getFailureSeverity() : null;
		String elementContent = failure.getElementContent();
		String assertionDeclaration = failure.getAssertionDeclaration();
		String userComment = failure.getUserComment();
		String assertionResult = failure.getAssertionResult() != null ? failure.getAssertionResult() : null;
		String failureType = failure.getFailureType() != null ? failure.getFailureType().toString() : null;

		return new ValidationResultItem(description, column, line, path, failureSeverity, elementContent,
				assertionDeclaration, userComment, assertionResult, failureType);
	}

}
