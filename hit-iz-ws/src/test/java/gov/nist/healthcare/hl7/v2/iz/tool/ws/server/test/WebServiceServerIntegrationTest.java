package gov.nist.healthcare.hl7.v2.iz.tool.ws.server.test;


// @RunWith(SpringJUnit4ClassRunner.class)
// @ContextConfiguration("classpath:/iztool-ws-server-test.xml")
public class WebServiceServerIntegrationTest {

  // @Autowired
  // private ApplicationContext applicationContext;
  //
  // private MockWebServiceClient mockClient;
  //
  // @Autowired
  // private MessageRegistry messageRegistry;
  //
  // @Before
  // public void createClient() {
  // mockClient = MockWebServiceClient.createClient(applicationContext);
  // }
  //
  // @Test
  // public void connectivityTestEndpoint() throws Exception {
  // Source requestPayload = new StringSource(
  // IOUtils.toString(WebServiceServerIntegrationTest.class
  // .getResourceAsStream("/2_connectivityTest.xml")));
  //
  // Source responsePayload = new StringSource(
  // IOUtils.toString(WebServiceServerIntegrationTest.class
  // .getResourceAsStream("/2_connectivityTestResponse.xml")));
  //
  // mockClient.sendRequest(withPayload(requestPayload)).andExpect(
  // payload(responsePayload));
  //
  // }
  //
  // @Test
  // public void testValidSubmitSingleMessage() throws Exception {
  // String facilityID = "FAC_TEST";
  // Source requestPayload = new StringSource(
  // IOUtils.toString(WebServiceServerIntegrationTest.class
  // .getResourceAsStream("/2_submitSingleMessage.xml")));
  // mockClient.sendRequest(withPayload(requestPayload));
  // String soapRequest = messageRegistry.getIncoming(facilityID);
  // System.out.println(soapRequest);
  // String soapResponse = messageRegistry.getOutgoing(facilityID);
  // System.out.println(soapResponse);
  // assertNotNull(soapRequest);
  // assertNotNull(soapResponse);
  // }
  //
  // @Test
  // public void testSubmitSingleMessageWithNoFacilityId() throws Exception {
  // String facilityID = "FAC_TEST_UNKNWON";
  // messageRegistry.clear(facilityID);
  // Source requestPayload = new StringSource(
  // IOUtils.toString(WebServiceServerIntegrationTest.class
  // .getResourceAsStream("/3_submitSingleMessage.xml")));
  // mockClient.sendRequest(withPayload(requestPayload));
  // String soapRequest = messageRegistry.getIncoming(facilityID);
  // System.out.println(soapRequest);
  // String soapResponse = messageRegistry.getOutgoing(facilityID);
  // System.out.println(soapResponse);
  // assertNotNull(soapRequest);
  // assertNotNull(soapResponse);
  // }

}
