package gov.nist.hit.iz.service.exception;

import gov.nist.hit.core.service.exception.ValidationReportException;


public class SoapValidationReportException extends ValidationReportException {
	private static final long serialVersionUID = 1L;

	public SoapValidationReportException(String message) {
		super(message);
	}

	public SoapValidationReportException(RuntimeException exception) {
		super(exception);
	}

	public SoapValidationReportException(ValidationReportException exception) {
		super(exception);
	}

}