/*
 * NIST Healthcare Core SoapValidator.java July 19, 2011
 * 
 * This code was produced by the National Institute of Standards and Technology (NIST). See the
 * "nist.disclaimer" file given in the distribution for information on the use and redistribution of
 * this software.
 */
package gov.nist.hit.iz.service.soap;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.xml.parsers.ParserConfigurationException;
import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;
import javax.xml.soap.SOAPException;

import org.xml.sax.ErrorHandler;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;
import org.xml.sax.SAXNotRecognizedException;
import org.xml.sax.SAXParseException;
import org.xml.sax.XMLReader;

import gov.nist.healthcare.unified.validation.AssertionResultConstants;
import gov.nist.healthcare.unified.validation.AssertionTypeV3Constants;
import gov.nist.healthcare.unified.validation.ErrorSeverityConstants;
import gov.nist.hit.iz.domain.MessageFailureV3;
import gov.nist.validation.xml.schematron.Result;
import gov.nist.validation.xml.schematron.Result.Severity;
import gov.nist.validation.xml.schematron.Validator;

/**
 * @author Harold Affo(NIST)
 */
public class SOAPValidator {

	public static String SCHEMA_LANGUAGE = "http://java.sun.com/xml/jaxp/properties/schemaLanguage";
	public static String XML_SCHEMA = "http://www.w3.org/2001/XMLSchema";
	public static String SCHEMA_SOURCE = "http://java.sun.com/xml/jaxp/properties/schemaSource";
	public static String SOAP_SCHEMA = "http://www.w3.org/2003/05/soap-envelope";
	private static final String SKELETON_PATH = "/skeleton1-5.xsl";

	/**
	 * Validate a SoapMessage against the W3C schema
	 * 
	 * @param soapMessage
	 * @return
	 * @throws SOAPException
	 * @throws SAXException
	 * @throws IOException
	 */
	public static ArrayList<MessageFailureV3> validate(String soapMessage)
			throws SOAPException, IOException, SAXException {
		ArrayList<MessageFailureV3> schemaFailures = new ArrayList<MessageFailureV3>();
		try {
			schemaFailures = validateWithSchema(soapMessage);
		} catch (ParserConfigurationException e) {
			MessageFailureV3 mf = new MessageFailureV3();
			mf.setFailureType(AssertionTypeV3Constants.SOAP.toString());
			mf.setFailureSeverity(ErrorSeverityConstants.FATAL.toString());
			mf.setAssertionResult(AssertionResultConstants.ERROR.toString());

			mf.setDescription(e.getLocalizedMessage());
			mf.setLine(1);
			mf.setColumn(1);
			schemaFailures.add(mf);
		} catch (SAXParseException e) {
			MessageFailureV3 mf = new MessageFailureV3();
			mf.setFailureType(AssertionTypeV3Constants.SOAP.toString());
			mf.setFailureSeverity(ErrorSeverityConstants.FATAL.toString());
			mf.setAssertionResult(AssertionResultConstants.ERROR.toString());

			mf.setDescription(e.getMessage());
			mf.setLine(e.getLineNumber());
			mf.setColumn(e.getColumnNumber());
			schemaFailures.add(mf);
		}
		return schemaFailures;
	}

	/**
	 * Validate a SoapMessage against the W3C schema and schematron rules
	 * 
	 * @param soapMessage
	 * @param schematron
	 * @return
	 * @throws SOAPException
	 * @throws SAXException
	 * @throws ParserConfigurationException
	 * @throws IOException
	 * @throws XmlException
	 */
	public static ArrayList<MessageFailureV3> validate(String soapMessage, InputStream schematron, String phase)
			throws SOAPException, IOException, SAXException {
		ArrayList<MessageFailureV3> result = new ArrayList<MessageFailureV3>();
		try {
			ArrayList<MessageFailureV3> schemaFailures = validateWithSchema(soapMessage);
			List<MessageFailureV3> schematronFailures = validateWithSchematron(soapMessage, schematron, phase);
			if (schemaFailures != null) {
				result.addAll(schemaFailures);
			}
			if (schematronFailures != null) {
				result.addAll(schematronFailures);
			}
		} catch (ParserConfigurationException e) {
			MessageFailureV3 mf = new MessageFailureV3();
			mf.setFailureType(AssertionTypeV3Constants.SOAP.toString());
			mf.setFailureSeverity(ErrorSeverityConstants.FATAL.toString());
			mf.setAssertionResult(AssertionResultConstants.ERROR.toString());

			mf.setDescription(e.getMessage());
			mf.setLine(1);
			mf.setColumn(1);
			result.add(mf);
		} catch (SAXParseException e) {
			MessageFailureV3 mf = new MessageFailureV3();
			mf.setFailureType(AssertionTypeV3Constants.SOAP.toString());
			mf.setFailureSeverity(ErrorSeverityConstants.FATAL.toString());
			mf.setAssertionResult(AssertionResultConstants.ERROR.toString());

			mf.setDescription(e.getMessage());
			mf.setLine(e.getLineNumber());
			mf.setColumn(e.getColumnNumber());
			result.add(mf);
		}
		return result;
	}

	private static ArrayList<MessageFailureV3> validateWithSchema(String xml)
			throws SOAPException, IOException, SAXException, ParserConfigurationException {
		ArrayList<MessageFailureV3> failures = new ArrayList<MessageFailureV3>();
		SAXParserFactory factory = SAXParserFactory.newInstance();
		factory.setValidating(true);
		factory.setNamespaceAware(true);
		SAXParser parser = factory.newSAXParser();
		try {
			parser.setProperty(SCHEMA_LANGUAGE, XML_SCHEMA);
			parser.setProperty(SCHEMA_SOURCE, SOAP_SCHEMA);
		} catch (SAXNotRecognizedException x) {
			throw new SAXException("Your SAX parser is not JAXP 1.2 compliant.");
		}
		XMLReader reader = parser.getXMLReader();
		reader.setErrorHandler(new ErrorHandler() {
			@Override
			public void warning(SAXParseException e) throws SAXException {
				MessageFailureV3 mf = new MessageFailureV3();
				mf.setFailureType(AssertionTypeV3Constants.SOAP.toString());
				mf.setFailureSeverity(ErrorSeverityConstants.NORMAL.toString());
				mf.setAssertionResult(AssertionResultConstants.WARNING.toString());
				mf.setDescription(e.getLocalizedMessage());
				mf.setLine(e.getLineNumber());
				mf.setColumn(e.getColumnNumber());
				failures.add(mf);
			}

			@Override
			public void error(SAXParseException e) throws SAXException {
				MessageFailureV3 mf = new MessageFailureV3();
				mf.setFailureType(AssertionTypeV3Constants.SOAP.toString());
				mf.setFailureSeverity(ErrorSeverityConstants.NORMAL.toString());
				mf.setAssertionResult(getAssertionResultType(e.getMessage()).toString());
				mf.setDescription(e.getLocalizedMessage());
				mf.setLine(e.getLineNumber());
				mf.setColumn(e.getColumnNumber());
				failures.add(mf);
			}

			@Override
			public void fatalError(SAXParseException e) throws SAXException {
				MessageFailureV3 mf = new MessageFailureV3();
				mf.setFailureType(AssertionTypeV3Constants.SOAP.toString());
				mf.setFailureSeverity(ErrorSeverityConstants.FATAL.toString());
				mf.setAssertionResult(AssertionResultConstants.ERROR.toString());
				mf.setDescription(e.getMessage());
				mf.setLine(e.getLineNumber());
				mf.setColumn(e.getColumnNumber());
				failures.add(mf);
			}
		});
		InputSource source = new InputSource(new StringReader(xml));
		reader.parse(source);

		return failures;
	}

	private static List<MessageFailureV3> validateWithSchematron(String soap, InputStream schematron, String phase)
			throws SAXException, ParserConfigurationException, IOException, SOAPException {
		List<MessageFailureV3> failures = new ArrayList<MessageFailureV3>();
		Collection<Result> results = Validator.validateWithSchematron(soap, schematron, phase, Severity.ERRORS);
		if (results != null) {
			for (Result result : results) {
				failures.add(getFailure(result));
			}
		}
		return failures;
	}

	private static MessageFailureV3 getFailure(Result result) {
		MessageFailureV3 mf = new MessageFailureV3();
		mf.setFailureType(AssertionTypeV3Constants.SOAP.toString());
		mf.setFailureSeverity(ErrorSeverityConstants.NORMAL.toString());
		mf.setAssertionResult(getAssertionResultType(result.getMessage()).toString());
		mf.setDescription(result.getMessage());
		mf.setPath(result.getContext());
		return mf;
	}

	private static AssertionResultConstants getAssertionResultType(String failure) {
		if (failure != null) {
			failure = failure.trim();
			if (failure.toUpperCase().startsWith("ERROR")) {
				return AssertionResultConstants.ERROR;
			} else if (failure.toUpperCase().startsWith("WARNING")) {
				return AssertionResultConstants.WARNING;
			}
		}
		return AssertionResultConstants.ERROR;
	}

}
