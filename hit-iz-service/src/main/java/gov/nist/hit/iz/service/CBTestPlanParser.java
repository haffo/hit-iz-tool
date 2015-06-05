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

import gov.nist.hit.core.domain.Constraints;
import gov.nist.hit.core.domain.DataInstanceTestCase;
import gov.nist.hit.core.domain.DataInstanceTestCaseGroup;
import gov.nist.hit.core.domain.DataInstanceTestPlan;
import gov.nist.hit.core.domain.DataInstanceTestStep;
import gov.nist.hit.core.domain.Message;
import gov.nist.hit.core.domain.Profile;
import gov.nist.hit.core.domain.Stage;
import gov.nist.hit.core.domain.TableLibraries;
import gov.nist.hit.core.domain.TableLibrary;
import gov.nist.hit.core.domain.TestContext;
import gov.nist.hit.core.domain.TestStory;
import gov.nist.hit.core.domain.ValueSetLibrary;
import gov.nist.hit.core.service.exception.ProfileParserException;

import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import org.apache.commons.io.IOUtils;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.JsonProcessingException;
import org.codehaus.jackson.map.ObjectMapper;

/**
 * 
 * @author Harold Affo
 * 
 */
public class CBTestPlanParser extends TestPlanParser {

	public List<DataInstanceTestPlan> create(String root)
			throws JsonProcessingException, IOException,
			ProfileParserException, URISyntaxException {
		List<DataInstanceTestPlan> tps = new ArrayList<DataInstanceTestPlan>();

		ObjectMapper mapper = new ObjectMapper();
		JsonNode testPlanObj = mapper.readTree(getContent(root
				+ "/TestPlans.json"));
		Iterator<JsonNode> it = testPlanObj.iterator();
		while (it.hasNext()) {
			JsonNode node = it.next();
			DataInstanceTestPlan tp = parseToDataInstanceTestPlan(root + "/"
					+ node.findValue("name").getTextValue(),
					node.findValue("position").getIntValue(),
					node.findValue("domain").getTextValue());
			tps.add(tp);

		}

		return tps;
	}

	public DataInstanceTestPlan parseToDataInstanceTestPlan(String path,
			int position, String domain) throws JsonProcessingException,
			IOException, ProfileParserException {

		DataInstanceTestPlan tp = new DataInstanceTestPlan();
		ObjectMapper mapper = new ObjectMapper();
		JsonNode testPlanObj = mapper.readTree(getContent(path
				+ "/TestPlan.json"));
		tp.setName(testPlanObj.findValue("name").getTextValue());
		tp.setObjDescription(testPlanObj.findValue("description")
				.getTextValue());
		tp.setStage(Stage.CB);
		// tp.setId((testPlanObj.findValue("id").getLongValue()));
		if (testPlanObj.findValue("testcases") != null) {
			JsonNode tcObjs = testPlanObj.findValue("testcases");
			if (tcObjs.size() > 0) {
				for (int i = 0; i < tcObjs.size(); i++) {
					JsonNode tcObj = tcObjs.get(i);
					DataInstanceTestCase tc = parseToDataInstanceTestCase(path,
							tcObj);
					tp.getTestCases().add(tc);
				}
			}
		}

		if (testPlanObj.findValue("testcasegroups") != null) {
			JsonNode tGroupsObj = testPlanObj.findValue("testcasegroups");
			for (int i = 0; i < tGroupsObj.size(); i++) {
				DataInstanceTestCaseGroup tGroup = new DataInstanceTestCaseGroup();
				JsonNode tGroupObj = tGroupsObj.get(i);
				tGroup.setName(tGroupObj.findValue("name") != null ? tGroupObj
						.findValue("name").getTextValue() : null);
				tGroup.setObjDescription(tGroupObj.findValue("description") != null ? tGroupObj
						.findValue("description").getTextValue() : null);
				// tGroup.setId(tGroupObj.findValue("id") != null ? tGroupObj
				// .findValue("id").getLongValue() : null);
				if (tGroupObj.findValue("testcases") != null) {
					JsonNode tcObjs = tGroupObj.findValue("testcases");
					if (tcObjs.size() > 0) {
						for (int j = 0; j < tcObjs.size(); j++) {
							JsonNode tcObj = tcObjs.get(j);
							DataInstanceTestCase tc = parseToDataInstanceTestCase(
									path + "/" + tGroup.getName(), tcObj);
							tGroup.getTestCases().add(tc);
						}
					}
				}
				tp.getTestCaseGroups().add(tGroup);
			}
		}

		return tp;

	}

	DataInstanceTestCase parseToDataInstanceTestCase(String path, JsonNode tcObj)
			throws JsonProcessingException, IOException, ProfileParserException {
		DataInstanceTestCase tc = new DataInstanceTestCase();
		tc.setName(tcObj.findValue("name").getTextValue());
		tc.setObjDescription(tcObj.findValue("description").getTextValue());
		// tc.setId((tcObj.findValue("id").getLongValue()));

		path = path + "/" + tc.getName();
		if (tcObj.findValue("testCaseStory") != null) {
			JsonNode tStoryObj = tcObj.findValue("testCaseStory");
			TestStory tStory = parseToTestStory(path, tStoryObj);
			tc.setTestStory(tStory);
		}

		if (tcObj.findValue("teststeps") != null) {
			JsonNode tStepsObj = tcObj.findValue("teststeps");
			if (tStepsObj.size() > 0) {
				for (int i = 0; i < tStepsObj.size(); i++) {
					tc.getTestSteps()
							.add(parseToDataInstanceTestStep(path,
									tStepsObj.get(i)));
				}
			}
		}

		return tc;
	}

	TestStory parseToTestStory(String path, JsonNode tStoryObj) {
		TestStory tStory = new TestStory();

		tStory.setDescription(tStoryObj.findValue("teststorydesc") != null ? tStoryObj
				.findValue("teststorydesc").getTextValue() : null);
		tStory.setHtmlPath(exists(path + "/TestStory.html") ? path
				+ "/TestStory.html" : null);
		tStory.setNotes(tStoryObj.findValue("notes") != null ? tStoryObj
				.findValue("notes").getTextValue() : null);
		tStory.setPdfPath(exists(path + "/TestStory.pdf") ? path
				+ "/TestStory.pdf" : null);
		tStory.setPostCondition(tStoryObj.findValue("postCondition") != null ? tStoryObj
				.findValue("postCondition").getTextValue() : null);
		tStory.setPreCondition(tStoryObj.findValue("preCondition") != null ? tStoryObj
				.findValue("preCondition").getTextValue() : null);
		tStory.setTestObjectives(tStoryObj.findValue("testObjectives") != null ? tStoryObj
				.findValue("testObjectives").getTextValue() : null);
		tStory.setComments(tStoryObj.findValue("comments") != null ? tStoryObj
				.findValue("comments").getTextValue() : null);
		return tStory;
	}

	DataInstanceTestStep parseToDataInstanceTestStep(String path,
			JsonNode tStepObj) throws JsonProcessingException, IOException,
			ProfileParserException {
		DataInstanceTestStep tStep = new DataInstanceTestStep();
		tStep.setName(tStepObj.findValue("name") != null ? tStepObj.findValue(
				"name").getTextValue() : null);
		path = path + "/" + tStep.getName();
		tStep.setObjDescription(tStepObj.findValue("description") != null ? tStepObj
				.findValue("description").getTextValue() : null);
		// tStep.setId(tStepObj.findValue("id") != null ?
		// tStepObj.findValue("id")
		// .getLongValue() : null);
		JsonNode tStoryObj = tStepObj.findValue("testStepStory");
		tStep.setTestStory(parseToTestStory(path, tStoryObj));
		tStep.setTestContext(parseToTestContext(path));

		return tStep;
	}

	TestContext parseToTestContext(String path) throws JsonProcessingException,
			IOException, ProfileParserException {
		TestContext tContext = new TestContext();
		tContext.setMessage(new Message("", "", getContent(path
				+ "/Message.txt")));

		String vsLibXml = getContent(path + "/ValueSets.xml");
		TableLibraries collection = new TableLibraries();
		collection.setPosition(2);
		collection.setName("ValueSet");
		TableLibrary lib = tableSerializer.toTableLibrary(vsLibXml);
		lib.setName("ValueSet");
		collection.addTableLibrary(lib);
		Set<TableLibraries> collections = new HashSet<TableLibraries>();
		collections.add(collection);
		String valueSetLibraryJson = obm.writeValueAsString(collections);
		ValueSetLibrary valueSetLibrary = new ValueSetLibrary();
		valueSetLibrary.setValueSetJson(valueSetLibraryJson);
		valueSetLibrary.setValueSetXml(vsLibXml);
		tContext.setValueSetLibrary(valueSetLibrary);

		String constraints = getContent(path + "/Constraints.xml");
		tContext.setConstraints(new Constraints(constraints));

		String pXml = getContent(path + "/Profile.xml");
		tContext.setProfile(new Profile(pXml, parseProfile(pXml, constraints)));

		return tContext;
	}

	private String getContent(String path) throws IOException {
		String content = null;
		// if (exists(path)) {
		content = IOUtils.toString(CBTestPlanParser.class
				.getResourceAsStream(path));
		// }

		return content;
	}

	public boolean exists(String location) {
		File file = new File(location);
		return file.exists();
	}

}
