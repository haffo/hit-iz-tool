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
import gov.nist.hit.core.domain.ValidationResult;
import gov.nist.hit.core.service.exception.MessageValidationException;
import gov.nist.hit.core.service.exception.TestCaseException;
import gov.nist.hit.iz.domain.IZEnvelopeTestCase;
import gov.nist.hit.iz.domain.IZEnvelopeTestContext;
import gov.nist.hit.iz.domain.IZEnvelopeTestPlan;
import gov.nist.hit.iz.repo.IZEnvelopeTestCaseRepository;
import gov.nist.hit.iz.repo.IZEnvelopeTestPlanRepository;
import gov.nist.hit.iz.service.SOAPValidationReportGenerator;
import gov.nist.hit.iz.service.exception.SoapValidationException;
import gov.nist.hit.iz.service.soap.SOAPMessageValidator;
import gov.nist.hit.iz.web.utils.Utils;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Harold Affo (NIST)
 * 
 */

@RestController
@RequestMapping("/envelope")
public class IZEnvelopeController {

  static final Logger logger = LoggerFactory.getLogger(IZEnvelopeController.class);

  @Autowired
  private SOAPMessageValidator soapValidator;

  @Autowired
  private IZEnvelopeTestPlanRepository testPlanRepository;

  @Autowired
  private IZEnvelopeTestCaseRepository testCaseRepository;


  @Autowired
  private SOAPValidationReportGenerator reportService;

  @Cacheable(value = "testCaseCache", key = "'env-testcases'")
  @RequestMapping(value = "/testcases", method = RequestMethod.GET)
  public List<IZEnvelopeTestPlan> testCases() {
    logger.info("Fetching all testplans...");
    return testPlanRepository.findAll();
  }

  @RequestMapping(value = "/testcases/{testCaseId}/validate", method = RequestMethod.POST,
      consumes = "application/json")
  public ValidationResult validate(@PathVariable final Long testCaseId,
      @RequestBody final Command command) throws SoapValidationException {
    try {
      logger.info("Validating envelope message " + command);
      IZEnvelopeTestCase testCase = testCaseRepository.findOne(testCaseId);
      if (testCase == null)
        throw new TestCaseException("No testcase selected");
      IZEnvelopeTestContext context = testCase.getTestContext();
      ValidationResult result;
      result =
          soapValidator.validate(Utils.getContent(command), testCase.getName(),
              context.getValidationPhase());
      return result;
    } catch (MessageValidationException e) {
      throw new SoapValidationException(e);
    }

  }
}
