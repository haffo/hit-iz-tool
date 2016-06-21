package gov.nist.hit.iz.ws.utils;

import gov.nist.hit.iz.ws.jaxb.ConnectivityTestRequestType;
import gov.nist.hit.iz.ws.jaxb.ConnectivityTestResponseType;
import gov.nist.hit.iz.ws.jaxb.MessageTooLargeFaultType;
import gov.nist.hit.iz.ws.jaxb.ObjectFactory;
import gov.nist.hit.iz.ws.jaxb.SecurityFaultType;
import gov.nist.hit.iz.ws.jaxb.SoapFaultType;
import gov.nist.hit.iz.ws.jaxb.SubmitSingleMessageRequestType;
import gov.nist.hit.iz.ws.jaxb.SubmitSingleMessageResponseType;
import gov.nist.hit.iz.ws.jaxb.UnsupportedOperationFaultType;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.StringWriter;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBElement;
import javax.xml.bind.JAXBException;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;

import org.apache.commons.io.IOUtils;
import org.springframework.oxm.XmlMappingException;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

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

  public static String toString(ConnectivityTestResponseType obj) throws JAXBException,
      XmlMappingException, IOException {
    StringWriter stringWriter = new StringWriter();
    StreamResult xmlOutput = new StreamResult(stringWriter);
    // serialise to xml
    JAXBContext context = JAXBContext.newInstance(ConnectivityTestResponseType.class);
    context.createMarshaller().marshal(obj, xmlOutput);
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


  public static ConnectivityTestRequestType toConnectivityTestRequest(String content)
      throws JAXBException, XmlMappingException, IOException {
    JAXBContext context = JAXBContext.newInstance(ConnectivityTestRequestType.class);
    ConnectivityTestRequestType ob =
        (ConnectivityTestRequestType) context.createUnmarshaller().unmarshal(
            IOUtils.toInputStream(content));
    return ob;
  }



  public static String getPayload(String requestContent) {
    try {
      DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
      factory.setNamespaceAware(true);
      DocumentBuilder builder = factory.newDocumentBuilder();
      Document doc =
          builder
              .parse(new InputSource(new ByteArrayInputStream(requestContent.getBytes("utf-8"))));
      XPathFactory xPathfactory = XPathFactory.newInstance();
      XPath xpath = xPathfactory.newXPath();
      XPathExpression expr = xpath.compile("//*[local-name()='Envelope']/*[local-name()='Body']/*");
      NodeList nodes = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);
      Element el = (Element) nodes.item(0);

      TransformerFactory transFactory = TransformerFactory.newInstance();
      Transformer transformer = transFactory.newTransformer();
      transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
      StringWriter buffer = new StringWriter();
      transformer.transform(new DOMSource(el), new StreamResult(buffer));
      String str = buffer.toString();
      return str;
    } catch (XPathExpressionException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    } catch (SAXException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    } catch (ParserConfigurationException e) {
      e.printStackTrace();
    } catch (TransformerConfigurationException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    } catch (TransformerException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
    return null;
  }

  public static Document getDocument(String content) {
    try {
      DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
      factory.setNamespaceAware(true);
      DocumentBuilder builder = factory.newDocumentBuilder();
      Document doc =
          builder.parse(new InputSource(new ByteArrayInputStream(content.getBytes("utf-8"))));
      return doc;
    } catch (SAXException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    } catch (ParserConfigurationException e) {
      e.printStackTrace();
    }
    return null;
  }

  public static boolean is(String content, String elementName) throws JAXBException,
      XmlMappingException, IOException {
    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
    factory.setNamespaceAware(true);
    DocumentBuilder builder;
    try {
      builder = factory.newDocumentBuilder();
      Document doc =
          builder.parse(new InputSource(new ByteArrayInputStream(content.getBytes("utf-8"))));
      XPathFactory xPathfactory = XPathFactory.newInstance();
      XPath xpath = xPathfactory.newXPath();
      XPathExpression expr = xpath.compile("//*[local-name()='" + elementName + "']");
      NodeList nodes = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);
      return nodes != null && nodes.getLength() > 0;
    } catch (ParserConfigurationException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    } catch (SAXException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    } catch (XPathExpressionException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
    return false;
  }



}
