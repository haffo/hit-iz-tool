/**
 * This software was developed at the National Institute of Standards and Technology by employees
 * of the Federal Government in the course of their official duties. Pursuant to title 17 Section 105 of the
 * United States Code this software is not subject to copyright protection and is in the public domain.
 * This is an experimental system. NIST assumes no responsibility whatsoever for its use by other parties,
 * and makes no guarantees, expressed or implied, about its quality, reliability, or any other characteristic.
 * We would appreciate acknowledgement if the software is used. This software can be redistributed and/or
 * modified freely provided that any derivative works bear some notice that they are derived from it, and any
 * modified versions bear some notice that they have been modified.
 */
package gov.nist.hit.iz.service;

import gov.nist.hit.core.service.ValidationReportGenerator;
import gov.nist.hit.core.service.exception.SoapValidationReportException;
import gov.nist.hit.core.service.exception.ValidationReportException;

import java.io.IOException;

import org.apache.commons.io.IOUtils;
import org.apache.log4j.Logger;

/**
 * @author Harold Affo (NIST)
 */

public abstract class SOAPValidationReportGenerator extends ValidationReportGenerator {
	
	private final static Logger logger = Logger
			.getLogger(SOAPValidationReportGenerator.class);
	
	private static final String HTML_XSL = "/xslt/html.xsl";

	private static final String PDF_XSL = "/xslt/pdf.xsl";

	public SOAPValidationReportGenerator() {

	}
	
	@Override
	public String getPdfConversionXslt() {
		try {
			return IOUtils.toString(SOAPValidationReportGenerator.class
					.getResourceAsStream(PDF_XSL));
		} catch (IOException e) {
			logger.error(e,e);
			throw new SoapValidationReportException(e.getMessage());
		}
	}

	@Override
	public String getHtmlConversionXslt() {
		try {
			return IOUtils.toString(SOAPValidationReportGenerator.class
					.getResourceAsStream(HTML_XSL));
		} catch (IOException e) {
			logger.error(e,e);
			throw new SoapValidationReportException(e.getMessage());
		}
	}


}
