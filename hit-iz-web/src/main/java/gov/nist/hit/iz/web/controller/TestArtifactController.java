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

import gov.nist.hit.core.service.exception.MessageException;
import gov.nist.hit.core.service.exception.TestCaseException;

import java.io.IOException;
import java.io.InputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Harold Affo (NIST)
 * 
 */

@RequestMapping("/testartifact")
@RestController
public class TestArtifactController extends TestingController {

  static final Logger logger = LoggerFactory.getLogger(TestArtifactController.class);

  @RequestMapping(value = "/download", method = RequestMethod.POST,
      consumes = "application/x-www-form-urlencoded; charset=UTF-8")
  public String download(@RequestParam("path") String path, HttpServletRequest request,
      HttpServletResponse response) throws MessageException {
    try {
      if (path != null && path.endsWith("pdf")) {
        InputStream content = null;
        String fileName = path.substring(path.lastIndexOf("/") + 1);
        content = TestArtifactController.class.getResourceAsStream("/" + path);
        response.setContentType("application/pdf");
        response.setHeader("Content-disposition", "attachment;filename=" + fileName);
        FileCopyUtils.copy(content, response.getOutputStream());
      }

      throw new IllegalArgumentException("Invalid Path Provided");
    } catch (IOException e) {
      logger.debug("Failed to download the test package ");
      throw new TestCaseException("Cannot download the artifact " + e.getMessage());
    }

  }



}
