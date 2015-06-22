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
public class TestStepControllerTest {

  // @Mock
  // TestStepRepository mockRepository;
  //
  // @InjectMocks
  // TestStepController controller;
  //
  // MockMvc mockMvc;
  //
  // @Before
  // public void setup() {
  // MockitoAnnotations.initMocks(this);
  // controller = new TestStepController();
  // controller.setTestStepRepository(mockRepository);
  // mockMvc = standaloneSetup(controller).build();
  // }
  //
  // /**
  // * Get a test case by its id. Return the testcase
  // *
  // * @throws Exception
  // */
  // @Test
  // public void testGetValidTestStepById() throws Exception {
  // TestStep testStep = createDummy();
  // when(mockRepository.findOne(testStep.getId())).thenReturn(testStep);
  // mockMvc.perform(
  // get("/teststeps/" + testStep.getId()).accept(
  // MediaType.APPLICATION_JSON))
  // .andDo(print())
  // .andExpect(status().isOk())
  // .andExpect(
  // jsonPath("$.description").value(
  // testStep.getDescription()));
  // verify(mockRepository, times(1)).findOne(testStep.getId());
  // verifyNoMoreInteractions(mockRepository);
  // }
  //
  // @Test
  // public void testGetTestSteps() throws Exception {
  // List<TestStep> testSteps = createDummies();
  // when(mockRepository.findAll()).thenReturn(testSteps);
  // mockMvc.perform(
  // get("/teststeps").contentType(MediaType.APPLICATION_JSON)
  // .accept(MediaType.APPLICATION_JSON))
  // .andDo(print())
  // .andExpect(status().isOk())
  // .andExpect(
  // jsonPath("$[0].description").value(
  // testSteps.get(0).getDescription()));
  // verify(mockRepository, times(1)).findAll();
  // verifyNoMoreInteractions(mockRepository);
  //
  // }
  //
  // private TestStep createDummy() {
  // TestStep ts = new TestStep();
  // ts.setId(new Random().nextLong());
  // ts.setSequenceNum(1);
  // ts.setDescription("This is test step test some stuff");
  // return ts;
  // }
  //
  // private List<TestStep> createDummies() {
  // List<TestStep> all = new ArrayList<TestStep>();
  // for (int i = 0; i < 2; i++) {
  // TestStep ts = new TestStep();
  // ts.setId(new Random().nextLong());
  // ts.setSequenceNum(i + 1);
  // ts.setDescription("This is test step " + (i + 1));
  // all.add(ts);
  // }
  // return all;
  // }

}
