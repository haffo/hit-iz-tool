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

import gov.nist.healthcare.tools.core.services.exception.ProfileParserException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Harold Affo (NIST)
 * 
 */
@RequestMapping("/profiles")
@RestController
public class ProfileController extends TestingController {
	static final Logger logger = LoggerFactory
			.getLogger(ProfileController.class);

	@ExceptionHandler(ProfileParserException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public String profileParserExeption(ProfileParserException ex) {
		logger.debug(ex.getMessage());
		return ex.getMessage();
	}

	// @RequestMapping(value = "/{profileId}", method = RequestMethod.GET)
	// public Callable<Profile> getProfileById(@PathVariable final Long
	// profileId) {
	// return new Callable<Profile>() {
	// @Override
	// public Profile call() throws Exception {
	// logger.info("Fetching profile with id=" + profileId);
	// Profile profile = profileRepository.findOne(profileId);
	// if (profile == null) {
	// throw new ProfileException(profileId);
	// }
	// return profile;
	// }
	// };
	// }

	// @RequestMapping(value = "/{profileId}/parse", method = RequestMethod.GET)
	// public Json parse(@PathVariable final Long profileId)
	// throws ProfileParserException {
	// logger.info("Parsing profile with id= " + profileId);
	// String content = profileRepository.getJson(profileId);
	// if (content != null) {
	// return new Json(content);
	// }
	// return null;
	// }

	// @RequestMapping(value = "/{profileId}/xml", method = RequestMethod.GET)
	// public Callable<String> profileContent(@PathVariable final Long
	// profileId) {
	// return new Callable<String>() {
	// @Override
	// public String call() throws Exception {
	// logger.info("Fetching profile content with id=" + profileId);
	// return profileRepository.getXml(profileId);
	// }
	// };
	// }

	// @RequestMapping(value = "/profiles/{profileId}/download", method =
	// RequestMethod.GET, produces = "text/xml")
	// public String downloadProfile(@PathVariable Long profileId,
	// HttpServletRequest request, HttpServletResponse response)
	// throws ProfileException {
	// try {
	// logger.info("Downloading profile with id=" + profileId);
	// Profile profile = profileRepository.findOne(profileId);
	// if (profile != null) {
	// InputStream content = IOUtils.toInputStream(
	// profile.getProfileXml(), "UTF-8");
	// response.setContentType("text/xml");
	// response.setHeader("Content-disposition",
	// "attachment;filename=" + profile.getName() + ".xml");
	// FileCopyUtils.copy(content, response.getOutputStream());
	// } else {
	// throw new ProfileException("No profile with id=" + profileId
	// + " found.");
	// }
	// } catch (IOException e) {
	// logger.debug("Failed to download the profile ");
	// throw new ProfileException("Cannot download the profile "
	// + e.getMessage());
	// }
	// return null;
	// }

	// @RequestMapping(value = "/profiles", method = RequestMethod.GET)
	// public Callable<List<Profile>> profiles() {
	// return new Callable<List<Profile>>() {
	// @Override
	// public List<Profile> call() {
	// logger.info("Fetching all profiles...");
	// return profileRepository.findAll();
	// }
	// };
	// }

}
