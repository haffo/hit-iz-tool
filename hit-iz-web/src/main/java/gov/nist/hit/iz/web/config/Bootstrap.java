/**
 * This software was developed at the National Institute of Standards and Technology by employees
 * of the Federal Government in the course of their official duties. Pursuant to title 17 Section 105 of the
 * United States Code this software is not subject to copyright protection and is in the public domain.
 * This is an experimental system. NIST assumes no responsibility whatsoever for its use by other parties,
 * and makes no guarantees, expressed or implied, about its quality, reliability, or any other characteristic.
 * We would appreciate acknowledgement if the software is used. This software can be redistributed and/or
 * modified freely provided that any derivative works bear some notice that they are derived from it, and any
 * modified versions bear some notice that they have been modified.
 */

package gov.nist.hit.iz.web.config;

import gov.nist.healthcare.tools.core.models.DataInstanceTestPlan;
import gov.nist.healthcare.tools.core.models.DataInstanceTestStep;
import gov.nist.healthcare.tools.core.models.Message;
import gov.nist.healthcare.tools.core.models.SoapConnectivityTestCase;
import gov.nist.healthcare.tools.core.models.SoapConnectivityTestContext;
import gov.nist.healthcare.tools.core.models.SoapConnectivityTestPlan;
import gov.nist.healthcare.tools.core.models.SoapEnvelopeTestCase;
import gov.nist.healthcare.tools.core.models.SoapEnvelopeTestContext;
import gov.nist.healthcare.tools.core.models.SoapEnvelopeTestPlan;
import gov.nist.healthcare.tools.core.models.SutType;
import gov.nist.healthcare.tools.core.models.TestStory;
import gov.nist.healthcare.tools.core.repo.SoapConnectivityTestContextRepository;
import gov.nist.healthcare.tools.core.repo.SoapConnectivityTransactionRepository;
import gov.nist.healthcare.tools.core.repo.DataInstanceTestPlanRepository;
import gov.nist.healthcare.tools.core.repo.DataInstanceTestStepRepository;
import gov.nist.healthcare.tools.core.repo.SoapEnvelopeTestContextRepository;
import gov.nist.healthcare.tools.core.repo.SoapConnectivityTestPlanRepository;
import gov.nist.healthcare.tools.core.repo.SoapEnvelopeTestCaseRepository;
import gov.nist.healthcare.tools.core.repo.SoapEnvelopeTestPlanRepository;
import gov.nist.healthcare.tools.core.repo.UserRepository;
import gov.nist.healthcare.tools.core.services.ProfileParser;
import gov.nist.healthcare.tools.core.services.exception.ProfileParserException;
import gov.nist.healthcare.tools.core.services.hl7.v2.profile.ProfileParserImpl;
import gov.nist.healthcare.tools.core.services.hl7.v2.vocabulary.TableLibrarySerializer;
import gov.nist.hit.iz.domain.IZTestType;
import gov.nist.hit.iz.domain.ValidationPhase;
import gov.nist.hit.iz.service.CBTestPlanParser;
import gov.nist.hit.iz.service.CFTestPlanParser;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.List;

import org.apache.commons.io.IOUtils;
import org.apache.commons.io.input.BOMInputStream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class Bootstrap implements InitializingBean {

	private final Logger LOG = LoggerFactory.getLogger(Bootstrap.class);

	@Autowired
	SoapEnvelopeTestPlanRepository soapEnvTestPlanRepository;

	@Autowired
	SoapConnectivityTestPlanRepository soapConnTestPlanRepository;

	@Autowired
	DataInstanceTestPlanRepository dataInstanceTestPlanRepository;

	@Autowired
	DataInstanceTestStepRepository dataInstanceTestStepRepository;

	@Autowired
	SoapEnvelopeTestCaseRepository testCaseRepository;

	@Autowired
	SoapConnectivityTestContextRepository connectivityContextRepository;

	@Autowired
	SoapEnvelopeTestContextRepository envelopeContextRepository;

	@Autowired
	SoapConnectivityTransactionRepository transactionRepository;

	@Autowired
	UserRepository userRepository;

	ProfileParser profileParser = new ProfileParserImpl();

	ObjectMapper obm = new ObjectMapper();

	TableLibrarySerializer tableSerializer = new TableLibrarySerializer();

	@Override
	@Transactional()
	public void afterPropertiesSet() throws Exception {
		LOG.info("Bootstrapping data...");
		obm.setSerializationInclusion(Include.NON_NULL);

		initContextfreeTestCases();

		initEnvelopeTestCases();

		initConnecitityTestCases();

		initContextBasedTestCases();

		LOG.info("...Bootstrapping completed");
	}

	private void initContextfreeTestCases() throws IOException,
			ProfileParserException {
		CFTestPlanParser parser = new CFTestPlanParser();
		List<DataInstanceTestStep> testSteps = parser
				.create("/bundle/contextfree");
		for (int i = 0; i < testSteps.size(); i++) {
			dataInstanceTestStepRepository.save(testSteps.get(i));
		}
	}

	private void initContextBasedTestCases() throws IOException,
			ProfileParserException {
		try {
			CBTestPlanParser parser = new CBTestPlanParser();
			List<DataInstanceTestPlan> testPlans = parser
					.create("/bundle/contextbased");
			for (int i = 0; i < testPlans.size(); i++) {
				dataInstanceTestPlanRepository.save(testPlans.get(i));
			}
		} catch (URISyntaxException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

	private void initEnvelopeTestCases() throws IOException {
		SoapEnvelopeTestPlan testPlan = new SoapEnvelopeTestPlan();
		testPlan.setName("Generic");
		testPlan.setTestProcedurePath("/bundle/envelope/generic/TP_NIST-CDC_SOAP_Envelope_Testing.docx");
		SoapEnvelopeTestCase testCase = new SoapEnvelopeTestCase();
		testCase.setName("SOAPENV_1_Min_Test");
		String testCasePath = "/bundle/envelope/generic/SOAPENV_1_Min_Test";
		testCase.setTestType(IZTestType.GENERIC.toString());
		SoapEnvelopeTestContext testContext = new SoapEnvelopeTestContext();
		testContext.setValidationPhase(ValidationPhase.envelope.toString());
		testCase.setTestContext(testContext);
		testCase.setMessageContentImage(getByteArray(testCasePath
				+ "/content.png"));
		testCase.setInstructionsImage(getByteArray(testCasePath
				+ "/instructions.png"));
		testCase.setInstructionsText(getContent(testCasePath
				+ "/instructions.txt"));
		testContext.setExampleMessage(new Message("SOAPENV_1_Min_Test", "",
				getContent(testCasePath + "/Message.xml")));
		TestStory testStory = testCase.getTestStory();
		testStory.setDescription(getContent(testCasePath + "/description.txt"));
		testStory.setTestObjectives(getContent(testCasePath
				+ "/testObjectives.txt"));
		testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");
		testCase.setSutType(SutType.GENERIC);
		testPlan.addTestCase(testCase);
		soapEnvTestPlanRepository.save(testPlan);

		testPlan = new SoapEnvelopeTestPlan();
		testPlan.setName("Sender(Initiator)");
		testPlan.setTestProcedurePath("/bundle/envelope/sender/TP_NIST-CDC_Sender_SOAP_Envelope_Testing.docx");
		testCase = new SoapEnvelopeTestCase();
		testCase.setName("SOAPENV_1_ConnectivityMessage_Request");
		testCasePath = "/bundle/envelope/sender/SOAPENV_1_ConnectivityMessage_Request";
		testCase.setTestType(IZTestType.SENDER_CONNECTIVITY.toString());
		testCase.setMessageContentImage(getByteArray(testCasePath
				+ "/content.png"));
		testCase.setInstructionsImage(getByteArray(testCasePath
				+ "/instructions.png"));
		testCase.setInstructionsText(getContent(testCasePath
				+ "/instructions.txt"));
		testStory = testCase.getTestStory();
		testStory.setDescription(getContent(testCasePath + "/description.txt"));
		testStory.setTestObjectives(getContent(testCasePath
				+ "/testObjectives.txt"));

		testContext = new SoapEnvelopeTestContext();
		testCase.setTestContext(testContext);
		testCase.setSutType(SutType.SENDER);

		testContext.setValidationPhase(ValidationPhase.connectivityTest_Request
				.toString());
		testContext.setExampleMessage(new Message(
				"SOAPENV_1_ConnectivityMessage_Request", "",
				getContent(testCasePath + "/Message.xml")));
		testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");
		testPlan.addTestCase(testCase);

		testCase = new SoapEnvelopeTestCase();
		testContext = new SoapEnvelopeTestContext();
		testCase.setTestContext(testContext);
		testContext
				.setValidationPhase(ValidationPhase.submitSingleMessage_Request
						.toString());
		testCase.setName("SOAPENV_2_SubmitSingleMessage_Request");
		testCasePath = "/bundle/envelope/sender/SOAPENV_2_SubmitSingleMessage_Request";
		testCase.setTestType(IZTestType.SENDER_SUBMIT_SINGLE_MESSAGE.toString());
		testStory = testCase.getTestStory();
		testCase.setMessageContentImage(getByteArray(testCasePath
				+ "/content.png"));
		testCase.setInstructionsImage(getByteArray(testCasePath
				+ "/instructions.png"));
		testCase.setInstructionsText(getContent(testCasePath
				+ "/instructions.txt"));
		testStory = testCase.getTestStory();
		testStory.setDescription(getContent(testCasePath + "/description.txt"));
		testStory.setTestObjectives(getContent(testCasePath
				+ "/testObjectives.txt"));
		testCase.setSutType(SutType.SENDER);
		testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");
		testContext.setExampleMessage(new Message(
				"SOAPENV_2_SubmitSingleMessage_Request", "",
				getContent(testCasePath + "/Message.xml")));
		testPlan.addTestCase(testCase);
		soapEnvTestPlanRepository.save(testPlan);

		// RECEIVER TESTCASES
		testPlan = new SoapEnvelopeTestPlan();
		testPlan.setName("Receiver(Responder)");
		testCase = new SoapEnvelopeTestCase();
		testCase.setName("SOAPENV_1_ConnectivityMessage_Response");
		testCasePath = "/bundle/envelope/receiver/SOAPENV_1_ConnectivityMessage_Response";
		testCase.setTestType(IZTestType.RECEIVER_CONNECTIVITY.toString());
		testStory = testCase.getTestStory();
		testCase.setMessageContentImage(getByteArray(testCasePath
				+ "/content.png"));
		testCase.setInstructionsImage(getByteArray(testCasePath
				+ "/instructions.png"));
		testCase.setInstructionsText(getContent(testCasePath
				+ "/instructions.txt"));
		testStory = testCase.getTestStory();
		testStory.setDescription(getContent(testCasePath + "/description.txt"));
		testStory.setTestObjectives(getContent(testCasePath
				+ "/testObjectives.txt"));
		testContext = new SoapEnvelopeTestContext();
		testCase.setTestContext(testContext);
		testContext
				.setValidationPhase(ValidationPhase.connectivityTest_Response
						.toString());
		testCase.setSutType(SutType.RECEIVER);
		testContext.setExampleMessage(new Message(
				"SOAPENV_1_ConnectivityMessage_Response", "",
				getContent(testCasePath + "/Message.xml")));
		testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");
		testPlan.addTestCase(testCase);

		testCase = new SoapEnvelopeTestCase();
		testCase.setName("SOAPENV_2_SubmitSingleMessage_Response");
		testCase.setTestType(IZTestType.RECEIVER_SUBMIT_SINGLE_MESSAGE
				.toString());
		testCasePath = "/bundle/envelope/receiver/SOAPENV_2_SubmitSingleMessage_Response";
		testCase.setMessageContentImage(getByteArray(testCasePath
				+ "/content.png"));
		testCase.setInstructionsImage(getByteArray(testCasePath
				+ "/instructions.png"));
		testCase.setInstructionsText(getContent(testCasePath
				+ "/instructions.txt"));
		testStory = testCase.getTestStory();
		testStory.setDescription(getContent(testCasePath + "/description.txt"));
		testStory.setTestObjectives(getContent(testCasePath
				+ "/testObjectives.txt"));
		testContext = new SoapEnvelopeTestContext();
		testCase.setTestContext(testContext);
		testContext
				.setValidationPhase(ValidationPhase.submitSingleMessage_Response
						.toString());
		testContext.setExampleMessage(new Message(
				"SOAPENV_2_SubmitSingleMessage_Response", "",
				getContent(testCasePath + "/Message.xml")));
		testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");
		testCase.setSutType(SutType.RECEIVER);
		testPlan.addTestCase(testCase);

		testCase = new SoapEnvelopeTestCase();
		testCase.setName("SOAPENV_3_MessageTooLarge_Fault");
		testCasePath = "/bundle/envelope/receiver/SOAPENV_3_MessageTooLarge_Fault";
		testCase.setTestType(IZTestType.RECEIVER_MESSAGE_TOO_LARGE.toString());
		testStory = testCase.getTestStory();
		testCase.setMessageContentImage(getByteArray(testCasePath
				+ "/content.png"));
		testCase.setInstructionsImage(getByteArray(testCasePath
				+ "/instructions.png"));
		testCase.setInstructionsText(getContent(testCasePath
				+ "/instructions.txt"));
		testStory = testCase.getTestStory();
		testStory.setDescription(getContent(testCasePath + "/description.txt"));
		testStory.setTestObjectives(getContent(testCasePath
				+ "/testObjectives.txt"));
		testContext = new SoapEnvelopeTestContext();
		testCase.setTestContext(testContext);
		testContext.setValidationPhase(ValidationPhase.MessageTooLargeFault
				.toString());
		testContext.setExampleMessage(new Message(
				"SOAPENV_3_MessageTooLarge_Fault", "", getContent(testCasePath
						+ "/Message.xml")));
		testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");
		testCase.setSutType(SutType.RECEIVER);
		testPlan.addTestCase(testCase);

		testCase = new SoapEnvelopeTestCase();
		testCase.setName("SOAPENV_4_Security_Fault");
		testCasePath = "/bundle/envelope/receiver/SOAPENV_4_Security_Fault";
		testCase.setTestType(IZTestType.RECEIVER_SECURITY_FAULT.toString());
		testCase.setMessageContentImage(getByteArray(testCasePath
				+ "/content.png"));
		testCase.setInstructionsImage(getByteArray(testCasePath
				+ "/instructions.png"));
		testCase.setInstructionsText(getContent(testCasePath
				+ "/instructions.txt"));
		testStory = testCase.getTestStory();
		testStory.setDescription(getContent(testCasePath + "/description.txt"));
		testStory.setTestObjectives(getContent(testCasePath
				+ "/testObjectives.txt"));
		testContext = new SoapEnvelopeTestContext();
		testContext
				.setValidationPhase(ValidationPhase.SecurityFault.toString());
		testCase.setTestContext(testContext);
		testContext.setExampleMessage(new Message("SOAPENV_4_Security_Fault",
				"", getContent(testCasePath + "/Message.xml")));
		testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");
		testCase.setSutType(SutType.RECEIVER);
		testPlan.addTestCase(testCase);

		testCase = new SoapEnvelopeTestCase();
		testCase.setName("SOAPENV_5_UnsupportedOperation_Fault");
		testCasePath = "/bundle/envelope/receiver/SOAPENV_5_UnsupportedOperation_Fault";
		testCase.setTestType(IZTestType.RECEIVER_UNSUPPORTED_OPERATION
				.toString());
		testContext = new SoapEnvelopeTestContext();
		testCase.setTestContext(testContext);
		testContext
				.setValidationPhase(ValidationPhase.UnsupportedOperationFault
						.toString());
		testCase.setMessageContentImage(getByteArray(testCasePath
				+ "/content.png"));
		testCase.setInstructionsImage(getByteArray(testCasePath
				+ "/instructions.png"));
		testCase.setInstructionsText(getContent(testCasePath
				+ "/instructions.txt"));
		testStory = testCase.getTestStory();
		testStory.setDescription(getContent(testCasePath + "/description.txt"));
		testStory.setTestObjectives(getContent(testCasePath
				+ "/testObjectives.txt"));
		testContext.setExampleMessage(new Message(
				"SOAPENV_5_UnsupportedOperation_Fault", "",
				getContent(testCasePath + "/Message.xml")));
		testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");
		testCase.setSutType(SutType.RECEIVER);
		testPlan.addTestCase(testCase);

		testCase = new SoapEnvelopeTestCase();
		testCase.setName("SOAPENV_6_Unknown_Fault");
		testCasePath = "/bundle/envelope/receiver/SOAPENV_6_Unknown_Fault";
		testCase.setTestType(IZTestType.RECEIVER_UNKNOWN_FAULT.toString());
		testContext = new SoapEnvelopeTestContext();
		testCase.setTestContext(testContext);
		testContext.setValidationPhase(ValidationPhase.UnknownFault.toString());
		testStory = testCase.getTestStory();
		testCase.setMessageContentImage(getByteArray(testCasePath
				+ "/content.png"));
		testCase.setInstructionsImage(getByteArray(testCasePath
				+ "/instructions.png"));
		testCase.setInstructionsText(getContent(testCasePath
				+ "/instructions.txt"));
		testStory = testCase.getTestStory();
		testStory.setDescription(getContent(testCasePath + "/description.txt"));
		testStory.setTestObjectives(getContent(testCasePath
				+ "/testObjectives.txt"));
		testContext.setExampleMessage(new Message("SOAPENV_6_Unknown_Fault",
				"", getContent(testCasePath + "/Message.xml")));
		testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");
		testCase.setSutType(SutType.RECEIVER);
		testPlan.addTestCase(testCase);

		testPlan.setTestProcedurePath("/bundle/envelope/receiver/TP_NIST-CDC_Receiver_SOAP_Envelope_Testing.docx");
		soapEnvTestPlanRepository.save(testPlan);
	}

	private void initConnecitityTestCases() throws IOException {
		String testCasePath = null;
		SoapConnectivityTestPlan testPlan = new SoapConnectivityTestPlan();
		testPlan.setName("Sender(Initiator)");

		SoapConnectivityTestCase testCase = new SoapConnectivityTestCase();
		testCase.setName("SOAPCON_1_BasicMessage_ConnectivityRequest");
		testCase.setSutType(SutType.SENDER);
		testCase.setTestType(IZTestType.SENDER_CONNECTIVITY.toString());
		testCasePath = "/bundle/connectivity/sender/SOAPCON_1_BasicMessage_ConnectivityRequest";
		testCase.setInstructionsImage(getByteArray(testCasePath
				+ "/instructions.png"));
		testCase.setInstructionsText(getContent(testCasePath
				+ "/instructions.txt"));
		testCase.setTestDataSpecificationImage(getByteArray(testCasePath
				+ "/testDataSpecification.png"));
		TestStory testStory = testCase.getTestStory();
		testStory.setDescription(getContent(testCasePath + "/description.txt"));
		testStory.setTestObjectives(getContent(testCasePath
				+ "/testObjectives.txt"));
		SoapConnectivityTestContext context = new SoapConnectivityTestContext();
		context.setRequestContentImage(getByteArray(testCasePath
				+ "/content.png"));
		context.setResponseContentImage(getByteArray(testCasePath
				+ "/content-response.png"));
		context.setRequestValidationPhase(ValidationPhase.connectivityTest_Request
				.toString());
		context.setResponseValidationPhase(ValidationPhase.connectivityTest_Response
				.toString());
		context.setMessage(getContent(testCasePath + "/Request.xml"));
		context.setExampleMessage(getContent(testCasePath + "/Response.xml"));
		testCase.setTestContext(context);
		testPlan.addTestCase(testCase);

		// testCase = new TestCase();
		// testCase.setName("SOAPCON_2_MessageContentDe-capsulation_Connectivity");
		// testCasePath =
		// "/bundle/connectivity/sender/SOAPCON_2_MessageContentDe-capsulation_Connectivity";
		// testCase.setTestType(IZTestType.SENDER_SUBMIT_SINGLE_MESSAGE.toString());
		// testCase.setSutType(SutType.SENDER);
		// context = new ConnectivityTestContext();
		// context.setRequestValidationPhase(ValidationPhase.connectivityTest_Request
		// .toString());
		// context.setResponseValidationPhase(ValidationPhase.connectivityTest_Response
		// .toString());
		// context.setMessage(getContent(testCasePath + "/Request.xml"));
		// context.setExampleMessage(getContent(testCasePath +
		// "/Response.xml"));
		// testCase.setTestContext(context);
		// testCase.getTestStory().setDescription(
		// getContent(testCasePath + "/description.txt"));
		// testPlan.addTestCase(testCase);

		testCase = new SoapConnectivityTestCase();
		testCase.setName("SOAPCON_3_SubmitSingleMessage_Message");
		testCasePath = "/bundle/connectivity/sender/SOAPCON_3_SubmitSingleMessage_Message";
		testCase.setTestType(IZTestType.SENDER_SUBMIT_SINGLE_MESSAGE.toString());
		testCase.setSutType(SutType.SENDER);
		context = new SoapConnectivityTestContext();
		context.setRequestValidationPhase(ValidationPhase.submitSingleMessage_Request
				.toString());
		context.setResponseValidationPhase(ValidationPhase.submitSingleMessage_Response
				.toString());
		context.setMessage(getContent(testCasePath + "/Request.xml"));
		context.setExampleMessage(getContent(testCasePath + "/Response.xml"));
		context.setRequestContentImage(getByteArray(testCasePath
				+ "/content.png"));
		context.setResponseContentImage(getByteArray(testCasePath
				+ "/content-response.png"));
		testCase.setInstructionsImage(getByteArray(testCasePath
				+ "/instructions.png"));
		testCase.setInstructionsText(getContent(testCasePath
				+ "/instructions.txt"));
		testCase.setTestDataSpecificationImage(getByteArray(testCasePath
				+ "/testDataSpecification.png"));
		testStory = testCase.getTestStory();
		testStory.setDescription(getContent(testCasePath + "/description.txt"));
		testStory.setTestObjectives(getContent(testCasePath
				+ "/testObjectives.txt"));
		testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");

		testCase.setTestContext(context);
		testPlan.addTestCase(testCase);
		soapConnTestPlanRepository.save(testPlan);

		testPlan = new SoapConnectivityTestPlan();
		testPlan.setName("Receiver(Responder)");

		testCase = new SoapConnectivityTestCase();
		testCase.setSutType(SutType.RECEIVER);
		testCase.setName("SOAPCON_1_BasicMessage_ConnectivityResponse");
		testCasePath = "/bundle/connectivity/receiver/SOAPCON_1_BasicMessage_ConnectivityResponse";
		testCase.setTestType(IZTestType.RECEIVER_CONNECTIVITY.toString());
		context = new SoapConnectivityTestContext();
		context.setRequestValidationPhase(ValidationPhase.connectivityTest_Request
				.toString());
		context.setResponseValidationPhase(ValidationPhase.connectivityTest_Response
				.toString());
		context.setMessage(getContent(testCasePath + "/Request.xml"));
		context.setExampleMessage(getContent(testCasePath + "/Response.xml"));
		context.setRequestContentImage(getByteArray(testCasePath
				+ "/content.png"));
		testCase.setInstructionsImage(getByteArray(testCasePath
				+ "/instructions.png"));
		testCase.setInstructionsText(getContent(testCasePath
				+ "/instructions.txt"));
		testCase.setTestDataSpecificationImage(getByteArray(testCasePath
				+ "/testDataSpecification.png"));
		testStory = testCase.getTestStory();
		testStory.setDescription(getContent(testCasePath + "/description.txt"));
		testStory.setTestObjectives(getContent(testCasePath
				+ "/testObjectives.txt"));
		testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");

		testCase.setTestContext(context);
		testPlan.addTestCase(testCase);

		testCase = new SoapConnectivityTestCase();
		testCase.setSutType(SutType.RECEIVER);
		testCase.setName("SOAPCON_2_SubmitSingleMessage_Response");
		testCasePath = "/bundle/connectivity/receiver/SOAPCON_2_SubmitSingleMessage_Response";
		testCase.setTestType(IZTestType.RECEIVER_SUBMIT_SINGLE_MESSAGE
				.toString());
		context = new SoapConnectivityTestContext();
		context.setRequestValidationPhase(ValidationPhase.submitSingleMessage_Request
				.toString());
		context.setResponseValidationPhase(ValidationPhase.submitSingleMessage_Response
				.toString());
		context.setMessage(getContent(testCasePath + "/Request.xml"));
		context.setExampleMessage(getContent(testCasePath + "/Response.xml"));
		context.setRequestContentImage(getByteArray(testCasePath
				+ "/content.png"));
		testCase.setInstructionsImage(getByteArray(testCasePath
				+ "/instructions.png"));
		testCase.setInstructionsText(getContent(testCasePath
				+ "/instructions.txt"));
		testCase.setTestDataSpecificationImage(getByteArray(testCasePath
				+ "/testDataSpecification.png"));
		testStory = testCase.getTestStory();
		testStory.setDescription(getContent(testCasePath + "/description.txt"));
		testStory.setTestObjectives(getContent(testCasePath
				+ "/testObjectives.txt"));
		testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");

		testCase.setTestContext(context);
		testPlan.addTestCase(testCase);

		testCase = new SoapConnectivityTestCase();
		testCase.setSutType(SutType.RECEIVER);
		testCase.setName("SOAPCON_3_FaultDetection-Generation_AuthenticationFault");
		testCasePath = "/bundle/connectivity/receiver/SOAPCON_3_FaultDetection-Generation_AuthenticationFault";
		testCase.setTestType(IZTestType.RECEIVER_SUBMIT_SINGLE_MESSAGE
				.toString());
		context = new SoapConnectivityTestContext();
		context.setRequestValidationPhase(ValidationPhase.submitSingleMessage_Request
				.toString());
		context.setResponseValidationPhase(ValidationPhase.SecurityFault
				.toString());
		context.setMessage(getContent(testCasePath + "/Request.xml"));
		context.setExampleMessage(getContent(testCasePath + "/Response.xml"));
		context.setRequestContentImage(getByteArray(testCasePath
				+ "/content.png"));
		testCase.setInstructionsImage(getByteArray(testCasePath
				+ "/instructions.png"));
		testCase.setInstructionsText(getContent(testCasePath
				+ "/instructions.txt"));
		testCase.setTestDataSpecificationImage(getByteArray(testCasePath
				+ "/testDataSpecification.png"));
		testStory = testCase.getTestStory();
		testStory.setDescription(getContent(testCasePath + "/description.txt"));
		testStory.setTestObjectives(getContent(testCasePath
				+ "/testObjectives.txt"));
		testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");

		testCase.setTestContext(context);
		testPlan.addTestCase(testCase);

		testCase = new SoapConnectivityTestCase();
		testCase.setSutType(SutType.RECEIVER);
		testCase.setName("SOAPCON_4_FaultDetection-Generation_MessageSizeFault");
		testCasePath = "/bundle/connectivity/receiver/SOAPCON_4_FaultDetection-Generation_MessageSizeFault";
		testCase.setTestType(IZTestType.RECEIVER_SUBMIT_SINGLE_MESSAGE
				.toString());
		context = new SoapConnectivityTestContext();
		context.setRequestValidationPhase(ValidationPhase.submitSingleMessage_Request
				.toString());
		context.setResponseValidationPhase(ValidationPhase.MessageTooLargeFault
				.toString());
		context.setMessage(getContent(testCasePath + "/Request.xml"));
		context.setExampleMessage(getContent(testCasePath + "/Response.xml"));
		context.setRequestContentImage(getByteArray(testCasePath
				+ "/content.png"));
		testCase.setInstructionsImage(getByteArray(testCasePath
				+ "/instructions.png"));
		testCase.setInstructionsText(getContent(testCasePath
				+ "/instructions.txt"));
		testCase.setTestDataSpecificationImage(getByteArray(testCasePath
				+ "/testDataSpecification.png"));
		// testCase.setTestDataSpecificationImage2(getByteArray(testCasePath
		// + "/testDataSpecification2.png"));

		testStory = testCase.getTestStory();
		testStory.setDescription(getContent(testCasePath + "/description.txt"));
		testStory.setTestObjectives(getContent(testCasePath
				+ "/testObjectives.txt"));
		testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");
		testCase.setTestContext(context);
		testPlan.addTestCase(testCase);

		testCase = new SoapConnectivityTestCase();
		testCase.setSutType(SutType.RECEIVER);
		testCase.setName("SOAPCON_5_FaultDetection-Generation_UnsupportedOp_Fault");
		testCasePath = "/bundle/connectivity/receiver/SOAPCON_5_FaultDetection-Generation_UnsupportedOp_Fault";

		testCase.setTestType(IZTestType.RECEIVER_UNSUPPORTED_OPERATION
				.toString());
		context = new SoapConnectivityTestContext();
		context.setRequestValidationPhase(ValidationPhase.submitSingleMessage_Request
				.toString());
		context.setResponseValidationPhase(ValidationPhase.UnsupportedOperationFault
				.toString());
		context.setMessage(getContent(testCasePath + "/Request.xml"));
		context.setExampleMessage(getContent(testCasePath + "/Response.xml"));
		context.setRequestContentImage(getByteArray(testCasePath
				+ "/content.png"));
		testCase.setInstructionsImage(getByteArray(testCasePath
				+ "/instructions.png"));
		testCase.setInstructionsText(getContent(testCasePath
				+ "/instructions.txt"));
		testCase.setTestDataSpecificationImage(getByteArray(testCasePath
				+ "/testDataSpecification.png"));
		testStory = testCase.getTestStory();
		testStory.setDescription(getContent(testCasePath + "/description.txt"));
		testStory.setTestObjectives(getContent(testCasePath
				+ "/testObjectives.txt"));
		testCase.setTestPackagePath(testCasePath + "/TestPackage.docx");
		testCase.setTestContext(context);
		testPlan.addTestCase(testCase);

		soapConnTestPlanRepository.save(testPlan);

	}

	private String getContent(String path) {
		try {
			return IOUtils.toString(new BOMInputStream(Bootstrap.class
					.getResourceAsStream(path)));
		} catch (RuntimeException e) {
			return null;
		} catch (Exception e) {
			return null;
		}

	}

	private byte[] getByteArray(String path) throws IOException {
		return IOUtils.toByteArray(Bootstrap.class.getResourceAsStream(path));
	}

}
