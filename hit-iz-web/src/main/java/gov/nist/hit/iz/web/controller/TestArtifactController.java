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

import gov.nist.hit.core.domain.TestArtifact;
import gov.nist.hit.core.repo.TestArtifactRepository;
import gov.nist.hit.core.service.exception.MessageException;
import gov.nist.hit.core.service.exception.TestCaseException;

import java.io.IOException;
import java.io.InputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/**
 * @author Harold Affo (NIST)
 * 
 */

@RequestMapping("/testartifact")
public class TestArtifactController extends TestingController {

  static final Logger logger = LoggerFactory.getLogger(TestArtifactController.class);

  @Autowired
  protected TestArtifactRepository artifactRepository;


  @RequestMapping(value = "/{artifactId}/download/{format}", method = RequestMethod.POST,
      consumes = "application/x-www-form-urlencoded; charset=UTF-8")
  public void testPackage(@PathVariable Long artifactId, @PathVariable String format,
      HttpServletRequest request, HttpServletResponse response) throws MessageException {
    try {
      TestArtifact artifact = artifactRepository.findOne(artifactId);
      if (artifact == null) {
        throw new IllegalArgumentException("Artifact with id=" + artifactId + " Not found");
      }
      InputStream content = null;
      if ("pdf".equalsIgnoreCase(format)) {
        String path = artifact.getPdfPath();
        content = TestArtifactController.class.getResourceAsStream(path);
        response.setContentType("application/pdf");
        response.setHeader("Content-disposition", "attachment;filename=" + artifact.getName()
            + ".pdf");
      } else if ("html".equalsIgnoreCase(format)) {
        content = IOUtils.toInputStream(artifact.getHtml());
        response.setContentType("text/html");
        response.setHeader("Content-disposition", "attachment;filename=" + artifact.getName()
            + ".html");
      }
      FileCopyUtils.copy(content, response.getOutputStream());
    } catch (IOException e) {
      logger.debug("Failed to download the test package ");
      throw new TestCaseException("Cannot download the artifact " + e.getMessage());
    }
  }



}
