package gov.nist.hit.iz.ws.server.interceptor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ws.client.WebServiceClientException;
import org.springframework.ws.client.support.interceptor.ClientInterceptor;
import org.springframework.ws.context.MessageContext;

public class ConnectivityTestClientInterceptor implements ClientInterceptor {
	final Logger logger = LoggerFactory.getLogger(ConnectivityTestClientInterceptor.class);

	@Override
	public boolean handleRequest(MessageContext messageContext) throws WebServiceClientException {
		logger.info("connectivityTest request received");
		return true;

	}

	@Override
	public boolean handleResponse(MessageContext messageContext) throws WebServiceClientException {
		logger.info("connectivityTest response sent");

		return true;
	}

	@Override
	public boolean handleFault(MessageContext messageContext) throws WebServiceClientException {
		logger.info("connectivityTest fault sent");
		return true;
	}

	@Override
	public void afterCompletion(MessageContext messageContext, Exception ex) throws WebServiceClientException {
	}

}
