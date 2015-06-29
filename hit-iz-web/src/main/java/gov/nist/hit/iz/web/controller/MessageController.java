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

import gov.nist.healthcare.core.MalformedMessageException;
import gov.nist.hit.core.domain.MessageCommand;
import gov.nist.hit.core.hl7v2.service.message.Er7MessageParser;
import gov.nist.hit.core.service.exception.MessageException;

import java.io.IOException;
import java.io.InputStream;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * @author Harold Affo (NIST)
 * 
 */
@RequestMapping("/message")
@RestController
public class MessageController extends TestingController {
  static final Logger logger = LoggerFactory.getLogger(MessageController.class);

  private Er7MessageParser er7MessageParser;

  public Er7MessageParser getEr7MessageParser() {
    return er7MessageParser;
  }

  public void setEr7MessageParser(Er7MessageParser er7MessageParser) {
    this.er7MessageParser = er7MessageParser;
  }

  @RequestMapping(value = "/download", method = RequestMethod.POST)
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


  /**
   * 
   * @param part
   * @return
   * @throws MessageException
   * @throws MalformedMessageException
   */
  @RequestMapping(value = "/upload", method = RequestMethod.POST,
      consumes = {"multipart/form-data"})
  public Map<String, String> upload(@RequestPart("file") MultipartFile part)
      throws MessageException {
    try {
      Map<String, String> map = new HashMap<String, String>();
      InputStream in = part.getInputStream();
      map.put("name", part.getName());
      map.put("size", part.getSize() + "");
      String content = IOUtils.toString(in);
      map.put("content", content);
      return map;
    } catch (IOException e) {
      throw new MessageException(e);
    }

  }



}
