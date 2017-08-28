package gov.nist.hit.iz.ws.server.interceptor;

import java.io.ByteArrayOutputStream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ws.WebServiceMessage;
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
		addMessages(messageContext);
		return true;
	}

	@Override
	public boolean handleFault(MessageContext messageContext) throws WebServiceClientException {
		addMessages(messageContext);
		return true;
	}

	@Override
	public void afterCompletion(MessageContext messageContext, Exception ex) throws WebServiceClientException {
	}

	private void addMessages(String request, String response) {
		try {
			logger.info("connectivityTest request received:\n");
			logger.info(request + "\n");
			logger.info("connectivityTest response sent:\n");
			logger.info(response + "\n");
		} catch (Exception e) {
		}
	}

	private void addMessages(MessageContext messageContext) {
		addMessages(toString(messageContext.getRequest()), toString(messageContext.getResponse()));
	}

	private String toString(final WebServiceMessage message) {
		try {
			final ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
			message.writeTo(outputStream);
			return new String(outputStream.toByteArray());
		} catch (final Exception e) {
			throw new RuntimeException(e);
		}
	}

}
