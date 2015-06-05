package gov.nist.hit.iz.service;

import gov.nist.healthcare.tools.core.services.ProfileParser;
import gov.nist.healthcare.tools.core.services.exception.ProfileParserException;
import gov.nist.healthcare.tools.core.services.hl7.v2.profile.ProfileParserImpl;
import gov.nist.healthcare.tools.core.services.hl7.v2.vocabulary.TableLibrarySerializer;

import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.core.JsonProcessingException;

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
