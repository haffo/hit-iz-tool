/**
 * This software was developed at the National Institute of Standards and Technology by employees of
 * the Federal Government in the course of their official duties. Pursuant to title 17 Section 105
 * of the United States Code this software is not subject to copyright protection and is in the
 * public domain. This is an experimental system. NIST assumes no responsibility whatsoever for its
 * use by other parties, and makes no guarantees, expressed or implied, about its quality,
 * reliability, or any other characteristic. We would appreciate acknowledgement if the software is
 * used. This software can be redistributed and/or modified freely provided that any derivative
 * works bear some notice that they are derived from it, and any modified versions bear some notice
 * that they have been modified.
 */
package gov.nist.hit.iz.service.soap;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Service;

import gov.nist.hit.core.domain.ValidationResult;
import gov.nist.hit.iz.domain.soap.SoapValidationResult;
import gov.nist.hit.iz.service.exception.SoapValidationException;

@Service
public class SOAPMessageValidatorImpl implements SOAPMessageValidator {

	private CDCSoapValidation validator = null;

	private final static Logger logger = Logger.getLogger(SOAPMessageValidatorImpl.class);

	public SOAPMessageValidatorImpl() {
		validator = new CDCSoapValidation();
	}

	@Override
	public ValidationResult validate(String soap, String title, String... options) throws SoapValidationException {
		try {
			SoapValidationResult tmp = validator.validate(soap, options);
			return new SOAPValidationResult(tmp);
		} catch (RuntimeException e) {
			logger.error(e.getMessage());
			throw new SoapValidationException(e);
		} catch (Exception e) {
			logger.error(e.getMessage());
			throw new SoapValidationException(e);
		}

	}
}
