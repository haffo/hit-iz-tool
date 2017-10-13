/*
 * NIST Healthcare Core
 * SoapValidationResult.java July 19, 2011
 *
 * This code was produced by the National Institute of Standards and
 * Technology (NIST). See the "nist.disclaimer" file given in the distribution
 * for information on the use and redistribution of this software.
 */
package gov.nist.hit.iz.domain.soap;

import java.io.IOException;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.GregorianCalendar;
import java.util.Iterator;
import java.util.List;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import javax.xml.datatype.DatatypeConfigurationException;
import javax.xml.datatype.DatatypeFactory;
import javax.xml.datatype.XMLGregorianCalendar;
import javax.xml.soap.SOAPException;

import gov.nist.healthcare.unified.validation.AssertionResultConstants;
import gov.nist.hit.iz.domain.MessageFailureV3;
import gov.nist.hit.iz.domain.jaxb.HL7V3MessageReport;
import gov.nist.hit.iz.domain.jaxb.HL7V3MessageReport.AssertionList;
import gov.nist.hit.iz.domain.jaxb.HL7V3MessageReport.AssertionList.Assertion;
import gov.nist.hit.iz.domain.jaxb.HL7V3MessageReport.AssertionList.Assertion.Location;
import gov.nist.hit.iz.domain.jaxb.HL7V3MessageReport.MetaData;
import gov.nist.hit.iz.domain.jaxb.HL7V3MessageReport.MetaData.Message;
import gov.nist.hit.iz.domain.jaxb.HL7V3MessageValidationReport;
import gov.nist.hit.iz.domain.jaxb.ReportHeader.TestObjectReferenceList;
import gov.nist.hit.iz.domain.jaxb.ReportHeader.TestObjectReferenceList.TestObjectReference;
import gov.nist.hit.iz.domain.jaxb.TestObjectReferenceType;

//import org.apache.xmlbeans.StringEnumAbstractBase;

//import gov.nist.healthcare.core.validation.message.v3.MessageFailureV3;
//import gov.nist.healthcare.core.validation.message.v3.MessageValidationContextV3;
//import gov.nist.healthcare.validation.message.ReportHeader.TestObjectReferenceList;
//import gov.nist.healthcare.validation.message.ReportHeader.TestObjectReferenceList.TestObjectReference;
//import gov.nist.healthcare.validation.message.TestObjectReferenceType;
//import gov.nist.healthcare.validation.message.hl7.v3.report.HL7V3MessageReport;
//import gov.nist.healthcare.validation.message.hl7.v3.report.HL7V3MessageReport.AssertionList;
//import gov.nist.healthcare.validation.message.hl7.v3.report.HL7V3MessageReport.AssertionList.Assertion;
//import gov.nist.healthcare.validation.message.hl7.v3.report.HL7V3MessageReport.AssertionList.Assertion.Location;
//import gov.nist.healthcare.validation.message.hl7.v3.report.HL7V3MessageReport.MetaData;
//import gov.nist.healthcare.validation.message.hl7.v3.report.HL7V3MessageReport.MetaData.Message;

public class SoapValidationResult {

	private final SoapMessage soapMessage;

	protected int affirmativeCount;
	protected int errorCount;
	protected int warningCount;
	protected int ignoreCount;
	protected int alertCount;
	protected int informationalCount;
	protected HL7V3MessageValidationReport report;

	List<MessageFailureV3> messageFailures = new ArrayList<MessageFailureV3>();

	public SoapValidationResult(SoapMessage message, List<MessageFailureV3> soapFailures) {
		this.soapMessage = message;
		messageFailures = new ArrayList<MessageFailureV3>();
		if (soapFailures != null) {
			messageFailures.addAll(soapFailures);
		}
		count();
	}

	/**
	 * Get the report document
	 * 
	 * @return
	 * @throws DatatypeConfigurationException
	 * @throws JAXBException
	 * @throws IOException
	 * @throws SOAPException
	 */
	public gov.nist.hit.iz.domain.jaxb.HL7V3MessageValidationReport createReport()
			throws JAXBException, DatatypeConfigurationException, SOAPException, IOException {
		String messageFilename = "";
		if (soapMessage != null) {
			messageFilename = soapMessage.getFilename();
		}
		return createReport(messageFilename);
	}

	/**
	 * Get the report document
	 * 
	 * @param messageFilename
	 * @return
	 * @throws JAXBException
	 * @throws DatatypeConfigurationException
	 * @throws IOException
	 * @throws SOAPException
	 */
	public gov.nist.hit.iz.domain.jaxb.HL7V3MessageValidationReport createReport(String messageFilename)
			throws JAXBException, DatatypeConfigurationException, SOAPException, IOException {
		report = new gov.nist.hit.iz.domain.jaxb.HL7V3MessageValidationReport();
		setReportHeader(report);
		setReportSpecific(report, messageFilename);
		return report;
	}

	private void setReportHeader(gov.nist.hit.iz.domain.jaxb.HL7V3MessageValidationReport report)
			throws DatatypeConfigurationException, SOAPException, IOException {
		gov.nist.hit.iz.domain.jaxb.ReportHeader header = new gov.nist.hit.iz.domain.jaxb.ReportHeader();
		report.setHeaderReport(header);
		header.setValidationStatus(gov.nist.hit.iz.domain.jaxb.ValidationStatusType.COMPLETE);
		header.setServiceName("NIST SOAP Message Validation");
		header.setServiceProvider("NIST");
		header.setServiceVersion("Soap Validation Version 1.0");
		header.setStandardType(gov.nist.hit.iz.domain.jaxb.StandardTypeType.CDC_WSDL);
		header.setValidationType(gov.nist.hit.iz.domain.jaxb.ValidationType.AUTOMATED);
		// Date Test
		// Calendar cal = Calendar.getInstance();
		XMLGregorianCalendar cal = DatatypeFactory.newInstance().newXMLGregorianCalendar(new GregorianCalendar());
		header.setDateOfTest(cal);
		// Time of Test
		header.setTimeOfTest(cal);

		TestObjectReferenceList torl = new TestObjectReferenceList();
		header.setTestObjectReferenceList(torl);
		TestObjectReference messageReference = new TestObjectReference();
		torl.getTestObjectReference().add(messageReference);
		if (soapMessage.getFilename() != null) {
			messageReference.setType(TestObjectReferenceType.FILENAME);
			messageReference.setValue(soapMessage.getFilename());
		}

		header.setPositiveAssertionIndicator(true);

		// header.setTotalAssertionsMade();
		header.setAffirmCount(affirmativeCount);
		header.setErrorCount(errorCount);
		header.setWarningCount(warningCount);
		header.setIgnoreCount(ignoreCount);
		header.setAlertCount(alertCount);
		header.setTestObject("<![CDATA[" + soapMessage.getMessageAsString() + "]]>");
	}

	private void setReportSpecific(gov.nist.hit.iz.domain.jaxb.HL7V3MessageValidationReport report,
			String messageFilename) {
		HL7V3MessageReport specific = new HL7V3MessageReport();
		report.setSpecificReport(specific);
		// MetaData
		MetaData md = new MetaData();
		specific.setMetaData(md);
		if (soapMessage != null) {
			Message metaMessage = new Message();
			md.setMessage(metaMessage);
			metaMessage.setFilename(messageFilename);
		}
		// Assertions
		AssertionList assertions = new AssertionList();
		specific.setAssertionList(assertions);
		// Affirmative / Error / Warning / Ignore / Alert
		Iterator<MessageFailureV3> itMF = messageFailures.iterator();
		MessageFailureV3 mf = null;
		while (itMF.hasNext()) {
			mf = itMF.next();
			String elementContent = mf.getElementContent();
			String assertionDeclaration = mf.getAssertionDeclaration();
			if (assertionDeclaration == null) {
				assertionDeclaration = mf.getUserComment();
			}
			Assertion assertion = new Assertion();
			assertions.getAssertion().add(assertion);
			assertion.setType(gov.nist.hit.iz.domain.jaxb.AssertionTypeV3Constants.valueOf(mf.getFailureType()));
			assertion.setResult(gov.nist.hit.iz.domain.jaxb.AssertionResultConstants.valueOf(mf.getAssertionResult()));
			assertion.setSeverity(gov.nist.hit.iz.domain.jaxb.ErrorSeverityConstants.valueOf(mf.getFailureSeverity()));
			if (elementContent != null) {
				assertion.setContent(elementContent);
			}
			assertion.setDescription(mf.getDescription());
			if (assertionDeclaration != null) {
				assertion.setAssertionDeclaration(assertionDeclaration);
			}
			if (mf.getPath() != null) {
				Location location = new Location();
				assertion.setLocation(location);
				location.setXPath(mf.getPath());
			}
		}
	}

	protected void count() {
		// Map< ? extends StringEnumAbstractBase, AssertionResultConstants.Enum>
		// map) {
		// HashMap<AssertionTypeV3Constants.Enum, AssertionResultConstants.Enum>
		affirmativeCount = 0;
		errorCount = 0;
		warningCount = 0;
		ignoreCount = 0;
		alertCount = 0;
		informationalCount = 0;
		for (MessageFailureV3 mf : messageFailures) {
			String assertionResult = mf.getAssertionResult();
			if (assertionResult == null) {
				assertionResult = AssertionResultConstants.ERROR.toString();
			}
			if (assertionResult.equals(gov.nist.hit.iz.domain.jaxb.AssertionResultConstants.ERROR.toString())) {
				errorCount++;
			} else if (assertionResult
					.equals(gov.nist.hit.iz.domain.jaxb.AssertionResultConstants.WARNING.toString())) {
				warningCount++;
			} else if (assertionResult.equals(gov.nist.hit.iz.domain.jaxb.AssertionResultConstants.IGNORE.toString())) {
				ignoreCount++;
			} else if (assertionResult.equals(gov.nist.hit.iz.domain.jaxb.AssertionResultConstants.ALERT.toString())) {
				alertCount++;
			} else if (assertionResult
					.equals(gov.nist.hit.iz.domain.jaxb.AssertionResultConstants.AFFIRMATIVE.toString())) {
				affirmativeCount++;
			} else if (assertionResult
					.equals(gov.nist.hit.iz.domain.jaxb.AssertionResultConstants.INFORMATIONAL.toString())) {
				informationalCount++;
			} else {
				errorCount++;
			}
		}
		// Iterator<MessageFailureV3> it = messageFailures.iterator();
		// MessageFailureV3 mf = null;
		// while (it.hasNext()) {
		// mf = it.next();
		// if (map.get(mf.getFailureType()).equals(
		// AssertionResultConstants.ERROR)) {
		// errorCount++;
		// } else if (map.get(mf.getFailureType()).equals(
		// AssertionResultConstants.WARNING)) {
		// warningCount++;
		// } else if (map.get(mf.getFailureType()).equals(
		// AssertionResultConstants.IGNORE)) {
		// ignoreCount++;
		// } else if (map.get(mf.getFailureType()).equals(
		// AssertionResultConstants.ALERT)) {
		// alertCount++;
		// } else if (map.get(mf.getFailureType()).equals(
		// AssertionResultConstants.AFFIRMATIVE)) {
		// affirmativeCount++;
		// }
		// }
	}

	/**
	 * Get all message failure depending on the FailureLevel
	 * 
	 * @param failureResult
	 * @return a list of T
	 */
	public List<MessageFailureV3> getMessageFailure(String failureResult) {
		ArrayList<MessageFailureV3> al = new ArrayList<MessageFailureV3>();
		Iterator<MessageFailureV3> it = messageFailures.iterator();
		MessageFailureV3 mf = null;
		while (it.hasNext()) {
			mf = it.next();
			String assertionResult = mf.getAssertionResult();
			if (assertionResult != null && assertionResult.equals(failureResult)) {
				al.add(mf);
			}
			// else if (assertionResult == null) {
			// if
			// (context.getFailureResult(mf.getFailureType()).equals(failureResult))
			// {
			// al.add(mf);
			// }
			// }
		}
		return al;
	}

	/**
	 * Is the message valid? Depending on the MessageValidationContext settings
	 * 
	 * @return a boolean
	 */
	public boolean isValid() {
		return !getErrors().hasNext();
	}

	/**
	 * Get all errors depending on the MessageValidationContext settings
	 * 
	 * @return an Iterator of T
	 */
	public Iterator<MessageFailureV3> getErrors() {
		return getMessageFailure(AssertionResultConstants.ERROR.toString()).iterator();
	}

	/**
	 * Get all warnings depending on the MessageValidationContext settings
	 * 
	 * @return an Iterator of T
	 */
	public Iterator<MessageFailureV3> getWarnings() {
		return getMessageFailure(AssertionResultConstants.WARNING.toString()).iterator();
	}

	/**
	 * Get all ignores depending on the MessageValidationContext settings
	 * 
	 * @return an Iterator of T
	 */
	public Iterator<MessageFailureV3> getIgnores() {
		return getMessageFailure(AssertionResultConstants.IGNORE.toString()).iterator();
	}

	/**
	 * Get all alerts depending on the MessageValidationContext settings
	 * 
	 * @return an Iterator of T
	 */
	public Iterator<MessageFailureV3> getAlerts() {
		return getMessageFailure(AssertionResultConstants.ALERT.toString()).iterator();
	}

	/**
	 * Get all affirmatives depending on the MessageValidationContext settings
	 * 
	 * @return an Iterator of T
	 */
	public Iterator<MessageFailureV3> getAffirmatives() {
		return getMessageFailure(AssertionResultConstants.AFFIRMATIVE.toString()).iterator();
	}

	/**
	 * Get all informatives depending on the MessageValidationContext settings
	 * 
	 * @return an Iterator of T
	 */
	public Iterator<MessageFailureV3> getInformationals() {
		return getMessageFailure(AssertionResultConstants.INFORMATIONAL.toString()).iterator();
	}

	public int getAffirmativeCount() {
		return affirmativeCount;
	}

	public void setAffirmativeCount(int affirmativeCount) {
		this.affirmativeCount = affirmativeCount;
	}

	public int getErrorCount() {
		return errorCount;
	}

	public void setErrorCount(int errorCount) {
		this.errorCount = errorCount;
	}

	public int getWarningCount() {
		return warningCount;
	}

	public void setWarningCount(int warningCount) {
		this.warningCount = warningCount;
	}

	public int getIgnoreCount() {
		return ignoreCount;
	}

	public void setIgnoreCount(int ignoreCount) {
		this.ignoreCount = ignoreCount;
	}

	public int getAlertCount() {
		return alertCount;
	}

	public void setAlertCount(int alertCount) {
		this.alertCount = alertCount;
	}

	public int getInformationalCount() {
		return informationalCount;
	}

	public void setInformationalCount(int informationalCount) {
		this.informationalCount = informationalCount;
	}

	public HL7V3MessageValidationReport getReport() {
		return report;
	}

	public void setReport(HL7V3MessageValidationReport report) {
		this.report = report;
	}

	public List<MessageFailureV3> getMessageFailures() {
		return messageFailures;
	}

	public void setMessageFailures(List<MessageFailureV3> messageFailures) {
		this.messageFailures = messageFailures;
	}

	public SoapMessage getSoapMessage() {
		return soapMessage;
	}

	public String toXml() throws DatatypeConfigurationException, SOAPException, IOException {
		JAXBContext jaxbContext;
		try {
			jaxbContext = JAXBContext.newInstance(HL7V3MessageValidationReport.class);
			HL7V3MessageValidationReport report = this.createReport();
			gov.nist.hit.iz.domain.jaxb.ReportHeader header = report.getHeaderReport();
			header.setServiceProvider("NIST SOAP Validation tool");
			Marshaller jaxbMarshaller = jaxbContext.createMarshaller();
			// output pretty printed
			jaxbMarshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);
			// jaxbMarshaller.setProperty("com.sun.xml.internal.bind.namespacePrefixMapper",
			// new SOAPValidationReportNamespaceMapper());

			StringWriter sw = new StringWriter();
			jaxbMarshaller.marshal(report, sw);
			return sw.toString();
		} catch (JAXBException e) {
		}

		return null;
	}

}
