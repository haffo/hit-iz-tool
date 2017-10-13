package gov.nist.healthcare.hl7.v2.iz.tool.ws.server.test;

import org.apache.commons.io.IOUtils;
import org.junit.Test;

import gov.nist.hit.iz.ws.utils.HL7MessageUtil;

public class HL7MessageUtilTest {

	@Test
	public void testUpdateValidPath() throws Exception {
		String in = IOUtils.toString(ConnectivityUtilTest.class.getResourceAsStream("/inEr7.txt"));
		String out = IOUtils.toString(ConnectivityUtilTest.class.getResourceAsStream("/outEr7.txt"));
		String updated = HL7MessageUtil.updateOutgoing(out, in);
		System.out.println(updated);
	}

}
