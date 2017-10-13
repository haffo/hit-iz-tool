package gov.nist.hit.iz.service;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;

import gov.nist.hit.core.domain.SutType;
import gov.nist.hit.core.service.util.FileUtil;
import gov.nist.hit.iz.domain.IZConnectivityTestCase;
import gov.nist.hit.iz.domain.IZConnectivityTestContext;
import gov.nist.hit.iz.domain.IZConnectivityTestPlan;
import gov.nist.hit.iz.domain.IZTestStory;
import gov.nist.hit.iz.domain.IZTestType;
import gov.nist.hit.iz.domain.IZValidationPhase;

/**
 * 
 * @author Harold Affo
 * 
 */
public class SOAPConnectivityTestPlanParser {

	private final String domain;

	public SOAPConnectivityTestPlanParser(String domain) {
		this.domain = domain;
	}

	public List<IZConnectivityTestPlan> create() throws IOException, URISyntaxException {
		List<IZConnectivityTestPlan> testPlans = new ArrayList<IZConnectivityTestPlan>();

		String testCasePath = null;
		IZConnectivityTestPlan testPlan = new IZConnectivityTestPlan();
		testPlan.setName("Sender(Initiator)");

		IZConnectivityTestCase testCase = new IZConnectivityTestCase();
		testCase.setName("SOAPCON_1_BasicMessage_ConnectivityRequest");
		testCase.setSutType(SutType.SENDER);
		testCase.setTestType(IZTestType.SENDER_CONNECTIVITY.toString());
		testCasePath = this.domain + "/Connectivity/sender/SOAPCON_1_BasicMessage_ConnectivityRequest";
		testCase.setInstructionsImage(FileUtil.getByteArray(testCasePath + "/instructions.png"));
		testCase.setInstructionsText(FileUtil.getContent(testCasePath + "/instructions.txt"));
		testCase.setTds(FileUtil.getContent(testCasePath + "/tds.html"));
		testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");
		IZTestStory testStory = testCase.getTestStory();
		testStory.setDescription(FileUtil.getContent(testCasePath + "/description.txt"));
		testStory.setTestObjectives(FileUtil.getContent(testCasePath + "/testObjectives.txt"));
		IZConnectivityTestContext context = new IZConnectivityTestContext();
		context.setRequestContentImage(FileUtil.getByteArray(testCasePath + "/content.png"));
		context.setResponseContentImage(FileUtil.getByteArray(testCasePath + "/content-response.png"));
		context.setRequestValidationPhase(IZValidationPhase.connectivityTest_Request.toString());
		context.setResponseValidationPhase(IZValidationPhase.connectivityTest_Response.toString());
		context.setMessage(FileUtil.getContent(testCasePath + "/Request.xml"));
		context.setExampleMessage(FileUtil.getContent(testCasePath + "/Response.xml"));
		testCase.setTestContext(context);
		testPlan.addTestCase(testCase);

		testCase = new IZConnectivityTestCase();
		testCase.setName("SOAPCON_3_SubmitSingleMessage_Message");
		testCasePath = this.domain + "/Connectivity/sender/SOAPCON_3_SubmitSingleMessage_Message";
		testCase.setTestType(IZTestType.SENDER_SUBMIT_SINGLE_MESSAGE.toString());
		testCase.setSutType(SutType.SENDER);
		context = new IZConnectivityTestContext();
		context.setRequestValidationPhase(IZValidationPhase.submitSingleMessage_Request.toString());
		context.setResponseValidationPhase(IZValidationPhase.submitSingleMessage_Response.toString());
		context.setMessage(FileUtil.getContent(testCasePath + "/Request.xml"));
		context.setExampleMessage(FileUtil.getContent(testCasePath + "/Response.xml"));
		context.setRequestContentImage(FileUtil.getByteArray(testCasePath + "/content.png"));
		context.setResponseContentImage(FileUtil.getByteArray(testCasePath + "/content-response.png"));
		testCase.setInstructionsImage(FileUtil.getByteArray(testCasePath + "/instructions.png"));
		testCase.setInstructionsText(FileUtil.getContent(testCasePath + "/instructions.txt"));
		testCase.setTds(FileUtil.getContent(testCasePath + "/tds.html"));
		testStory = testCase.getTestStory();
		testStory.setDescription(FileUtil.getContent(testCasePath + "/description.txt"));
		testStory.setTestObjectives(FileUtil.getContent(testCasePath + "/testObjectives.txt"));
		testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");

		testCase.setTestContext(context);
		testPlan.addTestCase(testCase);
		testPlans.add(testPlan);

		testPlan = new IZConnectivityTestPlan();
		testPlan.setName("Receiver(Responder)");

		testCase = new IZConnectivityTestCase();
		testCase.setSutType(SutType.RECEIVER);
		testCase.setName("SOAPCON_1_BasicMessage_ConnectivityResponse");
		testCasePath = this.domain + "/Connectivity/receiver/SOAPCON_1_BasicMessage_ConnectivityResponse";
		testCase.setTestType(IZTestType.RECEIVER_CONNECTIVITY.toString());
		context = new IZConnectivityTestContext();
		context.setRequestValidationPhase(IZValidationPhase.connectivityTest_Request.toString());
		context.setResponseValidationPhase(IZValidationPhase.connectivityTest_Response.toString());
		context.setMessage(FileUtil.getContent(testCasePath + "/Request.xml"));
		context.setExampleMessage(FileUtil.getContent(testCasePath + "/Response.xml"));
		context.setRequestContentImage(FileUtil.getByteArray(testCasePath + "/content.png"));
		testCase.setInstructionsImage(FileUtil.getByteArray(testCasePath + "/instructions.png"));
		testCase.setInstructionsText(FileUtil.getContent(testCasePath + "/instructions.txt"));
		testCase.setTds(FileUtil.getContent(testCasePath + "/tds.html"));
		testStory = testCase.getTestStory();
		testStory.setDescription(FileUtil.getContent(testCasePath + "/description.txt"));
		testStory.setTestObjectives(FileUtil.getContent(testCasePath + "/testObjectives.txt"));
		testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");

		testCase.setTestContext(context);
		testPlan.addTestCase(testCase);

		testCase = new IZConnectivityTestCase();
		testCase.setSutType(SutType.RECEIVER);
		testCase.setName("SOAPCON_2_SubmitSingleMessage_Response");
		testCasePath = this.domain + "/Connectivity/receiver/SOAPCON_2_SubmitSingleMessage_Response";
		testCase.setTestType(IZTestType.RECEIVER_SUBMIT_SINGLE_MESSAGE.toString());
		context = new IZConnectivityTestContext();
		context.setRequestValidationPhase(IZValidationPhase.submitSingleMessage_Request.toString());
		context.setResponseValidationPhase(IZValidationPhase.submitSingleMessage_Response.toString());
		context.setMessage(FileUtil.getContent(testCasePath + "/Request.xml"));
		context.setExampleMessage(FileUtil.getContent(testCasePath + "/Response.xml"));
		context.setRequestContentImage(FileUtil.getByteArray(testCasePath + "/content.png"));
		testCase.setInstructionsImage(FileUtil.getByteArray(testCasePath + "/instructions.png"));
		testCase.setInstructionsText(FileUtil.getContent(testCasePath + "/instructions.txt"));
		testCase.setTds(FileUtil.getContent(testCasePath + "/tds.html"));
		testStory = testCase.getTestStory();
		testStory.setDescription(FileUtil.getContent(testCasePath + "/description.txt"));
		testStory.setTestObjectives(FileUtil.getContent(testCasePath + "/testObjectives.txt"));
		testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");

		testCase.setTestContext(context);
		testPlan.addTestCase(testCase);

		testCase = new IZConnectivityTestCase();
		testCase.setSutType(SutType.RECEIVER);
		testCase.setName("SOAPCON_3_FaultDetection-Generation_AuthenticationFault");
		testCasePath = this.domain + "/Connectivity/receiver/SOAPCON_3_FaultDetection-Generation_AuthenticationFault";
		testCase.setTestType(IZTestType.RECEIVER_SUBMIT_SINGLE_MESSAGE.toString());
		context = new IZConnectivityTestContext();
		context.setRequestValidationPhase(IZValidationPhase.submitSingleMessage_Request.toString());
		context.setResponseValidationPhase(IZValidationPhase.SecurityFault.toString());
		context.setMessage(FileUtil.getContent(testCasePath + "/Request.xml"));
		context.setExampleMessage(FileUtil.getContent(testCasePath + "/Response.xml"));
		context.setRequestContentImage(FileUtil.getByteArray(testCasePath + "/content.png"));
		testCase.setInstructionsImage(FileUtil.getByteArray(testCasePath + "/instructions.png"));
		testCase.setInstructionsText(FileUtil.getContent(testCasePath + "/instructions.txt"));
		testCase.setTds(FileUtil.getContent(testCasePath + "/tds.html"));
		testStory = testCase.getTestStory();
		testStory.setDescription(FileUtil.getContent(testCasePath + "/description.txt"));
		testStory.setTestObjectives(FileUtil.getContent(testCasePath + "/testObjectives.txt"));
		testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");

		testCase.setTestContext(context);
		testPlan.addTestCase(testCase);

		testCase = new IZConnectivityTestCase();
		testCase.setSutType(SutType.RECEIVER);
		testCase.setName("SOAPCON_4_FaultDetection-Generation_MessageSizeFault");
		testCasePath = this.domain + "/Connectivity/receiver/SOAPCON_4_FaultDetection-Generation_MessageSizeFault";
		testCase.setTestType(IZTestType.RECEIVER_SUBMIT_SINGLE_MESSAGE.toString());
		context = new IZConnectivityTestContext();
		context.setRequestValidationPhase(IZValidationPhase.submitSingleMessage_Request.toString());
		context.setResponseValidationPhase(IZValidationPhase.MessageTooLargeFault.toString());
		context.setMessage(FileUtil.getContent(testCasePath + "/Request.xml"));
		context.setExampleMessage(FileUtil.getContent(testCasePath + "/Response.xml"));
		context.setRequestContentImage(FileUtil.getByteArray(testCasePath + "/content.png"));
		testCase.setInstructionsImage(FileUtil.getByteArray(testCasePath + "/instructions.png"));
		testCase.setInstructionsText(FileUtil.getContent(testCasePath + "/instructions.txt"));
		testCase.setTds(FileUtil.getContent(testCasePath + "/tds.html"));
		testStory = testCase.getTestStory();
		testStory.setDescription(FileUtil.getContent(testCasePath + "/description.txt"));
		testStory.setTestObjectives(FileUtil.getContent(testCasePath + "/testObjectives.txt"));
		testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");
		testCase.setTestContext(context);
		testPlan.addTestCase(testCase);

		testCase = new IZConnectivityTestCase();
		testCase.setSutType(SutType.RECEIVER);
		testCase.setName("SOAPCON_5_FaultDetection-Generation_UnsupportedOp_Fault");
		testCasePath = this.domain + "/Connectivity/receiver/SOAPCON_5_FaultDetection-Generation_UnsupportedOp_Fault";

		testCase.setTestType(IZTestType.RECEIVER_UNSUPPORTED_OPERATION.toString());
		context = new IZConnectivityTestContext();
		context.setRequestValidationPhase(IZValidationPhase.submitSingleMessage_Request.toString());
		context.setResponseValidationPhase(IZValidationPhase.UnsupportedOperationFault.toString());
		context.setMessage(FileUtil.getContent(testCasePath + "/Request.xml"));
		context.setExampleMessage(FileUtil.getContent(testCasePath + "/Response.xml"));
		context.setRequestContentImage(FileUtil.getByteArray(testCasePath + "/content.png"));
		testCase.setInstructionsImage(FileUtil.getByteArray(testCasePath + "/instructions.png"));
		testCase.setInstructionsText(FileUtil.getContent(testCasePath + "/instructions.txt"));
		testCase.setTds(FileUtil.getContent(testCasePath + "/tds.html"));
		testStory = testCase.getTestStory();
		testStory.setDescription(FileUtil.getContent(testCasePath + "/description.txt"));
		testStory.setTestObjectives(FileUtil.getContent(testCasePath + "/testObjectives.txt"));
		testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");
		testCase.setTestContext(context);
		testPlan.addTestCase(testCase);

		testPlans.add(testPlan);

		return testPlans;
	}
}
