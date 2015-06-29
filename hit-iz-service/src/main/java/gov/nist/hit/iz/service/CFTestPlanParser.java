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


// @Service
public class CFTestPlanParser extends TestPlanParser {

  // public CFTestPlanParser() {}
  //
  // public List<TestStep> testSteps(String path) throws JsonProcessingException, IOException,
  // ProfileParserException {
  // List<TestStep> res = new ArrayList<TestStep>();
  // ObjectMapper mapper = new ObjectMapper();
  // JsonNode testPlanObj = mapper.readTree(getContent(path + "/TestPlans.json"));
  // Iterator<JsonNode> it = testPlanObj.iterator();
  // while (it.hasNext()) {
  // JsonNode node = it.next();
  // TestStep step =
  // create(path + "/" + node.findValue("name").getTextValue(), node.findValue("position")
  // .getIntValue());
  // res.add(step);
  // }
  // return res;
  // }
  //
  // private TestStep create(String path, int position) throws IOException, ProfileParserException {
  // TestStep testCase = null;
  // String name = path.substring(path.lastIndexOf("/") + 1);
  // testCase = new TestStep();
  // testCase.setStage(Stage.CF);
  // testCase.setName(name);
  // TestContext testContext = testContext(path);
  // testCase.setTestContext(testContext);
  // testCase.setPosition(position);
  // return testCase;
  // }


}
