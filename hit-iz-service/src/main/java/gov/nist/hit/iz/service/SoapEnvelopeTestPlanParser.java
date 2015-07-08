package gov.nist.hit.iz.service;

import gov.nist.hit.core.domain.Message;
import gov.nist.hit.core.domain.SutType;
import gov.nist.hit.core.domain.TestStory;
import gov.nist.hit.core.service.exception.ProfileParserException;
import gov.nist.hit.core.service.util.FileUtil;
import gov.nist.hit.iz.domain.IZTestType;
import gov.nist.hit.iz.domain.EnvelopeTestCase;
import gov.nist.hit.iz.domain.EnvelopeTestContext;
import gov.nist.hit.iz.domain.EnvelopeTestPlan;
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
public class SoapEnvelopeTestPlanParser extends TestPlanParser {

  public List<EnvelopeTestPlan> create() throws JsonProcessingException, IOException,
      ProfileParserException, URISyntaxException {
    List<EnvelopeTestPlan> testPlans = new ArrayList<EnvelopeTestPlan>();

    EnvelopeTestPlan testPlan = new EnvelopeTestPlan();
    testPlan.setName("Generic");
    testPlan.setTestProcedurePath("/Envelope/generic/TP_NIST-CDC_SOAP_Envelope_Testing.docx");
    EnvelopeTestCase testCase = new EnvelopeTestCase();
    testCase.setName("SOAPENV_1_Min_Test");
    String testCasePath = "/Envelope/generic/SOAPENV_1_Min_Test";
    testCase.setTestType(IZTestType.GENERIC.toString());
    EnvelopeTestContext testContext = new EnvelopeTestContext();
    testContext.setValidationPhase(ValidationPhase.envelope.toString());
    testCase.setTestContext(testContext);
    testCase.setMessageContentImage(FileUtil.getByteArray(testCasePath + "/content.png"));
    testCase.setInstructionsImage(FileUtil.getByteArray(testCasePath + "/instructions.png"));
    testCase.setInstructionsText(FileUtil.getContent(testCasePath + "/instructions.txt"));
    testContext.setExampleMessage(new Message("SOAPENV_1_Min_Test", "", FileUtil
        .getContent(testCasePath + "/Message.xml")));
    TestStory testStory = testCase.getTestStory();
    testStory.setDescription(FileUtil.getContent(testCasePath + "/description.txt"));
    testStory.setTestObjectives(FileUtil.getContent(testCasePath + "/testObjectives.txt"));
    testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");
    testCase.setSutType(SutType.GENERIC);
    testPlan.addTestCase(testCase);
    testPlans.add(testPlan);

    testPlan = new EnvelopeTestPlan();
    testPlan.setName("Sender(Initiator)");
    testPlan.setTestProcedurePath("/Envelope/sender/TP_NIST-CDC_Sender_SOAP_Envelope_Testing.docx");
    testCase = new EnvelopeTestCase();
    testCase.setName("SOAPENV_1_ConnectivityMessage_Request");
    testCasePath = "/Envelope/sender/SOAPENV_1_ConnectivityMessage_Request";
    testCase.setTestType(IZTestType.SENDER_CONNECTIVITY.toString());
    testCase.setMessageContentImage(FileUtil.getByteArray(testCasePath + "/content.png"));
    testCase.setInstructionsImage(FileUtil.getByteArray(testCasePath + "/instructions.png"));
    testCase.setInstructionsText(FileUtil.getContent(testCasePath + "/instructions.txt"));
    testStory = testCase.getTestStory();
    testStory.setDescription(FileUtil.getContent(testCasePath + "/description.txt"));
    testStory.setTestObjectives(FileUtil.getContent(testCasePath + "/testObjectives.txt"));

    testContext = new EnvelopeTestContext();
    testCase.setTestContext(testContext);
    testCase.setSutType(SutType.SENDER);

    testContext.setValidationPhase(ValidationPhase.connectivityTest_Request.toString());
    testContext.setExampleMessage(new Message("SOAPENV_1_ConnectivityMessage_Request", "", FileUtil
        .getContent(testCasePath + "/Message.xml")));
    testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");
    testPlan.addTestCase(testCase);

    testCase = new EnvelopeTestCase();
    testContext = new EnvelopeTestContext();
    testCase.setTestContext(testContext);
    testContext.setValidationPhase(ValidationPhase.submitSingleMessage_Request.toString());
    testCase.setName("SOAPENV_2_SubmitSingleMessage_Request");
    testCasePath = "/Envelope/sender/SOAPENV_2_SubmitSingleMessage_Request";
    testCase.setTestType(IZTestType.SENDER_SUBMIT_SINGLE_MESSAGE.toString());
    testStory = testCase.getTestStory();
    testCase.setMessageContentImage(FileUtil.getByteArray(testCasePath + "/content.png"));
    testCase.setInstructionsImage(FileUtil.getByteArray(testCasePath + "/instructions.png"));
    testCase.setInstructionsText(FileUtil.getContent(testCasePath + "/instructions.txt"));
    testStory = testCase.getTestStory();
    testStory.setDescription(FileUtil.getContent(testCasePath + "/description.txt"));
    testStory.setTestObjectives(FileUtil.getContent(testCasePath + "/testObjectives.txt"));
    testCase.setSutType(SutType.SENDER);
    testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");
    testContext.setExampleMessage(new Message("SOAPENV_2_SubmitSingleMessage_Request", "", FileUtil
        .getContent(testCasePath + "/Message.xml")));
    testPlan.addTestCase(testCase);
    testPlans.add(testPlan);

    // RECEIVER TESTCASES
    testPlan = new EnvelopeTestPlan();
    testPlan.setName("Receiver(Responder)");
    testCase = new EnvelopeTestCase();
    testCase.setName("SOAPENV_1_ConnectivityMessage_Response");
    testCasePath = "/Envelope/receiver/SOAPENV_1_ConnectivityMessage_Response";
    testCase.setTestType(IZTestType.RECEIVER_CONNECTIVITY.toString());
    testStory = testCase.getTestStory();
    testCase.setMessageContentImage(FileUtil.getByteArray(testCasePath + "/content.png"));
    testCase.setInstructionsImage(FileUtil.getByteArray(testCasePath + "/instructions.png"));
    testCase.setInstructionsText(FileUtil.getContent(testCasePath + "/instructions.txt"));
    testStory = testCase.getTestStory();
    testStory.setDescription(FileUtil.getContent(testCasePath + "/description.txt"));
    testStory.setTestObjectives(FileUtil.getContent(testCasePath + "/testObjectives.txt"));
    testContext = new EnvelopeTestContext();
    testCase.setTestContext(testContext);
    testContext.setValidationPhase(ValidationPhase.connectivityTest_Response.toString());
    testCase.setSutType(SutType.RECEIVER);
    testContext.setExampleMessage(new Message("SOAPENV_1_ConnectivityMessage_Response", "",
        FileUtil.getContent(testCasePath + "/Message.xml")));
    testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");
    testPlan.addTestCase(testCase);

    testCase = new EnvelopeTestCase();
    testCase.setName("SOAPENV_2_SubmitSingleMessage_Response");
    testCase.setTestType(IZTestType.RECEIVER_SUBMIT_SINGLE_MESSAGE.toString());
    testCasePath = "/Envelope/receiver/SOAPENV_2_SubmitSingleMessage_Response";
    testCase.setMessageContentImage(FileUtil.getByteArray(testCasePath + "/content.png"));
    testCase.setInstructionsImage(FileUtil.getByteArray(testCasePath + "/instructions.png"));
    testCase.setInstructionsText(FileUtil.getContent(testCasePath + "/instructions.txt"));
    testStory = testCase.getTestStory();
    testStory.setDescription(FileUtil.getContent(testCasePath + "/description.txt"));
    testStory.setTestObjectives(FileUtil.getContent(testCasePath + "/testObjectives.txt"));
    testContext = new EnvelopeTestContext();
    testCase.setTestContext(testContext);
    testContext.setValidationPhase(ValidationPhase.submitSingleMessage_Response.toString());
    testContext.setExampleMessage(new Message("SOAPENV_2_SubmitSingleMessage_Response", "",
        FileUtil.getContent(testCasePath + "/Message.xml")));
    testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");
    testCase.setSutType(SutType.RECEIVER);
    testPlan.addTestCase(testCase);

    testCase = new EnvelopeTestCase();
    testCase.setName("SOAPENV_3_MessageTooLarge_Fault");
    testCasePath = "/Envelope/receiver/SOAPENV_3_MessageTooLarge_Fault";
    testCase.setTestType(IZTestType.RECEIVER_MESSAGE_TOO_LARGE.toString());
    testStory = testCase.getTestStory();
    testCase.setMessageContentImage(FileUtil.getByteArray(testCasePath + "/content.png"));
    testCase.setInstructionsImage(FileUtil.getByteArray(testCasePath + "/instructions.png"));
    testCase.setInstructionsText(FileUtil.getContent(testCasePath + "/instructions.txt"));
    testStory = testCase.getTestStory();
    testStory.setDescription(FileUtil.getContent(testCasePath + "/description.txt"));
    testStory.setTestObjectives(FileUtil.getContent(testCasePath + "/testObjectives.txt"));
    testContext = new EnvelopeTestContext();
    testCase.setTestContext(testContext);
    testContext.setValidationPhase(ValidationPhase.MessageTooLargeFault.toString());
    testContext.setExampleMessage(new Message("SOAPENV_3_MessageTooLarge_Fault", "", FileUtil
        .getContent(testCasePath + "/Message.xml")));
    testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");
    testCase.setSutType(SutType.RECEIVER);
    testPlan.addTestCase(testCase);

    testCase = new EnvelopeTestCase();
    testCase.setName("SOAPENV_4_Security_Fault");
    testCasePath = "/Envelope/receiver/SOAPENV_4_Security_Fault";
    testCase.setTestType(IZTestType.RECEIVER_SECURITY_FAULT.toString());
    testCase.setMessageContentImage(FileUtil.getByteArray(testCasePath + "/content.png"));
    testCase.setInstructionsImage(FileUtil.getByteArray(testCasePath + "/instructions.png"));
    testCase.setInstructionsText(FileUtil.getContent(testCasePath + "/instructions.txt"));
    testStory = testCase.getTestStory();
    testStory.setDescription(FileUtil.getContent(testCasePath + "/description.txt"));
    testStory.setTestObjectives(FileUtil.getContent(testCasePath + "/testObjectives.txt"));
    testContext = new EnvelopeTestContext();
    testContext.setValidationPhase(ValidationPhase.SecurityFault.toString());
    testCase.setTestContext(testContext);
    testContext.setExampleMessage(new Message("SOAPENV_4_Security_Fault", "", FileUtil
        .getContent(testCasePath + "/Message.xml")));
    testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");
    testCase.setSutType(SutType.RECEIVER);
    testPlan.addTestCase(testCase);

    testCase = new EnvelopeTestCase();
    testCase.setName("SOAPENV_5_UnsupportedOperation_Fault");
    testCasePath = "/Envelope/receiver/SOAPENV_5_UnsupportedOperation_Fault";
    testCase.setTestType(IZTestType.RECEIVER_UNSUPPORTED_OPERATION.toString());
    testContext = new EnvelopeTestContext();
    testCase.setTestContext(testContext);
    testContext.setValidationPhase(ValidationPhase.UnsupportedOperationFault.toString());
    testCase.setMessageContentImage(FileUtil.getByteArray(testCasePath + "/content.png"));
    testCase.setInstructionsImage(FileUtil.getByteArray(testCasePath + "/instructions.png"));
    testCase.setInstructionsText(FileUtil.getContent(testCasePath + "/instructions.txt"));
    testStory = testCase.getTestStory();
    testStory.setDescription(FileUtil.getContent(testCasePath + "/description.txt"));
    testStory.setTestObjectives(FileUtil.getContent(testCasePath + "/testObjectives.txt"));
    testContext.setExampleMessage(new Message("SOAPENV_5_UnsupportedOperation_Fault", "", FileUtil
        .getContent(testCasePath + "/Message.xml")));
    testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");
    testCase.setSutType(SutType.RECEIVER);
    testPlan.addTestCase(testCase);

    testCase = new EnvelopeTestCase();
    testCase.setName("SOAPENV_6_Unknown_Fault");
    testCasePath = "/Envelope/receiver/SOAPENV_6_Unknown_Fault";
    testCase.setTestType(IZTestType.RECEIVER_UNKNOWN_FAULT.toString());
    testContext = new EnvelopeTestContext();
    testCase.setTestContext(testContext);
    testContext.setValidationPhase(ValidationPhase.UnknownFault.toString());
    testStory = testCase.getTestStory();
    testCase.setMessageContentImage(FileUtil.getByteArray(testCasePath + "/content.png"));
    testCase.setInstructionsImage(FileUtil.getByteArray(testCasePath + "/instructions.png"));
    testCase.setInstructionsText(FileUtil.getContent(testCasePath + "/instructions.txt"));
    testStory = testCase.getTestStory();
    testStory.setDescription(FileUtil.getContent(testCasePath + "/description.txt"));
    testStory.setTestObjectives(FileUtil.getContent(testCasePath + "/testObjectives.txt"));
    testContext.setExampleMessage(new Message("SOAPENV_6_Unknown_Fault", "", FileUtil
        .getContent(testCasePath + "/Message.xml")));
    testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");
    testCase.setSutType(SutType.RECEIVER);
    testPlan.addTestCase(testCase);

    testPlan
        .setTestProcedurePath("/Envelope/receiver/TP_NIST-CDC_Receiver_SOAP_Envelope_Testing.docx");
    testPlans.add(testPlan);
    return testPlans;
  }
}
