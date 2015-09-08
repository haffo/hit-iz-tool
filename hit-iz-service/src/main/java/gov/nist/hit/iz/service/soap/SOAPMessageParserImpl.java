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

import gov.nist.hit.core.domain.MessageModel;
import gov.nist.hit.core.service.exception.MessageParserException;
import gov.nist.hit.core.service.exception.SoapMessageParserException;
import gov.nist.hit.core.service.exception.XmlParserException;
import gov.nist.hit.iz.service.XMLMessageParser;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SOAPMessageParserImpl extends SOAPMessageParser {


  @Autowired
  private XMLMessageParser xmlMessageParser;

  @Override
  public MessageModel parse(String soapXml, String... options) throws SoapMessageParserException {
    try {
      return xmlMessageParser.parse(soapXml, options);
    } catch (XmlParserException e) {
      throw new SoapMessageParserException(e);
    } catch (MessageParserException e) {
      throw new SoapMessageParserException(e);
    }
  }

  public XMLMessageParser getXmlMessageParser() {
    return xmlMessageParser;
  }

  public void setXmlMessageParser(XMLMessageParser xmlMessageParser) {
    this.xmlMessageParser = xmlMessageParser;
  }

}