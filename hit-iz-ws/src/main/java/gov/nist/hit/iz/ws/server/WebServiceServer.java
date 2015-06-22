package gov.nist.hit.iz.ws.server;

import gov.nist.hit.core.domain.TransactionStatus;
import gov.nist.hit.core.repo.UserRepository;
import gov.nist.hit.core.transport.TransportServerException;
import gov.nist.hit.iz.repo.SoapConnectivityTransactionRepository;
import gov.nist.hit.iz.ws.jaxb.ConnectivityTestRequestType;
import gov.nist.hit.iz.ws.jaxb.ConnectivityTestResponseType;
import gov.nist.hit.iz.ws.jaxb.SubmitSingleMessageRequestType;
import gov.nist.hit.iz.ws.jaxb.SubmitSingleMessageResponseType;
import gov.nist.hit.iz.ws.utils.WsdlUtil;

import java.io.IOException;

import javax.xml.bind.JAXBException;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.oxm.XmlMappingException;
import org.springframework.ws.server.endpoint.annotation.Endpoint;
import org.springframework.ws.server.endpoint.annotation.PayloadRoot;
import org.springframework.ws.server.endpoint.annotation.RequestPayload;
import org.springframework.ws.server.endpoint.annotation.ResponsePayload;

@Endpoint
public class WebServiceServer implements TransportServer {

	private static final String NAMESPACE_URI = "urn:cdc:iisb:2011";

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private SoapConnectivityTransactionRepository transactionRepository;

	public UserRepository getUserRepository() {
		return userRepository;
	}

	public void setUserRepository(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	@Override
	@PayloadRoot(namespace = NAMESPACE_URI, localPart = "connectivityTest")
	@ResponsePayload
	public ConnectivityTestResponseType handle(
			@RequestPayload ConnectivityTestRequestType request) {
		ConnectivityTestResponseType response = new ConnectivityTestResponseType();
		response.setReturn(request.getEchoBack());
		return response;
	}

	@Override
	@PayloadRoot(namespace = NAMESPACE_URI, localPart = "submitSingleMessage")
	@ResponsePayload
	public SubmitSingleMessageResponseType handle(
			@RequestPayload SubmitSingleMessageRequestType request) {
		check(request);
		// SubmitSingleMessageResponseType response = new
		// SubmitSingleMessageResponseType();
		// response.setReturn(getPrecannedAck());
		return getPreCannedSubmitSingleMessageResponse();
	}

	private void check(SubmitSingleMessageRequestType request)
			throws SecurityException, TransportServerException {
		String username = request.getUsername();
		String password = request.getPassword();
		if (StringUtils.isEmpty(username) || StringUtils.isEmpty(password)) {
			throw new SecurityException("Missing Authentication Information");
		} else if (userRepository.findOneByUsernameAndPassword(username,
				password) == null) {
			throw new SecurityException("Invalid Authentication Information");
		} else if (!TransactionStatus.OPEN.equals(transactionRepository
				.getStatusByUsernameAndPassword(username, password))) {
			throw new TransportServerException(
					"Transaction not initialized correctly");
		}
	}

	private SubmitSingleMessageResponseType getPreCannedSubmitSingleMessageResponse() {
		SubmitSingleMessageResponseType response = null;
		try {
			String content = IOUtils
					.toString(WebServiceServer.class
							.getResourceAsStream("/ws/messages/SubmitSingleMessageResponse_Precanned.xml"));
			response = WsdlUtil.toSubmitSingleMessageResponse(content);
		} catch (IOException | XmlMappingException | JAXBException e) {
			throw new TransportServerException(
					"Sorry, Server Error. Failed to generate response message submitSingleMessageResponse");
		}
		return response;
	}
}
