package gov.nist.hit.iz.service.exception;

public class TestCaseException extends RuntimeException {
	private static final long serialVersionUID = 1L;

	public TestCaseException(Long tcaseId) {
		super("TestCase '" + tcaseId + "' not found.");
	}

	public TestCaseException(String error) {
		super(error);
	}
}
