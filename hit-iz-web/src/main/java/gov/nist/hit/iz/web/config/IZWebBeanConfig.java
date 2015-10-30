/**
 * This software was developed at the National Institute of Standards and Technology by employees of
 * the Federal Government in the course of their official duties. Pursuant to title 17 Section 105
 * of the United States Code this software is not subject to copyright protection and is in the
 * public domain. This is an experimental system. NIST assumes no responsibility whatsoever for its
 * use by other parties, and makes no guarantees, expressed or implied, about its quality,
 * reliability, or any other characteristic. We would appreciate acknowledgement if the software is
 * used. This software can be redistributed and/or modified freely provided that any derivative
 * works bear some notice that they are derived from it, and any modified versions bear some notice
 * that they have been modified.
 */

package gov.nist.hit.iz.web.config;

import gov.nist.hit.core.hl7v2.service.HL7V2MessageParser;
import gov.nist.hit.core.hl7v2.service.HL7V2MessageParserImpl;
import gov.nist.hit.core.hl7v2.service.HL7V2MessageValidator;
import gov.nist.hit.core.hl7v2.service.HL7V2ResourcebundleLoaderImpl;
import gov.nist.hit.core.hl7v2.service.HL7V2ValidationReportGenerator;
import gov.nist.hit.core.hl7v2.service.HL7V2ValidationReportGeneratorImpl;
import gov.nist.hit.core.service.ResourcebundleLoader;
import gov.nist.hit.iz.service.IZHL7V2MessageValidatorImpl;
import gov.nist.hit.iz.service.SOAPValidationReportGenerator;
import gov.nist.hit.iz.service.soap.SOAPValidationReportGeneratorImpl;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * @author Harold Affo (NIST)
 * 
 */

@Configuration
public class IZWebBeanConfig {

  @Bean
  public HL7V2MessageValidator hl7v2MessageValidator() {
    return new IZHL7V2MessageValidatorImpl();
  }

  @Bean
  public HL7V2MessageParser hl7v2MessageParser() {
    return new HL7V2MessageParserImpl();
  }

  @Bean
  public ResourcebundleLoader resourcebundleLoader() {
    HL7V2ResourcebundleLoaderImpl rs = new HL7V2ResourcebundleLoaderImpl();
    return rs;
  }



  @Bean
  public SOAPValidationReportGenerator soapValidationReportGenerator() {
    return new SOAPValidationReportGeneratorImpl();
  }

  @Bean
  public HL7V2ValidationReportGenerator validationReportGenerator() {
    return new HL7V2ValidationReportGeneratorImpl();
  }



}
