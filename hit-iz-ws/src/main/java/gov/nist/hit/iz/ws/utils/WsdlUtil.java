package gov.nist.hit.iz.ws.utils;

import gov.nist.hit.iz.ws.jaxb.MessageTooLargeFaultType;
import gov.nist.hit.iz.ws.jaxb.ObjectFactory;
import gov.nist.hit.iz.ws.jaxb.SecurityFaultType;
import gov.nist.hit.iz.ws.jaxb.SoapFaultType;
import gov.nist.hit.iz.ws.jaxb.SubmitSingleMessageRequestType;
import gov.nist.hit.iz.ws.jaxb.SubmitSingleMessageResponseType;
import gov.nist.hit.iz.ws.jaxb.UnsupportedOperationFaultType;

import java.io.IOException;
import java.io.StringWriter;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBElement;
import javax.xml.bind.JAXBException;
import javax.xml.transform.stream.StreamResult;

import org.apache.commons.io.IOUtils;
import org.springframework.oxm.XmlMappingException;

public class WsdlUtil {

  public static String toString(SecurityFaultType fault) throws JAXBException, XmlMappingException,
      IOException {
    ObjectFactory of = new ObjectFactory();
    JAXBElement<SecurityFaultType> jaxbElement = of.createSecurityFault(fault);
    StringWriter stringWriter = new StringWriter();
    StreamResult xmlOutput = new StreamResult(stringWriter);
    // serialise to xml
    JAXBContext context = JAXBContext.newInstance(SecurityFaultType.class);
    context.createMarshaller().marshal(jaxbElement, xmlOutput);
    // output string to console
    String theXML = stringWriter.toString();
    return theXML;
  }

  public static String toString(UnsupportedOperationFaultType fault) throws JAXBException,
      XmlMappingException, IOException {
    ObjectFactory of = new ObjectFactory();
    JAXBElement<UnsupportedOperationFaultType> jaxbElement =
        of.createUnsupportedOperationFault(fault);
    StringWriter stringWriter = new StringWriter();
    StreamResult xmlOutput = new StreamResult(stringWriter);
    // serialise to xml
    JAXBContext context = JAXBContext.newInstance(UnsupportedOperationFaultType.class);
    context.createMarshaller().marshal(jaxbElement, xmlOutput);
    // output string to console
    String theXML = stringWriter.toString();
    return theXML;
  }

  public static String toString(MessageTooLargeFaultType fault) throws JAXBException,
      XmlMappingException, IOException {
    ObjectFactory of = new ObjectFactory();
    JAXBElement<MessageTooLargeFaultType> jaxbElement = of.createMessageTooLargeFault(fault);
    StringWriter stringWriter = new StringWriter();
    StreamResult xmlOutput = new StreamResult(stringWriter);
    // serialise to xml
    JAXBContext context = JAXBContext.newInstance(MessageTooLargeFaultType.class);
    context.createMarshaller().marshal(jaxbElement, xmlOutput);
    // output string to console
    String theXML = stringWriter.toString();
    return theXML;
  }

  public static String toString(SoapFaultType fault) throws JAXBException, XmlMappingException,
      IOException {
    StringWriter stringWriter = new StringWriter();
    StreamResult xmlOutput = new StreamResult(stringWriter);
    // serialise to xml
    JAXBContext context = JAXBContext.newInstance(SoapFaultType.class);
    context.createMarshaller().marshal(fault, xmlOutput);
    // output string to console
    String theXML = stringWriter.toString();
    return theXML;
  }

  public static SubmitSingleMessageRequestType toSubmitSingleMessage(String content)
      throws JAXBException, XmlMappingException, IOException {
    JAXBContext context = JAXBContext.newInstance(SubmitSingleMessageRequestType.class);
    SubmitSingleMessageRequestType ob =
        (SubmitSingleMessageRequestType) context.createUnmarshaller().unmarshal(
            IOUtils.toInputStream(content));
    return ob;
  }

  public static SubmitSingleMessageResponseType toSubmitSingleMessageResponse(String content)
      throws JAXBException, XmlMappingException, IOException {
    JAXBContext context = JAXBContext.newInstance(SubmitSingleMessageResponseType.class);
    SubmitSingleMessageResponseType ob =
        (SubmitSingleMessageResponseType) context.createUnmarshaller().unmarshal(
            IOUtils.toInputStream(content));
    return ob;
  }

}
