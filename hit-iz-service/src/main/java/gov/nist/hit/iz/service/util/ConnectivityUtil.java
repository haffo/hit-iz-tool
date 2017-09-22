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

	public static String updateSubmitSingleMessageRequest(String soapEnvelope, String hl7Message, String username,
			String password, String facilityId) throws Exception {
		Document doc = createDoc(soapEnvelope);
		Node node = null;
		if (hl7Message != null) {
			node = findNode(doc,
					"//*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='submitSingleMessage']/*[local-name()='hl7Message']");
			if (node != null)
				node.setTextContent(hl7Message);
		}

		if (username != null) {
			node = findNode(doc,
					"//*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='submitSingleMessage']/*[local-name()='username']");
			if (node != null)
				node.setTextContent(username);
		}
		if (password != null) {
			node = findNode(doc,
					"//*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='submitSingleMessage']/*[local-name()='password']");
			if (node != null)
				node.setTextContent(password);
		}

		if (facilityId != null) {
			node = findNode(doc,
					"//*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='submitSingleMessage']/*[local-name()='facilityID']");
			if (node != null)
				node.setTextContent(facilityId);
		}
		return toString(doc);
	}

	public static String getConnectivityEchoBack(String soapEnvelope) throws Exception {
		Document doc = createDoc(soapEnvelope);
		Node eckoBackNode = ConnectivityUtil.findNode(doc,
				"//*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='connectivityTest']/*[local-name()='echoBack']");
		return getNodeContent(eckoBackNode);
	}

	public static String getConnectivityReturn(String soapEnvelope) throws Exception {
		Document doc = createDoc(soapEnvelope);
		Node node = ConnectivityUtil.findNode(doc,
				"//*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='connectivityTestResponse']/*[local-name()='return']");
		return getNodeContent(node);
	}

	public static String getRequestHl7Message(String soapEnvelope) throws Exception {
		Document doc = createDoc(soapEnvelope);
		Node hl7MessageNode = findNode(doc,
				"//*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='submitSingleMessage']/*[local-name()='hl7Message']");
		return getNodeContent(hl7MessageNode);
	}

	public static String getResponseHl7Message(String soapEnvelope) throws Exception {
		Document doc = createDoc(soapEnvelope);
		Node hl7MessageNode = findNode(doc,
				"//*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='submitSingleMessageResponse']/*[local-name()='return']");
		return getNodeContent(hl7MessageNode);
	}

	public static String updateConnectivityRequest(String content) throws Exception {
		if (content == null)
			throw new Exception("No message found.");
		Document doc = createDoc(content);
		Node echoBack = findNode(doc,
				"//*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='connectivityTest']/*[local-name()='echoBack']");
		if (echoBack != null) {
			int i = new Random().nextInt(1000);
			int j = new Random().nextInt(1000);
			echoBack.setTextContent(String.format("%d+%d=%d", i, j, i + j));
		}
		return toString(doc);
	}

	public static Node findNode(String requestContent, String query) {
		try {
			return findNode(createDoc(requestContent), query);
		} catch (SAXException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		} catch (ParserConfigurationException e) {
			e.printStackTrace();
		} catch (Exception e) {
			// TODO Auto-generated catch block
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

	public static Document createDoc(String content) throws Exception {
		if (content == null)
			throw new Exception("No content found.");
		DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
		factory.setNamespaceAware(true);
		DocumentBuilder builder = factory.newDocumentBuilder();
		return builder.parse(new InputSource(new ByteArrayInputStream(content.getBytes("utf-8"))));
	}

	public static String toString(Document doc) throws Exception {
		if (doc == null)
			throw new Exception("No document found.");
		DOMSource domSource = new DOMSource(doc);
		StringWriter writer = new StringWriter();
		StreamResult result = new StreamResult(writer);
		TransformerFactory tf = TransformerFactory.newInstance();
		Transformer transformer = tf.newTransformer();
		transformer.transform(domSource, result);
		return writer.toString();
	}

	private static String getNodeContent(Node node) {
		return node != null ? node.getTextContent() : null;
	}

}
