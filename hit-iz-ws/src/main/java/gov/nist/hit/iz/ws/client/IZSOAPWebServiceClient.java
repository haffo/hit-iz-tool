package gov.nist.hit.iz.ws.client;

import gov.nist.hit.core.transport.exception.TransportClientException;
import gov.nist.hit.core.transport.service.TransportClient;

public abstract class IZSOAPWebServiceClient implements TransportClient {
  @Override
  public abstract String send(String soapEnvelope, String... arguments)
      throws TransportClientException;


}
