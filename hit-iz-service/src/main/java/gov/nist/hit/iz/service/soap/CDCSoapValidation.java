package gov.nist.hit.iz.service.soap;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.regex.Pattern;

import javax.xml.soap.SOAPException;

import org.apache.commons.io.IOUtils;
import org.jdom2.Document;
import org.jdom2.Element;
import org.jdom2.JDOMException;
import org.jdom2.Namespace;
import org.jdom2.filter.Filters;
import org.jdom2.input.SAXBuilder;
import org.jdom2.located.LocatedElement;
import org.jdom2.located.LocatedJDOMFactory;
import org.jdom2.xpath.XPathExpression;
import org.jdom2.xpath.XPathFactory;
import org.xml.sax.SAXException;

import gov.nist.healthcare.unified.validation.AssertionResultConstants;
import gov.nist.healthcare.unified.validation.AssertionTypeV3Constants;
import gov.nist.healthcare.unified.validation.ErrorSeverityConstants;
import gov.nist.hit.iz.domain.MessageFailureV3;
import gov.nist.hit.iz.domain.soap.SoapMessage;
import gov.nist.hit.iz.domain.soap.SoapValidationResult;
import gov.nist.hit.iz.service.util.ConnectivityUtil;

public class CDCSoapValidation {

	String schematronPath = null;

	public CDCSoapValidation() {
		schematronPath = "/soap/schema/soap_rules.sch";
	}

	private ArrayList<MessageFailureV3> verifySubmitSingleMessageRequest(String soapMessage, String phase) {
		ArrayList<MessageFailureV3> soapFailures = new ArrayList<MessageFailureV3>();
		try {
			String hl7Message = ConnectivityUtil.getRequestHl7Message(soapMessage);
			if (hl7Message != null && !"".equals(hl7Message)) {
				String path = "/Envelope[1]/Body[1]/submitSingleMessage[1]/hl7Message[1]";
				String cdataStart = "<![CDATA[";
				String cdataEnd = "]]>";
				if (hl7Message.startsWith("<![CDATA[")) {
					hl7Message = hl7Message.substring(cdataStart.length());
					hl7Message = hl7Message.substring(0, hl7Message.lastIndexOf(cdataEnd));
				}
				// check for welformed content
				String[] tabs = hl7Message.split(Pattern.quote("MSH|"));
				if (tabs != null && tabs.length > 2) {
					MessageFailureV3 mf = new MessageFailureV3();
					mf.setFailureType(AssertionTypeV3Constants.SOAP.toString());
					mf.setFailureSeverity(ErrorSeverityConstants.NORMAL.toString());
					mf.setAssertionResult(AssertionResultConstants.ERROR.toString());
					mf.setDescription("hl7Message element must contain only one HL7 V2 message");
					mf.setPath(path);
					soapFailures.add(mf);
				}
			}
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return soapFailures;
	}

	private ArrayList<MessageFailureV3> verifyConnectivityResponse(String soapMessage, String requestMessage) {
		ArrayList<MessageFailureV3> soapFailures = new ArrayList<MessageFailureV3>();
		try {
			if (requestMessage != null) {
				String echoBack = ConnectivityUtil.getConnectivityEchoBack(requestMessage);
				String returnedValue = ConnectivityUtil.getConnectivityReturn(soapMessage);
				if (returnedValue == null) {
					MessageFailureV3 mf = new MessageFailureV3();
					mf.setFailureType(AssertionTypeV3Constants.SOAP.toString());
					mf.setFailureSeverity(ErrorSeverityConstants.NORMAL.toString());
					mf.setAssertionResult(AssertionResultConstants.ERROR.toString());
					mf.setDescription("No retun element found");
					String path = "/Envelope[1]/Body[1]/connectivityTestResponse[1]";
					mf.setPath(path);
					soapFailures.add(mf);
				} else if (echoBack != null && !returnedValue.contains(echoBack)) {
					MessageFailureV3 mf = new MessageFailureV3();
					mf.setFailureType(AssertionTypeV3Constants.SOAP.toString());
					mf.setFailureSeverity(ErrorSeverityConstants.NORMAL.toString());
					mf.setAssertionResult(AssertionResultConstants.WARNING.toString());
					mf.setDescription("The returned value '" + returnedValue + "' does not contain '" + echoBack + "'");
					String path = "/Envelope[1]/Body[1]/connectivityTestResponse[1]/return[1]";
					mf.setPath(path);
					soapFailures.add(mf);
				}
			}

		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return soapFailures;
	}

	private ArrayList<MessageFailureV3> verifySubmitSingleMessageResponse(String soapMessage) {
		ArrayList<MessageFailureV3> soapFailures = new ArrayList<MessageFailureV3>();
		try {
			String returnContent = ConnectivityUtil.getResponseHl7Message(soapMessage);
			if (returnContent != null && !"".equals(returnContent)) {
				String path = "/Envelope[1]/Body[1]/submitSingleMessageResponse[1]/return[1]";
				String cdataStart = "<![CDATA[";
				String cdataEnd = "]]>";
				if (returnContent.startsWith("<![CDATA[")) {
					returnContent = returnContent.substring(cdataStart.length());
					returnContent = returnContent.substring(0, returnContent.lastIndexOf(cdataEnd));
				}
				// check for welformed content
				String[] tabs = returnContent.split(Pattern.quote("MSH|"));
				if (tabs != null && tabs.length > 2) {
					MessageFailureV3 mf = new MessageFailureV3();
					mf.setFailureType(AssertionTypeV3Constants.SOAP.toString());
					mf.setFailureSeverity(ErrorSeverityConstants.NORMAL.toString());
					mf.setAssertionResult(AssertionResultConstants.ERROR.toString());
					mf.setDescription("return element must contain only one HL7 V2 message");
					mf.setPath(path);
					soapFailures.add(mf);
				}

			}
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return soapFailures;
	}

	/**
	 * 
	 * @param soapMessage
	 * @param schematron
	 * @param phase
	 * @return
	 * @throws IOException
	 * @throws SOAPException
	 * @throws SAXException
	 * @throws XmlException
	 */
	public SoapValidationResult validate(String soapMessage, String... options)
			throws SOAPException, IOException, SAXException {
		String phase = options[0];
		ArrayList<MessageFailureV3> soapFailures = new ArrayList<MessageFailureV3>();
		// schematron validation
		soapFailures.addAll(SOAPValidator.validate(soapMessage,
				CDCSoapValidation.class.getResourceAsStream(schematronPath), phase));
		if (phase.equals("submitSingleMessage_Request")) {
			soapFailures.addAll(verifySubmitSingleMessageRequest(soapMessage, phase));
		} else if (phase.equals("connectivityTest_Response")) {
			String requestMessage = options.length >= 2 ? options[1] : null;
			soapFailures.addAll(verifyConnectivityResponse(soapMessage, requestMessage));
		} else if (phase.equals("submitSingleMessage_Response")) {
			soapFailures.addAll(verifySubmitSingleMessageResponse(soapMessage));
		}
		setErrLineNumbers(soapMessage, soapFailures);
		return new SoapValidationResult(new SoapMessage(soapMessage), soapFailures);
	}

	private String normalizeErrPath(String targetPath) {
		String tp1 = null;

		// Envelope
		if (targetPath.equals("/Envelope")) {
			tp1 = targetPath.replaceAll("\\Q/Envelope\\E", "/a:Envelope");
		}
		// Envelope/Body
		if (targetPath.equals("/Envelope/Body")) {
			tp1 = targetPath.replaceAll("\\Q/Envelope/Body\\E", "/a:Envelope/a:Body");
		}

		// Envelope/Body/connectivityTest
		if (targetPath.equals("/Envelope/Body/connectivityTest")) {
			tp1 = targetPath.replaceAll("\\Q/Envelope/Body/connectivityTest\\E",
					"/a:Envelope/a:Body/b:connectivityTest");
		}

		// Envelope/Body/connectivityTestResponse
		if (targetPath.equals("/Envelope/Body/connectivityTestResponse")) {
			tp1 = targetPath.replaceAll("\\Q/Envelope/Body/connectivityTestResponse\\E",
					"/a:Envelope/a:Body/b:connectivityTestResponse");
		}

		// Envelope
		if (targetPath.equals("/Envelope[1]")) {
			tp1 = targetPath.replaceAll("\\Q/Envelope[1]\\E", "/a:Envelope");
		}
		// Envelope/Body
		if (targetPath.equals("/Envelope[1]/Body[1]")) {
			tp1 = targetPath.replaceAll("\\Q/Envelope[1]/Body[1]\\E", "/a:Envelope/a:Body");
		}

		// Envelope/Body/connectivityTest
		if (targetPath.equals("/Envelope[1]/Body[1]/connectivityTest[1]")) {
			tp1 = targetPath.replaceAll("\\Q/Envelope[1]/Body[1]/connectivityTest[1]\\E",
					"/a:Envelope/a:Body/b:connectivityTest");
		}

		// Envelope/Body/connectivityTest/echoBack
		if (targetPath.equals("/Envelope[1]/Body[1]/connectivityTest[1]/echoBack[1]")) {
			tp1 = targetPath.replaceAll("\\Q/Envelope[1]/Body[1]/connectivityTest[1]/echoBack[1]\\E",
					"/a:Envelope/a:Body/b:connectivityTest/b:echoBack");
		}

		// Envelope/Body/connectivityTestResponse
		if (targetPath.equals("/Envelope[1]/Body[1]/connectivityTestResponse[1]")) {
			tp1 = targetPath.replaceAll("\\Q/Envelope[1]/Body[1]/connectivityTestResponse[1]\\E",
					"/a:Envelope/a:Body/b:connectivityTestResponse");
		}

		// Envelope/Body/connectivityTestResponse/return
		if (targetPath.equals("/Envelope[1]/Body[1]/connectivityTestResponse[1]/return[1]")) {
			tp1 = targetPath.replaceAll("\\Q/Envelope[1]/Body[1]/connectivityTestResponse[1]/return[1]\\E",
					"/a:Envelope/a:Body/b:connectivityTestResponse/b:return");
		}

		// Envelope/Body/submitSingleMessage
		if (targetPath.equals("/Envelope[1]/Body[1]/submitSingleMessage[1]")) {
			tp1 = targetPath.replaceAll("\\Q/Envelope[1]/Body[1]/submitSingleMessage[1]\\E",
					"/a:Envelope/a:Body/b:submitSingleMessage");
		}

		// Envelope/Body/submitSingleMessage/username
		if (targetPath.equals("/Envelope[1]/Body[1]/submitSingleMessage[1]/username[1]")) {
			tp1 = targetPath.replaceAll("\\Q/Envelope[1]/Body[1]/submitSingleMessage[1]/username[1]\\E",
					"/a:Envelope/a:Body/b:submitSingleMessage/b:username");
		}

		// Envelope/Body/submitSingleMessage/password
		if (targetPath.equals("/Envelope[1]/Body[1]/submitSingleMessage[1]/password[1]")) {
			tp1 = targetPath.replaceAll("\\Q/Envelope[1]/Body[1]/submitSingleMessage[1]/password[1]\\E",
					"/a:Envelope/a:Body/b:submitSingleMessage/b:password");
		}

		// Envelope/Body/submitSingleMessage/facilityID
		if (targetPath.equals("/Envelope[1]/Body[1]/submitSingleMessage[1]/facilityID[1]")) {
			tp1 = targetPath.replaceAll("\\Q/Envelope[1]/Body[1]/submitSingleMessage[1]/facilityID[1]\\E",
					"/a:Envelope/a:Body/b:submitSingleMessage/b:facilityID");
		}

		// Envelope/Body/submitSingleMessage/hl7Message
		if (targetPath.equals("/Envelope[1]/Body[1]/submitSingleMessage[1]/hl7Message[1]")) {
			tp1 = targetPath.replaceAll("\\Q/Envelope[1]/Body[1]/submitSingleMessage[1]/hl7Message[1]\\E",
					"/a:Envelope/a:Body/b:submitSingleMessage/b:hl7Message");
		}

		// Envelope/Body/submitSingleMessage_Response
		if (targetPath.equals("/Envelope[1]/Body[1]/submitSingleMessageResponse[1]")) {
			tp1 = targetPath.replaceAll("\\Q/Envelope[1]/Body[1]/submitSingleMessageResponse[1]\\E",
					"/a:Envelope/a:Body/b:submitSingleMessageResponse");
		}

		// Envelope/Body/submitSingleMessage_Response/return
		if (targetPath.equals("/Envelope[1]/Body[1]/submitSingleMessageResponse[1]/return[1]")) {
			tp1 = targetPath.replaceAll("\\Q/Envelope[1]/Body[1]/submitSingleMessageResponse[1]/return[1]\\E",
					"/a:Envelope/a:Body/b:submitSingleMessageResponse/b:return");
		}

		// All of the Faults...

		// Envelope/Body/Fault
		if (targetPath.equals("/Envelope[1]/Body[1]/Fault[1]")) {
			tp1 = targetPath.replaceAll("\\Q/Envelope[1]/Body[1]/Fault[1]\\E", "/a:Envelope/a:Body/a:Fault");
		}

		// Envelope/Body/Fault/Code
		if (targetPath.equals("/Envelope[1]/Body[1]/Fault[1]/Code[1]")) {
			tp1 = targetPath.replaceAll("\\Q/Envelope[1]/Body[1]/Fault[1]/Code[1]\\E",
					"/a:Envelope/a:Body/a:Fault/a:Code");
		}

		// Envelope/Body/Fault/Code/Value
		if (targetPath.equals("/Envelope[1]/Body[1]/Fault[1]/Code[1]/Value[1]")) {
			tp1 = targetPath.replaceAll("\\Q/Envelope[1]/Body[1]/Fault[1]/Code[1]/Value[1]\\E",
					"/a:Envelope/a:Body/a:Fault/a:Code/a:Value");
		}

		// Envelope/Body/Fault/Reason
		if (targetPath.equals("/Envelope[1]/Body[1]/Fault[1]/Reason[1]")) {
			tp1 = targetPath.replaceAll("\\Q/Envelope[1]/Body[1]/Fault[1]/Reason[1]\\E",
					"/a:Envelope/a:Body/a:Fault/a:Reason");
		}

		// Envelope/Body/Fault/Detail
		if (targetPath.equals("/Envelope[1]/Body[1]/Fault[1]/Detail[1]")) {
			tp1 = targetPath.replaceAll("\\Q/Envelope[1]/Body[1]/Fault[1]/Detail[1]\\E",
					"/a:Envelope/a:Body/a:Fault/a:Detail");
		}

		// Envelope/Body/Fault/Detail/SecurityFault
		if (targetPath.equals("/Envelope[1]/Body[1]/Fault[1]/Detail[1]/SecurityFault[1]")) {
			tp1 = targetPath.replaceAll("\\Q/Envelope[1]/Body[1]/Fault[1]/Detail[1]/SecurityFault[1]\\E",
					"/a:Envelope/a:Body/a:Fault/a:Detail/b:SecurityFault");
		}

		// Envelope/Body/Fault/Detail/SecurityFault/Code
		if (targetPath.equals("/Envelope[1]/Body[1]/Fault[1]/Detail[1]/SecurityFault[1]/Code[1]")) {
			tp1 = targetPath.replaceAll("\\Q/Envelope[1]/Body[1]/Fault[1]/Detail[1]/SecurityFault[1]/Code[1]\\E",
					"/a:Envelope/a:Body/a:Fault/a:Detail/b:SecurityFault/b:Code");
		}

		// Envelope/Body/Fault/Detail/SecurityFault/Reason
		if (targetPath.equals("/Envelope[1]/Body[1]/Fault[1]/Detail[1]/SecurityFault[1]/Reason[1]")) {
			tp1 = targetPath.replaceAll("\\Q/Envelope[1]/Body[1]/Fault[1]/Detail[1]/SecurityFault[1]/Reason[1]\\E",
					"/a:Envelope/a:Body/a:Fault/a:Detail/b:SecurityFault/b:Reason");
		}

		// Envelope/Body/Fault/Detail/SecurityFault/Detail
		if (targetPath.equals("/Envelope[1]/Body[1]/Fault[1]/Detail[1]/SecurityFault[1]/Detail[1]")) {
			tp1 = targetPath.replaceAll("\\Q/Envelope[1]/Body[1]/Fault[1]/Detail[1]/SecurityFault[1]/Detail[1]\\E",
					"/a:Envelope/a:Body/a:Fault/a:Detail/b:SecurityFault/b:Detail");
		}

		// Envelope/Body/Fault/Detail/MessageTooLargeFault
		if (targetPath.equals("/Envelope[1]/Body[1]/Fault[1]/Detail[1]/MessageTooLargeFault[1]")) {
			tp1 = targetPath.replaceAll("\\Q/Envelope[1]/Body[1]/Fault[1]/Detail[1]/MessageTooLargeFault[1]\\E",
					"/a:Envelope/a:Body/a:Fault/a:Detail/b:MessageTooLargeFault");
		}

		// Envelope/Body/Fault/Detail/MessageTooLargeFault/Code
		if (targetPath.equals("/Envelope[1]/Body[1]/Fault[1]/Detail[1]/MessageTooLargeFault[1]/Code[1]")) {
			tp1 = targetPath.replaceAll("\\Q/Envelope[1]/Body[1]/Fault[1]/Detail[1]/MessageTooLargeFault[1]/Code[1]\\E",
					"/a:Envelope/a:Body/a:Fault/a:Detail/b:MessageTooLargeFault/b:Code");
		}

		// Envelope/Body/Fault/Detail/MessageTooLargeFault/Reason
		if (targetPath.equals("/Envelope[1]/Body[1]/Fault[1]/Detail[1]/MessageTooLargeFault[1]/Reason[1]")) {
			tp1 = targetPath.replaceAll(
					"\\Q/Envelope[1]/Body[1]/Fault[1]/Detail[1]/MessageTooLargeFault[1]/Reason[1]\\E",
					"/a:Envelope/a:Body/a:Fault/a:Detail/b:MessageTooLargeFault/b:Reason");
		}

		// Envelope/Body/Fault/Detail/MessageTooLargeFault/Detail
		if (targetPath.equals("/Envelope[1]/Body[1]/Fault[1]/Detail[1]/MessageTooLargeFault[1]/Detail[1]")) {
			tp1 = targetPath.replaceAll(
					"\\Q/Envelope[1]/Body[1]/Fault[1]/Detail[1]/MessageTooLargeFault[1]/Detail[1]\\E",
					"/a:Envelope/a:Body/a:Fault/a:Detail/b:MessageTooLargeFault/b:Detail");
		}

		// Envelope/Body/Fault/Detail/UnsupportedOperationFault
		if (targetPath.equals("/Envelope[1]/Body[1]/Fault[1]/Detail[1]/UnsupportedOperationFault[1]")) {
			tp1 = targetPath.replaceAll("\\Q/Envelope[1]/Body[1]/Fault[1]/Detail[1]/UnsupportedOperationFault[1]\\E",
					"/a:Envelope/a:Body/a:Fault/a:Detail/b:UnsupportedOperationFault");
		}

		// Envelope/Body/Fault/Detail/UnsupportedOperationFault/Code
		if (targetPath.equals("/Envelope[1]/Body[1]/Fault[1]/Detail[1]/UnsupportedOperationFault[1]/Code[1]")) {
			tp1 = targetPath.replaceAll(
					"\\Q/Envelope[1]/Body[1]/Fault[1]/Detail[1]/UnsupportedOperationFault[1]/Code[1]\\E",
					"/a:Envelope/a:Body/a:Fault/a:Detail/b:UnsupportedOperationFault/b:Code");
		}

		// Envelope/Body/Fault/Detail/UnsupportedOperationFault/Reason
		if (targetPath.equals("/Envelope[1]/Body[1]/Fault[1]/Detail[1]/UnsupportedOperationFault[1]/Reason[1]")) {
			tp1 = targetPath.replaceAll(
					"\\Q/Envelope[1]/Body[1]/Fault[1]/Detail[1]/UnsupportedOperationFault[1]/Reason[1]\\E",
					"/a:Envelope/a:Body/a:Fault/a:Detail/b:UnsupportedOperationFault/b:Reason");
		}

		// Envelope/Body/Fault/Detail/UnsupportedOperationFault/Detail
		if (targetPath.equals("/Envelope[1]/Body[1]/Fault[1]/Detail[1]/UnsupportedOperationFault[1]/Detail[1]")) {
			tp1 = targetPath.replaceAll(
					"\\Q/Envelope[1]/Body[1]/Fault[1]/Detail[1]/UnsupportedOperationFault[1]/Detail[1]\\E",
					"/a:Envelope/a:Body/a:Fault/a:Detail/b:UnsupportedOperationFault/b:Detail");
		}

		// Envelope/Body/Fault/Detail/fault
		if (targetPath.equals("/Envelope[1]/Body[1]/Fault[1]/Detail[1]/fault[1]")) {
			tp1 = targetPath.replaceAll("\\Q/Envelope[1]/Body[1]/Fault[1]/Detail[1]/fault[1]\\E",
					"/a:Envelope/a:Body/a:Fault/a:Detail/b:fault");
		}

		// Envelope/Body/Fault/Detail/fault/Code
		if (targetPath.equals("/Envelope[1]/Body[1]/Fault[1]/Detail[1]/fault[1]/Code[1]")) {
			tp1 = targetPath.replaceAll("\\Q/Envelope[1]/Body[1]/Fault[1]/Detail[1]/fault[1]/Code[1]\\E",
					"/a:Envelope/a:Body/a:Fault/a:Detail/b:fault/b:Code");
		}

		// Envelope/Body/Fault/Detail/fault/Reason
		if (targetPath.equals("/Envelope[1]/Body[1]/Fault[1]/Detail[1]/fault[1]/Reason[1]")) {
			tp1 = targetPath.replaceAll("\\Q/Envelope[1]/Body[1]/Fault[1]/Detail[1]/fault[1]/Reason[1]\\E",
					"/a:Envelope/a:Body/a:Fault/a:Detail/b:fault/b:Reason");
		}

		// Envelope/Body/Fault/Detail/fault/Detail
		if (targetPath.equals("/Envelope[1]/Body[1]/Fault[1]/Detail[1]/fault[1]/Detail[1]")) {
			tp1 = targetPath.replaceAll("\\Q/Envelope[1]/Body[1]/Fault[1]/Detail[1]/fault[1]/Detail[1]\\E",
					"/a:Envelope/a:Body/a:Fault/a:Detail/b:fault/b:Detail");
		}

		return tp1;
	}

	private void setErrLineNumbers(String soapXml, ArrayList<gov.nist.hit.iz.domain.MessageFailureV3> soapFailures) {
		// the SAXBuilder is the easiest way to create the JDOM2 objects.
		SAXBuilder jdomBuilder = new SAXBuilder();
		jdomBuilder.setJDOMFactory(new LocatedJDOMFactory());
		Iterator<gov.nist.hit.iz.domain.MessageFailureV3> iterator = soapFailures.iterator();
		while (iterator.hasNext()) {
			gov.nist.hit.iz.domain.MessageFailureV3 failure = iterator.next();
			String targetPath = failure.getPath();
			if (targetPath == null) {
				continue;
			}

			String tp1 = normalizeErrPath(targetPath);

			if (tp1 != null) {
				try {
					Document jdomDocument = jdomBuilder.build(IOUtils.toInputStream(soapXml));
					XPathFactory xFactory = XPathFactory.instance();
					Namespace SOAPNs = Namespace.getNamespace("a", "http://www.w3.org/2003/05/soap-envelope");
					Namespace CDCNs = Namespace.getNamespace("b", "urn:cdc:iisb:2011");
					XPathExpression<Element> expr = xFactory.compile(tp1, Filters.element(), null, SOAPNs, CDCNs);
					Element child = expr.evaluateFirst(jdomDocument);
					if (child != null) {
						failure.setLine(((LocatedElement) child).getLine());
					}
				} catch (JDOMException | IOException e) {
				}
			}
		}

	}

}
