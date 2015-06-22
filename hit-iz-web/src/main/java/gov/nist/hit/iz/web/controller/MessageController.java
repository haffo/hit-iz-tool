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

import gov.nist.hit.core.hl7v2.service.message.Er7MessageParser;
import gov.nist.hit.core.service.exception.MessageException;
import gov.nist.hit.iz.web.model.Er7MessageCommand;
import gov.nist.hit.iz.web.model.MessageCommand;

import java.io.IOException;
import java.io.InputStream;
import java.util.Date;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Harold Affo (NIST)
 * 
 */
@RequestMapping("/messages")
@RestController
public class MessageController extends TestingController {
  static final Logger logger = LoggerFactory.getLogger(MessageController.class);

  @Autowired
  private Er7MessageParser er7MessageParser;

  @Override
  public Er7MessageParser getEr7MessageParser() {
    return er7MessageParser;
  }

  @Override
  public void setEr7MessageParser(Er7MessageParser er7MessageParser) {
    this.er7MessageParser = er7MessageParser;
  }

  @RequestMapping(value = "/downloadContent", method = RequestMethod.POST)
  public String download(MessageCommand command, HttpServletRequest request,
      HttpServletResponse response) throws MessageException {
    try {
      InputStream content = IOUtils.toInputStream(command.getContent(), "UTF-8");
      response.setContentType("text/plain");
      response.setHeader("Content-disposition",
          "attachment;filename=UserMessage-" + (new Date()).getTime() + ".txt");
      FileCopyUtils.copy(content, response.getOutputStream());
    } catch (IOException e) {
      logger.debug("Failed to download the message ");
      throw new MessageException("Cannot download the message " + e.getMessage());
    }
    return null;
  }

  public static String getMessageContent(Er7MessageCommand command) throws MessageException {
    String message = command.getEr7Message();
    if (message == null) {
      throw new MessageException("No Message provided in the request");
    }
    return message;
  }

}
