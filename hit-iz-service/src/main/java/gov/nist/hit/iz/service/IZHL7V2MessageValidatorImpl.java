package gov.nist.hit.iz.service;

import gov.nist.healthcare.unified.expressions.Action;
import gov.nist.healthcare.unified.expressions.Exp;
import gov.nist.healthcare.unified.filter.Condition;
import gov.nist.healthcare.unified.filter.Filter;
import gov.nist.healthcare.unified.filter.Restriction;
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
      if (report != null) {
        if (command.getDqaCodes() != null && !command.getDqaCodes().isEmpty()) {
          // Perform a DQA validation
          CompactReportModel dqaResults =
              ProcessMessageHL7.getInstance()
                  .process(command.getContent(), command.getFacilityId());
          report.put(dqaResults.toSections(command.getDqaCodes()));
        }
        // Create a restriction
        Restriction restriction = new Restriction();
        restriction.add(new Condition("path", Exp.Format,
            "RXA\\[[1-9]+[0-9]*\\]-9\\[2\\](\\.[1-9]+[0-9]*)*"));
        restriction.setAction(Action.Remove);
        // Create a filter
        Filter f = new Filter();
        // Add restriction to filter
        f.restrain(restriction);
        // Filter report
        report = f.filter(report);
        report = Filter.removeDuplicate(report);
        return new MessageValidationResult(report.to("json").toString(), report.render("iz-report",
            null));
      }
      throw new MessageValidationException(); // TODO: FIXME
    } catch (RuntimeException e) {
      throw new MessageValidationException(e.getLocalizedMessage());
    } catch (Exception e) {
      throw new MessageValidationException(e.getLocalizedMessage());
    }
  }
}
