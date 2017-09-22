package gov.nist.healthcare.hl7.v2.iz.tool.ws.server.test;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import org.apache.commons.io.IOUtils;
import org.junit.Test;
import org.w3c.dom.Node;

import gov.nist.hit.iz.service.util.ConnectivityUtil;

public class ConnectivityUtilTest {

	@Test
	public void testsubmitSingleMessage() throws Exception {
		String content = IOUtils.toString(ConnectivityUtilTest.class.getResourceAsStream("/2_submitSingleMessage.xml"));
		String username = "blablabla";
		String password = "blobloblo";
		String facilityId = "bliblibli";
		String hl7Message = "blublublu";
		String message = ConnectivityUtil.updateSubmitSingleMessageRequest(content, hl7Message, username, password,
				facilityId);
		assertNotNull(message);
		assertTrue(message.contains(username));
		assertTrue(message.contains(password));
		assertTrue(message.contains(facilityId));
		assertTrue(message.contains(hl7Message));
	}

	@Test
	public void testfindNode() throws Exception {
		String content = IOUtils.toString(ConnectivityUtilTest.class.getResourceAsStream("/2_submitSingleMessage.xml"));
		Node hl7MessageNode = ConnectivityUtil.findNode(content,
				"//*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='submitSingleMessage']/*[local-name()='hl7Message']");
		Node usernameNode = ConnectivityUtil.findNode(content,
				"//*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='submitSingleMessage']/*[local-name()='username']");
		Node passwordNode = ConnectivityUtil.findNode(content,
				"//*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='submitSingleMessage']/*[local-name()='password']");
		Node facilityIdNode = ConnectivityUtil.findNode(content,
				"//*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='submitSingleMessage']/*[local-name()='facilityID']");

		assertNotNull(hl7MessageNode);
		assertNotNull(usernameNode);
		assertNotNull(passwordNode);
		assertNotNull(facilityIdNode);

		assertNotNull(hl7MessageNode.getTextContent());
		assertNotNull(usernameNode.getTextContent());
		assertNotNull(passwordNode.getTextContent());
		assertNotNull(facilityIdNode.getTextContent());
	}

	@Test
	public void testUpdateConnectivityRequest() throws Exception {
		String content = IOUtils.toString(ConnectivityUtilTest.class.getResourceAsStream("/1_connectivityTest.xml"));
		assertNotNull(content);
		content = ConnectivityUtil.updateConnectivityRequest(content);
		assertFalse(content.equals("Hello world!"));
	}

	@Test
	public void testGetRequestHl7Message() throws Exception {
		String content = IOUtils.toString(ConnectivityUtilTest.class.getResourceAsStream("/2_submitSingleMessage.xml"));
		String hl7message = ConnectivityUtil.getRequestHl7Message(content);
		assertNotNull(hl7message);
	}

	@Test
	public void testGetConnectivityEchoBack() throws Exception {
		String content = IOUtils.toString(ConnectivityUtilTest.class.getResourceAsStream("/1_connectivityTest.xml"));
		assertNotNull(content);
		content = ConnectivityUtil.getConnectivityEchoBack(content);
		assertTrue(content.equals("Hello world!"));
	}

	@Test
	public void testGetConnectivityReturn() throws Exception {
		String content = IOUtils
				.toString(ConnectivityUtilTest.class.getResourceAsStream("/1_connectivityTestResponse.xml"));
		assertNotNull(content);
		content = ConnectivityUtil.getConnectivityReturn(content);
		assertTrue(content.equals("You sent: Hello world!"));
	}

}
