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
package gov.nist.healthcare.hl7.v2.iz.tool.web.unit;


/**
 * @author Harold Affo
 * 
 */
public class TestPlanControllerTest {

  // @Mock
  // TestPlanRepository mockRepository;
  //
  // @InjectMocks
  // TestPlanController controller;
  //
  // MockMvc mockMvc;
  //
  // @Before
  // public void setup() {
  // MockitoAnnotations.initMocks(this);
  // controller = new TestPlanController();
  // controller.setTestPlanRepository(mockRepository);
  // mockMvc = standaloneSetup(controller).build();
  // }
  //
  // /**
  // * Test method for
  // * {@link
  // gov.nist.healthcare.hl7.v2.iz.tool.web.controller.TestPlanController#testPlans()}
  // * .
  // *
  // * @throws Exception
  // */
  // @Test
  // public void testGetAllTestPlans() throws Exception {
  // List<CFTestPlan> expectedTestBoxes = createDummyTestPlans();
  // when(mockRepository.findAll()).thenReturn(expectedTestBoxes);
  //
  // mockMvc.perform(
  // get("/testplans").contentType(MediaType.APPLICATION_JSON)
  // .accept(MediaType.APPLICATION_JSON))
  // .andDo(print())
  // .andExpect(status().isOk())
  // .andExpect(
  // jsonPath("$[0].name").value(
  // expectedTestBoxes.get(0).getName()));
  // verify(mockRepository, times(1)).findAll();
  // verifyNoMoreInteractions(mockRepository);
  // }
  //
  // /**
  // *
  // * @throws Exception
  // */
  // @Test
  // public void testGetValidTestPlanById() throws Exception {
  // CFTestPlan expectedTestPlan = createDummyTestPlan(1);
  // Long id = expectedTestPlan.getId();
  // when(mockRepository.findOne(id)).thenReturn(expectedTestPlan);
  // mockMvc.perform(
  // get("/testplans/" + id).contentType(MediaType.APPLICATION_JSON)
  // .accept(MediaType.APPLICATION_JSON))
  // .andDo(print())
  // .andExpect(status().isOk())
  // .andExpect(jsonPath("$.name").value(expectedTestPlan.getName()));
  //
  // verify(mockRepository, times(1)).findOne(id);
  // verifyNoMoreInteractions(mockRepository);
  //
  // }
  //
  // @Test
  // public void testGetInvalidTestPlanById() throws Exception {
  // when(mockRepository.findOne(new Long(2000))).thenReturn(null);
  // mockMvc.perform(get("/testplans/2000"))
  // .andExpect(status().isNotFound());
  // verify(mockRepository, times(1)).findOne(new Long(2000));
  // verifyNoMoreInteractions(mockRepository);
  // }
  //
  // @Test
  // public void testGetInvalidTestPlanTestCaseById() throws Exception {
  // when(mockRepository.findOne(new Long(2000))).thenReturn(null);
  // mockMvc.perform(get("/testplans/2000/testcases")).andExpect(
  // status().isNotFound());
  // verify(mockRepository, times(1)).findOne(new Long(2000));
  // verifyNoMoreInteractions(mockRepository);
  // }
  //
  // @Test
  // public void testGetValidTestPlanTestCasesById() throws Exception {
  // CFTestPlan expectedTestPlan = createDummyTestPlan(2);
  // List<TestPlan> testCases = new ArrayList<TestPlan>(
  // expectedTestPlan.getTestCases());
  //
  // Long id = expectedTestPlan.getId();
  // when(mockRepository.findOne(id)).thenReturn(expectedTestPlan);
  // mockMvc.perform(
  // get("/testplans/" + id + "/testcases").contentType(
  // MediaType.APPLICATION_JSON).accept(
  // MediaType.APPLICATION_JSON))
  // .andDo(print())
  // .andExpect(status().isOk())
  // .andExpect(
  // jsonPath("$[0].name").value(testCases.get(0).getName()))
  // .andExpect(
  // jsonPath("$[1].name").value(testCases.get(1).getName()));
  //
  // verify(mockRepository, times(1)).findOne(id);
  // verifyNoMoreInteractions(mockRepository);
  //
  // }
  //
  // /**
  // *
  // * @param count
  // * @return
  // */
  // private List<CFTestPlan> createDummyTestPlans() {
  // List<CFTestPlan> testPlans = new ArrayList<CFTestPlan>();
  // for (int i = 0; i < 2; i++) {
  // CFTestPlan testPlan = createDummyTestPlan(i + 1);
  // testPlans.add(testPlan);
  // }
  // return testPlans;
  // }
  //
  // private CFTestPlan createDummyTestPlan(int k) {
  // // build a test scenario with 2 test case
  // CFTestPlan testPlan = new CFTestPlan();
  // testPlan.setName("TP_" + k);
  // testPlan.setId(new Random().nextLong());
  //
  // for (int i = 0; i < 2; i++) {
  // TestPlan testCase = new TestPlan();
  // testCase.setName("TC " + (i + 1));
  // testCase.setId(new Long(i + 1));
  //
  // for (int j = 0; j < 2; j++) {
  // TestStep ts = new TestStep();
  // ts.setId(new Random().nextLong());
  // ts.setSequenceNum(j + 1);
  // ts.setDescription("This is test step " + (j + 1));
  // testCase.addTestStep(ts);
  // }
  // testPlan.addTestCase(testCase);
  // }
  //
  // return testPlan;
  // }

}
