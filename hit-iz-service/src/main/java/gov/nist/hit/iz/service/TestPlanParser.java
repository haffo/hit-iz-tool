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
package gov.nist.hit.iz.service;

import gov.nist.hit.core.hl7v2.service.profile.ProfileParserImpl;
import gov.nist.hit.core.hl7v2.service.vocabulary.TableLibrarySerializer;
import gov.nist.hit.core.service.ProfileParser;
import gov.nist.hit.core.service.exception.ProfileParserException;

import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.core.JsonProcessingException;

/**
 * 
 * @author Harold Affo
 * 
 */
public class TestPlanParser {

	protected ProfileParser profileParser = new ProfileParserImpl();

	protected com.fasterxml.jackson.databind.ObjectMapper obm = new com.fasterxml.jackson.databind.ObjectMapper();

	protected TableLibrarySerializer tableSerializer = new TableLibrarySerializer();

	public TestPlanParser() {
		super();
		obm.setSerializationInclusion(Include.NON_NULL);

	}

	public String parseProfile(String profile, String constraints)
			throws JsonProcessingException, ProfileParserException {
		return obm
				.writeValueAsString(profileParser.parse(profile, constraints));
	}

}
