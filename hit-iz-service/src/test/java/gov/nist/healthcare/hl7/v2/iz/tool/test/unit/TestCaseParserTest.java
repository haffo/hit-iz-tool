package gov.nist.healthcare.hl7.v2.iz.tool.test.unit;

import gov.nist.hit.iz.service.CBTestPlanParser;

import org.junit.Test;

public class TestCaseParserTest {

	CBTestPlanParser parser = new CBTestPlanParser();

	@Test
	public void testParseDataInstanceTestCases() throws Exception {
		String root = "/TP2";
		root = this.getClass().getResource(root).getPath();
		// DataInstanceTestPlan tp = parser.parseToDataInstanceTestPlan(root);

	}
}
