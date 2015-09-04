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

package gov.nist.hit.iz.web.controller;

import gov.nist.hit.core.domain.Command;
import gov.nist.hit.core.domain.MessageElement;
import gov.nist.hit.core.domain.util.XmlUtil;
import gov.nist.hit.core.service.exception.XmlFormatterException;
import gov.nist.hit.core.service.exception.XmlParserException;
import gov.nist.hit.iz.service.XMLMessageParser;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Harold Affo (NIST)
 * 
 */
@RequestMapping("/xml")
@RestController
public class XMLMessageController extends TestingController {

  static final Logger logger = LoggerFactory.getLogger(XMLMessageController.class);

  @Autowired
  private XMLMessageParser xmlMessageParser;



  public XMLMessageParser getXmlMessageParser() {
    return xmlMessageParser;
  }

  public void setXmlMessageParser(XMLMessageParser xmlMessageParser) {
    this.xmlMessageParser = xmlMessageParser;
  }

  @RequestMapping(value = "/parse", method = RequestMethod.POST, consumes = "application/json")
  public List<MessageElement> parse(@RequestBody Command soapCommand) throws XmlParserException {
    logger.info("Parsing soap" + soapCommand.getContent());
    try {
      return xmlMessageParser.parse(soapCommand.getContent(), "").getElements();
    } catch (gov.nist.hit.core.service.exception.MessageParserException e) {
      throw new XmlParserException(e);
    }
  }

  @RequestMapping(value = "/format", method = RequestMethod.POST, consumes = "application/json")
  public Command format(@RequestBody Command soapCommand) throws XmlFormatterException {
    logger.info("Formatting xml " + soapCommand.getContent());
    try {
      Command res = new Command(XmlUtil.prettyFormat(soapCommand.getContent(), 4));
      return res;
    } catch (RuntimeException e) {
      throw new XmlFormatterException("Malformed Xml Content");
    } catch (Exception e) {
      throw new XmlFormatterException("Malformed Xml Content");
    }
  }

}
