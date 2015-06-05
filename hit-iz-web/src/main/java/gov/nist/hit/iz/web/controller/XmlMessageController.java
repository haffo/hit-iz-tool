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

package gov.nist.hit.iz.web.controller;

import gov.nist.healthcare.tools.core.models.Command;
import gov.nist.healthcare.tools.core.models.MessageElement;
import gov.nist.healthcare.tools.core.models.utils.XmlUtil;
import gov.nist.healthcare.tools.core.services.XmlMessageParser;
import gov.nist.healthcare.tools.core.services.exception.XmlFormatterException;
import gov.nist.healthcare.tools.core.services.exception.XmlParserException;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Harold Affo (NIST)
 * 
 */
@RequestMapping("/xml")
@RestController
public class XmlMessageController {

	static final Logger logger = LoggerFactory
			.getLogger(XmlMessageController.class);

	@Autowired
	private XmlMessageParser parser;

	public XmlMessageParser getParser() {
		return parser;
	}

	public void setParser(XmlMessageParser parser) {
		this.parser = parser;
	}

	@ExceptionHandler(XmlParserException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public String xmlParserException(XmlParserException ex) {
		logger.debug(ex.getMessage());
		return ex.getMessage();
	}

	@ExceptionHandler(XmlFormatterException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public String xmlFormatterException(XmlFormatterException ex) {
		logger.debug(ex.getMessage());
		return "Malformed Xml Content.";
	}

	@RequestMapping(value = "/parse", method = RequestMethod.POST, consumes = "application/json")
	public List<MessageElement> parse(@RequestBody Command soapCommand)
			throws XmlParserException {
		logger.info("Parsing soap" + soapCommand.getContent());
		return parser.parse(soapCommand.getContent()).getElements();
	}

	@RequestMapping(value = "/format", method = RequestMethod.POST, consumes = "application/json")
	public Command format(@RequestBody Command soapCommand)
			throws XmlFormatterException {
		logger.info("Formatting xml " + soapCommand.getContent());
		try {
			Command res = new Command(XmlUtil.prettyFormat(
					soapCommand.getContent(), 4));
			return res;
		} catch (RuntimeException e) {
			throw new XmlFormatterException("Malformed Xml Content");
		} catch (Exception e) {
			throw new XmlFormatterException("Malformed Xml Content");
		}
	}

}
