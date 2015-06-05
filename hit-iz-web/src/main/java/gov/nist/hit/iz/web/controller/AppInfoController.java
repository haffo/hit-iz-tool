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

import gov.nist.healthcare.core.validation.message.MessageValidationException;
import gov.nist.healthcare.tools.core.models.AppInfo;
import gov.nist.healthcare.tools.core.services.exception.MessageException;

import javax.servlet.http.HttpServletRequest;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Harold Affo (NIST)
 * 
 */
@RestController
@RequestMapping("/appInfo")
public class AppInfoController {

	// @ExceptionHandler(HttpSessionRequiredException.class)
	// @ResponseStatus(value = HttpStatus.UNAUTHORIZED,
	// reason="The session has expired"))
	// public String handleSessionExpired(){
	// return "sessionExpired";
	// }
	//

	@RequestMapping(method = RequestMethod.GET)
	public AppInfo validate(HttpServletRequest request)
			throws MessageValidationException, MessageException {
		AppInfo info = new AppInfo();
		info.setUrl(getUrl(request));
		return info;
	}

	private String getUrl(HttpServletRequest request) {
		String scheme = request.getScheme();
		String host = request.getHeader("Host");
		return scheme + "://" + host + "/iztool";
	}
}
