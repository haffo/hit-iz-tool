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
public class SoapConnectivityControllerTest {

  // @InjectMocks
  // SoapConnectivityController soapController;
  //
  // MockMvc mockMvc;
  //
  // @Mock
  // TransportClient client;
  //
  // @Rule
  // public ExpectedException thrown = ExpectedException.none();
  //
  // @Before
  // public void setup() {
  // MockitoAnnotations.initMocks(this);
  // soapController.setSoapParser(new SoapMessageParser(
  // new XmlMessageParser()));
  // soapController.setTransportClient(client);
  // mockMvc = standaloneSetup(soapController).build();
  // }
  //
  // /**
  // * Get a integrationProfile model as json
  // *
  // * @throws Exception
  // */
  // @Test
  // public void testSend() throws Exception {
  // String soapRequest = getSoapRequest();
  // String soapResponse = getSoapResponse();
  // String endpoint = "TESTING_URL";
  // Command command = new Command(endpoint, soapResponse);
  //
  // when(client.send(endpoint, soapRequest)).thenReturn(soapResponse);
  //
  // ObjectMapper objectMapper = new ObjectMapper();
  // // valid request object
  // String jsonText = objectMapper.writeValueAsString(command);
  // mockMvc.perform(
  // post("/connectivity/send").contentType(
  // MediaType.APPLICATION_JSON).content(jsonText))
  // .andExpect(status().isOk()).andDo(print());
  // }
  //
  // public String getSoapRequest() throws IOException {
  // return IOUtils.toString(SoapConnectivityControllerTest.class
  // .getResourceAsStream("/soapMessages/1.xml"));
  // }
  //
  // public String getSoapResponse() throws IOException {
  // return IOUtils.toString(SoapConnectivityControllerTest.class
  // .getResourceAsStream("/soapMessages/2.xml"));
  // }

}
