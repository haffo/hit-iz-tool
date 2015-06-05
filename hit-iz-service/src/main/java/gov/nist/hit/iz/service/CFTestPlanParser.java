package gov.nist.hit.iz.service;

import gov.nist.healthcare.tools.core.models.Constraints;
import gov.nist.healthcare.tools.core.models.DataInstanceTestStep;
import gov.nist.healthcare.tools.core.models.Message;
import gov.nist.healthcare.tools.core.models.Profile;
import gov.nist.healthcare.tools.core.models.Stage;
import gov.nist.healthcare.tools.core.models.TableLibraries;
import gov.nist.healthcare.tools.core.models.TableLibrary;
import gov.nist.healthcare.tools.core.models.TestContext;
import gov.nist.healthcare.tools.core.models.ValueSetLibrary;
import gov.nist.healthcare.tools.core.services.exception.ProfileParserException;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import org.apache.commons.io.IOUtils;
import org.apache.commons.io.input.BOMInputStream;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.JsonProcessingException;
import org.codehaus.jackson.map.ObjectMapper;

public class CFTestPlanParser extends TestPlanParser {

	public CFTestPlanParser() {
		super();
	}

	public List<DataInstanceTestStep> create(String path)
			throws JsonProcessingException, IOException, ProfileParserException {
		List<DataInstanceTestStep> res = new ArrayList<DataInstanceTestStep>();
		ObjectMapper mapper = new ObjectMapper();
		JsonNode testPlanObj = mapper.readTree(getContent(path
				+ "/TestPlans.json"));
		Iterator<JsonNode> it = testPlanObj.iterator();
		while (it.hasNext()) {
			JsonNode node = it.next();
			DataInstanceTestStep step = create(
					path + "/" + node.findValue("name").getTextValue(), node
							.findValue("position").getIntValue());
			res.add(step);
		}
		return res;
	}

	private DataInstanceTestStep create(String path, int position)
			throws IOException, ProfileParserException {
		DataInstanceTestStep testCase = null;
		String name = path.substring(path.lastIndexOf("/") + 1);
		testCase = new DataInstanceTestStep();
		testCase.setStage(Stage.CF);
		testCase.setName(name);
		TestContext testContext = new TestContext();
		String allConstraints = getContent(path + "/Constraints.xml");

		Profile p = new Profile(name, name, getContent(path + "/Profile.xml"));
		p.setProfileJson(parseProfile(p.getProfileXml(), allConstraints));
		testContext.setProfile(p);

		String message = getContent(path + "/Message.txt");
		if (message != null) {
			testContext.setMessage(new Message(name, "", message));
		}

		if (allConstraints != null) {
			testContext.setConstraints(new Constraints(allConstraints));
		}

		String vcCdcIz = getContent(path + "/ValueSets_CDC-IZ.xml");
		Set<TableLibraries> collections = new HashSet<TableLibraries>();
		if (vcCdcIz != null) {
			TableLibraries collection = new TableLibraries();
			collection.setPosition(1);
			collection.setName("CDC-IZ");
			TableLibrary lib = tableSerializer.toTableLibrary(vcCdcIz);
			lib.setName("CDC-IZ");
			collection.addTableLibrary(lib);
			collections.add(collection);
		}

		String vcCdcHl7Iz = getContent(path + "/ValueSets_CDC-HL7-IZ.xml");
		if (vcCdcHl7Iz != null) {
			TableLibraries collection = new TableLibraries();
			collection.setPosition(2);
			collection.setName("CDC-HL7-IZ");
			TableLibrary lib = tableSerializer.toTableLibrary(vcCdcHl7Iz);
			lib.setName("CDC-HL7-IZ");
			collection.addTableLibrary(lib);
			collections.add(collection);
		}

		String vsHL7 = getContent(path + "/ValueSets_HL7.xml");
		if (vsHL7 != null) {
			TableLibraries collection = new TableLibraries();
			collection.setPosition(3);
			collection.setName("HL7");
			TableLibrary lib = tableSerializer.toTableLibrary(vsHL7);
			lib.setName("HL7");
			collection.addTableLibrary(lib);
			collections.add(collection);
		}

		String valueSetLibraryJson = obm.writeValueAsString(collections);
		ValueSetLibrary valueSetLibrary = new ValueSetLibrary();
		valueSetLibrary.setValueSetJson(valueSetLibraryJson);
		valueSetLibrary.setValueSetXml(getContent(path
				+ "/ValueSets_Validation.xml"));

		testContext.setValueSetLibrary(valueSetLibrary);

		testCase.setTestContext(testContext);
		testCase.setPosition(position);

		return testCase;

	}

	private String getContent(String path) {
		try {
			return IOUtils.toString(new BOMInputStream(CFTestPlanParser.class
					.getResourceAsStream(path)));
		} catch (RuntimeException e) {
			return null;
		} catch (Exception e) {
			return null;
		}

	}

}
