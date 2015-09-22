package gov.nist.hit.iz.service.exception;

public class SoapException extends Exception {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public SoapException(String message) {
		super(message);
	}

	public SoapException(RuntimeException exception) {
		super(exception);
	}

	public SoapException(Exception e) {
		super(e);
	}
}
