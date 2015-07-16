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
package gov.nist.hit.iz.service;

import gov.nist.hit.core.domain.MessageElement;
import gov.nist.hit.core.domain.MessageModel;
import gov.nist.hit.core.domain.XmlMessageElementData;
import gov.nist.hit.core.domain.util.XmlUtil;
import gov.nist.hit.core.service.MessageParser;
import gov.nist.hit.core.service.exception.XmlParserException;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.jdom2.Document;
import org.jdom2.Element;
import org.jdom2.JDOMException;

public class XmlMessageParser implements MessageParser {

  public XmlMessageParser() {
    super();
  }


  @Override
  public MessageModel parse(String content, String... options) throws XmlParserException {
    return parse(content);
  }

  private MessageModel parse(String content) throws XmlParserException {
    try {
      Document document = XmlUtil.toDocument(content);
      Element element = document.getRootElement();
      MessageModel model = new MessageModel();
      XmlMessageElementData data = new XmlMessageElementData(element);
      MessageElement parentNode = getSoapMessageElement(data);
      processChildren(element.getChildren(), parentNode);
      model.getElements().add(parentNode);
      return model;
    } catch (JDOMException | IOException e) {
      throw new XmlParserException(e);
    }
  }

  private void processChildren(List<Element> childElements, MessageElement parent) {
    for (int i = 0; i < childElements.size(); i++) {
      Element element = childElements.get(i);
      MessageElement childNode = getSoapMessageElement(new XmlMessageElementData(element), parent);
      if (!element.getChildren().isEmpty()) {
        processChildren(element.getChildren(), childNode);
      } else if (element.getValue() != null && !"".equals(element.getValue())) {
        getSoapMessageElement(new XmlMessageElementData(element), element.getValue(), childNode);
      }
    }
  }


  private MessageElement getSoapMessageElement(XmlMessageElementData data) {
    return getSoapMessageElement(data, null);
  }

  private MessageElement getSoapMessageElement(XmlMessageElementData data, MessageElement parent) {
    MessageElement element = new MessageElement();
    element.setData(data);
    List<MessageElement> children = new ArrayList<MessageElement>();
    if (parent != null) {
      if (parent.getChildren() == null) {
        parent.setChildren(new ArrayList<MessageElement>());
      }
      parent.getChildren().add(element);
    }
    element.setChildren(children);
    element.setLabel(data.getName());
    return element;
  }


  private MessageElement getSoapMessageElement(XmlMessageElementData data, String label,
      MessageElement parent) {
    MessageElement element = getSoapMessageElement(data, parent);
    element.setLabel(label);
    return element;
  }



}
