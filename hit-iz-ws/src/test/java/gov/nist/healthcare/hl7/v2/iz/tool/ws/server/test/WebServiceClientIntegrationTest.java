package gov.nist.healthcare.hl7.v2.iz.tool.ws.server.test;

import static org.junit.Assert.assertNotNull;
import static org.springframework.ws.test.client.RequestMatchers.connectionTo;
import static org.springframework.ws.test.client.RequestMatchers.payload;
import static org.springframework.ws.test.client.ResponseCreators.withPayload;
import gov.nist.hit.iz.ws.client.WebServiceClient;

import javax.xml.transform.Source;

import org.apache.commons.io.IOUtils;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.ws.client.core.WebServiceTemplate;
import org.springframework.ws.test.client.MockWebServiceServer;
import org.springframework.xml.transform.StringSource;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("classpath:/iztool-ws-client-test.xml")
public class WebServiceClientIntegrationTest {

	private WebServiceClient client;

	private MockWebServiceServer mockServer;

	@Before
	public void createServer() throws Exception {
		WebServiceTemplate webServiceTemplate = new WebServiceTemplate();
		client = new WebServiceClient(webServiceTemplate);
		mockServer = MockWebServiceServer.createServer(webServiceTemplate);
	}

	@Test
	public void sendToValidEndpoint() throws Exception {
		String soapRequest = IOUtils
				.toString(WebServiceClientIntegrationTest.class
						.getResourceAsStream("/1_connectivityTest.xml"));
		String soapResponse = IOUtils
				.toString(WebServiceClientIntegrationTest.class
						.getResourceAsStream("/1_connectivityTestResponse.xml"));
		String endpoint = "http://testing.com";
		Source requestPayload = new StringSource(soapRequest);
		Source responsePayload = new StringSource(soapResponse);

		mockServer.expect(connectionTo("http://testing.com"))
				.andExpect(payload(requestPayload))
				.andRespond(withPayload(responsePayload));

		String result = client.send(endpoint, soapRequest);
		assertNotNull(result);
		System.out.print(result);
		mockServer.verify();
	}

	@Test
	public void sendToInvalidEndpoint() throws Exception {
		String soapRequest = IOUtils
				.toString(WebServiceClientIntegrationTest.class
						.getResourceAsStream("/1_connectivityTest.xml"));
		String soapResponse = IOUtils
				.toString(WebServiceClientIntegrationTest.class
						.getResourceAsStream("/1_connectivityTestResponse.xml"));
		String endpoint = "http://testing.com";
		Source requestPayload = new StringSource(soapRequest);
		Source responsePayload = new StringSource(soapResponse);

		mockServer.expect(connectionTo("http://testing.com"))
				.andExpect(payload(requestPayload))
				.andExpect(payload(requestPayload))
				.andRespond(withPayload(responsePayload));

		String result = client.send(endpoint, soapRequest);
		assertNotNull(result);
		System.out.print(result);
		mockServer.verify();
	}

}
