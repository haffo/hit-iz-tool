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

package gov.nist.hit.iz.web.utils;

import javax.servlet.http.HttpServletRequest;

import gov.nist.hit.core.domain.Command;
import gov.nist.hit.core.domain.IntegrationProfile;
import gov.nist.hit.core.service.exception.ProfileException;
import gov.nist.hit.iz.service.exception.MessageContentNotFoundException;

/**
 * @author Harold Affo(NIST)
 * 
 */
public class Utils {

	public static String getContent(IntegrationProfile integrationProfile) throws ProfileException {
		if (integrationProfile == null || "".equals(integrationProfile.getXml())) {
			throw new ProfileException("No integrationProfile found in the request");
		}
		return integrationProfile.getXml();
	}

	public static String getContent(Command request) {
		if (request == null || "".equals(request.getContent())) {
			throw new MessageContentNotFoundException("No content found in the request");
		}
		return request.getContent();
	}

	public static String getUrl(HttpServletRequest request) {
		String scheme = request.getScheme();
		String host = request.getHeader("Host");
		if (host.contains("psapps01.nist.gov")) {
			host = "www-s.nist.gov";
		} else {
			// Yeah I know, I have no other choice
			host = host.replaceAll("hit-2015.nist.gov:8098", "hl7v2-iz-r1.5-testing.nist.gov:8098");
			host = host.replaceAll("hit-2015.nist.gov:19070", "hl7v2-iz-cdc-testing.nist.gov");
		}
		return scheme + "://" + host + request.getContextPath();
	}

}
