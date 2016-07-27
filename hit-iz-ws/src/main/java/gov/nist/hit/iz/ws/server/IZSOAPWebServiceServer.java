package gov.nist.hit.iz.ws.server;

import gov.nist.healthcare.core.MalformedMessageException;
import gov.nist.healthcare.core.message.MessageLocation;
import gov.nist.healthcare.core.message.v2.er7.Er7Message;
import gov.nist.hit.core.domain.Transaction;
import gov.nist.hit.core.domain.TransportMessage;
import gov.nist.hit.core.repo.MessageRepository;
import gov.nist.hit.core.service.AccountService;
import gov.nist.hit.core.service.TransactionService;
import gov.nist.hit.core.service.TransportMessageService;
import gov.nist.hit.core.transport.exception.TransportServerException;
import gov.nist.hit.iz.ws.IZWSConstant;
import gov.nist.hit.iz.ws.jaxb.ConnectivityTestRequestType;
import gov.nist.hit.iz.ws.jaxb.ConnectivityTestResponseType;
import gov.nist.hit.iz.ws.jaxb.SubmitSingleMessageRequestType;
import gov.nist.hit.iz.ws.jaxb.SubmitSingleMessageResponseType;
import gov.nist.hit.iz.ws.utils.WsdlUtil;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

import javax.xml.bind.JAXBException;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringEscapeUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.oxm.XmlMappingException;
import org.springframework.ws.server.endpoint.annotation.Endpoint;
import org.springframework.ws.server.endpoint.annotation.PayloadRoot;
import org.springframework.ws.server.endpoint.annotation.RequestPayload;
import org.springframework.ws.server.endpoint.annotation.ResponsePayload;

@Endpoint
public class IZSOAPWebServiceServer implements TransportServer {

  private static final String NAMESPACE_URI = "urn:cdc:iisb:2011";

  @Autowired
  private AccountService userService;

  @Autowired
  private TransactionService transactionService;

  @Autowired
  private MessageRepository messageRepository;

  @Autowired
  protected TransportMessageService transportMessageService;



  @Override
  @PayloadRoot(namespace = NAMESPACE_URI, localPart = "connectivityTest")
  @ResponsePayload
  public ConnectivityTestResponseType handle(@RequestPayload ConnectivityTestRequestType request) {
    ConnectivityTestResponseType response = new ConnectivityTestResponseType();
    response.setReturn(request.getEchoBack());
    return response;
  }

  @Override
  @PayloadRoot(namespace = NAMESPACE_URI, localPart = "submitSingleMessage")
  @ResponsePayload
  public SubmitSingleMessageResponseType handle(
      @RequestPayload SubmitSingleMessageRequestType request) {
    validateRequest(request);
    String hl7Message = request.getHl7Message();
    if (hl7Message == null || hl7Message.equals("")) {
      throw new TransportServerException("No Hl7 Message Provided");
    }
    Map<String, String> properties =
        getProperties(request.getUsername(), request.getPassword(), request.getFacilityID());
    TransportMessage message = transportMessageService.findOneByProperties(properties);
    if (message != null
        && IZWSConstant.LISTENER_STARTED.equals(message.getProperties().get(
            IZWSConstant.LISTENER_STATUS))) {
      String responseMessage = getResponseMessage(message.getMessageId());
      return getSubmitSingleMessageResponse(hl7Message, responseMessage);
    } else {
      throw new TransportServerException("Listener not started");
    }
  }

  public String getResponseMessage(Long messageId) {
    if (messageId != null) {
      return messageRepository.getContentById(messageId);
    }
    return null;
  }


  public String getResponseMessage(String username, String password, String facilityID) {
    Map<String, String> properties = getProperties(username, password, facilityID);
    Long messageId = transportMessageService.findMessageIdByProperties(properties);
    if (messageId != null) {
      return messageRepository.getContentById(messageId);
    }
    return null;
  }

  public Map<String, String> getProperties(String username, String password, String facilityID) {
    Map<String, String> properties = new HashMap<String, String>();
    properties.put("username", username);
    properties.put("password", password);
    properties.put("facilityID", facilityID);
    return properties;
  }


  public Transaction getTransaction(String username, String password, String facilityID) {
    Transaction transaction =
        transactionService.findOneByProperties(getProperties(username, password, facilityID));
    return transaction;
  }


  private void validateRequest(SubmitSingleMessageRequestType request) throws SecurityException,
      TransportServerException {
    String username = request.getUsername();
    String password = request.getPassword();
    String facilityID = request.getFacilityID();
    Map<String, String> properties = getProperties(username, password, facilityID);
    if (StringUtils.isEmpty(username) || StringUtils.isEmpty(password)) {
      throw new SecurityException("Missing Authentication Information");
    } else if (!userService.exitBySutInitiatorPropertiesAndProtocol(properties, "soap")) {
      throw new SecurityException("Invalid Authentication Information");
    }
    // else if (!TransactionStatus.OPEN.equals(getStatus(username, password, facilityID))) {
    // throw new TransportServerException("Transaction not initialized correctly");
    // }
  }

  // private SubmitSingleMessageResponseType getPreCannedSubmitSingleMessageResponse() {
  // SubmitSingleMessageResponseType response = null;
  // try {
  // String content =
  // IOUtils.toString(WebServiceServer.class
  // .getResourceAsStream("/ws/messages/SubmitSingleMessageResponse_Precanned.xml"));
  // response = WsdlUtil.toSubmitSingleMessageResponse(content);
  // } catch (IOException | XmlMappingException | JAXBException e) {
  // throw new TransportServerException(
  // "Sorry, Server Error. Failed to generate response message submitSingleMessageResponse");
  // }
  // return response;
  // }


  private String updateOutboundMessage(String inboundMessage, String outboundMessage) {
    try {
      Er7Message inEr7 = new Er7Message(inboundMessage);
      Er7Message outEr7 = new Er7Message(outboundMessage);
      MessageLocation msh31 = new MessageLocation("MSH[1].3[1].1");
      MessageLocation msh32 = new MessageLocation("MSH[1].3[1].2");
      MessageLocation msh33 = new MessageLocation("MSH[1].3[1].3");
      MessageLocation msh41 = new MessageLocation("MSH[1].4[1].1");
      MessageLocation msh42 = new MessageLocation("MSH[1].4[1].2");
      MessageLocation msh43 = new MessageLocation("MSH[1].4[1].3");
      MessageLocation msh10 = new MessageLocation("MSH[1].10[1]");
      MessageLocation msh51 = new MessageLocation("MSH[1].5[1].1");
      MessageLocation msh52 = new MessageLocation("MSH[1].5[1].2");
      MessageLocation msh53 = new MessageLocation("MSH[1].5[1].3");
      MessageLocation msh61 = new MessageLocation("MSH[1].6[1].1");
      MessageLocation msh62 = new MessageLocation("MSH[1].6[1].2");
      MessageLocation msh63 = new MessageLocation("MSH[1].6[1].3");
      MessageLocation msa2 = new MessageLocation("MSA[1].2[1]");
      String inMsh31Value = inEr7.getValue(msh31);
      String inMsh32Value = inEr7.getValue(msh32);
      String inMsh33Value = inEr7.getValue(msh33);
      String inMsh41Value = inEr7.getValue(msh41);
      String inMsh42Value = inEr7.getValue(msh42);
      String inMsh43Value = inEr7.getValue(msh43);
      String inMsh10Value = inEr7.getValue(msh10);
      String outMsh51 = outEr7.getValue(msh51);
      String outMsh52 = outEr7.getValue(msh52);
      String outMsh53 = outEr7.getValue(msh53);
      String outMsh61 = outEr7.getValue(msh61);
      String outMsh62 = outEr7.getValue(msh62);
      String outMsh63 = outEr7.getValue(msh63);
      String outMsa2 = outEr7.getValue(msa2);
      if (inMsh31Value != null && outMsh51 != null)
        outEr7.replaceValue(msh51, inMsh31Value);
      if (inMsh32Value != null && outMsh52 != null)
        outEr7.replaceValue(msh52, inMsh32Value);
      if (inMsh33Value != null && outMsh53 != null)
        outEr7.replaceValue(msh53, inMsh33Value);
      if (inMsh41Value != null && outMsh61 != null)
        outEr7.replaceValue(msh61, inMsh41Value);
      if (inMsh42Value != null && outMsh62 != null)
        outEr7.replaceValue(msh62, inMsh42Value);
      if (inMsh43Value != null && outMsh63 != null)
        outEr7.replaceValue(msh63, inMsh43Value);
      if (inMsh10Value != null && outMsa2 != null)
        outEr7.replaceValue(msa2, inMsh10Value);
      outboundMessage = outEr7.getMessageAsString();
    } catch (MalformedMessageException e) {
    }
    return outboundMessage;

  }

  private SubmitSingleMessageResponseType getSubmitSingleMessageResponse(String inboundMessage,
      String outboundMessage) {
    try {
      SubmitSingleMessageResponseType response = null;
      if (outboundMessage != null) {
        inboundMessage = getHL7MessageString(inboundMessage);
        outboundMessage = updateOutboundMessage(inboundMessage, outboundMessage);
        response = new SubmitSingleMessageResponseType();
        response.setReturn(outboundMessage);
      } else {
        String outboundSoap =
            IOUtils.toString(IZSOAPWebServiceServer.class
                .getResourceAsStream("/ws/messages/SubmitSingleMessageResponse_Precanned.xml"));
        response = WsdlUtil.toSubmitSingleMessageResponse(outboundSoap);
        outboundMessage = response.getReturn();
        outboundMessage = getHL7MessageString(outboundMessage);
        outboundMessage = updateOutboundMessage(inboundMessage, outboundMessage);
        response.setReturn(outboundMessage);
      }
      return response;
    } catch (XmlMappingException e) {
      throw new TransportServerException("ERROR: We were unable to generate the outbound message: "
          + e.getMessage());
    } catch (IOException e) {
      throw new TransportServerException("ERROR: We were unable to generate the outbound message."
          + e.getMessage());
    } catch (JAXBException e) {
      throw new TransportServerException("ERROR: We were unable to generate the outbound message."
          + e.getMessage());
    }
  }

  private String getHL7MessageString(String content) {
    return StringEscapeUtils.unescapeXml(content.replaceAll(Pattern.quote("<![CDATA["), "")
        .replaceAll(Pattern.quote("]]>"), "").trim());
  }



}
