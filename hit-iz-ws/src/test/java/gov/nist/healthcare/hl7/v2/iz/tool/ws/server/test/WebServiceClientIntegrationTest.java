package gov.nist.healthcare.hl7.v2.iz.tool.ws.server.test;

import static org.junit.Assert.assertNotNull;
import gov.nist.hit.iz.ws.IZWSConstant;
import gov.nist.hit.iz.ws.client.IZSOAPWebServiceClient;

import org.apache.commons.io.IOUtils;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.ws.client.core.WebServiceTemplate;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("classpath:/iztool-ws-client-test.xml")
public class WebServiceClientIntegrationTest {


  @Autowired
  private IZSOAPWebServiceClient client;

  @Autowired
  private WebServiceTemplate webServiceTemplate;

  // private static MockWebServiceServer mockServer;

  @BeforeClass
  public static void createServer() throws Exception {
    // client = new IZSOAPWebServiceClientImpl(webServiceTemplate);
    // mockServer = MockWebServiceServer.createServer(webServiceTemplate);
  }

  // @Test
  // public void sendToValidEndpoint() throws Exception {
  // String soapRequest =
  // IOUtils.toString(WebServiceClientIntegrationTest.class
  // .getResourceAsStream("/1_connectivityTest.xml"));
  // String soapResponse =
  // IOUtils.toString(WebServiceClientIntegrationTest.class
  // .getResourceAsStream("/1_connectivityTestResponse.xml"));
  // String endpoint = "http://testing.com";
  // Source requestPayload = new StringSource(soapRequest);
  // Source responsePayload = new StringSource(soapResponse);
  //
  // mockServer.expect(connectionTo("http://testing.com")).andRespond(withPayload(responsePayload));
  // String result = client.send(soapRequest, endpoint, IZWSConstant.CONNECTIVITYTEST_SOAP_ACTION);
  // assertNotNull(result);
  // System.out.print(result);
  // mockServer.verify();
  // }


  @Test
  public void testConnectivityTest() throws Exception {
    String soapRequest =
        IOUtils.toString(WebServiceClientIntegrationTest.class
            .getResourceAsStream("/1_connectivityTest.xml"));
    // String endpoint = "http://localhost:8080/iztool/ws/iisService";
    String endpoint =
        "http://test.envisiontechnology.com/CDCIISTestService20160112/V1/IISService.svc";
    String result = client.send(soapRequest, endpoint, IZWSConstant.CONNECTIVITYTEST_SOAP_ACTION);
    assertNotNull(result);
    System.out.print(result);
  }

  // @Test
  // public void testSubmitSingleMesssage() throws Exception {
  // String soapRequest =
  // IOUtils.toString(WebServiceClientIntegrationTest.class
  // .getResourceAsStream("/2_submitSingleMessage.xml"));
  // String endpoint = "http://localhost:8080/iztool/ws/iisService";
  // // String endpoint =
  // // "http://test.envisiontechnology.com/CDCIISTestService20160112/V1/IISService.svc";
  //
  // String result =
  // client.send(soapRequest, endpoint, IZWSConstant.SUBMITSINGLEMESSAGE_SOAP_ACTION);
  // assertNotNull(result);
  // System.out.print(result);
  // }
  //


  // @Test
  // public void sendToInvalidEndpoint() throws Exception {
  // String soapRequest =
  // IOUtils.toString(WebServiceClientIntegrationTest.class
  // .getResourceAsStream("/1_connectivityTest.xml"));
  // String soapResponse =
  // IOUtils.toString(WebServiceClientIntegrationTest.class
  // .getResourceAsStream("/1_connectivityTestResponse.xml"));
  // String endpoint = "http://testing.com";
  // Source requestPayload = new StringSource(soapRequest);
  // Source responsePayload = new StringSource(soapResponse);
  //
  // mockServer.expect(connectionTo("http://testing.com")).andExpect(payload(requestPayload))
  // .andExpect(payload(requestPayload)).andRespond(withPayload(responsePayload));
  //
  // String result = client.send(endpoint, soapRequest);
  // assertNotNull(result);
  // System.out.print(result);
  // mockServer.verify();
  // }

}
