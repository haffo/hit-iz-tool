package gov.nist.hit.iz.service;

import gov.nist.hit.core.domain.SutType;
import gov.nist.hit.core.domain.TestStory;
import gov.nist.hit.core.service.util.FileUtil;
import gov.nist.hit.iz.domain.ConnectivityTestCase;
import gov.nist.hit.iz.domain.ConnectivityTestContext;
import gov.nist.hit.iz.domain.ConnectivityTestPlan;
import gov.nist.hit.iz.domain.IZTestType;
import gov.nist.hit.iz.domain.ValidationPhase;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;

import org.codehaus.jackson.JsonProcessingException;

/**
 * 
 * @author Harold Affo
 * 
 */
public class SoapConnectivityTestPlanParser extends TestPlanParser {

  public List<ConnectivityTestPlan> create() throws JsonProcessingException, IOException,
      URISyntaxException {
    List<ConnectivityTestPlan> testPlans = new ArrayList<ConnectivityTestPlan>();

    String testCasePath = null;
    ConnectivityTestPlan testPlan = new ConnectivityTestPlan();
    testPlan.setName("Sender(Initiator)");

    ConnectivityTestCase testCase = new ConnectivityTestCase();
    testCase.setName("SOAPCON_1_BasicMessage_ConnectivityRequest");
    testCase.setSutType(SutType.SENDER);
    testCase.setTestType(IZTestType.SENDER_CONNECTIVITY.toString());
    testCasePath = "/Connectivity/sender/SOAPCON_1_BasicMessage_ConnectivityRequest";
    testCase.setInstructionsImage(FileUtil.getByteArray(testCasePath + "/instructions.png"));
    testCase.setInstructionsText(FileUtil.getContent(testCasePath + "/instructions.txt"));
    testCase.setTestDataSpecificationImage(FileUtil.getByteArray(testCasePath
        + "/testDataSpecification.png"));
    testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");
    TestStory testStory = testCase.getTestStory();
    testStory.setDescription(FileUtil.getContent(testCasePath + "/description.txt"));
    testStory.setTestObjectives(FileUtil.getContent(testCasePath + "/testObjectives.txt"));
    ConnectivityTestContext context = new ConnectivityTestContext();
    context.setRequestContentImage(FileUtil.getByteArray(testCasePath + "/content.png"));
    context.setResponseContentImage(FileUtil.getByteArray(testCasePath + "/content-response.png"));
    context.setRequestValidationPhase(ValidationPhase.connectivityTest_Request.toString());
    context.setResponseValidationPhase(ValidationPhase.connectivityTest_Response.toString());
    context.setMessage(FileUtil.getContent(testCasePath + "/Request.xml"));
    context.setExampleMessage(FileUtil.getContent(testCasePath + "/Response.xml"));
    testCase.setTestContext(context);
    testPlan.addTestCase(testCase);

    // testCase = new TestCase();
    // testCase.setName("SOAPCON_2_MessageContentDe-capsulation_Connectivity");
    // testCasePath =
    // "/Connectivity/sender/SOAPCON_2_MessageContentDe-capsulation_Connectivity";
    // testCase.setTestType(IZTestType.SENDER_SUBMIT_SINGLE_MESSAGE.toString());
    // testCase.setSutType(SutType.SENDER);
    // context = new ConnectivityTestContext();
    // context.setRequestValidationPhase(ValidationPhase.connectivityTest_Request
    // .toString());
    // context.setResponseValidationPhase(ValidationPhase.connectivityTest_Response
    // .toString());
    // context.setMessage(FileUtil.getContent(testCasePath +
    // "/Request.xml"));
    // context.setExampleMessage(FileUtil.getContent(testCasePath +
    // "/Response.xml"));
    // testCase.setTestContext(context);
    // testCase.getTestStory().setDescription(
    // FileUtil.getContent(testCasePath + "/description.txt"));
    // testPlan.addTestCase(testCase);

    testCase = new ConnectivityTestCase();
    testCase.setName("SOAPCON_3_SubmitSingleMessage_Message");
    testCasePath = "/Connectivity/sender/SOAPCON_3_SubmitSingleMessage_Message";
    testCase.setTestType(IZTestType.SENDER_SUBMIT_SINGLE_MESSAGE.toString());
    testCase.setSutType(SutType.SENDER);
    context = new ConnectivityTestContext();
    context.setRequestValidationPhase(ValidationPhase.submitSingleMessage_Request.toString());
    context.setResponseValidationPhase(ValidationPhase.submitSingleMessage_Response.toString());
    context.setMessage(FileUtil.getContent(testCasePath + "/Request.xml"));
    context.setExampleMessage(FileUtil.getContent(testCasePath + "/Response.xml"));
    context.setRequestContentImage(FileUtil.getByteArray(testCasePath + "/content.png"));
    context.setResponseContentImage(FileUtil.getByteArray(testCasePath + "/content-response.png"));
    testCase.setInstructionsImage(FileUtil.getByteArray(testCasePath + "/instructions.png"));
    testCase.setInstructionsText(FileUtil.getContent(testCasePath + "/instructions.txt"));
    testCase.setTestDataSpecificationImage(FileUtil.getByteArray(testCasePath
        + "/testDataSpecification.png"));
    testStory = testCase.getTestStory();
    testStory.setDescription(FileUtil.getContent(testCasePath + "/description.txt"));
    testStory.setTestObjectives(FileUtil.getContent(testCasePath + "/testObjectives.txt"));
    testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");

    testCase.setTestContext(context);
    testPlan.addTestCase(testCase);
    testPlans.add(testPlan);

    testPlan = new ConnectivityTestPlan();
    testPlan.setName("Receiver(Responder)");

    testCase = new ConnectivityTestCase();
    testCase.setSutType(SutType.RECEIVER);
    testCase.setName("SOAPCON_1_BasicMessage_ConnectivityResponse");
    testCasePath = "/Connectivity/receiver/SOAPCON_1_BasicMessage_ConnectivityResponse";
    testCase.setTestType(IZTestType.RECEIVER_CONNECTIVITY.toString());
    context = new ConnectivityTestContext();
    context.setRequestValidationPhase(ValidationPhase.connectivityTest_Request.toString());
    context.setResponseValidationPhase(ValidationPhase.connectivityTest_Response.toString());
    context.setMessage(FileUtil.getContent(testCasePath + "/Request.xml"));
    context.setExampleMessage(FileUtil.getContent(testCasePath + "/Response.xml"));
    context.setRequestContentImage(FileUtil.getByteArray(testCasePath + "/content.png"));
    testCase.setInstructionsImage(FileUtil.getByteArray(testCasePath + "/instructions.png"));
    testCase.setInstructionsText(FileUtil.getContent(testCasePath + "/instructions.txt"));
    testCase.setTestDataSpecificationImage(FileUtil.getByteArray(testCasePath
        + "/testDataSpecification.png"));
    testStory = testCase.getTestStory();
    testStory.setDescription(FileUtil.getContent(testCasePath + "/description.txt"));
    testStory.setTestObjectives(FileUtil.getContent(testCasePath + "/testObjectives.txt"));
    testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");

    testCase.setTestContext(context);
    testPlan.addTestCase(testCase);

    testCase = new ConnectivityTestCase();
    testCase.setSutType(SutType.RECEIVER);
    testCase.setName("SOAPCON_2_SubmitSingleMessage_Response");
    testCasePath = "/Connectivity/receiver/SOAPCON_2_SubmitSingleMessage_Response";
    testCase.setTestType(IZTestType.RECEIVER_SUBMIT_SINGLE_MESSAGE.toString());
    context = new ConnectivityTestContext();
    context.setRequestValidationPhase(ValidationPhase.submitSingleMessage_Request.toString());
    context.setResponseValidationPhase(ValidationPhase.submitSingleMessage_Response.toString());
    context.setMessage(FileUtil.getContent(testCasePath + "/Request.xml"));
    context.setExampleMessage(FileUtil.getContent(testCasePath + "/Response.xml"));
    context.setRequestContentImage(FileUtil.getByteArray(testCasePath + "/content.png"));
    testCase.setInstructionsImage(FileUtil.getByteArray(testCasePath + "/instructions.png"));
    testCase.setInstructionsText(FileUtil.getContent(testCasePath + "/instructions.txt"));
    testCase.setTestDataSpecificationImage(FileUtil.getByteArray(testCasePath
        + "/testDataSpecification.png"));
    testStory = testCase.getTestStory();
    testStory.setDescription(FileUtil.getContent(testCasePath + "/description.txt"));
    testStory.setTestObjectives(FileUtil.getContent(testCasePath + "/testObjectives.txt"));
    testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");

    testCase.setTestContext(context);
    testPlan.addTestCase(testCase);

    testCase = new ConnectivityTestCase();
    testCase.setSutType(SutType.RECEIVER);
    testCase.setName("SOAPCON_3_FaultDetection-Generation_AuthenticationFault");
    testCasePath = "/Connectivity/receiver/SOAPCON_3_FaultDetection-Generation_AuthenticationFault";
    testCase.setTestType(IZTestType.RECEIVER_SUBMIT_SINGLE_MESSAGE.toString());
    context = new ConnectivityTestContext();
    context.setRequestValidationPhase(ValidationPhase.submitSingleMessage_Request.toString());
    context.setResponseValidationPhase(ValidationPhase.SecurityFault.toString());
    context.setMessage(FileUtil.getContent(testCasePath + "/Request.xml"));
    context.setExampleMessage(FileUtil.getContent(testCasePath + "/Response.xml"));
    context.setRequestContentImage(FileUtil.getByteArray(testCasePath + "/content.png"));
    testCase.setInstructionsImage(FileUtil.getByteArray(testCasePath + "/instructions.png"));
    testCase.setInstructionsText(FileUtil.getContent(testCasePath + "/instructions.txt"));
    testCase.setTestDataSpecificationImage(FileUtil.getByteArray(testCasePath
        + "/testDataSpecification.png"));
    testStory = testCase.getTestStory();
    testStory.setDescription(FileUtil.getContent(testCasePath + "/description.txt"));
    testStory.setTestObjectives(FileUtil.getContent(testCasePath + "/testObjectives.txt"));
    testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");

    testCase.setTestContext(context);
    testPlan.addTestCase(testCase);

    testCase = new ConnectivityTestCase();
    testCase.setSutType(SutType.RECEIVER);
    testCase.setName("SOAPCON_4_FaultDetection-Generation_MessageSizeFault");
    testCasePath = "/Connectivity/receiver/SOAPCON_4_FaultDetection-Generation_MessageSizeFault";
    testCase.setTestType(IZTestType.RECEIVER_SUBMIT_SINGLE_MESSAGE.toString());
    context = new ConnectivityTestContext();
    context.setRequestValidationPhase(ValidationPhase.submitSingleMessage_Request.toString());
    context.setResponseValidationPhase(ValidationPhase.MessageTooLargeFault.toString());
    context.setMessage(FileUtil.getContent(testCasePath + "/Request.xml"));
    context.setExampleMessage(FileUtil.getContent(testCasePath + "/Response.xml"));
    context.setRequestContentImage(FileUtil.getByteArray(testCasePath + "/content.png"));
    testCase.setInstructionsImage(FileUtil.getByteArray(testCasePath + "/instructions.png"));
    testCase.setInstructionsText(FileUtil.getContent(testCasePath + "/instructions.txt"));
    testCase.setTestDataSpecificationImage(FileUtil.getByteArray(testCasePath
        + "/testDataSpecification.png"));
    // testCase.setTestDataSpecificationImage2(FileUtil.getByteArray(testCasePath
    // + "/testDataSpecification2.png"));

    testStory = testCase.getTestStory();
    testStory.setDescription(FileUtil.getContent(testCasePath + "/description.txt"));
    testStory.setTestObjectives(FileUtil.getContent(testCasePath + "/testObjectives.txt"));
    testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");
    testCase.setTestContext(context);
    testPlan.addTestCase(testCase);

    testCase = new ConnectivityTestCase();
    testCase.setSutType(SutType.RECEIVER);
    testCase.setName("SOAPCON_5_FaultDetection-Generation_UnsupportedOp_Fault");
    testCasePath = "/Connectivity/receiver/SOAPCON_5_FaultDetection-Generation_UnsupportedOp_Fault";

    testCase.setTestType(IZTestType.RECEIVER_UNSUPPORTED_OPERATION.toString());
    context = new ConnectivityTestContext();
    context.setRequestValidationPhase(ValidationPhase.submitSingleMessage_Request.toString());
    context.setResponseValidationPhase(ValidationPhase.UnsupportedOperationFault.toString());
    context.setMessage(FileUtil.getContent(testCasePath + "/Request.xml"));
    context.setExampleMessage(FileUtil.getContent(testCasePath + "/Response.xml"));
    context.setRequestContentImage(FileUtil.getByteArray(testCasePath + "/content.png"));
    testCase.setInstructionsImage(FileUtil.getByteArray(testCasePath + "/instructions.png"));
    testCase.setInstructionsText(FileUtil.getContent(testCasePath + "/instructions.txt"));
    testCase.setTestDataSpecificationImage(FileUtil.getByteArray(testCasePath
        + "/testDataSpecification.png"));
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
