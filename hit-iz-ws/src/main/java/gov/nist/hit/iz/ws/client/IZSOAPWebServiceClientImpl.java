package gov.nist.hit.iz.ws.client;

import gov.nist.hit.core.transport.exception.TransportClientException;

import java.io.StringReader;
import java.io.StringWriter;

import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.oxm.XmlMappingException;
import org.springframework.ws.client.WebServiceTransportException;
import org.springframework.ws.client.core.WebServiceTemplate;
import org.springframework.ws.soap.client.SoapFaultClientException;

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
  public String send(String soapEnvelope, String... arguments) throws TransportClientException {
    String res = null;
    try {
      final String endpoint = arguments[0];
      StreamSource source = new StreamSource(new StringReader(soapEnvelope));
      StringWriter stringWriter = new StringWriter();
      StreamResult xmlOutput = new StreamResult(stringWriter);

      webServiceTemplate.sendSourceAndReceiveToResult(endpoint, source, xmlOutput);
      res = xmlOutput.getWriter().toString();
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
      StringWriter stringWriter = new StringWriter();
      StreamResult xmlOutput = new StreamResult(stringWriter);
      Transformer trn = TransformerFactory.newInstance().newTransformer();
      trn.transform(e.getSoapFault().getSource(), xmlOutput);
      return xmlOutput.getWriter().toString();
    } catch (TransformerException ex) {
      logger.error("problem with XML transform: ", ex);
      throw new TransportClientException(e);
    } catch (XmlMappingException e1) {
      logger.error("problem with XML transform: ", e1);
      throw new TransportClientException(e);
    }
  }
}
