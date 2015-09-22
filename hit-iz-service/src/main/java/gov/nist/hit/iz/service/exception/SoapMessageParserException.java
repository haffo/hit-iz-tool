package gov.nist.hit.iz.service.exception;

import gov.nist.hit.core.service.exception.MessageParserException;


public class SoapMessageParserException extends MessageParserException {

	private static final long serialVersionUID = -5030971870248560876L;

	public SoapMessageParserException(String message) {
		super(message);
	}

	public SoapMessageParserException(RuntimeException exception) {
		super(exception);
	}
 
	public SoapMessageParserException(Exception e) {
		super(e);
	}
}
