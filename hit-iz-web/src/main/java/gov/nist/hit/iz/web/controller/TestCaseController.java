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

import gov.nist.hit.core.domain.SoapTestCase;
import gov.nist.hit.core.domain.SoapTestPlan;
import gov.nist.hit.core.service.exception.MessageException;
import gov.nist.hit.core.service.exception.TestCaseException;

import java.io.IOException;
import java.io.InputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Harold Affo (NIST)
 * 
 */

@RestController
public class TestCaseController extends TestingController {

	static final Logger logger = LoggerFactory
			.getLogger(TestCaseController.class);

	@RequestMapping(value = "/testCases/{testCaseId}/testPackage", method = RequestMethod.POST)
	public void testPackage(@PathVariable Long testCaseId,
			HttpServletRequest request, HttpServletResponse response)
			throws MessageException {
		try {

			SoapTestCase testCase = testCaseRepository.findOne(testCaseId);
			if (testCase == null) {
				throw new IllegalArgumentException(
						"The test case cannot be retrieved");
			}

			String testPackagePath = testCase.getTestPackagePath();
			if (testPackagePath == null) {
				throw new IllegalArgumentException(
						"No test package found for this TestCase");
			}
			InputStream content = TestCaseController.class
					.getResourceAsStream(testPackagePath);
			response.setContentType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
			response.setHeader("Content-disposition", "attachment;filename="
					+ testCase.getName() + ".docx");
			FileCopyUtils.copy(content, response.getOutputStream());

		} catch (IOException e) {
			logger.debug("Failed to download the test package ");
			throw new TestCaseException("Cannot download the test package "
					+ e.getMessage());
		}
	}

	@RequestMapping(value = "/teststory/download", method = RequestMethod.POST, consumes = "application/x-www-form-urlencoded; charset=UTF-8")
	public String testStory(@RequestParam("path") String path,
			@RequestParam("title") String title, HttpServletRequest request,
			HttpServletResponse response) throws MessageException {
		try {
			if (path == null) {
				throw new IllegalArgumentException("No test story path found");
			}
			InputStream content = TestCaseController.class
					.getResourceAsStream(path);
			response.setContentType("application/pdf");
			response.setHeader("Content-disposition", "attachment;filename="
					+ title + "-TestStory.pdf");
			FileCopyUtils.copy(content, response.getOutputStream());

		} catch (IOException e) {
			logger.debug("Failed to download the test stoty of " + title);
			throw new TestCaseException("Cannot download the test story "
					+ e.getMessage());
		}
		return null;
	}

	@RequestMapping(value = "/testPlans/{testPlanId}/testProcedure", method = RequestMethod.POST)
	public String testProcedure(@PathVariable Long testPlanId,
			HttpServletRequest request, HttpServletResponse response)
			throws MessageException {
		try {
			SoapTestPlan testPlan = testPlanRepository.findOne(testPlanId);
			if (testPlan == null) {
				throw new IllegalArgumentException(
						"The test plan cannot be retrieved");
			}

			String testProcedurePath = testPlan.getTestProcedurePath();
			if (testProcedurePath == null) {
				throw new IllegalArgumentException(
						"No test procedure found for this TestPlan");
			}
			InputStream content = TestCaseController.class
					.getResourceAsStream(testProcedurePath);
			response.setContentType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
			response.setHeader("Content-disposition", "attachment;filename="
					+ "TestProcedure-" + testPlan.getName() + ".docx");
			FileCopyUtils.copy(content, response.getOutputStream());

		} catch (IOException e) {
			logger.debug("Failed to download the test procedure ");
			throw new TestCaseException("Cannot download the procedure "
					+ e.getMessage());
		}
		return null;
	}

}
