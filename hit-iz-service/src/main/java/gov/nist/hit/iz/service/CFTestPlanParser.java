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
package gov.nist.hit.iz.service;

import gov.nist.hit.core.domain.Constraints;
import gov.nist.hit.core.domain.Message;
import gov.nist.hit.core.domain.Profile;
import gov.nist.hit.core.domain.Stage;
import gov.nist.hit.core.domain.TestContext;
import gov.nist.hit.core.domain.TestStep;
import gov.nist.hit.core.domain.VocabularyLibrary;
import gov.nist.hit.core.service.ProfileParser;
import gov.nist.hit.core.service.TestPlanParser;
import gov.nist.hit.core.service.ValueSetLibrarySerializer;
import gov.nist.hit.core.service.exception.ProfileParserException;
import gov.nist.hit.core.service.impl.ValueSetLibrarySerializerImpl;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.apache.commons.io.IOUtils;
import org.apache.commons.io.input.BOMInputStream;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.JsonProcessingException;
import org.codehaus.jackson.map.ObjectMapper;

import com.fasterxml.jackson.core.JsonGenerationException;
import com.fasterxml.jackson.databind.JsonMappingException;

// @Service
public class CFTestPlanParser extends TestPlanParser {

  public CFTestPlanParser(ProfileParser profileParser, ValueSetLibrarySerializer tableSerializer) {
    super(profileParser, tableSerializer);
  }

  public List<TestStep> create(String path) throws JsonProcessingException, IOException,
      ProfileParserException {
    List<TestStep> res = new ArrayList<TestStep>();
    ObjectMapper mapper = new ObjectMapper();
    JsonNode testPlanObj = mapper.readTree(getContent(path + "/TestPlans.json"));
    Iterator<JsonNode> it = testPlanObj.iterator();
    while (it.hasNext()) {
      JsonNode node = it.next();
      TestStep step =
          create(path + "/" + node.findValue("name").getTextValue(), node.findValue("position")
              .getIntValue());
      res.add(step);
    }
    return res;
  }

  private TestStep create(String path, int position) throws IOException, ProfileParserException {
    TestStep testCase = null;
    String name = path.substring(path.lastIndexOf("/") + 1);
    testCase = new TestStep();
    testCase.setStage(Stage.CF);
    testCase.setName(name);
    TestContext testContext = new TestContext();
    String allConstraints = getContent(path + "/Constraints.xml");

    Profile p = new Profile(name, name, getContent(path + "/Profile.xml"));
    p.setJson(parseProfile(p.getXml(), allConstraints));
    testContext.setProfile(p);

    String message = getContent(path + "/Message.txt");
    if (message != null) {
      testContext.setMessage(new Message(name, "", message));
    }

    if (allConstraints != null) {
      testContext.setConstraints(new Constraints(allConstraints));
    }

    VocabularyLibrary vocabLibrary = vocabLibrary(getContent(path + "/ValueSets_Validation.xml"));
    testContext.setVocabularyLibrary(vocabLibrary);

    testCase.setTestContext(testContext);
    testCase.setPosition(position);
    return testCase;
  }


  private VocabularyLibrary vocabLibrary(String content) throws JsonGenerationException,
      JsonMappingException, IOException {
    VocabularyLibrary vocabLibrary = new VocabularyLibrary();
    vocabLibrary.setXml(content);
    vocabLibrary.setJson(obm.writeValueAsString(new ValueSetLibrarySerializerImpl()
        .toObject(content)));
    return vocabLibrary;
  }

  private String getContent(String path) {
    try {
      return IOUtils.toString(new BOMInputStream(CFTestPlanParser.class.getResourceAsStream(path)));
    } catch (RuntimeException e) {
      return null;
    } catch (Exception e) {
      return null;
    }

  }

}
