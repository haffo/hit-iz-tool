package gov.nist.hit.iz.domain;

public enum IZValidationPhase {
	envelope, connectivityTest_Request, connectivityTest_Response, submitSingleMessage_Request, submitSingleMessage_Response, MessageTooLargeFault, SecurityFault, UnsupportedOperationFault, UnknownFault
}
