package gov.nist.healthcare.hl7.v2.iz.tool.test.unit;

import static org.junit.Assert.assertNotNull;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringReader;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.apache.commons.io.IOUtils;
import org.junit.Test;
import org.w3c.dom.Document;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

import gov.nist.hit.iz.domain.IZValidationPhase;
import gov.nist.hit.iz.service.exception.SoapValidationException;
import gov.nist.hit.iz.service.soap.SOAPMessageValidatorImpl;
import gov.nist.hit.iz.service.soap.SOAPValidationResult;
import gov.nist.validation.xml.schematron.Validator;

public class SOAPMessageValidatorImplTest {

	SOAPMessageValidatorImpl validator = new SOAPMessageValidatorImpl();

	@Test
	public void testTransformer() throws IOException, SoapValidationException, SAXException {
		String content = IOUtils
				.toString(SOAPMessageValidatorImplTest.class.getResourceAsStream("/soap/validSubmitSingleMessage.xml"));
		Document doc = createDocument(content);
		InputStream skematron = Validator.class.getResourceAsStream("/soap/schema/soap_rules.sch");
		Validator.validateWithSchematron(doc, skematron, "submitSingleMessage");
	}

	// @Test
	public void testValid() throws IOException, SoapValidationException {
		String content = IOUtils
				.toString(SOAPMessageValidatorImplTest.class.getResourceAsStream("/soap/validSubmitSingleMessage.xml"));
		SOAPValidationResult result = (SOAPValidationResult) validator.validate(content, "Testing",
				IZValidationPhase.submitSingleMessage_Request.toString());
		assertNotNull(result.getXml());
		System.out.println(result.getXml());
	}

	// @Test
	public void testInValid() throws IOException, SoapValidationException {
		String content = IOUtils.toString(
				SOAPMessageValidatorImplTest.class.getResourceAsStream("/soap/invalidSubmitSingleMessage.xml"));
		SOAPValidationResult result = (SOAPValidationResult) validator.validate(content, "Testing",
				IZValidationPhase.submitSingleMessage_Request.toString());
		assertNotNull(result.getXml());
	}

	protected static Document createDocument(String xml) throws SAXException, IOException {
		InputSource xmlInputSource = new InputSource(new StringReader(xml));
		DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
		factory.setNamespaceAware(true);
		factory.setIgnoringElementContentWhitespace(true);
		DocumentBuilder builder = null;
		try {
			builder = factory.newDocumentBuilder();
		} catch (ParserConfigurationException pce) {
			pce.printStackTrace();
			return null;
		}

		// builder.setErrorHandler(handler);
		Document doc = null;
		// try {
		doc = builder.parse(xmlInputSource);
		// } catch (SAXException e) {
		// System.out.println("Message is not valid XML.");
		// handler.addError("Message is not valid XML.", null);
		// e.printStackTrace();
		// } catch (IOException e) {
		// System.out.println("Message is not valid XML. Possible empty
		// message.");
		// handler.addError("Message is not valid XML. Possible empty message.",
		// null);
		// e.printStackTrace();
		// }
		return doc;
	}

}
