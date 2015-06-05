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

package gov.nist.hit.iz.web.utils;

import gov.nist.healthcare.tools.core.models.Command;
import gov.nist.healthcare.tools.core.models.Profile;
import gov.nist.healthcare.tools.core.services.exception.MessageException;
import gov.nist.healthcare.tools.core.services.exception.ProfileException;
import gov.nist.hit.iz.service.exception.MessageContentNotFoundException;
import gov.nist.hit.iz.web.model.MessageModelRequest;
import gov.nist.hit.iz.web.model.MessageValidationRequest;

/**
 * @author Harold Affo(NIST)
 * 
 */
public class Utils {

	public static String getContent(Profile profile) throws ProfileException {
		if (profile == null || "".equals(profile.getProfileXml())) {
			throw new ProfileException("Not profile found in the request");
		}
		return profile.getProfileXml();
	}

	public static String getMessageContent(MessageValidationRequest command)
			throws MessageException {
		String message = command.getEr7Message();
		if (message == null || "".equals(message)) {
			throw new MessageException(new ProfileException(
					"Not message found in the request"));
		}
		return message;
	}

	// public static String getContent(TableLibrary tableLibrary)
	// throws TableLibraryException {
	// if (tableLibrary == null || "".equals(tableLibrary.getXml())) {
	// throw new TableLibraryException(
	// "Not table library found in the request");
	// }
	// return tableLibrary.getXml();
	// }

	public static String getMessageContent(MessageModelRequest command)
			throws MessageException {
		String message = command.getEr7Message();
		if (message == null) {
			throw new MessageException("No Message provided in the request");
		}
		return message;
	}

	public static String getContent(Command request) {
		if (request == null || "".equals(request.getContent())) {
			throw new MessageContentNotFoundException(
					"No soap content found in the request");
		}
		return request.getContent();
	}

}
