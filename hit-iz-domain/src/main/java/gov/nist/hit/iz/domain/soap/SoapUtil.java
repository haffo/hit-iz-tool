package gov.nist.hit.iz.domain.soap;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import javax.xml.parsers.ParserConfigurationException;
import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;
import javax.xml.soap.SOAPException;
import javax.xml.soap.SOAPMessage;
import javax.xml.transform.Source;
import javax.xml.transform.stream.StreamSource;
import javax.xml.validation.SchemaFactory;

import org.w3c.dom.Node;
import org.xml.sax.ErrorHandler;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;
import org.xml.sax.SAXParseException;
import org.xml.sax.XMLReader;

public class SoapUtil {

	public static String toString(SOAPMessage messageDoc) throws SOAPException, IOException {
		ByteArrayOutputStream stream = new ByteArrayOutputStream();
		messageDoc.writeTo(stream);
		String message = new String(stream.toByteArray(), "utf-8");
		return message;
	}

	public static Node getNode(SOAPMessage messageDoc) {
		Node node = messageDoc.getSOAPPart().getFirstChild();
		return node;
	}

	// validate SAX and external XSD
	public static boolean validate(String xml, String xsd) throws ParserConfigurationException, IOException {
		try {
			SAXParserFactory factory = SAXParserFactory.newInstance();
			factory.setValidating(false);
			factory.setNamespaceAware(true);

			SchemaFactory schemaFactory = SchemaFactory.newInstance("http://www.w3.org/2001/XMLSchema");
			SAXParser parser = null;
			try {
				factory.setSchema(schemaFactory.newSchema(new Source[] { new StreamSource(xsd) }));
				parser = factory.newSAXParser();
			} catch (SAXException se) {
				System.out.println("SCHEMA : " + se.getMessage()); // problem in
																	// the XSD
																	// itself
				return false;
			}

			XMLReader reader = parser.getXMLReader();
			reader.setErrorHandler(new ErrorHandler() {
				@Override
				public void warning(SAXParseException e) throws SAXException {
					System.out.println("WARNING: " + e.getMessage()); // do
																		// nothing
				}

				@Override
				public void error(SAXParseException e) throws SAXException {
					System.out.println("ERROR : " + e.getMessage());
					throw e;
				}

				@Override
				public void fatalError(SAXParseException e) throws SAXException {
					System.out.println("FATAL : " + e.getMessage());
					throw e;
				}
			});
			reader.parse(new InputSource(xml));
			return true;
		} catch (ParserConfigurationException pce) {
			throw pce;
		} catch (IOException io) {
			throw io;
		} catch (SAXException se) {
			return false;
		}
	}

}
