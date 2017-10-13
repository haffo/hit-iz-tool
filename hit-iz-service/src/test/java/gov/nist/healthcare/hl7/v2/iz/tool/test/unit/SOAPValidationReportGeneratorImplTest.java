package gov.nist.healthcare.hl7.v2.iz.tool.test.unit;

import static org.junit.Assert.assertNotNull;

import java.io.IOException;
import java.io.InputStream;

import org.apache.commons.io.IOUtils;
import org.junit.Test;

import gov.nist.hit.iz.domain.IZValidationPhase;
import gov.nist.hit.iz.service.SOAPValidationReportGenerator;
import gov.nist.hit.iz.service.exception.SoapValidationException;
import gov.nist.hit.iz.service.soap.SOAPMessageValidatorImpl;
import gov.nist.hit.iz.service.soap.SOAPValidationReportGeneratorImpl;
import gov.nist.hit.iz.service.soap.SOAPValidationResult;

public class SOAPValidationReportGeneratorImplTest {

	private final SOAPMessageValidatorImpl validator = new SOAPMessageValidatorImpl();

	private final SOAPValidationReportGenerator reportService = new SOAPValidationReportGeneratorImpl();

	@Test
	public void testXml() throws IOException, SoapValidationException {
		String xml = IOUtils.toString(SOAPValidationReportGeneratorImplTest.class
				.getResourceAsStream("/soap/invalidSubmitSingleMessage.xml"));
		SOAPValidationResult result = (SOAPValidationResult) validator.validate(xml, "Testing",
				IZValidationPhase.submitSingleMessage_Request.toString());
		String reportXml = result.getXml();
		assertNotNull(reportXml);
	}

	@Test
	public void testOldReport() throws IOException, SoapValidationException {
		String reportXml = IOUtils
				.toString(SOAPValidationReportGeneratorImplTest.class.getResourceAsStream("/reports/old-report.xml"));
		String html = reportService.toHTML(reportXml);
		assertNotNull(html);
	}

	@Test
	public void testHtml() throws IOException, SoapValidationException {
		String reportXml = IOUtils.toString(
				SOAPValidationReportGeneratorImplTest.class.getResourceAsStream("/reports/reportWithError.xml"));
		String html = reportService.toHTML(reportXml);
		assertNotNull(html);
	}

	@Test
	public void testPdf() throws IOException, SoapValidationException {
		String reportXml = IOUtils.toString(
				SOAPValidationReportGeneratorImplTest.class.getResourceAsStream("/reports/reportWithError.xml"));
		InputStream io = reportService.toPDF(reportXml);
		assertNotNull(io);
	}

}
