package gov.nist.hit.iz.service;

public interface Receiver {

	String echoBack(String request);

	String submitSingleMessage(String message);

}
