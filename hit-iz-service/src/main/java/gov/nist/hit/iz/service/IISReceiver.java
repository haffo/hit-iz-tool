package gov.nist.hit.iz.service;

public class IISReceiver implements Receiver {

	public IISReceiver() {
	}

	@Override
	public String echoBack(String echoMessage) {
		return echoMessage;
	}

	@Override
	public String submitSingleMessage(String hl7Message) {
		// TODO Auto-generated method stub
		return "Message Submitted";
	}

}
