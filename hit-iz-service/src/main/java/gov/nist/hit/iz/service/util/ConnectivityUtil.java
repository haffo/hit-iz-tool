package gov.nist.hit.iz.service.util;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.StringWriter;
import java.util.Random;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;

import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

public class ConnectivityUtil {

  public static String updateSubmitSingleMessageRequest(String soapEnvelope, String hl7Message,
      String username, String password, String facilityId) throws Exception {
    if (soapEnvelope == null)
      throw new Exception("No message found.");
    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
    factory.setNamespaceAware(true);
    DocumentBuilder builder = factory.newDocumentBuilder();
    Document doc =
        builder.parse(new InputSource(new ByteArrayInputStream(soapEnvelope.getBytes("utf-8"))));

    if (hl7Message != null) {
      Node hl7MessageNode =
          findNode(
              doc,
              "//*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='submitSingleMessage']/*[local-name()='hl7Message']");
      if (hl7MessageNode != null) {
        hl7MessageNode.setTextContent(hl7Message);
      }
    }

    if (username != null) {
      Node usernameNode =
          findNode(
              doc,
              "//*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='submitSingleMessage']/*[local-name()='username']");
      if (usernameNode != null) {
        usernameNode.setTextContent(username);
      }

    }
    if (password != null) {
      Node passwordNode =
          findNode(
              doc,
              "//*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='submitSingleMessage']/*[local-name()='password']");
      if (passwordNode != null) {
        passwordNode.setTextContent(password);
      }
    }

    if (facilityId != null) {
      Node facilityIdNode =
          findNode(
              doc,
              "//*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='submitSingleMessage']/*[local-name()='facilityID']");
      if (facilityIdNode != null) {
        facilityIdNode.setTextContent(facilityId);
      }

    }
    DOMSource domSource = new DOMSource(doc);
    StringWriter writer = new StringWriter();
    StreamResult result = new StreamResult(writer);
    TransformerFactory tf = TransformerFactory.newInstance();
    Transformer transformer = tf.newTransformer();
    transformer.transform(domSource, result);
    return writer.toString();

  }


  public static String getRequestHl7Message(String soapEnvelope) throws Exception {
    if (soapEnvelope == null)
      throw new Exception("No message found.");
    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
    factory.setNamespaceAware(true);
    DocumentBuilder builder = factory.newDocumentBuilder();
    Document doc =
        builder.parse(new InputSource(new ByteArrayInputStream(soapEnvelope.getBytes("utf-8"))));

    Node hl7MessageNode =
        findNode(
            doc,
            "//*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='submitSingleMessage']/*[local-name()='hl7Message']");
    if (hl7MessageNode != null) {
      return hl7MessageNode.getTextContent();
    }
    return null;
  }


  public static String getResponseHl7Message(String soapEnvelope) throws Exception {
    if (soapEnvelope == null)
      throw new Exception("No message found.");
    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
    factory.setNamespaceAware(true);
    DocumentBuilder builder = factory.newDocumentBuilder();
    Document doc =
        builder.parse(new InputSource(new ByteArrayInputStream(soapEnvelope.getBytes("utf-8"))));

    Node hl7MessageNode =
        findNode(
            doc,
            "//*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='submitSingleMessageResponse']/*[local-name()='return']");
    if (hl7MessageNode != null) {
      return hl7MessageNode.getTextContent();
    }
    return null;
  }



  public static String updateConnectivityRequest(String content) throws Exception {
    if (content == null)
      throw new Exception("No message found.");
    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
    factory.setNamespaceAware(true);
    DocumentBuilder builder = factory.newDocumentBuilder();
    Document doc =
        builder.parse(new InputSource(new ByteArrayInputStream(content.getBytes("utf-8"))));

    Node echoBack =
        findNode(
            doc,
            "//*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='connectivityTest']/*[local-name()='echoBack']");
    if (echoBack != null) {
      int i = new Random().nextInt(1000);
      int j = new Random().nextInt(1000);
      echoBack.setTextContent(String.format("%d+%d=%d", i, j, i + j));
    }

    DOMSource domSource = new DOMSource(doc);
    StringWriter writer = new StringWriter();
    StreamResult result = new StreamResult(writer);
    TransformerFactory tf = TransformerFactory.newInstance();
    Transformer transformer = tf.newTransformer();
    transformer.transform(domSource, result);
    return writer.toString();

  }

  public static Node findNode(String requestContent, String query) {
    try {
      DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
      factory.setNamespaceAware(true);
      DocumentBuilder builder = factory.newDocumentBuilder();
      Document doc =
          builder
              .parse(new InputSource(new ByteArrayInputStream(requestContent.getBytes("utf-8"))));
      return findNode(doc, query);
    } catch (SAXException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    } catch (ParserConfigurationException e) {
      e.printStackTrace();
    }
    return null;
  }

  public static Node findNode(Document doc, String query) {
    try {
      XPathFactory xPathfactory = XPathFactory.newInstance();
      XPath xpath = xPathfactory.newXPath();
      XPathExpression expr = xpath.compile(query);
      return (Node) expr.evaluate(doc, XPathConstants.NODE);
    } catch (XPathExpressionException e) {
      e.printStackTrace();
    }
    return null;
  }

}
