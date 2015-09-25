package gov.nist.hit.iz.service;

import gov.nist.healthcare.unified.model.EnhancedReport;
import gov.nist.hit.core.domain.MessageValidationCommand;
import gov.nist.hit.core.domain.MessageValidationResult;
import gov.nist.hit.core.domain.TestContext;
import gov.nist.hit.core.hl7v2.service.HL7V2MessageValidatorImpl;
import gov.nist.hit.core.service.exception.MessageValidationException;

import org.openimmunizationsoftware.dqa.nist.CompactReportModel;
import org.openimmunizationsoftware.dqa.nist.ProcessMessageHL7;

public class IZHL7V2MessageValidatorImpl extends HL7V2MessageValidatorImpl {

  @Override
  public MessageValidationResult validate(TestContext testContext, MessageValidationCommand command)
      throws MessageValidationException {
    try {
      MessageValidationResult result = super.validate(testContext, command);
      EnhancedReport report = EnhancedReport.from("json", result.getJson());
      if (command.getDqaCodes() != null && !command.getDqaCodes().isEmpty()) {
        // Perform a DQA validation
        CompactReportModel dqaResults =
            ProcessMessageHL7.getInstance().process(command.getContent(), command.getFacilityId());
        report.put(dqaResults.toSections(command.getDqaCodes()));
      }
      return new MessageValidationResult(report.to("json").toString(), report.render("iz-report",
          null));
    } catch (RuntimeException e) {
      throw new MessageValidationException(e);
    } catch (Exception e) {
      throw new MessageValidationException(e);
    }
  }
}
