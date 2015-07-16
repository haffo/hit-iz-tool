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

import gov.nist.hit.core.domain.Json;
import gov.nist.hit.core.repo.VocabularyLibraryRepository;
import gov.nist.hit.core.service.exception.TestCaseException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Harold Affo (NIST)
 * 
 */

@RequestMapping("/valueSetLibrary")
@RestController
public class ValueSetController {

  Logger logger = LoggerFactory.getLogger(ValueSetController.class);

  @Autowired
  private VocabularyLibraryRepository vocabularyLibraryRepository;

  @RequestMapping(value = "/{valueSetLibraryId}")
  public Json profile(@PathVariable final Long valueSetLibraryId) {
    if (valueSetLibraryId == null) {
      throw new TestCaseException("No profile id provided");
    }
    logger.info("Fetching conformance profile (json) with id=" + valueSetLibraryId);
    String value = vocabularyLibraryRepository.getJson(valueSetLibraryId);
    return new Json(value);
  }

}
