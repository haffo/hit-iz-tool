/*
 * NIST Healthcare Core
 * SoapMessage.java July 19, 2011
 *
 * This code was produced by the National Institute of Standards and
 * Technology (NIST). See the "nist.disclaimer" file given in the distribution
 * for information on the use and redistribution of this software.
 */
package gov.nist.hit.iz.domain.soap;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.nio.charset.Charset;
import java.util.Scanner;

import javax.xml.soap.MessageFactory;
import javax.xml.soap.MimeHeaders;
import javax.xml.soap.SOAPException;
import javax.xml.soap.SOAPMessage;

/**
 * @author Harold Affo (NIST)
 */

public class SoapMessage {

	private File messageFile;
	protected SOAPMessage messageDoc;
	protected String httpHeader;

	/**
	 * Create a new SoapMessage from a file
	 * 
	 * @param messageFile
	 * @throws MalformedMessageException
	 */
	public SoapMessage(File messageFile) throws Exception {
		// setByDocument(XmlObject.Factory.parse(messageFile,
		// (new XmlOptions()).setLoadLineNumbers()));
		this.messageFile = messageFile;
		FileReader rd = new FileReader(messageFile);
		char[] buf = new char[(int) messageFile.length()];
		rd.read(buf);
		rd.close();
		String soapMessage = new String(buf);
		this.httpHeader = extractHeader(soapMessage);
		this.messageDoc = extractSoap(soapMessage);

	}

	/**
	 * Create a new SoapMessage from an XmlObject
	 * 
	 * @param httpHeader
	 * @param messageDoc
	 * @throws MalformedMessageException
	 */
	public SoapMessage(String httpHeader, SOAPMessage messageDoc) throws SOAPException {
		try {
			this.httpHeader = httpHeader;
			this.messageDoc = messageDoc;
		} catch (Exception e) {
			throw new SOAPException(e.getMessage());
		}
	}

	public SoapMessage(String soapMessage) throws SOAPException {
		try {
			this.httpHeader = extractHeader(soapMessage);
			this.messageDoc = extractSoap(soapMessage);
		} catch (Exception e) {
			throw new SOAPException(e.getMessage());
		}
	}

	/**
	 * Save the SoapMessage in a File
	 * 
	 * @param file
	 * @throws IOException
	 * @throws SOAPException
	 */
	public void save(File file) throws IOException, SOAPException {

		FileOutputStream out = new FileOutputStream(file);
		/* Write header */
		if (httpHeader != null && !"".equals(httpHeader)) {
			out.write(httpHeader.getBytes());
			out.write("\n\r".getBytes());
		}
		/* Write SOAP */
		if (messageDoc != null) {
			out.write(docToString().getBytes());
		}
		out.close();

	}

	/**
	 * Get the SOAP version
	 * 
	 * @return
	 * @throws SOAPException
	 */
	public String getVersionAsString() throws SOAPException {
		// String nms = messageDoc.get
		// if (nms.contains("https://schemas.xmlsoap.org/soap/envelope")) {
		// return "1.1";
		// } else if (nms.contains("https://www.w3.org/2003/05/soap-envelope"))
		// {
		// return "1.2";
		// }
		return "1.2";
	}

	/**
	 * Get the file name (if the SoapMessage was created from a File)
	 * 
	 * @return
	 */
	public String getFilename() {
		String filename = "";
		if (messageFile != null) {
			filename = messageFile.getAbsolutePath();
		}
		return filename;
	}

	/**
	 * Get the SoapMessage as a String
	 * 
	 * @return
	 * @throws IOException
	 * @throws SOAPException
	 */
	public String getMessageAsString() throws SOAPException, IOException {
		StringBuffer buf = new StringBuffer();
		if (httpHeader != null && !"".equals(httpHeader)) {
			buf.append(httpHeader);
			buf.append("\n\r");
		}
		if (messageDoc != null) {
			buf.append(docToString());
		}
		return buf.toString();
	}

	// private void setByDocument(XmlObject doc) {
	// messageDoc = doc;
	// }

	public SOAPMessage getMessageDoc() {
		return messageDoc;
	}

	public void setMessageDoc(SOAPMessage messageDoc) {
		this.messageDoc = messageDoc;
	}

	public String getHttpHeader() {
		return httpHeader;
	}

	public void setHttpHeader(String httpHeader) {
		this.httpHeader = httpHeader;
	}

	private String extractHeader(String input) {
		StringBuffer httpHeader = new StringBuffer();
		StringBuffer soap = new StringBuffer();
		parse(input, httpHeader, soap);
		return httpHeader.toString();
	}

	private SOAPMessage extractSoap(String input) throws SOAPException, IOException {
		StringBuffer httpHeader = new StringBuffer();
		StringBuffer soap = new StringBuffer();
		parse(input, httpHeader, soap);
		SOAPMessage result = getSoapMessageFromString(soap.toString());
		return result;
	}

	private SOAPMessage getSoapMessageFromString(String xml) throws SOAPException, IOException {
		MessageFactory factory = MessageFactory.newInstance();
		SOAPMessage message = factory.createMessage(new MimeHeaders(),
				new ByteArrayInputStream(xml.getBytes(Charset.forName("UTF-8"))));
		return message;
	}

	private void parse(String input, StringBuffer httpHeader, StringBuffer soap) {
		httpHeader.delete(0, httpHeader.length());
		soap.delete(0, soap.length());
		Scanner s = new Scanner(input);
		boolean httpHeaderDetected = false;
		boolean soapDetected = false;

		/* Remove blank lines from the beginning */
		while (s.hasNextLine()) {
			String line = s.nextLine();
			if (line.matches("\\s*")) {
				/* Do nothing */
			} else if (line.matches("\\s*<.*")) {
				/* soap detected */
				httpHeaderDetected = false;
				soapDetected = true;
			} else if (!soapDetected) {
				/* http header detected */
				httpHeaderDetected = true;
				soapDetected = false;
			}
			if (httpHeaderDetected) {
				httpHeader.append(line);
				httpHeader.append("\n");
			}
			if (soapDetected) {
				soap.append(line);
				soap.append("\n");
			}
		}

	}

	private String docToString() throws SOAPException, IOException {
		return SoapUtil.toString(messageDoc);
	}

}
