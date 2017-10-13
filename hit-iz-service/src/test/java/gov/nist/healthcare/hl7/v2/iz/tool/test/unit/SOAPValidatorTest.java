package gov.nist.healthcare.hl7.v2.iz.tool.test.unit;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.io.IOException;
import java.util.List;

import javax.xml.soap.SOAPException;

import org.apache.commons.io.IOUtils;
import org.junit.Test;
import org.xml.sax.SAXException;

import gov.nist.hit.iz.domain.IZValidationPhase;
import gov.nist.hit.iz.domain.MessageFailureV3;
import gov.nist.hit.iz.service.soap.SOAPValidator;

public class SOAPValidatorTest {
	SOAPValidator validator = new SOAPValidator();

	private final String schematronPath = "/soap/schema/soap_rules.sch";

	@Test
	public void testInValidConnectivityTestEnvelope() throws IOException, SOAPException, SAXException {
		String content = IOUtils
				.toString(SOAPValidatorTest.class.getResourceAsStream("/soap/invalidConnectivityTestEnvelope.xml"));
		List<MessageFailureV3> results = SOAPValidator.validate(content,
				SOAPValidatorTest.class.getResourceAsStream(schematronPath),
				IZValidationPhase.connectivityTest_Request.toString());
		assertTrue(!results.isEmpty());
		assertEquals(2, results.size());
	}

	@Test
	public void testValidConnectivityTest() throws IOException, SOAPException, SAXException {
		String content = IOUtils
				.toString(SOAPValidatorTest.class.getResourceAsStream("/soap/validConnectivityTest.xml"));
		List<MessageFailureV3> results = SOAPValidator.validate(content,
				SOAPValidatorTest.class.getResourceAsStream(schematronPath),
				IZValidationPhase.connectivityTest_Request.toString());
		assertTrue(results.isEmpty());
	}

	@Test
	public void testInValidConnectivityTest() throws IOException, SOAPException, SAXException {
		String content = IOUtils
				.toString(SOAPValidatorTest.class.getResourceAsStream("/soap/invalidConnectivityTest.xml"));
		List<MessageFailureV3> results = SOAPValidator.validate(content,
				SOAPValidatorTest.class.getResourceAsStream(schematronPath),
				IZValidationPhase.connectivityTest_Request.toString());
		assertTrue(!results.isEmpty());
		assertEquals(2, results.size());
	}

	@Test
	public void testInValidSubmitSingleMessageEnvelope() throws IOException, SOAPException, SAXException {
		String content = IOUtils
				.toString(SOAPValidatorTest.class.getResourceAsStream("/soap/invalidSubmitSingleMessageEnvelope.xml"));
		List<MessageFailureV3> results = SOAPValidator.validate(content,
				SOAPValidatorTest.class.getResourceAsStream(schematronPath),
				IZValidationPhase.submitSingleMessage_Request.toString());
		assertEquals(2, results.size());
	}

	@Test
	public void testValidSubmitSingleMessage() throws IOException, SOAPException, SAXException {
		String content = IOUtils
				.toString(SOAPValidatorTest.class.getResourceAsStream("/soap/validSubmitSingleMessage.xml"));
		List<MessageFailureV3> results = SOAPValidator.validate(content,
				SOAPValidatorTest.class.getResourceAsStream(schematronPath),
				IZValidationPhase.submitSingleMessage_Request.toString());
		assertTrue(results.isEmpty());
	}

	@Test
	public void testInValidSubmitSingleMessage() throws IOException, SOAPException, SAXException {
		String content = IOUtils
				.toString(SOAPValidatorTest.class.getResourceAsStream("/soap/invalidSubmitSingleMessage.xml"));
		List<MessageFailureV3> results = SOAPValidator.validate(content,
				SOAPValidatorTest.class.getResourceAsStream(schematronPath),
				IZValidationPhase.submitSingleMessage_Request.toString());
		assertEquals(5, results.size());
	}

}
