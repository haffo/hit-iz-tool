package gov.nist.healthcare.hl7.v2.iz.tool.ws.server.test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import gov.nist.hit.iz.ws.jaxb.SubmitSingleMessageRequestType;
import gov.nist.hit.iz.ws.jaxb.SubmitSingleMessageResponseType;
import gov.nist.hit.iz.ws.utils.WsdlUtil;

import org.apache.commons.io.IOUtils;
import org.junit.Test;

public class WsdlUtilTest {

	@Test
	public void testToSubmitSingleMessage() throws Exception {
		String content = IOUtils.toString(WsdlUtilTest.class
				.getResourceAsStream("/2_submitSingleMessage.xml"));
		SubmitSingleMessageRequestType obj = WsdlUtil
				.toSubmitSingleMessage(content);
		assertEquals("FAC_TEST", obj.getFacilityID());
		assertEquals("test", obj.getUsername());
		assertEquals("12345", obj.getPassword());
	}

	@Test
	public void testToSubmitSingleMessageResponse() throws Exception {
		String content = IOUtils.toString(WsdlUtilTest.class
				.getResourceAsStream("/submitSingleMessageResponse.xml"));
		SubmitSingleMessageResponseType obj = WsdlUtil
				.toSubmitSingleMessageResponse(content);
		assertNotNull(obj.getReturn());

	}

}
