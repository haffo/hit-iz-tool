package gov.nist.hit.iz.ws.client;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import javax.xml.bind.JAXBException;
import javax.xml.transform.TransformerException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.oxm.Marshaller;
import org.springframework.oxm.XmlMappingException;
import org.springframework.ws.WebServiceMessage;
import org.springframework.ws.client.WebServiceTransportException;
import org.springframework.ws.client.core.WebServiceMessageCallback;
import org.springframework.ws.client.core.WebServiceMessageExtractor;
import org.springframework.ws.client.core.WebServiceTemplate;
import org.springframework.ws.soap.client.SoapFaultClientException;
import org.springframework.ws.soap.client.core.SoapActionCallback;
import org.springframework.ws.support.MarshallingUtils;

import gov.nist.hit.core.transport.exception.TransportClientException;
import gov.nist.hit.iz.ws.utils.WsdlUtil;

public class IZSOAPWebServiceClientImpl extends IZSOAPWebServiceClient {

	static final Logger logger = LoggerFactory.getLogger(IZSOAPWebServiceClientImpl.class);

	private final WebServiceTemplate webServiceTemplate;

	public IZSOAPWebServiceClientImpl(WebServiceTemplate webServiceTemplate) {
		this.webServiceTemplate = webServiceTemplate;
	}

	public WebServiceTemplate getWebServiceTemplate() {
		return webServiceTemplate;
	}

	@Override
	public String send(String content, final String... arguments) throws TransportClientException {
		String res = null;
		try {
			final String endpoint = arguments[0];
			final String action = arguments[1];
			content = WsdlUtil.getPayload(content);
			if (content == null)
				throw new TransportClientException("No content found in the body of the envelope");
			final SoapActionCallback requestCallback = new SoapActionCallback(action);
			final String payload = content;

			res = (String) webServiceTemplate.sendAndReceive(endpoint, new WebServiceMessageCallback() {
				@Override
				public void doWithMessage(WebServiceMessage request) throws IOException, TransformerException {
					Object requestPayload = null;
					try {
						if (WsdlUtil.is(payload, "connectivityTest")) {
							requestPayload = WsdlUtil.toConnectivityTestRequest(payload);
						} else {
							requestPayload = WsdlUtil.toSubmitSingleMessage(payload);
						}
						if (requestPayload != null) {
							Marshaller marshaller = webServiceTemplate.getMarshaller();
							if (marshaller == null) {
								throw new IllegalStateException(
										"No marshaller registered. Check configuration of WebServiceTemplate.");
							}
							MarshallingUtils.marshal(marshaller, requestPayload, request);
							if (requestCallback != null) {
								requestCallback.doWithMessage(request);
							}
						}
					} catch (XmlMappingException | JAXBException e) {
						throw new IOException(e);
					}
				}
			}, new WebServiceMessageExtractor<Object>() {
				@Override
				public Object extractData(WebServiceMessage response) throws IOException {
					return format(response);
				}
			});

			return res;
		} catch (SoapFaultClientException e) {
			logger.error("Failed to send message:\n" + e.getMessage());
			return toString(e);
		} catch (WebServiceTransportException e) {
			logger.error("Failed to send message:\n" + e.getMessage());
			throw new TransportClientException(e);
		} catch (RuntimeException e) {
			e.printStackTrace();
			logger.error("Failed to send message:\n" + e.getMessage());
			throw new TransportClientException(e);
		} catch (Exception e) {
			logger.error("Failed to send message:\n" + e.getMessage());
			e.printStackTrace();
			throw new TransportClientException(e);
		}
	}

	private String toString(SoapFaultClientException e) throws TransportClientException {
		try {
			// StringWriter stringWriter = new StringWriter();
			// StreamResult xmlOutput = new StreamResult(stringWriter);
			// Transformer trn =
			// TransformerFactory.newInstance().newTransformer();
			// trn.transform(e.getWebServiceMessage(), xmlOutput);
			String error = format(e.getWebServiceMessage());
			return error;
		} catch (XmlMappingException e1) {
			logger.error("problem with XML transform: ", e1);
			throw new TransportClientException(e);
		}
	}

	// public static String toString(FaultAwareWebServiceMessage fault)
	// throws JAXBException, XmlMappingException, IOException {
	// ObjectFactory of = new ObjectFactory();
	// JAXBElement<SecurityFaultType> jaxbElement =
	// of.createSecurityFault(fault);
	// StringWriter stringWriter = new StringWriter();
	// StreamResult xmlOutput = new StreamResult(stringWriter);
	// // serialise to xml
	// JAXBContext context = JAXBContext.newInstance(SecurityFaultType.class);
	// context.createMarshaller().marshal(jaxbElement, xmlOutput);
	// // output string to console
	// String theXML = stringWriter.toString();
	// return theXML;
	// }

	public static String format(final WebServiceMessage message) {
		try {
			final ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
			message.writeTo(outputStream);
			return new String(outputStream.toByteArray());
		} catch (final Exception e) {
			throw new RuntimeException(e);
		}
	}

}
